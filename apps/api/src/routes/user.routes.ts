import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, requirePermission('USERS', 'READ'), UserController.getUsers);
router.post('/', authenticateToken, requirePermission('USERS', 'CREATE'), UserController.createUser);
router.put('/:id', authenticateToken, requirePermission('USERS', 'UPDATE'), UserController.updateUser);
router.post('/:id/reset-password', authenticateToken, requirePermission('USERS', 'UPDATE'), UserController.resetPassword);
router.delete('/:id', authenticateToken, requirePermission('USERS', 'DELETE'), UserController.deleteUser);

export default router;
