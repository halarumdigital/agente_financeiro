import { Router } from 'express';
import {
  getReportsByCategory,
  getReportsByPeriod,
  getTransactionsList,
  getReportsSummary,
} from '../controllers/reportsController';

const router = Router();

router.get('/by-category', getReportsByCategory);
router.get('/by-period', getReportsByPeriod);
router.get('/transactions', getTransactionsList);
router.get('/summary', getReportsSummary);

export default router;
