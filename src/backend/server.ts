import express from 'express';
import cors from 'cors';
import path from 'path';
import { PipelineOrchestrator } from './agents/orchestrator.agent.js';
import { XPublisher } from './services/social/x.publisher.js';
import { TiktokPublisher } from './services/social/tiktok.publisher.js';
import { FacebookPublisher } from './services/social/facebook.publisher.js';
import { LinkedinPublisher } from './services/social/linkedin.publisher.js';

import * as dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve generated outputs statically
app.use('/output', express.static(path.resolve(process.cwd(), 'output')));

const orchestrator = new PipelineOrchestrator();
const publishers = {
  x: new XPublisher(),
  tiktok: new TiktokPublisher(),
  facebook: new FacebookPublisher(),
  linkedin: new LinkedinPublisher(),
};

// ============================================
// Routes
// ============================================

app.post('/api/analyze', async (req, res) => {
  try {
    const { ticker, style } = req.body;
    
    if (!ticker || !style) {
      return res.status(400).json({ error: 'Missing ticker or style' });
    }

    console.log(`\n--- Starting Pipeline for ${ticker} (${style}) ---`);
    const result = await orchestrator.execute({ ticker, style });
    
    // Convert absolute paths to URLs
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
});

app.post('/api/publish', async (req, res) => {
  try {
    const { platforms, imagePath, caption } = req.body;
    
    if (!platforms || !Array.isArray(platforms) || !imagePath || !caption) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const results: Record<string, any> = {};

    await Promise.all(platforms.map(async (p: string) => {
      const publisher = publishers[p as keyof typeof publishers];
      if (!publisher) {
        results[p] = { success: false, error: 'Unknown platform' };
      } else {
        results[p] = await publisher.publish(imagePath, caption);
      }
    }));

    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/social-status', (req, res) => {
  res.json({
    x: publishers.x.isConfigured(),
    tiktok: publishers.tiktok.isConfigured(),
    facebook: publishers.facebook.isConfigured(),
    linkedin: publishers.linkedin.isConfigured(),
  });
});

app.listen(port, () => {
  console.log(`AutoSWOT Backend running on http://localhost:${port}`);
});
