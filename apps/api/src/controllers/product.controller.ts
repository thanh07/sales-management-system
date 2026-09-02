import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { sendSuccess, sendError } from '../utils/response';

export class ProductController {
  static getProducts = async (req: Request, res: Response) => {
    try {
      const { query, category, brand, location } = req.query;
      const products = ProductService.getAllProducts(
        query as string,
        category as string,
        brand as string,
        location as string
      );
      const categories = ProductService.getCategories();
      const brands = ProductService.getBrands();
      const locations = ProductService.getLocations();
      const units = ProductService.getUnits();

      // SECURITY: Mask cost price (giá vốn) if user is a CASHIER
      const userRole = (req as any).user?.role;
      let sanitizedProducts = products;

      if (userRole === 'CASHIER') {
        sanitizedProducts = products.map((p) => {
          const { costPrice, ...pRest } = p;
          if (pRest.variants) {
            pRest.variants = pRest.variants.map((v) => {
              const { costPrice: vCost, ...vRest } = v;
              return vRest as any;
            });
          }
          return pRest as any;
        });
      }

      return sendSuccess(res, { products: sanitizedProducts, categories, brands, locations, units });
    } catch (err: any) {
      return sendError(res, err.message);
    }
  };

  static resetProducts = async (req: Request, res: Response) => {
    try {
      const count = ProductService.resetAndSeed300GroceryProducts();
      return sendSuccess(res, { count }, `Đã xóa hết dữ liệu cũ và khởi tạo thành công ${count} sản phẩm hàng tạp hóa mới!`);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  };

  static clearAllProducts = async (req: Request, res: Response) => {
    try {
      ProductService.deleteAllProducts();
      return sendSuccess(res, null, 'Đã xóa toàn bộ dữ liệu sản phẩm thành công!');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  };

  static getProductByBarcode = async (req: Request, res: Response) => {
    try {
      const { barcode } = req.params;
      const product = ProductService.getProductByBarcode(barcode);

      // SECURITY: Mask cost price if user is a CASHIER
      const userRole = (req as any).user?.role;
      if (userRole === 'CASHIER') {
        const { costPrice, ...rest } = product;
        return sendSuccess(res, rest);
      }

      return sendSuccess(res, product);
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  };

  static createProduct = async (req: Request, res: Response) => {
    try {
      const product = ProductService.addProduct(req.body);
      return sendSuccess(res, product, 'Tạo sản phẩm mới thành công', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static updateProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = ProductService.updateProduct(id, req.body);
      return sendSuccess(res, product, 'Cập nhật thông tin sản phẩm thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static deleteProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      ProductService.deleteProduct(id);
      return sendSuccess(res, null, 'Xóa sản phẩm thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static importExcel = async (req: Request, res: Response) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) throw new Error('Dữ liệu danh sách không hợp lệ');
      const count = ProductService.importProductsFromExcel(items);
      return sendSuccess(res, { count }, `Đã nhập thành công ${count} sản phẩm từ file Excel!`);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static exportExcel = async (req: Request, res: Response) => {
    try {
      const { query, category, brand, location, branchId } = req.query as Record<string, string>;
      const csv = ProductService.generateExcelExportCsv(query, category, brand, location, branchId);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=danh_sach_san_pham.csv');
      return res.status(200).send('\uFEFF' + csv);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  };

  static downloadTemplateExcel = async (req: Request, res: Response) => {
    try {
      const csv = ProductService.generateExcelTemplateCsv();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=mau_nhap_hang_hoa_chuan.csv');
      return res.status(200).send('\uFEFF' + csv);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  };

  // Category Management
  static getCategories = async (req: Request, res: Response) => {
    try {
      const categories = ProductService.getCategories();
      return sendSuccess(res, categories);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  };

  static createCategory = async (req: Request, res: Response) => {
    try {
      const { name, icon, showOnPos } = req.body;
      const categories = ProductService.addCategory(name, icon, showOnPos);
      return sendSuccess(res, categories, 'Thêm nhóm hàng mới thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static updateCategory = async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const { newName, icon, showOnPos } = req.body;
      const categories = ProductService.updateCategory(name, newName, icon, showOnPos);
      return sendSuccess(res, categories, 'Cập nhật nhóm hàng thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static deleteCategory = async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const categories = ProductService.deleteCategory(name);
      return sendSuccess(res, categories, 'Xóa nhóm hàng thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  // Brand Management
  static getBrands = async (req: Request, res: Response) => {
    try {
      const brands = ProductService.getBrands();
      return sendSuccess(res, brands);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  };

  static createBrand = async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const brands = ProductService.addBrand(name);
      return sendSuccess(res, brands, 'Thêm thương hiệu mới thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static updateBrand = async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const { newName } = req.body;
      const brands = ProductService.updateBrand(name, newName);
      return sendSuccess(res, brands, 'Cập nhật thương hiệu thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static deleteBrand = async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const brands = ProductService.deleteBrand(name);
      return sendSuccess(res, brands, 'Xóa thương hiệu thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  // Location Management
  static getLocations = async (req: Request, res: Response) => {
    try {
      const locations = ProductService.getLocations();
      return sendSuccess(res, locations);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  };

  static createLocation = async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const locations = ProductService.addLocation(name);
      return sendSuccess(res, locations, 'Thêm vị trí lưu kho mới thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static updateLocation = async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const { newName } = req.body;
      const locations = ProductService.updateLocation(name, newName);
      return sendSuccess(res, locations, 'Cập nhật vị trí kho thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static deleteLocation = async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const locations = ProductService.deleteLocation(name);
      return sendSuccess(res, locations, 'Xóa vị trí kho thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  // Custom Units Management
  static getUnits = async (req: Request, res: Response) => {
    try {
      const units = ProductService.getUnits();
      return sendSuccess(res, units);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  };

  static createUnit = async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const units = ProductService.addUnit(name);
      return sendSuccess(res, units, 'Thêm đơn vị tính mới thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static updateUnit = async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const { newName } = req.body;
      const units = ProductService.updateUnit(name, newName);
      return sendSuccess(res, units, 'Cập nhật đơn vị tính thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static deleteUnit = async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const units = ProductService.deleteUnit(name);
      return sendSuccess(res, units, 'Xóa đơn vị tính thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  // Branch-specific settings
  static updateBranchStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { branchId, isActive } = req.body;
      if (!branchId || typeof isActive !== 'boolean') {
        return sendError(res, 'Vui lòng cung cấp branchId và trạng thái isActive', 400);
      }
      const product = ProductService.toggleBranchActiveStatus(id, branchId, isActive);
      return sendSuccess(res, product, `Đã ${isActive ? 'bật bán' : 'ngừng bán'} sản phẩm tại chi nhánh!`);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static updateBranchMinStock = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { branchId, minStock } = req.body;
      if (!branchId || minStock === undefined) {
        return sendError(res, 'Vui lòng cung cấp branchId và ngưỡng minStock', 400);
      }
      const product = ProductService.updateBranchMinStock(id, branchId, Number(minStock));
      return sendSuccess(res, product, 'Cập nhật định mức tồn kho tối thiểu tại chi nhánh thành công!');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };
}
