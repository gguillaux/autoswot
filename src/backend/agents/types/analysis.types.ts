import { z } from 'zod';

// ============================================
// Security Analysis Types (Gemini Output)
// ============================================

export const HistoryMilestoneSchema = z.object({
  year: z.number(),
  event: z.string(),
});

export type HistoryMilestone = z.infer<typeof HistoryMilestoneSchema>;

export const RevenueSegmentSchema = z.object({
  segment: z.string(),
  description: z.string(),
  percentageOfRevenue: z.number().min(0).max(100),
});

export type RevenueSegment = z.infer<typeof RevenueSegmentSchema>;

export const SwotSchema = z.object({
  strengths: z.array(z.string()).min(2).max(5),
  weaknesses: z.array(z.string()).min(2).max(5),
  opportunities: z.array(z.string()).min(2).max(5),
  threats: z.array(z.string()).min(2).max(5),
});

export type Swot = z.infer<typeof SwotSchema>;

export const SecurityAnalysisSchema = z.object({
  ticker: z.string(),
  companyName: z.string(),
  sector: z.string(),
  industry: z.string(),
  overview: z.string(),
  history: z.array(HistoryMilestoneSchema).min(3).max(8),
  revenueModel: z.array(RevenueSegmentSchema).min(1).max(8),
  swot: SwotSchema,
  generatedAt: z.string().datetime(),
});

export type SecurityAnalysis = z.infer<typeof SecurityAnalysisSchema>;

// Schema description for Gemini structured output (without dates, those are added post-generation)
export const GeminiAnalysisResponseSchema = z.object({
  companyName: z.string().describe('Full legal company name'),
  sector: z.string().describe('GICS sector classification'),
  industry: z.string().describe('Specific industry within sector'),
  overview: z.string().describe('2-3 sentence company overview including founding, headquarters, and core business'),
  history: z.array(z.object({
    year: z.number().describe('Year of the milestone event'),
    event: z.string().describe('Brief description of the milestone (1-2 sentences)'),
  })).describe('5-7 key historical milestones in chronological order'),
  revenueModel: z.array(z.object({
    segment: z.string().describe('Revenue segment name'),
    description: z.string().describe('How this segment generates revenue'),
    percentageOfRevenue: z.number().describe('Approximate percentage of total revenue (0-100)'),
  })).describe('Revenue segments showing how the company makes money'),
  swot: z.object({
    strengths: z.array(z.string()).describe('3-4 internal strengths'),
    weaknesses: z.array(z.string()).describe('3-4 internal weaknesses'),
    opportunities: z.array(z.string()).describe('3-4 external opportunities'),
    threats: z.array(z.string()).describe('3-4 external threats'),
  }).describe('SWOT analysis with 3-4 bullet points per quadrant'),
});

export type GeminiAnalysisResponse = z.infer<typeof GeminiAnalysisResponseSchema>;
