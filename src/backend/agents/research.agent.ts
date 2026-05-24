import { ResearchData } from './types/research.types.js';
import { skillRegistry } from '../skills/registry.js';

export class ResearchAgent {
  public name = 'Research Agent';

  async execute(ticker: string): Promise<ResearchData> {
    console.log(`[${this.name}] Fetching data for ${ticker}...`);
    const data = await skillRegistry.fetch_yahoo_finance.execute({ ticker });
    console.log(`[${this.name}] Successfully fetched data for ${ticker}.`);
    return data;
  }
}
