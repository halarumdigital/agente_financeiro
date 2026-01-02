import { Router } from 'express';
import transactionsRouter from './transactions';
import categoriesRouter from './categories';
import dashboardRouter from './dashboard';
import savingsBoxesRouter from './savingsBoxes';
import reportsRouter from './reports';
import billsRouter from './bills';

const router = Router();

router.use('/transactions', transactionsRouter);
router.use('/categories', categoriesRouter);
router.use('/dashboard', dashboardRouter);
router.use('/savings-boxes', savingsBoxesRouter);
router.use('/reports', reportsRouter);
router.use('/bills', billsRouter);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
