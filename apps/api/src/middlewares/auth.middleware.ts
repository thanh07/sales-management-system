import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  // Fallback: check query parameter token (used for direct browser file downloads)
  if (!token && req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    return sendError(res, 'Yêu cầu xác thực token (Access Token missing)', null, 401);
  }

  try {
    const user = verifyAccessToken(token);
    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Token không hợp lệ hoặc đã hết hạn', error, 401);
  }
};

export const requireRoles = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Chưa đăng nhập', null, 401);
    }

    if (req.user.role === 'ADMIN' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return sendError(
      res,
      `Tài khoản (${req.user.role}) không có quyền thực hiện thao tác quản trị này. Vui lòng đăng nhập tài khoản Quản Trị Viên (Admin).`,
      null,
      403
    );
  };
};

export const requirePermission = (module: string, action: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Chưa đăng nhập', null, 401);
    }

    if (req.user.role === 'ADMIN') {
      return next(); // Admin has all permissions
    }

    const permissionKey = `${module}:${action}`;
    const hasPermission = req.user.permissions?.includes(permissionKey);

    if (!hasPermission) {
      return sendError(res, `Bạn không có quyền thực hiện hành động này (${permissionKey})`, null, 403);
    }

    next();
  };
};
