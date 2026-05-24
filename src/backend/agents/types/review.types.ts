import { z } from 'zod';

// ============================================
// Review Verdicts & Corrections
// ============================================

export const VerdictStatusSchema = z.enum(['PASS', 'WARN', 'FAIL']);
export type VerdictStatus = z.infer<typeof VerdictStatusSchema>;

export const FieldVerdictSchema = z.object({
  field: z.string(),
  status: VerdictStatusSchema,
  expected: z.string().nullable(),
  received: z.string(),
  note: z.string(),
});

export type FieldVerdict = z.infer<typeof FieldVerdictSchema>;

export const ReviewResultSchema = z.object({
  approved: z.boolean(),
  overallScore: z.number().min(0).max(100),
  verdicts: z.array(FieldVerdictSchema),
  corrections: z.string().nullable(),
  reviewedAt: z.string().datetime(),
});

export type ReviewResult = z.infer<typeof ReviewResultSchema>;
