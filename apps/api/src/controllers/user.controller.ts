import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response';

export class UserController {
  static getUsers(req: Request, res: Response) {
    try {
      const users = UserService.getAllUsers();
      return sendSuccess(res, users, 'Lấy danh sách nhân viên thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 500);
    }
  }

  static createUser(req: Request, res: Response) {
    try {
      const user = UserService.createUser(req.body);
      return sendSuccess(res, user, 'Tạo mới nhân viên thành công', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi tạo nhân viên', error, 400);
    }
  }

  static updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = UserService.updateUser(id, req.body);
      return sendSuccess(res, user, 'Cập nhật nhân viên thành công');
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi cập nhật nhân viên', error, 400);
    }
  }

  static deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      UserService.deleteUser(id);
      return sendSuccess(res, null, 'Xóa nhân viên thành công');
    } catch (error: any) {
      return sendError(res, error.message, error, 400);
    }
  }
}
