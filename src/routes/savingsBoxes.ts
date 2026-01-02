import { Router } from 'express';
import {
  listSavingsBoxes,
  getSavingsBox,
  addSavingsBox,
  depositToBox,
  withdrawFromBox,
  removeSavingsBox,
} from '../controllers/savingsBoxController';

const router = Router();

router.get('/', listSavingsBoxes);
router.get('/:id', getSavingsBox);
router.post('/', addSavingsBox);
router.post('/:id/deposit', depositToBox);
router.post('/:id/withdraw', withdrawFromBox);
router.delete('/:id', removeSavingsBox);

export default router;
