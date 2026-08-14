import { Router } from 'express';
import { BranchController } from '../controllers/branch.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

// All authenticated roles can view branches (for branch switcher / checkout context)
router.get('/', BranchController.getAllBranches);
router.get('/:id', BranchController.getBranchById);

// Only ADMIN can create, update, or delete branches
router.post('/', requireRoles(['ADMIN']), BranchController.createBranch);
router.put('/:id', requireRoles(['ADMIN']), BranchController.updateBranch);
router.delete('/:id', requireRoles(['ADMIN']), BranchController.deleteBranch);

export default router;
