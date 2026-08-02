import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/summary', authenticateToken, ReportController.getSummary);
router.get('/revenue-chart', authenticateToken, ReportController.getRevenueChart);
router.get('/top-selling', authenticateToken, ReportController.getTopSelling);
router.get('/low-stock', authenticateToken, ReportController.getLowStock);

export default router;
