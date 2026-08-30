export interface Supplier {
  id: string;
  code: string;
  name: string;
  group?: string; // e.g. "Bao bì & Carton", "Gốm sứ & Bình hoa", "Phụ kiện & Nhựa"
  phone: string;
  email?: string;
  address?: string;
  taxCode?: string;
  initialDebt: number; // Nợ đầu kỳ
  debtAmount: number; // Nợ hiện tại phải trả NCC
  status: 'ACTIVE' | 'INACTIVE';
  note?: string;
  createdAt: string;
}

export interface SupplierPaymentHistory {
  id: string;
  supplierId: string;
  amount: number; // Số tiền trả
  discount: number; // Chiết khấu thanh toán được giảm
  totalReduced: number; // Tổng nợ giảm = amount + discount
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD';
  note?: string;
  creatorName: string;
  createdAt: string;
}

// In-Memory Data Store with Initial Seed Suppliers
let suppliers: Supplier[] = [
  {
    id: 'supp-01',
    code: 'NCC01',
    name: 'Công Ty TNHH Bao Bì Đức Minh',
    group: 'Bao bì & Carton',
    phone: '0978123456',
    email: 'contact@ducminhpack.vn',
    address: 'KCN Tân Bình, Q. Bình Tân, TP.HCM',
    taxCode: '0312456789',
    initialDebt: 0,
    debtAmount: 2500000,
    status: 'ACTIVE',
    note: 'Chuyên cung cấp thùng carton 3 lớp, túi xốp gói hàng',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'supp-02',
    code: 'NCC02',
    name: 'Xưởng Gốm Nung Á Đông',
    group: 'Gốm sứ & Bình hoa',
    phone: '0903998877',
    email: 'sales@gombinhduong.com',
    address: 'Làng Gốm Tân Phước, Tân Uyên, Bình Dương',
    taxCode: '3700987654',
    initialDebt: 1000000,
    debtAmount: 4800000,
    status: 'ACTIVE',
    note: 'Cung cấp chậu đất nung, bình hoa gốm sứ thủ công',
    createdAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 'supp-03',
    code: 'NCC03',
    name: 'Nhà Máy Nhựa Gia Dụng Tân Bình',
    group: 'Phụ kiện & Nhựa',
    phone: '0918554433',
    email: 'info@nhuatanbinh.vn',
    address: '120 Lý Thường Kiệt, Q. Tân Bình, TP.HCM',
    taxCode: '0301122334',
    initialDebt: 0,
    debtAmount: 0,
    status: 'ACTIVE',
    note: 'Bình xịt tưới cây, chậu nhựa treo tường các loại',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'supp-04',
    code: 'NCC04',
    name: 'Tổng Kho Gốm Sứ Cao Cấp Minh Long',
    group: 'Gốm sứ & Bình hoa',
    phone: '02743888999',
    email: 'cskh@minhlong.com.vn',
    address: '333 Đại Lộ Bình Dương, Thuận An, Bình Dương',
    taxCode: '3700112233',
    initialDebt: 0,
    debtAmount: 12500000,
    status: 'ACTIVE',
    note: 'Bình hoa sứ mạ vàng, đĩa trưng bày cao cấp',
    createdAt: '2026-02-10T14:00:00Z',
  },
];

let supplierPaymentLogs: SupplierPaymentHistory[] = [
  {
    id: 'pay-supp-01',
    supplierId: 'supp-01',
    amount: 5000000,
    discount: 200000,
    totalReduced: 5200000,
    paymentMethod: 'BANK_TRANSFER',
    note: 'Thanh toán đợt 1 tiền hộp carton - được giảm 200k do trả trước hạn',
    creatorName: 'Trần Thu Trang (Quản lý)',
    createdAt: '2026-02-18T15:30:00Z',
  },
];

export const getAllSuppliers = (search?: string, group?: string, status?: string): Supplier[] => {
  let result = [...suppliers];

  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        (s.email && s.email.toLowerCase().includes(q))
    );
  }

  if (group && group !== 'ALL') {
    result = result.filter((s) => s.group === group);
  }

  if (status && status !== 'ALL') {
    result = result.filter((s) => s.status === status);
  }

  return result;
};

export const getSupplierById = (id: string): Supplier | undefined => {
  return suppliers.find((s) => s.id === id);
};

export const createSupplier = (data: Partial<Supplier>): Supplier => {
  const code = data.code?.trim() || `NCC${Math.floor(100 + Math.random() * 900)}`;
  const initialDebt = Number(data.initialDebt) || 0;

  const newSupplier: Supplier = {
    id: `supp-${Date.now()}`,
    code,
    name: data.name?.trim() || 'Nhà cung cấp mới',
    group: data.group || 'Khác',
    phone: data.phone?.trim() || '',
    email: data.email?.trim() || '',
    address: data.address?.trim() || '',
    taxCode: data.taxCode?.trim() || '',
    initialDebt,
    debtAmount: initialDebt, // Khởi tạo nợ bằng nợ đầu kỳ
    status: data.status || 'ACTIVE',
    note: data.note?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  suppliers.unshift(newSupplier);
  return newSupplier;
};

export const updateSupplier = (id: string, data: Partial<Supplier>): Supplier => {
  const index = suppliers.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error('Không tìm thấy Nhà cung cấp');
  }

  const existing = suppliers[index];
  const updated: Supplier = {
    ...existing,
    ...data,
    name: data.name !== undefined ? data.name.trim() : existing.name,
    code: data.code !== undefined ? data.code.trim() : existing.code,
    group: data.group !== undefined ? data.group : existing.group,
    phone: data.phone !== undefined ? data.phone.trim() : existing.phone,
    email: data.email !== undefined ? data.email.trim() : existing.email,
    address: data.address !== undefined ? data.address.trim() : existing.address,
    taxCode: data.taxCode !== undefined ? data.taxCode.trim() : existing.taxCode,
    note: data.note !== undefined ? data.note.trim() : existing.note,
    status: data.status !== undefined ? data.status : existing.status,
  };

  suppliers[index] = updated;
  return updated;
};

export const deleteSupplier = (id: string): boolean => {
  const index = suppliers.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error('Không tìm thấy Nhà cung cấp');
  }
  const s = suppliers[index];
  if (s.debtAmount > 0) {
    throw new Error(`Không thể xóa Nhà cung cấp đang còn nợ ${s.debtAmount.toLocaleString('vi-VN')}đ!`);
  }

  suppliers.splice(index, 1);
  return true;
};

// Trả nợ NCC (Có chiết khấu thanh toán)
export const paySupplierDebt = (
  supplierId: string,
  payData: {
    amount: number;
    discount?: number;
    paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD';
    note?: string;
    creatorName?: string;
  }
): { supplier: Supplier; paymentLog: SupplierPaymentHistory } => {
  const supplier = getSupplierById(supplierId);
  if (!supplier) {
    throw new Error('Không tìm thấy Nhà cung cấp');
  }

  const amount = Number(payData.amount) || 0;
  const discount = Number(payData.discount) || 0;
  const totalReduced = amount + discount;

  if (totalReduced <= 0) {
    throw new Error('Số tiền trả hoặc chiết khấu phải lớn hơn 0');
  }

  // Cập nhật nợ NCC (Không âm)
  supplier.debtAmount = Math.max(0, supplier.debtAmount - totalReduced);

  const paymentLog: SupplierPaymentHistory = {
    id: `pay-supp-${Date.now()}`,
    supplierId,
    amount,
    discount,
    totalReduced,
    paymentMethod: payData.paymentMethod || 'CASH',
    note: payData.note || 'Thanh toán nợ nhà cung cấp',
    creatorName: payData.creatorName || 'Quản trị viên',
    createdAt: new Date().toISOString(),
  };

  supplierPaymentLogs.unshift(paymentLog);
  return { supplier, paymentLog };
};

// Điều chỉnh thủ công công nợ NCC
export const adjustSupplierDebt = (supplierId: string, newDebtAmount: number, note?: string): Supplier => {
  const supplier = getSupplierById(supplierId);
  if (!supplier) {
    throw new Error('Không tìm thấy Nhà cung cấp');
  }

  supplier.debtAmount = Math.max(0, Number(newDebtAmount) || 0);
  if (note) {
    supplier.note = `[Điều chỉnh nợ ${new Date().toLocaleDateString('vi-VN')}]: ${note}. ${supplier.note || ''}`;
  }
  return supplier;
};

// Lấy lịch sử trả nợ của NCC
export const getSupplierPaymentLogs = (supplierId: string): SupplierPaymentHistory[] => {
  return supplierPaymentLogs.filter((log) => log.supplierId === supplierId);
};

// Cộng thêm nợ cho NCC (dùng khi nhập hàng nợ)
export const addSupplierDebt = (supplierId: string, amount: number) => {
  const supplier = getSupplierById(supplierId);
  if (supplier && amount > 0) {
    supplier.debtAmount += amount;
  }
};
