import { Router } from 'express';
import { getCourses, createCourse, updateCourse, deleteCourse, logAttendance } from '../controllers/courseController';
import { authenticateToken } from '../middleware/authMiddleware';
const router = Router();
// Protect all course routes with authentication middleware
router.use(authenticateToken);
// Routes
router.get('/', getCourses);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);
router.post('/:id/attendance', logAttendance);
export default router;
