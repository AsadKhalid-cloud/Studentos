import { Router } from 'express';
import { 
  getUniversityProfile, 
  updateUniversityProfile 
} from '../controllers/universityController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all university profile routes with authentication middleware
router.use(authenticateToken as any);

// Routes
router.get('/profile', getUniversityProfile);
router.put('/profile', updateUniversityProfile);

export default router;