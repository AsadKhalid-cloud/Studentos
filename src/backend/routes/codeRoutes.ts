import { Router } from 'express';
import { 
  getCodeSnippets, 
  createCodeSnippet, 
  updateCodeSnippet, 
  toggleFavoriteSnippet, 
  deleteCodeSnippet 
} from '../controllers/codeController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all code workspace routes with authentication middleware
router.use(authenticateToken as any);

// Routes
router.get('/', getCodeSnippets);
router.post('/', createCodeSnippet);
router.put('/:id', updateCodeSnippet);
router.patch('/:id/favorite', toggleFavoriteSnippet);
router.delete('/:id', deleteCodeSnippet);

export default router;