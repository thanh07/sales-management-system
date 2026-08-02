import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { sendSuccess, sendError } from '../utils/response';

export class ProductController {
  static getProducts(req: Request, res: Response) {
    try {
      const { query, category } = req.query;
      const products = ProductService.getAllProducts(
        query as string,
        category as string
      );
      const categories = ProductService.getCategories();
      const units = ProductService.getUnits();
      return sendSuccess(res, { products, categories, units }, 'Lấy danh sách sản phẩm thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 500);
    }
  }

  static getByBarcode(req: Request, res: Response) {
    try {
      const { barcode } = req.params;
      const product = ProductService.getProductByBarcode(barcode);
      return sendSuccess(res, product, 'Tìm sản phẩm thành công');
    } catch (error: any) {
      return sendError(res, error.message, null, 404);
    }
  }

  static createProduct(req: Request, res: Response) {
    try {
      const product = ProductService.addProduct(req.body);
      return sendSuccess(res, product, 'Thêm sản phẩm thành công', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi thêm sản phẩm', error, 400);
    }
  }

  static exportExcel(req: Request, res: Response) {
    try {
      const csvData = ProductService.generateExcelExportCsv();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="danh_sach_san_pham.csv"'
      );
      return res.send('\uFEFF' + csvData);
    } catch (error: any) {
      return sendError(res, error.message, error, 500);
    }
  }

  static importExcel(req: Request, res: Response) {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return sendError(res, 'Dữ liệu import không hợp lệ', null, 400);
      }
      const count = ProductService.importProductsFromExcel(items);
      return sendSuccess(res, { count }, `Đã nhập thành công ${count} sản phẩm từ file Excel`);
    } catch (error: any) {
      return sendError(res, error.message, error, 400);
    }
  }

  // Category Controllers
  static getCategories(req: Request, res: Response) {
    try {
      const categories = ProductService.getCategories();
      return sendSuccess(res, categories, 'Lấy danh sách danh mục thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 500);
    }
  }

  static addCategory(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const categories = ProductService.addCategory(name);
      return sendSuccess(res, categories, 'Thêm danh mục mới thành công', 201);
    } catch (error: any) {
      return sendError(res, error.message, error, 400);
    }
  }

  static updateCategory(req: Request, res: Response) {
    try {
      const { oldName, newName } = req.body;
      const categories = ProductService.updateCategory(oldName, newName);
      return sendSuccess(res, categories, 'Cập nhật danh mục thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 400);
    }
  }

  static deleteCategory(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const categories = ProductService.deleteCategory(name);
      return sendSuccess(res, categories, 'Xóa danh mục thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 400);
    }
  }

  // Units Controllers
  static getUnits(req: Request, res: Response) {
    try {
      const units = ProductService.getUnits();
      return sendSuccess(res, units, 'Lấy danh sách đơn vị tính thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 500);
    }
  }

  static addUnit(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const units = ProductService.addUnit(name);
      return sendSuccess(res, units, 'Thêm đơn vị tính mới thành công', 201);
    } catch (error: any) {
      return sendError(res, error.message, error, 400);
    }
  }

  static deleteUnit(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const units = ProductService.deleteUnit(name);
      return sendSuccess(res, units, 'Xóa đơn vị tính thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 400);
    }
  }
}
