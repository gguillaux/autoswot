import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { Skill, SkillError } from '../skill.interface.js';
import { QualityResult, QualityResultSchema } from '../../agents/types/quality.types.js';
import { SecurityAnalysis } from '../../agents/types/analysis.types.js';
import fs from 'fs';

const InputSchema = z.object({
  imagePath: z.string(),
  analysis: z.any(), // SecurityAnalysis
});

type Input = { imagePath: string; analysis: SecurityAnalysis };

export const validateInfographicSkill: Skill<Input, QualityResult> = {
  name: 'validate_infographic',
  description: 'Uses Gemini Vision to validate the quality and layout of the rendered infographic',
  inputSchema: InputSchema as any,
  outputSchema: QualityResultSchema,

  async execute(input: Input): Promise<QualityResult> {
    const { imagePath, analysis } = input;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new SkillError('validate_infographic', 'CONFIG_ERROR', 'GEMINI_API_KEY not set');
    }

    if (!fs.existsSync(imagePath)) {
      throw new SkillError('validate_infographic', 'FILE_ERROR', `Image not found at ${imagePath}`);
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const imageBase64 = fs.readFileSync(imagePath).toString('base64');
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const prompt = `You are a design QA agent. Inspect this infographic for the security ${analysis.ticker}.
    
Check for:
1. Text readability: Is any text cut off, overlapping, or too small?
2. Completeness: Does it have all 4 SWOT quadrants (Strengths, Weaknesses, Opportunities, Threats)?
3. Completeness: Does it have a timeline?
4. Contrast: Is the text clearly visible against the background?

Score the design from 0 to 100.
If the score is < 80, approved must be false, and you must list specific issues to fix.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          prompt,
          { inlineData: { data: imageBase64, mimeType } }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object' as any,
            properties: {
              approved: { type: 'boolean' as any },
              score: { type: 'number' as any },
              issues: {
                type: 'array' as any,
                items: {
                  type: 'object' as any,
                  properties: {
                    severity: { type: 'string' as any, enum: ['critical', 'warning', 'info'] },
                    category: { type: 'string' as any, enum: ['readability', 'completeness', 'layout', 'contrast', 'branding'] },
                    description: { type: 'string' as any },
                    suggestion: { type: 'string' as any },
                  },
                  required: ['severity', 'category', 'description', 'suggestion'],
                },
              },
            },
            required: ['approved', 'score', 'issues'],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new SkillError('validate_infographic', 'EMPTY_RESPONSE', 'Gemini returned empty response');
      }

      const parsed = JSON.parse(text);
      return {
        approved: parsed.approved,
        score: parsed.score,
        issues: parsed.issues,
        checkedAt: new Date().toISOString(),
      };
    } catch (err) {
      if (err instanceof SkillError) throw err;
      throw new SkillError('validate_infographic', 'QA_ERROR', `QA failed: ${(err as Error).message}`, err);
    }
  },
};
