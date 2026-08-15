import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

// All authenticated roles can read store settings (e.g. For receipt info, branch name)
router.get('/', SettingsController.getSettings);

// Only ADMIN can update store settings
router.put('/', requireRoles(['ADMIN']), SettingsController.updateSettings);
router.post('/reset-data', requireRoles(['ADMIN']), SettingsController.resetData);

export default router;
