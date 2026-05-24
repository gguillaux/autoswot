import { SecurityAnalysis } from './types/analysis.types.js';
import { ResearchData } from './types/research.types.js';
import { skillRegistry } from '../skills/registry.js';

export class AnalystAgent {
  public name = 'Analyst Agent';

  async execute(ticker: string, researchData: ResearchData, corrections?: string): Promise<SecurityAnalysis> {
    console.log(`[${this.name}] Generating analysis for ${ticker}...`);
    if (corrections) {
      console.log(`[${this.name}] Applying corrections from Reviewer...`);
    }
    
    const analysis = await skillRegistry.generate_swot_analysis.execute({
      ticker,
      researchData,
      corrections,
      enableSearchGrounding: true,
    });
    
    console.log(`[${this.name}] Successfully generated analysis.`);
    return analysis;
  }
}
