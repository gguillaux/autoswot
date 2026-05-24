import { z } from 'zod';
import { DesignStyleSchema } from './pipeline.types.js';

// ============================================
// Design & Layout Types
// ============================================

export const StyleConfigSchema = z.object({
  background: z.object({
    type: z.enum(['gradient', 'solid']),
    colors: z.array(z.string()),
  }),
  cardStyle: z.object({
    fill: z.string(),
    stroke: z.string(),
    radius: z.number(),
    opacity: z.number().min(0).max(1),
  }),
  typography: z.object({
    heading: z.object({ font: z.string(), size: z.number(), color: z.string(), weight: z.number() }),
    body: z.object({ font: z.string(), size: z.number(), color: z.string(), weight: z.number() }),
    label: z.object({ font: z.string(), size: z.number(), color: z.string(), weight: z.number() }),
  }),
  swotColors: z.object({
    S: z.string(),
    W: z.string(),
    O: z.string(),
    T: z.string(),
  }),
  chartColors: z.array(z.string()),
  spacing: z.object({
    padding: z.number(),
    gap: z.number(),
    sectionGap: z.number(),
  }),
});

export type StyleConfig = z.infer<typeof StyleConfigSchema>;

export const LayoutHintsSchema = z.object({
  highlightedMilestones: z.array(z.string()),
  abbreviatedTexts: z.record(z.string(), z.string()),
  sectorAccentColor: z.string(),
});

export type LayoutHints = z.infer<typeof LayoutHintsSchema>;

export const DesignOutputSchema = z.object({
  jpegPath: z.string(),
  pngPath: z.string(),
  style: DesignStyleSchema,
  renderedAt: z.string().datetime(),
});

export type DesignOutput = z.infer<typeof DesignOutputSchema>;
