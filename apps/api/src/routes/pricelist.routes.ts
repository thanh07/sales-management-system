import { Router } from 'express';
import { PriceListController } from '../controllers/pricelist.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, PriceListController.getPriceLists);
router.get('/comparison', authenticateToken, PriceListController.getComparisonMatrix);
router.get('/resolve', authenticateToken, PriceListController.resolveActivePriceList);
router.get('/:id', authenticateToken, PriceListController.getById);
router.post('/', authenticateToken, PriceListController.createPriceList);
router.post('/:id/duplicate', authenticateToken, PriceListController.duplicatePriceList);
router.patch('/:id/toggle', authenticateToken, PriceListController.toggleStatus);
router.put('/:id', authenticateToken, PriceListController.updatePriceList);
router.put('/:id/items', authenticateToken, PriceListController.updateItems);
router.delete('/:id', authenticateToken, PriceListController.deletePriceList);

export default router;
