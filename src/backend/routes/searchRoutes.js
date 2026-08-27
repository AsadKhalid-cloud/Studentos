import { Router } from 'express';
import { globalSearch } from '../controllers/searchController';
import { authenticateToken } from '../middleware/authMiddleware';
const router = Router();
// Protect search route with authentication middleware
router.use(authenticateToken);
// Universal Search Endpoint
router.get('/', globalSearch);
export default router;
