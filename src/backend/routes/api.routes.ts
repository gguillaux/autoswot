import { Router } from 'express';
import { analysisController } from '../controllers/analysis.controller.js';
import { publishController } from '../controllers/publish.controller.js';

const router = Router();

router.post('/analyze', analysisController.analyze);
router.post('/publish', publishController.publish);
router.get('/social-status', publishController.status);

export { router as apiRoutes };
