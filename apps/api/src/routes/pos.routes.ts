import { Router } from 'express';
import { PosController } from '../controllers/pos.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/checkout', authenticateToken, PosController.checkout);
router.get('/orders', authenticateToken, PosController.getOrders);
router.post('/parked-orders', authenticateToken, PosController.parkOrder);
router.get('/parked-orders', authenticateToken, PosController.getParkedOrders);
router.delete('/parked-orders/:id', authenticateToken, PosController.deleteParkedOrder);

export default router;
