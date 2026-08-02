import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.get('/me', authenticateToken, AuthController.me);
router.get('/users', authenticateToken, requirePermission('USERS', 'READ'), AuthController.getUsers);

export default router;
