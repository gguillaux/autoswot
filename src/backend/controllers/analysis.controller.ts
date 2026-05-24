import { Request, Response } from 'express';
import path from 'path';
import { PipelineOrchestrator } from '../agents/orchestrator.agent.js';
import { ResearchAgent } from '../agents/research.agent.js';
import { AnalystAgent } from '../agents/analyst.agent.js';
import { ReviewerAgent } from '../agents/reviewer.agent.js';
import { DesignerAgent } from '../agents/designer.agent.js';
import { QualityAgent } from '../agents/quality.agent.js';

export class AnalysisController {
  private orchestrator: PipelineOrchestrator;

  constructor() {
    // Inject dependencies into the orchestrator
    this.orchestrator = new PipelineOrchestrator(
      new ResearchAgent(),
      new AnalystAgent(),
      new ReviewerAgent(),
      new DesignerAgent(),
      new QualityAgent()
    );
  }

  analyze = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ticker, style } = req.body;
      
      if (!ticker || !style) {
        res.status(400).json({ error: 'Missing ticker or style' });
        return;
      }

      console.log(`\n--- Starting Pipeline for ${ticker} (${style}) ---`);
      const result = await this.orchestrator.execute({ ticker, style });
      
      // Convert absolute paths to URLs
      const port = process.env.PORT || 3001;
      const baseUrl = `http://localhost:${port}`;
      const response = {
        ...result,
        infographicJpegUrl: result.infographicJpegPath ? `${baseUrl}/output/${path.basename(result.infographicJpegPath)}` : undefined,
        infographicPngUrl: result.infographicPngPath ? `${baseUrl}/output/${path.basename(result.infographicPngPath)}` : undefined,
      };

      res.json(response);
    } catch (error) {
      console.error('Pipeline error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };
}

export const analysisController = new AnalysisController();
