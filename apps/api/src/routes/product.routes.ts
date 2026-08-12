import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', ProductController.getProducts);
router.post('/reset', ProductController.resetProducts);
router.post('/clear-all', ProductController.clearAllProducts);
router.get('/barcode/:barcode', ProductController.getProductByBarcode);
router.get('/export-excel', ProductController.exportExcel);
router.get('/template-excel', ProductController.downloadTemplateExcel);
router.post('/import-excel', ProductController.importExcel);
router.post('/', ProductController.createProduct);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

// Categories endpoints
router.get('/categories', ProductController.getCategories);
router.post('/categories', ProductController.createCategory);
router.put('/categories/:name', ProductController.updateCategory);
router.delete('/categories/:name', ProductController.deleteCategory);

// Brands endpoints
router.get('/brands', ProductController.getBrands);
router.post('/brands', ProductController.createBrand);
router.put('/brands/:name', ProductController.updateBrand);
router.delete('/brands/:name', ProductController.deleteBrand);

// Locations endpoints
router.get('/locations', ProductController.getLocations);
router.post('/locations', ProductController.createLocation);
router.put('/locations/:name', ProductController.updateLocation);
router.delete('/locations/:name', ProductController.deleteLocation);

// Custom Units endpoints
router.get('/units', ProductController.getUnits);
router.post('/units', ProductController.createUnit);
router.put('/units/:name', ProductController.updateUnit);
router.delete('/units/:name', ProductController.deleteUnit);

export default router;
