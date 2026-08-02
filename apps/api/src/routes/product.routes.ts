import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, ProductController.getProducts);
router.get('/export-excel', authenticateToken, ProductController.exportExcel);
router.post('/import-excel', authenticateToken, ProductController.importExcel);
router.get('/barcode/:barcode', authenticateToken, ProductController.getByBarcode);
router.post('/', authenticateToken, ProductController.createProduct);

// Category Routes
router.get('/categories', authenticateToken, ProductController.getCategories);
router.post('/categories', authenticateToken, ProductController.addCategory);
router.put('/categories', authenticateToken, ProductController.updateCategory);
router.delete('/categories/:name', authenticateToken, ProductController.deleteCategory);

// Units Routes
router.get('/units', authenticateToken, ProductController.getUnits);
router.post('/units', authenticateToken, ProductController.addUnit);
router.delete('/units/:name', authenticateToken, ProductController.deleteUnit);

export default router;
