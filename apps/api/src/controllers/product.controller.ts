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
      return sendSuccess(res, { products, categories, brands, locations, units });
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

  static getProductByBarcode = async (req: Request, res: Response) => {
    try {
      const { barcode } = req.params;
      const product = ProductService.getProductByBarcode(barcode);
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
      const csv = ProductService.generateExcelExportCsv();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=danh_sach_san_pham.csv');
      return res.status(200).send('\uFEFF' + csv);
    } catch (err: any) {
      return sendError(res, err.message);
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

  static deleteUnit = async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const units = ProductService.deleteUnit(name);
      return sendSuccess(res, units, 'Xóa đơn vị tính thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };
}
