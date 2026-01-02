import { Router } from 'express';
import { list, getById, create, update, remove, markPaid, upcoming } from '../controllers/billsController';

const router = Router();

router.get('/', list);
router.get('/upcoming', upcoming);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/:id/pay', markPaid);

export default router;
