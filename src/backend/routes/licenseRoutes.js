import { Router } from 'express';
import { getLicenseStatus, activateApp } from '../controllers/licenseController';
import { authenticateToken } from '../middleware/authMiddleware';
const router = Router();
// Protect all license routes with authentication middleware
router.use(authenticateToken);
// Routes
router.get('/status', getLicenseStatus);
router.post('/activate', activateApp);
export default router;
