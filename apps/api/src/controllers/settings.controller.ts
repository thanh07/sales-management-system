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
}
