import { SecurityAnalysis } from './types/analysis.types.js';
import { QualityResult } from './types/quality.types.js';
import { skillRegistry } from '../skills/registry.js';

export class QualityAgent {
  public name = 'Quality Agent';

  async execute(imagePath: string, analysis: SecurityAnalysis): Promise<QualityResult> {
    console.log(`[${this.name}] Validating infographic quality...`);
    
    const result = await skillRegistry.validate_infographic.execute({
      imagePath,
      analysis,
    });
    
    console.log(`[${this.name}] Quality check complete. Score: ${result.score}, Approved: ${result.approved}`);
    return result;
  }
}
