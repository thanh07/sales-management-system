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

  static getImagePresets = async (req: Request, res: Response) => {
    try {
      const presets = SettingsService.getImagePresets();
      return sendSuccess(res, presets, 'Lấy danh sách gợi ý hình ảnh thành công');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  };

  static addImagePreset = async (req: Request, res: Response) => {
    try {
      const { label, url } = req.body;
      if (!label || !url) {
        return sendError(res, 'Vui lòng cung cấp nhãn hiển thị và đường link hình ảnh', 400);
      }
      const presets = SettingsService.addImagePreset(label, url);
      return sendSuccess(res, presets, 'Thêm mới gợi ý hình ảnh thành công!');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static updateImagePreset = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { label, url } = req.body;
      if (!label || !url) {
        return sendError(res, 'Vui lòng cung cấp nhãn hiển thị và đường link hình ảnh', 400);
      }
      const presets = SettingsService.updateImagePreset(id, label, url);
      return sendSuccess(res, presets, 'Cập nhật gợi ý hình ảnh thành công!');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static deleteImagePreset = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const presets = SettingsService.deleteImagePreset(id);
      return sendSuccess(res, presets, 'Xóa gợi ý hình ảnh thành công!');
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

  static exportBundle = async (req: Request, res: Response) => {
    try {
      const bundle = SettingsService.exportSystemBundle();
      return sendSuccess(res, bundle, 'Xuất toàn bộ gói cấu hình hệ thống thành công');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  };

  static importBundle = async (req: Request, res: Response) => {
    try {
      const result = SettingsService.importSystemBundle(req.body);
      return sendSuccess(res, result, 'Khôi phục gói cấu hình hệ thống thành công!');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static loadDefaultConfig = async (req: Request, res: Response) => {
    try {
      const result = SettingsService.loadDefaultSystemConfig();
      return sendSuccess(res, result, 'Nạp cấu hình hệ thống chuẩn mặc định thành công!');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  };
}
