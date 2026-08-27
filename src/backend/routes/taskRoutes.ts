import { Router } from 'express';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  updateTaskStatus, 
  deleteTask 
} from '../controllers/taskController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all task routes with authentication middleware
router.use(authenticateToken as any);

// Routes
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

export default router;