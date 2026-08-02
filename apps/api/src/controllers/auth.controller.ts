import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return sendError(res, 'Vui lòng nhập tên đăng nhập và mật khẩu');
      }

      const result = await AuthService.login(username, password);
      return sendSuccess(res, result, 'Đăng nhập thành công');
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi đăng nhập', null, 400);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return sendError(res, 'Chưa xác thực', null, 401);
    }
    return sendSuccess(res, req.user, 'Lấy thông tin người dùng thành công');
  }

  static async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await AuthService.getUsers();
      return sendSuccess(res, users, 'Lấy danh sách nhân viên thành công');
    } catch (error: any) {
      return sendError(res, 'Lỗi lấy danh sách nhân viên', error, 500);
    }
  }
}
