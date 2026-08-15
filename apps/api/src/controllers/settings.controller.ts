import { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service';
import { sendSuccess, sendError } from '../utils/response';

export class SettingsController {
  static getSettings = async (req: Request, res: Response) => {
    try {
      const settings = SettingsService.getSettings();
      return sendSuccess(res, settings, 'Lấy thông tin thiết lập cửa hàng thành công');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  };

  static updateSettings = async (req: Request, res: Response) => {
    try {
      const updated = SettingsService.updateSettings(req.body);
      return sendSuccess(res, updated, 'Lưu thông tin thiết lập cửa hàng thành công!');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static resetData = async (req: Request, res: Response) => {
    try {
      const resData = SettingsService.resetAppAllData();
      return sendSuccess(res, resData, 'Đã xóa toàn bộ dữ liệu ứng dụng và nạp lại 100 sản phẩm đầy đủ cho tất cả các chi nhánh!');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };
}
