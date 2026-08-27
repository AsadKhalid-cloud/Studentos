import { Router } from 'express';
import { 
  getBackupStats, 
  exportBackup, 
  importBackup 
} from '../controllers/backupController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all backup routes with authentication middleware
router.use(authenticateToken as any);

// Routes
router.get('/stats', getBackupStats);
router.post('/export', exportBackup);
router.post('/import', importBackup);

export default router;