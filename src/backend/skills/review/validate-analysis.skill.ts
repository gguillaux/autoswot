import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { Skill, SkillError } from '../skill.interface.js';
import { SecurityAnalysis } from '../../agents/types/analysis.types.js';
import { ResearchData } from '../../agents/types/research.types.js';
import { ReviewResult, ReviewResultSchema } from '../../agents/types/review.types.js';

const InputSchema = z.object({
  analysis: z.any(),
  researchData: z.any(),
});

type Input = { analysis: SecurityAnalysis; researchData: ResearchData };

export const validateAnalysisSkill: Skill<Input, ReviewResult> = {
  name: 'validate_analysis',
  description: 'Uses Gemini to cross-reference AI analysis against Yahoo Finance ground truth',
  inputSchema: InputSchema as any,
  outputSchema: ReviewResultSchema,

  async execute(input: Input): Promise<ReviewResult> {
    const { analysis, researchData } = input;
    const config = require('../../services/config/config.service.js').configService.read();
    const apiKey = config.gemini?.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new SkillError('validate_analysis', 'CONFIG_ERROR', 'GEMINI_API_KEY not set');
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a fact-checking analyst. Compare this AI-generated security analysis against verified Yahoo Finance data and identify any inaccuracies.

## AI-GENERATED ANALYSIS:
${JSON.stringify(analysis, null, 2)}

## VERIFIED YAHOO FINANCE DATA:
${JSON.stringify({
  companyName: researchData.profile.companyName,
  sector: researchData.profile.sector,
  industry: researchData.profile.industry,
  marketCap: researchData.quote.marketCap,
  revenue: researchData.financials.totalRevenue,
  revenueGrowth: researchData.financials.revenueGrowth,
  peRatio: researchData.quote.peRatio,
  employees: researchData.profile.fullTimeEmployees,
}, null, 2)}

## INSTRUCTIONS:
Review each field and provide a verdict (PASS, WARN, or FAIL):
- FAIL: Material inaccuracy (wrong sector, revenue off by >15%, wrong dates)
- WARN: Minor inaccuracy or vague claim
- PASS: Consistent with verified data

Set approved=true ONLY if there are ZERO "FAIL" verdicts.
If not approved, provide specific corrections the analyst should make.
Score from 0-100 based on overall accuracy.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object' as any,
            properties: {
              approved: { type: 'boolean' as any },
              overallScore: { type: 'number' as any },
              verdicts: {
                type: 'array' as any,
                items: {
                  type: 'object' as any,
                  properties: {
                    field: { type: 'string' as any },
                    status: { type: 'string' as any, enum: ['PASS', 'WARN', 'FAIL'] },
                    expected: { type: 'string' as any },
                    received: { type: 'string' as any },
                    note: { type: 'string' as any },
                  },
                  required: ['field', 'status', 'received', 'note'],
                },
              },
              corrections: { type: 'string' as any },
            },
            required: ['approved', 'overallScore', 'verdicts'],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new SkillError('validate_analysis', 'EMPTY_RESPONSE', 'Gemini returned empty response');
      }

      const parsed = JSON.parse(text);
      return {
        approved: parsed.approved,
        overallScore: parsed.overallScore,
        verdicts: parsed.verdicts.map((v: any) => ({
          ...v,
          expected: v.expected ?? null,
        })),
        corrections: parsed.corrections ?? null,
        reviewedAt: new Date().toISOString(),
      };
    } catch (err) {
      if (err instanceof SkillError) throw err;
      throw new SkillError('validate_analysis', 'REVIEW_ERROR', `Review failed: ${(err as Error).message}`, err);
    }
  },
};
