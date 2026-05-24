import { Router } from 'express';
import { oauthController } from '../controllers/oauth.controller.js';

const router = Router();

router.get('/x/login', oauthController.loginX);
router.get('/x/callback', oauthController.callbackX);

router.get('/linkedin/login', oauthController.loginLinkedin);
router.get('/linkedin/callback', oauthController.callbackLinkedin);

router.get('/facebook/login', oauthController.loginFacebook);
router.get('/facebook/callback', oauthController.callbackFacebook);

export { router as oauthRoutes };
