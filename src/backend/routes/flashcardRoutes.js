import { Router } from 'express';
import { getDueFlashcards, reviewFlashcard } from '../controllers/flashcardController';
import { authenticateToken } from '../middleware/authMiddleware';
const router = Router();
// Protect all flashcard routes with authentication middleware
router.use(authenticateToken);
// Routes
router.get('/due', getDueFlashcards);
router.post('/:id/review', reviewFlashcard);
export default router;
