import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { Skill, SkillError } from '../skill.interface.js';
import { SecurityAnalysis, SecurityAnalysisSchema, GeminiAnalysisResponseSchema } from '../../agents/types/analysis.types.js';
import { ResearchData } from '../../agents/types/research.types.js';

const InputSchema = z.object({
  ticker: z.string(),
  researchData: z.any(), // ResearchData
  corrections: z.string().optional(),
  enableSearchGrounding: z.boolean().default(true),
});

type Input = z.infer<typeof InputSchema>;

export const generateSwotSkill: Skill<Input, SecurityAnalysis> = {
  name: 'generate_swot_analysis',
  description: 'Uses Gemini to generate a comprehensive security analysis with SWOT, grounded by Yahoo Finance data',
  inputSchema: InputSchema as any,
  outputSchema: SecurityAnalysisSchema,

  async execute(input: Input): Promise<SecurityAnalysis> {
    const { ticker, researchData, corrections } = input;
    const config = require('../../services/config/config.service.js').configService.read();
    const apiKey = config.gemini?.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new SkillError('generate_swot_analysis', 'CONFIG_ERROR', 'GEMINI_API_KEY is not set');
    }

    const ai = new GoogleGenAI({ apiKey });

    const researchContext = formatResearchContext(researchData);
    const correctionBlock = corrections
      ? `\n\n⚠️ PREVIOUS REVIEW FEEDBACK — You MUST address these corrections:\n${corrections}\n`
      : '';

    const prompt = `You are a senior equity research analyst. Analyze the security "${ticker}" and provide a comprehensive report.

${correctionBlock}

## VERIFIED FINANCIAL DATA (from Yahoo Finance — use these as ground truth):
${researchContext}

## INSTRUCTIONS:
1. **Company Overview**: Write 2-3 sentences covering what the company does, when it was founded, where it's headquartered, and its core business.
2. **History**: List 5-7 key milestones in chronological order (founding, IPO, major acquisitions, product launches, pivots).
3. **Revenue Model**: Break down how the company makes money. List each revenue segment with a description and approximate percentage of total revenue.
4. **SWOT Analysis**: Provide 3-4 bullet points for each quadrant. Be specific and data-driven, referencing the financial data provided.

IMPORTANT: Your analysis MUST be consistent with the verified financial data above. Do not contradict the sector, industry, market cap, or revenue figures provided.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object' as any,
            properties: {
              companyName: { type: 'string' as any },
              sector: { type: 'string' as any },
              industry: { type: 'string' as any },
              overview: { type: 'string' as any },
              history: {
                type: 'array' as any,
                items: {
                  type: 'object' as any,
                  properties: {
                    year: { type: 'number' as any },
                    event: { type: 'string' as any },
                  },
                  required: ['year', 'event'],
                },
              },
              revenueModel: {
                type: 'array' as any,
                items: {
                  type: 'object' as any,
                  properties: {
                    segment: { type: 'string' as any },
                    description: { type: 'string' as any },
                    percentageOfRevenue: { type: 'number' as any },
                  },
                  required: ['segment', 'description', 'percentageOfRevenue'],
                },
              },
              swot: {
                type: 'object' as any,
                properties: {
                  strengths: { type: 'array' as any, items: { type: 'string' as any } },
                  weaknesses: { type: 'array' as any, items: { type: 'string' as any } },
                  opportunities: { type: 'array' as any, items: { type: 'string' as any } },
                  threats: { type: 'array' as any, items: { type: 'string' as any } },
                },
                required: ['strengths', 'weaknesses', 'opportunities', 'threats'],
              },
            },
            required: ['companyName', 'sector', 'industry', 'overview', 'history', 'revenueModel', 'swot'],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new SkillError('generate_swot_analysis', 'EMPTY_RESPONSE', 'Gemini returned empty response');
      }

      const parsed = JSON.parse(text);

      const analysis: SecurityAnalysis = {
        ticker,
        companyName: parsed.companyName,
        sector: parsed.sector,
        industry: parsed.industry,
        overview: parsed.overview,
        history: parsed.history,
        revenueModel: parsed.revenueModel,
        swot: parsed.swot,
        generatedAt: new Date().toISOString(),
      };

      return analysis;
    } catch (err) {
      if (err instanceof SkillError) throw err;
      throw new SkillError(
        'generate_swot_analysis',
        'GENERATION_ERROR',
        `Gemini analysis failed: ${(err as Error).message}`,
        err,
      );
    }
  },
};

function formatResearchContext(data: ResearchData): string {
  const lines: string[] = [];
  lines.push(`Company: ${data.profile.companyName}`);
  if (data.profile.sector) lines.push(`Sector: ${data.profile.sector}`);
  if (data.profile.industry) lines.push(`Industry: ${data.profile.industry}`);
  if (data.profile.country) lines.push(`Country: ${data.profile.country}`);
  if (data.quote.marketCap) lines.push(`Market Cap: $${(data.quote.marketCap / 1e9).toFixed(2)}B`);
  if (data.quote.price) lines.push(`Current Price: $${data.quote.price}`);
  if (data.quote.peRatio) lines.push(`P/E Ratio: ${data.quote.peRatio.toFixed(2)}`);
  if (data.quote.eps) lines.push(`EPS: $${data.quote.eps.toFixed(2)}`);
  if (data.financials.totalRevenue) lines.push(`Total Revenue: $${(data.financials.totalRevenue / 1e9).toFixed(2)}B`);
  if (data.financials.revenueGrowth) lines.push(`Revenue Growth: ${(data.financials.revenueGrowth * 100).toFixed(1)}%`);
  if (data.financials.grossMargin) lines.push(`Gross Margin: ${(data.financials.grossMargin * 100).toFixed(1)}%`);
  if (data.financials.netMargin) lines.push(`Net Margin: ${(data.financials.netMargin * 100).toFixed(1)}%`);
  if (data.profile.fullTimeEmployees) lines.push(`Employees: ${data.profile.fullTimeEmployees.toLocaleString()}`);
  if (data.profile.description) lines.push(`\nBusiness Description: ${data.profile.description.slice(0, 500)}`);
  return lines.join('\n');
}
