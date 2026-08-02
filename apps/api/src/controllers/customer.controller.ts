import { Request, Response } from 'express';
import { CustomerService } from '../services/customer.service';
import { sendSuccess, sendError } from '../utils/response';

export class CustomerController {
  static getCustomers(req: Request, res: Response) {
    try {
      const { query, group } = req.query;
      const customers = CustomerService.getCustomers(query as string, group as string);
      return sendSuccess(res, customers, 'Lấy danh sách khách hàng thành công');
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi lấy danh sách khách hàng', error, 500);
    }
  }

  static getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customer = CustomerService.getCustomerById(id);
      return sendSuccess(res, customer, 'Lấy thông tin khách hàng thành công');
    } catch (error: any) {
      return sendError(res, error.message, null, 404);
    }
  }

  static createCustomer(req: Request, res: Response) {
    try {
      const newCust = CustomerService.addCustomer(req.body);
      return sendSuccess(res, newCust, 'Tạo mới khách hàng thành công', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi tạo khách hàng', error, 400);
    }
  }

  static getAbcAnalysis(req: Request, res: Response) {
    try {
      const data = CustomerService.getAbcAnalysis();
      return sendSuccess(res, data, 'Phân loại khách hàng Pareto ABC thành công');
    } catch (error: any) {
      return sendError(res, 'Lỗi phân tích Pareto ABC', error, 500);
    }
  }
}
