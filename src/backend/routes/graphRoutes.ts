import { Router } from 'express';
import { getKnowledgeGraphData } from '../controllers/graphController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect graph route with authentication middleware
router.use(authenticateToken as any);

// Routes
router.get('/data', getKnowledgeGraphData);

export default router;