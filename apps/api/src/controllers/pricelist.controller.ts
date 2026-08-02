import { Request, Response } from 'express';
import { PriceListService } from '../services/pricelist.service';
import { sendSuccess, sendError } from '../utils/response';

export class PriceListController {
  static getPriceLists(req: Request, res: Response) {
    try {
      const { query, type } = req.query;
      const lists = PriceListService.getAllPriceLists(query as string, type as string);
      return sendSuccess(res, lists, 'Lấy danh sách bảng giá thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 500);
    }
  }

  static getComparisonMatrix(req: Request, res: Response) {
    try {
      const idsParam = req.query.ids as string;
      const ids = idsParam ? idsParam.split(',') : undefined;
      const matrix = PriceListService.getMultiPriceListComparisonMatrix(ids);
      return sendSuccess(res, matrix, 'Lấy ma trận so sánh nhiều bảng giá thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 500);
    }
  }

  static getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const priceList = PriceListService.getPriceListById(id);
      return sendSuccess(res, priceList, 'Lấy chi tiết bảng giá thành công');
    } catch (error: any) {
      return sendError(res, error.message, null, 404);
    }
  }

  static createPriceList(req: Request, res: Response) {
    try {
      const priceList = PriceListService.createPriceList(req.body);
      return sendSuccess(res, priceList, 'Tạo bảng giá mới thành công', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi tạo bảng giá', error, 400);
    }
  }

  static updatePriceList(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const priceList = PriceListService.updatePriceList(id, req.body);
      return sendSuccess(res, priceList, 'Cập nhật bảng giá thành công');
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi cập nhật bảng giá', error, 400);
    }
  }

  static toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const priceList = PriceListService.toggleStatus(id);
      return sendSuccess(res, priceList, `Đã ${priceList.isActive ? 'kích hoạt' : 'ngưng áp dụng'} bảng giá`);
    } catch (error: any) {
      return sendError(res, error.message, error, 400);
    }
  }

  static duplicatePriceList(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const priceList = PriceListService.duplicatePriceList(id);
      return sendSuccess(res, priceList, 'Nhân bản bảng giá thành công', 201);
    } catch (error: any) {
      return sendError(res, error.message, error, 400);
    }
  }

  static updateItems(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { items } = req.body;
      const priceList = PriceListService.updatePriceListItems(id, items);
      return sendSuccess(res, priceList, 'Đã lưu thiết lập giá sản phẩm vào bảng giá');
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi cập nhật giá sản phẩm', error, 400);
    }
  }

  static deletePriceList(req: Request, res: Response) {
    try {
      const { id } = req.params;
      PriceListService.deletePriceList(id);
      return sendSuccess(res, null, 'Xóa bảng giá thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 400);
    }
  }

  static resolveActivePriceList(req: Request, res: Response) {
    try {
      const { group } = req.query;
      const activeList = PriceListService.getActivePriceListForCustomerGroup(group as string);
      return sendSuccess(res, activeList, 'Áp dụng bảng giá phù hợp thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 500);
    }
  }
}
