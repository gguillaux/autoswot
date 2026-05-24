import { PipelineInput, PipelineResult, PipelineStep, PipelinePhase } from './types/pipeline.types.js';
import { ResearchAgent } from './research.agent.js';
import { AnalystAgent } from './analyst.agent.js';
import { ReviewerAgent } from './reviewer.agent.js';
import { DesignerAgent } from './designer.agent.js';
import { QualityAgent } from './quality.agent.js';

export class PipelineOrchestrator {
  private researchAgent = new ResearchAgent();
  private analystAgent = new AnalystAgent();
  private reviewerAgent = new ReviewerAgent();
  private designerAgent = new DesignerAgent();
  private qualityAgent = new QualityAgent();

  async execute(input: PipelineInput): Promise<PipelineResult> {
    const { ticker, style } = input;
    const startTime = Date.now();
    const log: PipelineStep[] = [];

    const addLog = (phase: PipelinePhase, agentName: string, status: PipelineStep['status'], message?: string, error?: string) => {
      log.push({
        phase,
        agentName,
        status,
        startedAt: new Date().toISOString(),
        retryCount: 0,
        message,
        error,
      });
    };

    const updateLog = (status: PipelineStep['status'], message?: string) => {
      const current = log[log.length - 1];
      if (current) {
        current.status = status;
        current.completedAt = new Date().toISOString();
        current.durationMs = Date.now() - new Date(current.startedAt!).getTime();
        if (message) current.message = message;
      }
    };

    try {
      // 1. Research Phase
      addLog('researching', this.researchAgent.name, 'running', `Fetching data for ${ticker}`);
      const researchData = await this.researchAgent.execute(ticker);
      updateLog('success');

      // 2 & 3. Analysis & Review Loop
      let analysisResult = null;
      let reviewResult = null;
      let analysisRetries = 0;
      const MAX_ANALYSIS_RETRIES = 2;
      let corrections = undefined;

      while (analysisRetries <= MAX_ANALYSIS_RETRIES) {
        addLog('analyzing', this.analystAgent.name, 'running', `Generating SWOT (Attempt ${analysisRetries + 1})`);
        analysisResult = await this.analystAgent.execute(ticker, researchData, corrections);
        updateLog('success');

        addLog('reviewing', this.reviewerAgent.name, 'running', 'Reviewing analysis against data');
        reviewResult = await this.reviewerAgent.execute(analysisResult, researchData);
        
        if (reviewResult.approved) {
          updateLog('success', `Approved with score ${reviewResult.overallScore}`);
          break;
        } else {
          updateLog('retrying', `Review failed. Score: ${reviewResult.overallScore}`);
          corrections = reviewResult.corrections || 'Please fix inaccuracies.';
          analysisRetries++;
        }
      }

      if (!reviewResult?.approved) {
        throw new Error('Analysis failed to pass review after maximum retries');
      }

      // 4 & 5. Design & Quality Loop
      let designResult = null;
      let qualityResult = null;
      let designRetries = 0;
      const MAX_DESIGN_RETRIES = 2;
      let qualityNotes = undefined;

      while (designRetries <= MAX_DESIGN_RETRIES) {
        addLog('designing', this.designerAgent.name, 'running', `Rendering infographic (Attempt ${designRetries + 1})`);
        designResult = await this.designerAgent.execute(analysisResult!, style, qualityNotes);
        updateLog('success');

        addLog('quality_checking', this.qualityAgent.name, 'running', 'Validating infographic quality');
        qualityResult = await this.qualityAgent.execute(designResult.jpegPath, analysisResult!);
        
        if (qualityResult.approved) {
          updateLog('success', `Approved with score ${qualityResult.score}`);
          break;
        } else {
          updateLog('retrying', `Quality check failed. Score: ${qualityResult.score}`);
          qualityNotes = qualityResult.issues.map(i => `${i.category}: ${i.description} -> ${i.suggestion}`).join('; ');
          designRetries++;
        }
      }

      if (!qualityResult?.approved) {
        console.warn(`[Orchestrator] Warning: Infographic passed with warnings. Score: ${qualityResult?.score}`);
        // We continue even if quality fails, as it might still be usable
      }

      addLog('complete', 'Orchestrator', 'success', 'Pipeline complete');

      return {
        ticker,
        analysis: analysisResult!,
        infographicJpegPath: designResult!.jpegPath,
        infographicPngPath: designResult!.pngPath,
        pipelineLog: log,
        completedAt: new Date().toISOString(),
        totalDurationMs: Date.now() - startTime,
      };

    } catch (err) {
      updateLog('failed', (err as Error).message);
      addLog('failed', 'Orchestrator', 'failed', 'Pipeline aborted', (err as Error).message);
      throw err;
    }
  }
}
