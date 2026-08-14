export interface Branch {
  id: string; // e.g. "branch-01", "branch-02", "branch-03"
  code: string; // "CN-01", "CN-02", "KHO-01"
  name: string; // "Chi nhánh Chợ Bến Thành (CN-01)", "Chi nhánh Quận 7 (CN-02)", "Kho Tổng TP.HCM"
  phone: string;
  address: string;
  city: string;
  district: string;
  managerName?: string;
  isCentralWarehouse?: boolean; // Kho trung tâm / Kho tổng
  isActive: boolean;
  createdAt: string;
}

let BRANCHES_DB: Branch[] = [
  {
    id: 'branch-01',
    code: 'CN-01',
    name: 'Chi nhánh Chợ Bến Thành (CN-01)',
    phone: '0973634595',
    address: 'Số 33 Đường Nguyễn Huệ, Phường Bến Nghé',
    city: 'Hồ Chí Minh',
    district: 'Quận 1',
    managerName: 'Trần Thu Trang',
    isCentralWarehouse: false,
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'branch-02',
    code: 'CN-02',
    name: 'Chi nhánh Quận 7 (CN-02)',
    phone: '0988112233',
    address: 'Số 105 Đường Nguyễn Thị Thập, Phường Tân Phú',
    city: 'Hồ Chí Minh',
    district: 'Quận 7',
    managerName: 'Nguyễn Văn Nam',
    isCentralWarehouse: false,
    isActive: true,
    createdAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'branch-03',
    code: 'KHO-01',
    name: 'Kho Tổng Trung Tâm TP.HCM (KHO-01)',
    phone: '0909123456',
    address: 'Số 450 Quốc Lộ 1A, Phường Bình Trị Đông B',
    city: 'Hồ Chí Minh',
    district: 'Bình Tân',
    managerName: 'Lê Huỳnh Công Trí',
    isCentralWarehouse: true,
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
];

export class BranchService {
  static getAllBranches(): Branch[] {
    return [...BRANCHES_DB];
  }

  static getBranchById(id: string): Branch | undefined {
    return BRANCHES_DB.find((b) => b.id === id || b.code === id);
  }

  static createBranch(data: Partial<Branch>): Branch {
    if (!data.name?.trim()) {
      throw new Error('Tên chi nhánh không được để trống');
    }
    const code = data.code?.trim().toUpperCase() || `CN-0${BRANCHES_DB.length + 1}`;
    if (BRANCHES_DB.some((b) => b.code.toUpperCase() === code)) {
      throw new Error(`Mã chi nhánh ${code} đã tồn tại trong hệ thống`);
    }

    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      code,
      name: data.name.trim(),
      phone: data.phone?.trim() || '',
      address: data.address?.trim() || '',
      city: data.city || 'Hồ Chí Minh',
      district: data.district || '',
      managerName: data.managerName || '',
      isCentralWarehouse: !!data.isCentralWarehouse,
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString(),
    };

    BRANCHES_DB.push(newBranch);
    return newBranch;
  }

  static updateBranch(id: string, data: Partial<Branch>): Branch {
    const branch = BRANCHES_DB.find((b) => b.id === id);
    if (!branch) {
      throw new Error(`Không tìm thấy chi nhánh với ID: ${id}`);
    }

    if (data.code && data.code !== branch.code) {
      const codeUpper = data.code.trim().toUpperCase();
      if (BRANCHES_DB.some((b) => b.id !== id && b.code.toUpperCase() === codeUpper)) {
        throw new Error(`Mã chi nhánh ${codeUpper} đã được sử dụng`);
      }
      branch.code = codeUpper;
    }

    if (data.name) branch.name = data.name.trim();
    if (data.phone !== undefined) branch.phone = data.phone.trim();
    if (data.address !== undefined) branch.address = data.address.trim();
    if (data.city !== undefined) branch.city = data.city;
    if (data.district !== undefined) branch.district = data.district;
    if (data.managerName !== undefined) branch.managerName = data.managerName;
    if (data.isCentralWarehouse !== undefined) branch.isCentralWarehouse = data.isCentralWarehouse;
    if (data.isActive !== undefined) branch.isActive = data.isActive;

    return branch;
  }

  static deleteBranch(id: string): boolean {
    if (id === 'branch-01') {
      throw new Error('Không thể xóa chi nhánh mặc định của hệ thống');
    }
    const idx = BRANCHES_DB.findIndex((b) => b.id === id);
    if (idx === -1) {
      throw new Error(`Không tìm thấy chi nhánh với ID: ${id}`);
    }
    BRANCHES_DB.splice(idx, 1);
    return true;
  }
}
