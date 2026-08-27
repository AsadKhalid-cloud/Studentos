import { Router } from 'express';
import { getNotes, createNote, updateNote, deleteNote, togglePinNote, toggleFavoriteNote } from '../controllers/noteController';
import { authenticateToken } from '../middleware/authMiddleware';
const router = Router();
// Protect all note routes with authentication middleware
router.use(authenticateToken);
// Routes
router.get('/', getNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.patch('/:id/pin', togglePinNote);
router.patch('/:id/favorite', toggleFavoriteNote);
export default router;
