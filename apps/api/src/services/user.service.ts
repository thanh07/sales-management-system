import bcrypt from 'bcryptjs';
import { UserRole } from '../types';

export interface UserRecord {
  id: string;
  employeeCode: string; // Mã nhân viên (VD: NVA, NV001)
  username: string; // Tên đăng nhập
  passwordHash: string; // Mật khẩu mã hóa bcrypt
  fullName: string; // Họ và tên
  avatar?: string; // Ảnh đại diện
  email: string;
  phone: string; // ĐT di động
  role: UserRole; // ADMIN, MANAGER, CASHIER, WAREHOUSE, SALE
  workStatus: 'CHINH_THUC' | 'THU_VIEC' | 'NGHI_VIEC' | 'TAM_NGHI';
  allowSoftwareAccess: boolean; // Cho phép làm việc với phần mềm
  idCardNumber?: string; // Số CMND / CCCD
  idCardIssueDate?: string; // Ngày cấp
  idCardIssuePlace?: string; // Nơi cấp
  birthday?: string; // Ngày sinh
  maritalStatus?: 'DOC_THAN' | 'DA_KET_HON'; // Tình trạng hôn nhân
  gender?: 'NAM' | 'NU'; // Giới tính
  branchName: string; // Chi nhánh làm việc
  branchId?: string; // ID chi nhánh
  isActive: boolean;
  createdAt: string;
}

let MOCK_STAFF: UserRecord[] = [
  {
    id: 'usr-admin-01',
    employeeCode: 'ADMIN01',
    username: 'admin',
    passwordHash: bcrypt.hashSync('admin123', 10),
    fullName: 'Nguyễn Văn Thành (Admin)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    email: 'admin@salesmanager.vn',
    phone: '0909123456',
    role: 'ADMIN',
    workStatus: 'CHINH_THUC',
    allowSoftwareAccess: true,
    idCardNumber: '079095012345',
    idCardIssueDate: '2021-05-12',
    idCardIssuePlace: 'Cục CSQLHC về TTXH',
    birthday: '1990-08-15',
    maritalStatus: 'DA_KET_HON',
    gender: 'NAM',
    branchName: 'Chi nhánh Chợ Bến Thành (CN-01)',
    branchId: 'branch-01',
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'usr-cashier-01',
    employeeCode: 'NVA',
    username: 'cashier',
    passwordHash: bcrypt.hashSync('cashier123', 10),
    fullName: 'Nguyễn Văn A (Thu Ngân)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    email: 'nva@salesmanager.vn',
    phone: '0564313451',
    role: 'CASHIER',
    workStatus: 'CHINH_THUC',
    allowSoftwareAccess: true,
    idCardNumber: '079098056789',
    idCardIssueDate: '2022-10-20',
    idCardIssuePlace: 'Cục CSQLHC về TTXH',
    birthday: '1998-03-22',
    maritalStatus: 'DOC_THAN',
    gender: 'NAM',
    branchName: 'Chi nhánh Chợ Bến Thành (CN-01)',
    branchId: 'branch-01',
    isActive: true,
    createdAt: '2026-02-15T09:30:00Z',
  },
  {
    id: 'usr-warehouse-01',
    employeeCode: 'NV02',
    username: 'warehouse',
    passwordHash: bcrypt.hashSync('warehouse123', 10),
    fullName: 'Lê Huỳnh Công Trí (Thủ Kho)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    email: 'warehouse@salesmanager.vn',
    phone: '0336615753',
    role: 'WAREHOUSE',
    workStatus: 'CHINH_THUC',
    allowSoftwareAccess: true,
    idCardNumber: '079093011223',
    idCardIssueDate: '2020-08-15',
    idCardIssuePlace: 'Công an TP. Hồ Chí Minh',
    birthday: '1995-11-05',
    maritalStatus: 'DOC_THAN',
    gender: 'NAM',
    branchName: 'Kho Tổng Trung Tâm TP.HCM (KHO-01)',
    branchId: 'branch-03',
    isActive: true,
    createdAt: '2026-03-10T14:15:00Z',
  },
  {
    id: 'usr-manager-01',
    employeeCode: 'NV03',
    username: 'manager',
    passwordHash: bcrypt.hashSync('manager123', 10),
    fullName: 'Trần Thu Trang (Quản Lý)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    email: 'manager@salesmanager.vn',
    phone: '0903445566',
    role: 'MANAGER',
    workStatus: 'CHINH_THUC',
    allowSoftwareAccess: true,
    idCardNumber: '079196099887',
    idCardIssueDate: '2021-01-18',
    idCardIssuePlace: 'Cục CSQLHC về TTXH',
    birthday: '1996-07-29',
    maritalStatus: 'DA_KET_HON',
    gender: 'NU',
    branchName: 'Chi nhánh Chợ Bến Thành (CN-01)',
    branchId: 'branch-01',
    isActive: true,
    createdAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'usr-sale-01',
    employeeCode: 'NV04',
    username: 'quynhnhu',
    passwordHash: bcrypt.hashSync('123456', 10),
    fullName: 'Quỳnh Như (Tư Vấn Bán Hàng)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
    email: 'quynhnhu@salesmanager.vn',
    phone: '0344798446',
    role: 'SALE',
    workStatus: 'THU_VIEC',
    allowSoftwareAccess: true,
    idCardNumber: '079199044556',
    idCardIssueDate: '2023-04-10',
    idCardIssuePlace: 'Cục CSQLHC về TTXH',
    birthday: '2001-12-14',
    maritalStatus: 'DOC_THAN',
    gender: 'NU',
    branchName: 'Chi nhánh Quận 7 (CN-02)',
    branchId: 'branch-02',
    isActive: true,
    createdAt: '2026-05-10T08:00:00Z',
  },
];

export class UserService {
  static getAllUsers() {
    // Strip passwordHash before returning to clients
    return MOCK_STAFF.map(({ passwordHash, ...user }) => user);
  }

  static findUserForAuth(identifier: string): UserRecord | undefined {
    const term = identifier.trim().toLowerCase();
    return MOCK_STAFF.find(
      (u) =>
        (u.username && u.username.toLowerCase() === term) ||
        (u.employeeCode && u.employeeCode.toLowerCase() === term) ||
        (u.email && u.email.toLowerCase() === term) ||
        (u.phone && u.phone.replace(/[^0-9]/g, '') === term.replace(/[^0-9]/g, ''))
    );
  }

  static createUser(data: any) {
    const rawUsername = data.username || data.employeeCode || `user_${Date.now()}`;
    const username = rawUsername.trim().toLowerCase();
    const employeeCode = data.employeeCode?.trim().toUpperCase() || `NV${String(MOCK_STAFF.length + 1).padStart(3, '0')}`;

    const existing = MOCK_STAFF.find(
      (u) =>
        u.username.toLowerCase() === username ||
        (u.email && data.email && u.email.toLowerCase() === data.email.trim().toLowerCase()) ||
        u.employeeCode.toUpperCase() === employeeCode
    );

    if (existing) {
      throw new Error('Mã nhân viên, Tên đăng nhập hoặc Email đã tồn tại!');
    }

    const plainPassword = data.password?.trim() || '123456';
    const passwordHash = bcrypt.hashSync(plainPassword, 10);

    const newUser: UserRecord = {
      id: `usr-${Date.now()}`,
      employeeCode,
      username,
      passwordHash,
      fullName: data.fullName || 'Nhân viên mới',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
      email: data.email || `${username}@salesmanager.vn`,
      phone: data.phone || '',
      role: data.role || 'CASHIER',
      workStatus: data.workStatus || 'CHINH_THUC',
      allowSoftwareAccess: data.allowSoftwareAccess !== false,
      idCardNumber: data.idCardNumber || '',
      idCardIssueDate: data.idCardIssueDate || '',
      idCardIssuePlace: data.idCardIssuePlace || '',
      birthday: data.birthday || '',
      maritalStatus: data.maritalStatus || 'DOC_THAN',
      gender: data.gender || 'NAM',
      branchName: data.branchName || 'Chi nhánh Chợ Bến Thành (CN-01)',
      branchId: data.branchId || 'branch-01',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    MOCK_STAFF.unshift(newUser);
    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  }

  static updateUser(id: string, data: any) {
    const user = MOCK_STAFF.find((u) => u.id === id);
    if (!user) throw new Error('Không tìm thấy nhân viên');

    if (data.employeeCode) user.employeeCode = data.employeeCode.trim().toUpperCase();
    if (data.username) user.username = data.username.trim().toLowerCase();
    if (data.password && data.password.trim()) {
      user.passwordHash = bcrypt.hashSync(data.password.trim(), 10);
    }
    if (data.fullName) user.fullName = data.fullName.trim();
    if (data.avatar) user.avatar = data.avatar;
    if (data.email) user.email = data.email.trim();
    if (data.phone) user.phone = data.phone.trim();
    if (data.role) user.role = data.role;
    if (data.workStatus) user.workStatus = data.workStatus;
    if (data.allowSoftwareAccess !== undefined) user.allowSoftwareAccess = data.allowSoftwareAccess;
    if (data.idCardNumber !== undefined) user.idCardNumber = data.idCardNumber;
    if (data.idCardIssueDate !== undefined) user.idCardIssueDate = data.idCardIssueDate;
    if (data.idCardIssuePlace !== undefined) user.idCardIssuePlace = data.idCardIssuePlace;
    if (data.birthday !== undefined) user.birthday = data.birthday;
    if (data.maritalStatus !== undefined) user.maritalStatus = data.maritalStatus;
    if (data.gender !== undefined) user.gender = data.gender;
    if (data.branchName !== undefined) user.branchName = data.branchName;
    if (data.branchId !== undefined) user.branchId = data.branchId;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  static resetPassword(id: string, newPassword: string) {
    const user = MOCK_STAFF.find((u) => u.id === id);
    if (!user) throw new Error('Không tìm thấy nhân viên');
    if (!newPassword || newPassword.trim().length < 6) {
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
    }
    user.passwordHash = bcrypt.hashSync(newPassword.trim(), 10);
    return true;
  }

  static deleteUser(id: string) {
    const index = MOCK_STAFF.findIndex((u) => u.id === id);
    if (index !== -1) {
      MOCK_STAFF.splice(index, 1);
    }
    return true;
  }
}
