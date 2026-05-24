import { z } from 'zod';
import { Skill } from '../skill.interface.js';
import { DesignStyle } from '../../agents/types/pipeline.types.js';
import { StyleConfig, StyleConfigSchema } from '../../agents/types/design.types.js';

const InputSchema = z.object({
  style: z.enum(['dark_gradient', 'clean_corporate', 'bold_editorial']),
});

type Input = { style: DesignStyle };

const STYLE_CONFIGS: Record<DesignStyle, StyleConfig> = {
  dark_gradient: {
    background: { type: 'gradient', colors: ['#0a0e27', '#1a1145', '#0d1b3e'] },
    cardStyle: { fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.12)', radius: 16, opacity: 0.9 },
    typography: {
      heading: { font: 'Inter', size: 48, color: '#ffffff', weight: 700 },
      body: { font: 'Inter', size: 24, color: '#e0e0e0', weight: 400 },
      label: { font: 'Inter', size: 18, color: '#9ca3af', weight: 500 },
    },
    swotColors: { S: '#10b981', W: '#ef4444', O: '#3b82f6', T: '#f59e0b' },
    chartColors: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6366f1'],
    spacing: { padding: 48, gap: 20, sectionGap: 36 },
  },
  clean_corporate: {
    background: { type: 'solid', colors: ['#f8fafc'] },
    cardStyle: { fill: '#ffffff', stroke: '#e2e8f0', radius: 12, opacity: 1 },
    typography: {
      heading: { font: 'Inter', size: 44, color: '#0f172a', weight: 700 },
      body: { font: 'Inter', size: 22, color: '#334155', weight: 400 },
      label: { font: 'Inter', size: 17, color: '#64748b', weight: 500 },
    },
    swotColors: { S: '#059669', W: '#dc2626', O: '#2563eb', T: '#d97706' },
    chartColors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#1d4ed8', '#1e40af'],
    spacing: { padding: 44, gap: 18, sectionGap: 32 },
  },
  bold_editorial: {
    background: { type: 'gradient', colors: ['#fbbf24', '#f59e0b', '#d97706'] },
    cardStyle: { fill: '#000000', stroke: '#333333', radius: 8, opacity: 0.95 },
    typography: {
      heading: { font: 'Inter', size: 52, color: '#000000', weight: 800 },
      body: { font: 'Inter', size: 24, color: '#1a1a1a', weight: 400 },
      label: { font: 'Inter', size: 18, color: '#525252', weight: 600 },
    },
    swotColors: { S: '#16a34a', W: '#b91c1c', O: '#1d4ed8', T: '#c2410c' },
    chartColors: ['#000000', '#333333', '#555555', '#777777', '#999999', '#1a1a1a'],
    spacing: { padding: 40, gap: 16, sectionGap: 28 },
  },
};

export const applyStyleSkill: Skill<Input, StyleConfig> = {
  name: 'apply_design_style',
  description: 'Returns the complete style configuration for the selected design template',
  inputSchema: InputSchema as any,
  outputSchema: StyleConfigSchema,

  async execute(input: Input): Promise<StyleConfig> {
    return STYLE_CONFIGS[input.style];
  },
};
