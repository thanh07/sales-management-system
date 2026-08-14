import { Request, Response } from 'express';
import { BranchService } from '../services/branch.service';
import { sendSuccess, sendError } from '../utils/response';

export class BranchController {
  static getAllBranches = async (req: Request, res: Response) => {
    try {
      const branches = BranchService.getAllBranches();
      return sendSuccess(res, branches, 'Lấy danh sách chi nhánh thành công');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  };

  static getBranchById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const branch = BranchService.getBranchById(id);
      if (!branch) {
        return sendError(res, 'Không tìm thấy chi nhánh', 404);
      }
      return sendSuccess(res, branch);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  };

  static createBranch = async (req: Request, res: Response) => {
    try {
      const newBranch = BranchService.createBranch(req.body);
      return sendSuccess(res, newBranch, 'Tạo mới chi nhánh thành công', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static updateBranch = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = BranchService.updateBranch(id, req.body);
      return sendSuccess(res, updated, 'Cập nhật chi nhánh thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };

  static deleteBranch = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      BranchService.deleteBranch(id);
      return sendSuccess(res, null, 'Xóa chi nhánh thành công');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  };
}
