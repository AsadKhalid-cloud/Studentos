import { Router } from 'express';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../controllers/questionController';
import { authenticateToken } from '../middleware/authMiddleware';
const router = Router();
// Protect all question bank routes with authentication middleware
router.use(authenticateToken);
// Routes
router.get('/', getQuestions);
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);
export default router;
