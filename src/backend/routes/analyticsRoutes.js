import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/authMiddleware';
const router = Router();
// Protect analytics route with authentication middleware
router.use(authenticateToken);
// Analytics & Productivity Score Endpoint
router.get('/', getAnalytics);
export default router;
