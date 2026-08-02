import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { PosService } from '../services/pos.service';
import { sendSuccess, sendError } from '../utils/response';

export class PosController {
  static checkout(req: AuthenticatedRequest, res: Response) {
    try {
      const cashierId = req.user?.userId || 'usr-cashier-01';
      const branchId = req.user?.branchId || 'branch-01';

      const order = PosService.checkout({
        ...req.body,
        cashierId,
        branchId,
      });

      return sendSuccess(res, order, 'Thanh toán đơn hàng thành công', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Thanh toán thất bại', error, 400);
    }
  }

  static getOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const orders = PosService.getOrders();
      return sendSuccess(res, orders, 'Lấy danh sách hóa đơn thành công');
    } catch (error: any) {
      return sendError(res, 'Lỗi lấy hóa đơn', error, 500);
    }
  }

  static parkOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const parked = PosService.parkOrder(req.body);
      return sendSuccess(res, parked, 'Đã tạm giữ đơn hàng');
    } catch (error: any) {
      return sendError(res, 'Lỗi tạm giữ đơn hàng', error, 400);
    }
  }

  static getParkedOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const list = PosService.getParkedOrders();
      return sendSuccess(res, list, 'Lấy danh sách đơn tạm giữ thành công');
    } catch (error: any) {
      return sendError(res, 'Lỗi lấy đơn tạm giữ', error, 500);
    }
  }

  static deleteParkedOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      PosService.deleteParkedOrder(id);
      return sendSuccess(res, null, 'Đã xóa đơn tạm giữ');
    } catch (error: any) {
      return sendError(res, 'Lỗi xóa đơn tạm giữ', error, 400);
    }
  }
}
