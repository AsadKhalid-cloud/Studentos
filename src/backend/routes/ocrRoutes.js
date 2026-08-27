import { Router } from 'express';
import { processOcrExtraction } from '../controllers/ocrController';
import { authenticateToken } from '../middleware/authMiddleware';
const router = Router();
// Protect OCR routes with authentication middleware
router.use(authenticateToken);
// Routes
router.post('/extract', processOcrExtraction);
export default router;
