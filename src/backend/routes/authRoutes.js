import { Router } from 'express';
import { register, login, getMe, deleteAccount } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
const router = Router();
// Public Routes
router.post('/register', register);
router.post('/login', login);
// Protected Routes (Requires valid JWT Token)
router.get('/me', authenticateToken, getMe);
router.delete('/delete-account', authenticateToken, deleteAccount);
export default router;
