import { Request, Response } from 'express';
import { BackupService } from '../services/backup.service';
import { sendSuccess, sendError } from '../utils/response';

export class BackupController {
  static getConfig = async (req: Request, res: Response) => {
    try {
      const config = BackupService.getBackupConfig();
      return sendSuccess(res, config, 'Lấy cấu hình tự động sao lưu thành công');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  };

  static updateConfig = async (req: Request, res: Response) => {
    try {
      const updated = BackupService.updateBackupConfig(req.body);
      return sendSuccess(res, updated, 'Lưu cấu hình tự động sao lưu thành công!');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static listBackups = async (req: Request, res: Response) => {
    try {
      const backups = BackupService.listBackups();
      return sendSuccess(res, backups, 'Lấy danh sách các bản sao lưu hệ thống thành công');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  };

  static createBackup = async (req: Request, res: Response) => {
    try {
      const meta = BackupService.createBackup('MANUAL');
      return sendSuccess(res, meta, `Đã tạo bản sao lưu thành công (${meta.filename})!`);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  };

  static downloadBackup = async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const filePath = BackupService.getBackupFilePath(filename);
      return res.download(filePath, filename);
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  };

  static restoreBackup = async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const result = BackupService.restoreBackup(filename);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static uploadRestore = async (req: Request, res: Response) => {
    try {
      const snapshot = req.body;
      const result = BackupService.restoreFromSnapshot(snapshot, 'Khôi phục từ file tải lên');
      
      // Save an import backup record as well
      try {
        BackupService.createBackup('IMPORT');
      } catch (e) {
        console.warn('Failed to record import snapshot:', e);
      }

      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static deleteBackup = async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const result = BackupService.deleteBackup(filename);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };
}
