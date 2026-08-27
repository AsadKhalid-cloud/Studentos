import { Router } from 'express';
import { getBudgetSummary, getTransactions, createTransaction, deleteTransaction } from '../controllers/budgetController';
import { authenticateToken } from '../middleware/authMiddleware';
const router = Router();
// Protect all budget routes with authentication middleware
router.use(authenticateToken);
// Routes
router.get('/summary', getBudgetSummary);
router.get('/transactions', getTransactions);
router.post('/transactions', createTransaction);
router.delete('/transactions/:id', deleteTransaction);
export default router;
