import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, CustomerController.getCustomers);
router.get('/abc-analysis', authenticateToken, CustomerController.getAbcAnalysis);
router.get('/:id', authenticateToken, CustomerController.getById);
router.post('/', authenticateToken, CustomerController.createCustomer);
router.post('/:id/pay-debt', authenticateToken, CustomerController.payDebt);

export default router;
