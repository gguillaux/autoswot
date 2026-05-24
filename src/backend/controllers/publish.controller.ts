import { Request, Response } from 'express';
import { socialPublisherFactory } from '../services/social/publisher.factory.js';

export class PublishController {
  
  publish = async (req: Request, res: Response): Promise<void> => {
    try {
      const { platforms, imagePath, caption } = req.body;
      
      if (!platforms || !Array.isArray(platforms) || !imagePath || !caption) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const results: Record<string, any> = {};

      await Promise.all(platforms.map(async (p: string) => {
        const publisher = socialPublisherFactory.createPublisher(p);
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
  };

  status = (req: Request, res: Response): void => {
    const publishers = socialPublisherFactory.createAllPublishers();
    const config = require('../services/config/config.service.js').configService.read();
    
    res.json({
      x: publishers.x.isConfigured(),
      tiktok: publishers.tiktok.isConfigured(),
      facebook: publishers.facebook.isConfigured(),
      linkedin: publishers.linkedin.isConfigured(),
      gemini: !!(config.gemini?.apiKey || process.env.GEMINI_API_KEY),
    });
  };
}

export const publishController = new PublishController();
