import { Router } from 'express';
import { getStudySessionStats, logStudySession } from '../controllers/studySessionController';
import { authenticateToken } from '../middleware/authMiddleware';
const router = Router();
// Protect all study session routes with authentication middleware
router.use(authenticateToken);
// Routes
router.get('/stats', getStudySessionStats);
router.post('/', logStudySession);
export default router;
