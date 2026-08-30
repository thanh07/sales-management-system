import { addSupplierDebt, getSupplierById } from './supplier.service';
import { ProductService } from './product.service';

export interface PurchaseOrderItem {
  productId: string;
  productCode: string;
  productName: string;
  unit: string; // e.g. "Cái", "Chục (10 cái)", "Thùng (24 cái)"
  unitRatio: number; // e.g. 1, 10, 24
  quantity: number; // Số lượng đơn vị tính nhập
  baseQuantity: number; // Số lượng lẻ quy đổi = quantity * unitRatio
  importPrice: number; // Giá nhập 1 đơn vị tính
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  code: string; // PNK20260830001
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  creatorName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  finalTotal: number;
  paidAmount: number; // Số tiền trả trước cho NCC
  debtAmount: number; // Nợ còn thiếu NCC
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD';
  status: 'COMPLETED' | 'DRAFT' | 'CANCELLED';
  note?: string;
  createdAt: string;
}

let purchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-01',
    code: 'PNK20260215001',
    supplierId: 'supp-01',
    supplierName: 'Công Ty TNHH Bao Bì Đức Minh',
    branchId: 'branch-01',
    branchName: 'Chi nhánh Chợ Bến Thành (CN-01)',
    creatorName: 'Trần Thu Trang (Quản lý)',
    items: [
      {
        productId: 'prod-001',
        productCode: 'SP001',
        productName: 'Chậu Đất Nung Nhỏ 12cm',
        unit: 'Chục (10 cái)',
        unitRatio: 10,
        quantity: 20,
        baseQuantity: 200,
        importPrice: 110000, // 11k/cái = 110k/chục
        subtotal: 2200000,
      },
    ],
    subtotal: 2200000,
    discount: 100000,
    tax: 0,
    finalTotal: 2100000,
    paidAmount: 1000000,
    debtAmount: 1100000,
    paymentMethod: 'BANK_TRANSFER',
    status: 'COMPLETED',
    note: 'Nhập lô chậu đất nung đợt 1 tháng 2',
    createdAt: '2026-02-15T09:00:00Z',
  },
];

export const getAllPurchaseOrders = (branchId?: string, status?: string, search?: string): PurchaseOrder[] => {
  let result = [...purchaseOrders];

  if (branchId && branchId !== 'ALL') {
    result = result.filter((po) => po.branchId === branchId);
  }

  if (status && status !== 'ALL') {
    result = result.filter((po) => po.status === status);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (po) =>
        po.code.toLowerCase().includes(q) ||
        po.supplierName.toLowerCase().includes(q) ||
        po.items.some((i) => i.productName.toLowerCase().includes(q) || i.productCode.toLowerCase().includes(q))
    );
  }

  return result;
};

export const getPurchaseOrderById = (id: string): PurchaseOrder | undefined => {
  return purchaseOrders.find((po) => po.id === id);
};

export const createPurchaseOrder = (poData: Partial<PurchaseOrder>): PurchaseOrder => {
  const supplier = getSupplierById(poData.supplierId || '');
  if (!supplier && poData.status === 'COMPLETED') {
    throw new Error('Vui lòng chọn Nhà cung cấp hợp lệ');
  }

  const items = poData.items || [];
  if (items.length === 0) {
    throw new Error('Phiếu nhập kho phải có ít nhất 1 mặt hàng');
  }

  const code = poData.code?.trim() || `PNK${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;

  const subtotal = items.reduce((sum, item) => sum + (item.subtotal || item.quantity * item.importPrice), 0);
  const discount = Number(poData.discount) || 0;
  const tax = Number(poData.tax) || 0;
  const finalTotal = Math.max(0, subtotal - discount + tax);
  const paidAmount = Number(poData.paidAmount) || 0;
  const debtAmount = Math.max(0, finalTotal - paidAmount);

  const newPO: PurchaseOrder = {
    id: `po-${Date.now()}`,
    code,
    supplierId: poData.supplierId || 'supp-01',
    supplierName: supplier ? supplier.name : (poData.supplierName || 'Nhà cung cấp lẻ'),
    branchId: poData.branchId || 'branch-01',
    branchName: poData.branchName || 'Chi nhánh mặc định',
    creatorName: poData.creatorName || 'Quản trị viên',
    items,
    subtotal,
    discount,
    tax,
    finalTotal,
    paidAmount,
    debtAmount,
    paymentMethod: poData.paymentMethod || 'CASH',
    status: poData.status || 'COMPLETED',
    note: poData.note?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  // Nếu tạo phiếu ở trạng thái COMPLETED -> Duyệt kho & WAC & nợ NCC ngay
  if (newPO.status === 'COMPLETED') {
    processPurchaseOrderCompletion(newPO);
  }

  purchaseOrders.unshift(newPO);
  return newPO;
};

// Xử lý khi hoàn tất đơn nhập kho (Tăng stock, tính lại WAC costPrice, cộng nợ NCC)
const processPurchaseOrderCompletion = (po: PurchaseOrder) => {
  // 1. Cộng nợ NCC nếu còn thiếu
  if (po.debtAmount > 0 && po.supplierId) {
    addSupplierDebt(po.supplierId, po.debtAmount);
  }

  // 2. Cập nhật tồn kho & Giá vốn Bình quân Gia quyền (WAC) cho từng sản phẩm
  po.items.forEach((item) => {
    try {
      const prod = ProductService.getProductById(item.productId);
      if (prod) {
        const addedBaseQty = item.baseQuantity || item.quantity * (item.unitRatio || 1);
        const importPricePerBaseUnit = item.importPrice / (item.unitRatio || 1);

        const oldStock = prod.stockQuantity ?? (prod as any).stock ?? 0;
        const oldCostPrice = prod.costPrice || 0;

        // Công thức WAC: NewCostPrice = (OldStock * OldCostPrice + AddedQty * ImportPricePerUnit) / (OldStock + AddedQty)
        let newCostPrice = oldCostPrice;
        const newTotalStock = Math.max(0, oldStock + addedBaseQty);

        if (newTotalStock > 0) {
          newCostPrice = Math.round(
            (oldStock * oldCostPrice + addedBaseQty * importPricePerBaseUnit) / newTotalStock
          );
        }

        prod.stockQuantity = newTotalStock;
        prod.costPrice = newCostPrice;

        // Cập nhật tồn kho chi nhánh
        if (po.branchId) {
          if (!prod.branchStocks) prod.branchStocks = {};
          const currentBranchStock = prod.branchStocks[po.branchId] || 0;
          prod.branchStocks[po.branchId] = currentBranchStock + addedBaseQty;
        }
      }
    } catch (err: any) {
      console.warn(`Sản phẩm ID ${item.productId} không tìm thấy trong danh mục kho:`, err?.message);
    }
  });
};

export const completePurchaseOrder = (id: string): PurchaseOrder => {
  const po = purchaseOrders.find((p) => p.id === id);
  if (!po) {
    throw new Error('Không tìm thấy Phiếu nhập kho');
  }

  if (po.status === 'COMPLETED') {
    throw new Error('Phiếu nhập kho đã được hoàn tất trước đó!');
  }

  po.status = 'COMPLETED';
  processPurchaseOrderCompletion(po);
  return po;
};
