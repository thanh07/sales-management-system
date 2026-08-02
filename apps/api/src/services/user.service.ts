import bcrypt from 'bcryptjs';
import { UserRole } from '../types';

export interface UserRecord {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  branchName: string;
  isActive: boolean;
  createdAt: string;
}

const MOCK_STAFF: UserRecord[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@salesmanager.vn',
    username: 'admin',
    fullName: 'Quản Trị Viên (Admin)',
    phone: '0909123456',
    role: 'ADMIN',
    branchName: 'Chi nhánh Bến Thành (CN-01)',
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'usr-cashier-01',
    email: 'cashier@salesmanager.vn',
    username: 'cashier',
    fullName: 'Nguyễn Văn Nam (Thu Ngân Quầy 1)',
    phone: '0918765432',
    role: 'CASHIER',
    branchName: 'Chi nhánh Bến Thành (CN-01)',
    isActive: true,
    createdAt: '2026-02-15T09:30:00Z',
  },
  {
    id: 'usr-warehouse-01',
    email: 'warehouse@salesmanager.vn',
    username: 'warehouse',
    fullName: 'Lê Hoàng Minh (Thủ Kho)',
    phone: '0988112233',
    role: 'WAREHOUSE',
    branchName: 'Chi nhánh Bến Thành (CN-01)',
    isActive: true,
    createdAt: '2026-03-10T14:15:00Z',
  },
  {
    id: 'usr-manager-01',
    email: 'manager@salesmanager.vn',
    username: 'manager',
    fullName: 'Trần Thu Trang (Quản Lý Cửa Hàng)',
    phone: '0903445566',
    role: 'MANAGER',
    branchName: 'Chi nhánh Bến Thành (CN-01)',
    isActive: true,
    createdAt: '2026-04-01T10:00:00Z',
  },
];

export class UserService {
  static getAllUsers() {
    return MOCK_STAFF;
  }

  static createUser(data: any) {
    const existing = MOCK_STAFF.find((u) => u.username === data.username || u.email === data.email);
    if (existing) {
      throw new Error('Tên đăng nhập hoặc Email đã tồn tại trong hệ thống');
    }

    const newUser: UserRecord = {
      id: `usr-${Date.now()}`,
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone || '',
      role: data.role || 'CASHIER',
      branchName: data.branchName || 'Chi nhánh Bến Thành (CN-01)',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    MOCK_STAFF.unshift(newUser);
    return newUser;
  }

  static updateUser(id: string, data: any) {
    const user = MOCK_STAFF.find((u) => u.id === id);
    if (!user) throw new Error('Không tìm thấy nhân viên');
    if (data.fullName) user.fullName = data.fullName;
    if (data.role) user.role = data.role;
    if (data.phone) user.phone = data.phone;
    if (data.isActive !== undefined) user.isActive = data.isActive;
    return user;
  }

  static deleteUser(id: string) {
    const index = MOCK_STAFF.findIndex((u) => u.id === id);
    if (index !== -1) {
      MOCK_STAFF.splice(index, 1);
    }
    return true;
  }
}
