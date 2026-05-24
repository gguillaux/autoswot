import { z } from 'zod';

// ============================================
// Quality Check Types
// ============================================

export const QualityIssueSeveritySchema = z.enum(['critical', 'warning', 'info']);
export const QualityIssueCategorySchema = z.enum([
  'readability',
  'completeness',
  'layout',
  'contrast',
  'branding',
]);

export const QualityIssueSchema = z.object({
  severity: QualityIssueSeveritySchema,
  category: QualityIssueCategorySchema,
  description: z.string(),
  suggestion: z.string(),
});

export type QualityIssue = z.infer<typeof QualityIssueSchema>;

export const QualityResultSchema = z.object({
  approved: z.boolean(),
  score: z.number().min(0).max(100),
  issues: z.array(QualityIssueSchema),
  checkedAt: z.string().datetime(),
});

export type QualityResult = z.infer<typeof QualityResultSchema>;
