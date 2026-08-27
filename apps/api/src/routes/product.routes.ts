import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

// Read-only catalog endpoints (Accessible by all roles: ADMIN, WAREHOUSE, CASHIER)
router.get('/', ProductController.getProducts);
router.get('/barcode/:barcode', ProductController.getProductByBarcode);
router.get('/export-excel', ProductController.exportExcel);
router.get('/template-excel', ProductController.downloadTemplateExcel);
router.get('/categories', ProductController.getCategories);
router.get('/brands', ProductController.getBrands);
router.get('/locations', ProductController.getLocations);
router.get('/units', ProductController.getUnits);

// Super-admin destructive actions (Only ADMIN)
router.post('/reset', requireRoles(['ADMIN']), ProductController.resetProducts);
router.post('/clear-all', requireRoles(['ADMIN']), ProductController.clearAllProducts);

// Product CRUD & Excel batch import (ADMIN & WAREHOUSE)
router.post('/import-excel', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.importExcel);
router.post('/', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.createProduct);
router.put('/:id', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.updateProduct);
router.patch('/:id/branch-status', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.updateBranchStatus);
router.patch('/:id/branch-min-stock', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.updateBranchMinStock);
router.delete('/:id', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.deleteProduct);

// Master Categories management (ADMIN & WAREHOUSE)
router.post('/categories', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.createCategory);
router.put('/categories/:name', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.updateCategory);
router.delete('/categories/:name', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.deleteCategory);

// Master Brands management (ADMIN & WAREHOUSE)
router.post('/brands', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.createBrand);
router.put('/brands/:name', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.updateBrand);
router.delete('/brands/:name', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.deleteBrand);

// Master Locations management (ADMIN & WAREHOUSE)
router.post('/locations', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.createLocation);
router.put('/locations/:name', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.updateLocation);
router.delete('/locations/:name', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.deleteLocation);

// Custom Units management (ADMIN & WAREHOUSE)
router.post('/units', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.createUnit);
router.put('/units/:name', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.updateUnit);
router.delete('/units/:name', requireRoles(['ADMIN', 'WAREHOUSE']), ProductController.deleteUnit);

export default router;
