import { Router } from 'express';
import { 
  getCalendarEvents, 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent 
} from '../controllers/calendarController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all calendar routes with authentication middleware
router.use(authenticateToken as any);

// Routes
router.get('/events', getCalendarEvents);
router.post('/events', createCalendarEvent);
router.put('/events/:id', updateCalendarEvent);
router.delete('/events/:id', deleteCalendarEvent);

export default router;