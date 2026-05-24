import { Router } from 'express';
import { analysisController } from '../controllers/analysis.controller.js';
import { publishController } from '../controllers/publish.controller.js';
import { configService } from '../services/config/config.service.js';

const router = Router();

router.post('/analyze', analysisController.analyze);
router.post('/publish', publishController.publish);
router.get('/social-status', publishController.status);

router.post('/config', (req, res) => {
  const { platform, data } = req.body;
  if (!platform || !data) return res.status(400).json({ error: 'Missing platform or data' });
  configService.update(platform as any, data);
  res.json({ success: true });
});

export { router as apiRoutes };
