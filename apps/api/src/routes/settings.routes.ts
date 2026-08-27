import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

// All authenticated roles can read store settings (e.g. For receipt info, branch name)
router.get('/', SettingsController.getSettings);
router.get('/image-presets', SettingsController.getImagePresets);

// Only ADMIN can update store settings & image presets
router.put('/', requireRoles(['ADMIN']), SettingsController.updateSettings);
router.post('/image-presets', requireRoles(['ADMIN']), SettingsController.addImagePreset);
router.put('/image-presets/:id', requireRoles(['ADMIN']), SettingsController.updateImagePreset);
router.delete('/image-presets/:id', requireRoles(['ADMIN']), SettingsController.deleteImagePreset);
router.post('/reset-data', requireRoles(['ADMIN']), SettingsController.resetData);

// System Configuration Snapshot Bundle (Backup & Restore)
router.get('/export-bundle', requireRoles(['ADMIN']), SettingsController.exportBundle);
router.post('/import-bundle', requireRoles(['ADMIN']), SettingsController.importBundle);
router.post('/load-default-config', requireRoles(['ADMIN']), SettingsController.loadDefaultConfig);

export default router;
