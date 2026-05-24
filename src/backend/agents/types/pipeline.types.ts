import { z } from 'zod';

// ============================================
// Pipeline State & Step Logs
// ============================================

export const PipelinePhaseSchema = z.enum([
  'researching',
  'analyzing',
  'reviewing',
  'designing',
  'quality_checking',
  'publishing',
  'complete',
  'failed',
]);

export type PipelinePhase = z.infer<typeof PipelinePhaseSchema>;

export const PipelineStepSchema = z.object({
  phase: PipelinePhaseSchema,
  agentName: z.string(),
  status: z.enum(['pending', 'running', 'success', 'failed', 'retrying']),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  durationMs: z.number().optional(),
  retryCount: z.number().default(0),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type PipelineStep = z.infer<typeof PipelineStepSchema>;

export const DesignStyleSchema = z.enum([
  'dark_gradient',
  'clean_corporate',
  'bold_editorial',
]);

export type DesignStyle = z.infer<typeof DesignStyleSchema>;

export const PipelineInputSchema = z.object({
  ticker: z.string().min(1).max(10).toUpperCase(),
  style: DesignStyleSchema,
});

export type PipelineInput = z.infer<typeof PipelineInputSchema>;

export const PipelineResultSchema = z.object({
  ticker: z.string(),
  analysis: z.any(), // SecurityAnalysis — cross-referenced at runtime
  infographicJpegPath: z.string().optional(),
  infographicPngPath: z.string().optional(),
  pipelineLog: z.array(PipelineStepSchema),
  completedAt: z.string().datetime(),
  totalDurationMs: z.number(),
});

export type PipelineResult = z.infer<typeof PipelineResultSchema>;
