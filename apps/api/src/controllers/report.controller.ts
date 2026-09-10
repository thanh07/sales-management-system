import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import { sendSuccess, sendError } from '../utils/response';

export class ReportController {
  static getSummary(req: Request, res: Response) {
    try {
      const data = ReportService.getSummary(req.query);
      return sendSuccess(res, data, 'Lấy tổng quan báo cáo thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 500);
    }
  }

  static getRevenueChart(req: Request, res: Response) {
    try {
      const data = ReportService.getRevenueChartData(req.query);
      return sendSuccess(res, data, 'Lấy biểu đồ doanh thu thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 500);
    }
  }

  static getTopPerformance(req: Request, res: Response) {
    try {
      const data = ReportService.getTopPerformance(req.query);
      return sendSuccess(res, data, 'Lấy báo cáo Top Performance thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 500);
    }
  }

  static getCustomerAnalytics(req: Request, res: Response) {
    try {
      const data = ReportService.getCustomerAnalytics(req.query);
      return sendSuccess(res, data, 'Lấy báo cáo phân tích khách hàng thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 500);
    }
  }

  static getTopSelling(req: Request, res: Response) {
    try {
      const data = ReportService.getTopPerformance({ ...req.query, type: 'products' });
      return sendSuccess(res, data, 'Lấy danh sách top bán chạy thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 500);
    }
  }

  static getLowStock(req: Request, res: Response) {
    try {
      const data = ReportService.getLowStockAlerts();
      return sendSuccess(res, data, 'Lấy cảnh báo hết hàng thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 500);
    }
  }
}
