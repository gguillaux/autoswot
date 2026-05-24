import { SecurityAnalysis } from './types/analysis.types.js';
import { DesignStyle } from './types/pipeline.types.js';
import { DesignOutput } from './types/design.types.js';
import { skillRegistry } from '../skills/registry.js';

export class DesignerAgent {
  public name = 'Designer Agent';

  async execute(analysis: SecurityAnalysis, style: DesignStyle, qualityNotes?: string): Promise<DesignOutput> {
    console.log(`[${this.name}] Rendering infographic for ${analysis.ticker} using ${style} style...`);
    
    if (qualityNotes) {
      console.log(`[${this.name}] Applying quality feedback: ${qualityNotes}`);
      // In a more complex implementation, we'd use an LLM here to adjust layout hints based on feedback
    }

    const output = await skillRegistry.generate_infographic.execute({
      analysis,
      style,
    });
    
    console.log(`[${this.name}] Infographic rendered to ${output.jpegPath}`);
    return output;
  }
}
