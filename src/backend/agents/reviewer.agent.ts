import { SecurityAnalysis } from './types/analysis.types.js';
import { ResearchData } from './types/research.types.js';
import { ReviewResult } from './types/review.types.js';
import { skillRegistry } from '../skills/registry.js';

export class ReviewerAgent {
  public name = 'Reviewer Agent';

  async execute(analysis: SecurityAnalysis, researchData: ResearchData): Promise<ReviewResult> {
    console.log(`[${this.name}] Reviewing analysis against Yahoo Finance data...`);
    
    // 1. Deterministic cross-reference
    const { fieldComparisons } = await skillRegistry.cross_reference_data.execute({ analysis, researchData });
    
    // 2. LLM validation for nuanced checks
    const reviewResult = await skillRegistry.validate_analysis.execute({ analysis, researchData });
    
    // Merge deterministic verdicts with LLM verdicts if needed, 
    // for simplicity, we just use the LLM result which handles the overall score and corrections,
    // but we could enforce FAILs from deterministic checks here.
    const hasDeterministicFail = fieldComparisons.some(v => v.status === 'FAIL');
    
    if (hasDeterministicFail && reviewResult.approved) {
      reviewResult.approved = false;
      reviewResult.corrections = (reviewResult.corrections || '') + '\nEnsure numeric and categorical fields match verified data exactly.';
    }

    console.log(`[${this.name}] Review complete. Approved: ${reviewResult.approved}`);
    return reviewResult;
  }
}
