import { Router } from 'express';
import {
  listTransactions,
  getTransaction,
  addTransaction,
  getSummary,
  getRecent,
} from '../controllers/transactionController';

const router = Router();

router.get('/', listTransactions);
router.get('/recent', getRecent);
router.get('/summary', getSummary);
router.get('/:id', getTransaction);
router.post('/', addTransaction);

export default router;
