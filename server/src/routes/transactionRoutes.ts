import { Router } from 'express';
import { getTransactions, createTransaction } from '../controllers/transactionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getTransactions);
router.post('/', createTransaction);

export default router;
