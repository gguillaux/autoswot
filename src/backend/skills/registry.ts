import { fetchYahooFinanceSkill } from './research/fetch-yahoo-finance.skill.js';
import { generateSwotSkill } from './analysis/generate-swot.skill.js';
import { validateAnalysisSkill } from './review/validate-analysis.skill.js';
import { crossReferenceSkill } from './review/cross-reference.skill.js';
import { applyStyleSkill } from './design/apply-style.skill.js';
import { generateInfographicSkill } from './design/generate-infographic.skill.js';
import { validateInfographicSkill } from './quality/validate-infographic.skill.js';

export const skillRegistry = {
  // Research
  fetch_yahoo_finance: fetchYahooFinanceSkill,

  // Analysis
  generate_swot_analysis: generateSwotSkill,

  // Review
  validate_analysis: validateAnalysisSkill,
  cross_reference_data: crossReferenceSkill,

  // Design
  apply_design_style: applyStyleSkill,
  generate_infographic: generateInfographicSkill,

  // Quality
  validate_infographic: validateInfographicSkill,
} as const;

export type SkillName = keyof typeof skillRegistry;
