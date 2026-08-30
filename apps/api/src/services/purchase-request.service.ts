import { getSupplierById } from './supplier.service';
import { createPurchaseOrder } from './purchase-order.service';

export interface PurchaseRequestItem {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  unitRatio: number;
  orderedQty: number; // Số lượng đặt
  receivedQty: number; // Số lượng đã nhận kho
  importPrice: number; // Giá nhập thỏa thuận
  subtotal: number;
}

export interface PurchaseRequestDepositLog {
  id: string;
  requestId: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD';
  note?: string;
  creatorName: string;
  createdAt: string;
}

export interface PurchaseRequest {
  id: string;
  code: string; // ĐHN20260830001
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  creatorName: string;
  expectedDeliveryDate?: string; // Ngày dự kiến nhận hàng
  depositAmount: number; // Số tiền đã đặt cọc/tạm ứng cho NCC
  items: PurchaseRequestItem[];
  subtotal: number;
  discount: number;
  tax: number;
  finalTotal: number;
  status: 'DRAFT' | 'ORDERING' | 'PARTIAL_RECEIVED' | 'COMPLETED' | 'CANCELLED';
  note?: string;
  createdAt: string;
}

// In-memory data store for Purchase Requests & Deposits
let purchaseRequests: PurchaseRequest[] = [
  {
    id: 'pr-01',
    code: 'ĐHN20260825001',
    supplierId: 'supp-01',
    supplierName: 'Công Ty TNHH Bao Bì Đức Minh',
    branchId: 'branch-01',
    branchName: 'Chi nhánh Chợ Bến Thành (CN-01)',
    creatorName: 'Trần Thu Trang (Quản lý)',
    expectedDeliveryDate: '2026-09-05',
    depositAmount: 1000000,
    items: [
      {
        productId: 'prod-001',
        productCode: 'SP001',
        productName: 'Chậu Đất Nung Nhỏ 12cm',
        unit: 'Chục (10 cái)',
        unitRatio: 10,
        orderedQty: 50,
        receivedQty: 0,
        importPrice: 110000,
        subtotal: 5500000,
      },
    ],
    subtotal: 5500000,
    discount: 200000,
    tax: 0,
    finalTotal: 5300000,
    status: 'ORDERING',
    note: 'Đơn đặt hàng hộp và chậu nung đợt tháng 9 - Đã chuyển cọc 1 triệu',
    createdAt: '2026-08-25T10:00:00Z',
  },
];

let depositLogs: PurchaseRequestDepositLog[] = [
  {
    id: 'dep-01',
    requestId: 'pr-01',
    amount: 1000000,
    paymentMethod: 'BANK_TRANSFER',
    note: 'Chuyển khoản đặt cọc 1 triệu đợt 1',
    creatorName: 'Trần Thu Trang (Quản lý)',
    createdAt: '2026-08-25T10:15:00Z',
  },
];

export const getAllPurchaseRequests = (branchId?: string, status?: string, search?: string): PurchaseRequest[] => {
  let result = [...purchaseRequests];

  if (branchId && branchId !== 'ALL') {
    result = result.filter((r) => r.branchId === branchId);
  }

  if (status && status !== 'ALL') {
    result = result.filter((r) => r.status === status);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.supplierName.toLowerCase().includes(q) ||
        r.items.some((i) => i.productName.toLowerCase().includes(q) || i.productCode.toLowerCase().includes(q))
    );
  }

  return result;
};

export const getPurchaseRequestById = (id: string): PurchaseRequest | undefined => {
  return purchaseRequests.find((r) => r.id === id);
};

export const createPurchaseRequest = (data: Partial<PurchaseRequest>): PurchaseRequest => {
  const supplier = getSupplierById(data.supplierId || '');
  if (!supplier && data.status !== 'DRAFT') {
    throw new Error('Vui lòng chọn Nhà cung cấp hợp lệ');
  }

  const items = data.items || [];
  if (items.length === 0) {
    throw new Error('Đơn đặt hàng phải chứa ít nhất 1 mặt hàng');
  }

  const code = data.code?.trim() || `ĐHN${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;

  const subtotal = items.reduce((sum, i) => sum + (i.subtotal || i.orderedQty * i.importPrice), 0);
  const discount = Number(data.discount) || 0;
  const tax = Number(data.tax) || 0;
  const finalTotal = Math.max(0, subtotal - discount + tax);
  const initialDeposit = Number(data.depositAmount) || 0;

  const newPR: PurchaseRequest = {
    id: `pr-${Date.now()}`,
    code,
    supplierId: data.supplierId || 'supp-01',
    supplierName: supplier ? supplier.name : (data.supplierName || 'Nhà cung cấp lẻ'),
    branchId: data.branchId || 'branch-01',
    branchName: data.branchName || 'Chi nhánh mặc định',
    creatorName: data.creatorName || 'Quản trị viên',
    expectedDeliveryDate: data.expectedDeliveryDate || '',
    depositAmount: initialDeposit,
    items: items.map((i) => ({ ...i, receivedQty: 0 })),
    subtotal,
    discount,
    tax,
    finalTotal,
    status: data.status || 'ORDERING',
    note: data.note?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  if (initialDeposit > 0) {
    depositLogs.unshift({
      id: `dep-${Date.now()}`,
      requestId: newPR.id,
      amount: initialDeposit,
      paymentMethod: 'CASH',
      note: 'Tạm ứng đặt cọc khi khởi tạo đơn đặt hàng',
      creatorName: newPR.creatorName,
      createdAt: new Date().toISOString(),
    });
  }

  purchaseRequests.unshift(newPR);
  return newPR;
};

// Chi tạm ứng cọc thêm cho NCC
export const depositPurchaseRequest = (
  requestId: string,
  depositData: {
    amount: number;
    paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD';
    note?: string;
    creatorName?: string;
  }
): PurchaseRequest => {
  const pr = purchaseRequests.find((r) => r.id === requestId);
  if (!pr) {
    throw new Error('Không tìm thấy Đơn đặt hàng nhập');
  }

  const amount = Number(depositData.amount) || 0;
  if (amount <= 0) {
    throw new Error('Số tiền đặt cọc phải lớn hơn 0');
  }

  pr.depositAmount += amount;

  depositLogs.unshift({
    id: `dep-${Date.now()}`,
    requestId,
    amount,
    paymentMethod: depositData.paymentMethod || 'CASH',
    note: depositData.note || 'Chi tạm ứng cọc cho NCC',
    creatorName: depositData.creatorName || 'Quản trị viên',
    createdAt: new Date().toISOString(),
  });

  return pr;
};

// Hủy đơn đặt hàng nhập
export const cancelPurchaseRequest = (requestId: string, reason?: string): PurchaseRequest => {
  const pr = purchaseRequests.find((r) => r.id === requestId);
  if (!pr) {
    throw new Error('Không tìm thấy Đơn đặt hàng nhập');
  }

  if (pr.status === 'COMPLETED') {
    throw new Error('Không thể hủy Đơn đặt hàng nhập đã hoàn tất!');
  }

  pr.status = 'CANCELLED';
  if (reason) {
    pr.note = `[Đã hủy ngày ${new Date().toLocaleDateString('vi-VN')}]: ${reason}. ${pr.note || ''}`;
  }
  return pr;
};

// Chuyển Đơn Đặt Hàng Nhập sang Phiếu Nhập Kho (1-Click Convert & Cấn trừ cọc)
export const convertPurchaseRequestToOrder = (
  requestId: string,
  importData: {
    receivedItems: { productId: string; quantity: number; importPrice: number }[];
    paidAmount?: number;
    paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD';
    note?: string;
    creatorName?: string;
  }
) => {
  const pr = purchaseRequests.find((r) => r.id === requestId);
  if (!pr) {
    throw new Error('Không tìm thấy Đơn đặt hàng nhập');
  }

  if (pr.status === 'COMPLETED' || pr.status === 'CANCELLED') {
    throw new Error('Đơn đặt hàng này đã hoàn tất hoặc đã bị hủy!');
  }

  // Tự động cấn trừ tiền cọc đã tạm ứng
  const depositDeduction = pr.depositAmount;
  const userPaid = Number(importData.paidAmount) || 0;
  const totalPaidForPO = depositDeduction + userPaid;

  // Xây dựng danh sách item cho Phiếu Nhập Kho
  const poItems = importData.receivedItems.map((rItem) => {
    const origItem = pr.items.find((i) => i.productId === rItem.productId);
    const qty = Number(rItem.quantity) || 0;
    const price = Number(rItem.importPrice) || (origItem ? origItem.importPrice : 0);

    // Cập nhật số lượng đã nhận trong Đơn đặt hàng
    if (origItem) {
      origItem.receivedQty += qty;
    }

    return {
      productId: rItem.productId,
      productCode: origItem ? origItem.productCode : 'SP000',
      productName: origItem ? origItem.productName : 'Sản phẩm',
      unit: origItem ? origItem.unit : 'Cái',
      unitRatio: origItem ? origItem.unitRatio : 1,
      quantity: qty,
      baseQuantity: qty * (origItem ? origItem.unitRatio : 1),
      importPrice: price,
      subtotal: qty * price,
    };
  });

  // Tạo Phiếu Nhập Kho mới từ dữ liệu cấn trừ
  const createdPO = createPurchaseOrder({
    supplierId: pr.supplierId,
    supplierName: pr.supplierName,
    branchId: pr.branchId,
    branchName: pr.branchName,
    creatorName: importData.creatorName || pr.creatorName,
    items: poItems,
    discount: pr.discount,
    tax: pr.tax,
    paidAmount: totalPaidForPO, // Cấn trừ cọc + Tiền trả thêm
    paymentMethod: importData.paymentMethod || 'CASH',
    status: 'COMPLETED',
    note: `[Tạo từ Đơn đặt ${pr.code} - Cấn trừ cọc ${depositDeduction.toLocaleString('vi-VN')}đ]. ${importData.note || ''}`,
  });

  // Kiểm tra nếu tất cả sản phẩm trong đơn đặt đã nhận đủ -> Đổi trạng thái COMPLETED, ngược lại PARTIAL_RECEIVED
  const isFullyReceived = pr.items.every((i) => i.receivedQty >= i.orderedQty);
  pr.status = isFullyReceived ? 'COMPLETED' : 'PARTIAL_RECEIVED';

  return { purchaseRequest: pr, purchaseOrder: createdPO };
};

export const getDepositLogs = (requestId: string): PurchaseRequestDepositLog[] => {
  return depositLogs.filter((l) => l.requestId === requestId);
};
