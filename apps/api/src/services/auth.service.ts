import bcrypt from 'bcryptjs';
import { generateTokens } from '../utils/jwt';
import { UserPayload, UserRole } from '../types';

// System default mock users for instant testing & demonstration
const MOCK_USERS = [
  {
    id: 'usr-admin-01',
    email: 'admin@salesmanager.vn',
    username: 'admin',
    passwordHash: bcrypt.hashSync('admin123', 10),
    fullName: 'Quản Trị Viên (Admin)',
    role: 'ADMIN' as UserRole,
    branchId: 'branch-01',
    permissions: ['*'],
  },
  {
    id: 'usr-cashier-01',
    email: 'cashier@salesmanager.vn',
    username: 'cashier',
    passwordHash: bcrypt.hashSync('cashier123', 10),
    fullName: 'Thu Ngân Quầy 1',
    role: 'CASHIER' as UserRole,
    branchId: 'branch-01',
    permissions: ['POS:CREATE', 'POS:READ', 'ORDERS:READ', 'PRODUCTS:READ'],
  },
  {
    id: 'usr-warehouse-01',
    email: 'warehouse@salesmanager.vn',
    username: 'warehouse',
    passwordHash: bcrypt.hashSync('warehouse123', 10),
    fullName: 'Thủ Kho Chi Nhánh 1',
    role: 'WAREHOUSE' as UserRole,
    branchId: 'branch-01',
    permissions: ['INVENTORY:READ', 'INVENTORY:UPDATE', 'PRODUCTS:READ', 'PRODUCTS:CREATE'],
  },
];

export class AuthService {
  static async login(usernameOrEmail: string, password: string) {
    const user = MOCK_USERS.find(
      (u) => u.username === usernameOrEmail || u.email === usernameOrEmail
    );

    if (!user) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác');
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác');
    }

    const payload: UserPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId,
      permissions: user.permissions,
    };

    const tokens = generateTokens(payload);
    return {
      user: payload,
      tokens,
    };
  }

  static async getUsers() {
    return MOCK_USERS.map(({ passwordHash, ...u }) => u);
  }
}
