import bcrypt from 'bcryptjs';
import { generateTokens } from '../utils/jwt';
import { UserPayload, UserRole } from '../types';
import { UserService } from './user.service';

export class AuthService {
  static async login(usernameOrEmailOrCodeOrPhone: string, password: string) {
    if (!usernameOrEmailOrCodeOrPhone || !password) {
      throw new Error('Vui lòng nhập tài khoản và mật khẩu');
    }

    const user = UserService.findUserForAuth(usernameOrEmailOrCodeOrPhone);

    if (!user) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác');
    }

    if (!user.isActive || user.workStatus === 'NGHI_VIEC') {
      throw new Error('Tài khoản nhân viên này đã ngừng hoạt động / nghỉ việc');
    }

    if (user.allowSoftwareAccess === false) {
      throw new Error('Tài khoản này chưa được cấp quyền truy cập phần mềm');
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác');
    }

    const permissions: string[] =
      user.role === 'ADMIN'
        ? ['*']
        : user.role === 'MANAGER'
        ? ['POS:*', 'PRODUCTS:*', 'REPORTS:*', 'ORDERS:*', 'INVENTORY:*']
        : user.role === 'CASHIER'
        ? ['POS:CREATE', 'POS:READ', 'ORDERS:READ', 'PRODUCTS:READ']
        : user.role === 'WAREHOUSE'
        ? ['INVENTORY:*', 'PRODUCTS:READ', 'PRODUCTS:CREATE', 'PRODUCTS:UPDATE']
        : ['POS:CREATE', 'ORDERS:READ', 'PRODUCTS:READ'];

    const payload: UserPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId || 'branch-01',
      permissions,
    };

    const tokens = generateTokens(payload);
    return {
      user: payload,
      tokens,
    };
  }

  static async getUsers() {
    return UserService.getAllUsers();
  }
}
