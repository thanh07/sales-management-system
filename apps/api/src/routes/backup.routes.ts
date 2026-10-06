import { Router } from 'express';
import { BackupController } from '../controllers/backup.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.use(requireRoles(['ADMIN']));

router.get('/config', BackupController.getConfig);
router.put('/config', BackupController.updateConfig);

router.get('/list', BackupController.listBackups);
router.post('/create', BackupController.createBackup);
router.get('/download/:filename', BackupController.downloadBackup);
router.post('/restore/:filename', BackupController.restoreBackup);
router.post('/upload-restore', BackupController.uploadRestore);
router.delete('/:filename', BackupController.deleteBackup);

export default router;
