import { ProductService } from './product.service';
import { getBranchById } from './branch.service';

export interface StockAuditItem {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  systemQty: number; // Tồn sổ sách tại thời điểm kiểm
  actualQty: number; // Tồn thực tế kiểm đếm được
  differenceQty: number; // actualQty - systemQty
  costPrice: number; // Giá vốn hiện tại
  differenceValue: number; // differenceQty * costPrice
}

export interface StockAudit {
  id: string;
  code: string; // PKK20260831001
  branchId: string;
  branchName: string;
  creatorName: string;
  auditorName: string; // Người kiểm
  items: StockAuditItem[];
  totalSystemQty: number;
  totalActualQty: number;
  totalDiffQty: number;
  totalDiffValue: number;
  status: 'DRAFT' | 'COMPLETED' | 'CANCELLED';
  note?: string;
  createdAt: string;
  completedAt?: string;
}

// In-memory data store for Stock Audits
let stockAudits: StockAudit[] = [
  {
    id: 'audit-01',
    code: 'PKK20260828001',
    branchId: 'branch-01',
    branchName: 'Chi nhánh Chợ Bến Thành (CN-01)',
    creatorName: 'Trần Thu Trang (Quản lý)',
    auditorName: 'Nguyễn Văn Minh (Thủ kho)',
    items: [
      {
        productId: 'prod-001',
        productCode: 'SP001',
        productName: 'Chậu Đất Nung Nhỏ 12cm',
        unit: 'Cái',
        systemQty: 50,
        actualQty: 48,
        differenceQty: -2,
        costPrice: 11000,
        differenceValue: -22000,
      },
      {
        productId: 'prod-002',
        productCode: 'SP002',
        productName: 'Chậu Gốm Sứ Trắng 20cm',
        unit: 'Cái',
        systemQty: 30,
        actualQty: 30,
        differenceQty: 0,
        costPrice: 45000,
        differenceValue: 0,
      },
    ],
    totalSystemQty: 80,
    totalActualQty: 78,
    totalDiffQty: -2,
    totalDiffValue: -22000,
    status: 'COMPLETED',
    note: 'Kiểm kê định kỳ cuối tháng 8/2026 - Hao hụt 2 chậu nung bị nứt',
    createdAt: '2026-08-28T16:00:00Z',
    completedAt: '2026-08-28T17:30:00Z',
  },
];

export const getAllStockAudits = (branchId?: string, status?: string, search?: string): StockAudit[] => {
  let result = [...stockAudits];

  if (branchId && branchId !== 'ALL') {
    result = result.filter((a) => a.branchId === branchId);
  }

  if (status && status !== 'ALL') {
    result = result.filter((a) => a.status === status);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.creatorName.toLowerCase().includes(q) ||
        a.auditorName.toLowerCase().includes(q) ||
        a.items.some((i) => i.productName.toLowerCase().includes(q) || i.productCode.toLowerCase().includes(q))
    );
  }

  return result;
};

export const getStockAuditById = (id: string): StockAudit | undefined => {
  return stockAudits.find((a) => a.id === id);
};

export const createStockAudit = (data: Partial<StockAudit>): StockAudit => {
  const branch = getBranchById(data.branchId || 'branch-01');
  const code =
    data.code?.trim() ||
    `PKK${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;

  const items: StockAuditItem[] = (data.items || []).map((i) => {
    const sysQty = Number(i.systemQty) || 0;
    const actQty = Number(i.actualQty) || 0;
    const diffQty = actQty - sysQty;
    const cost = Number(i.costPrice) || 0;

    return {
      productId: i.productId,
      productCode: i.productCode || 'SP000',
      productName: i.productName || 'Sản phẩm',
      unit: i.unit || 'Cái',
      systemQty: sysQty,
      actualQty: actQty,
      differenceQty: diffQty,
      costPrice: cost,
      differenceValue: diffQty * cost,
    };
  });

  const totalSystemQty = items.reduce((sum, i) => sum + i.systemQty, 0);
  const totalActualQty = items.reduce((sum, i) => sum + i.actualQty, 0);
  const totalDiffQty = items.reduce((sum, i) => sum + i.differenceQty, 0);
  const totalDiffValue = items.reduce((sum, i) => sum + i.differenceValue, 0);

  const newAudit: StockAudit = {
    id: `audit-${Date.now()}`,
    code,
    branchId: data.branchId || 'branch-01',
    branchName: branch ? branch.name : (data.branchName || 'Chi nhánh mặc định'),
    creatorName: data.creatorName || 'Quản trị viên',
    auditorName: data.auditorName || data.creatorName || 'Người kiểm kho',
    items,
    totalSystemQty,
    totalActualQty,
    totalDiffQty,
    totalDiffValue,
    status: data.status || 'DRAFT',
    note: data.note?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  stockAudits.unshift(newAudit);
  return newAudit;
};

export const updateStockAudit = (id: string, data: Partial<StockAudit>): StockAudit => {
  const index = stockAudits.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new Error('Không tìm thấy Phiếu kiểm kho');
  }

  const existing = stockAudits[index];
  if (existing.status === 'COMPLETED') {
    throw new Error('Phiếu kiểm kho đã cân bằng kho, không thể chỉnh sửa!');
  }
  if (existing.status === 'CANCELLED') {
    throw new Error('Phiếu kiểm kho đã bị hủy, không thể chỉnh sửa!');
  }

  const items: StockAuditItem[] = (data.items || existing.items).map((i) => {
    const sysQty = Number(i.systemQty) || 0;
    const actQty = Number(i.actualQty) || 0;
    const diffQty = actQty - sysQty;
    const cost = Number(i.costPrice) || 0;

    return {
      productId: i.productId,
      productCode: i.productCode || 'SP000',
      productName: i.productName || 'Sản phẩm',
      unit: i.unit || 'Cái',
      systemQty: sysQty,
      actualQty: actQty,
      differenceQty: diffQty,
      costPrice: cost,
      differenceValue: diffQty * cost,
    };
  });

  const totalSystemQty = items.reduce((sum, i) => sum + i.systemQty, 0);
  const totalActualQty = items.reduce((sum, i) => sum + i.actualQty, 0);
  const totalDiffQty = items.reduce((sum, i) => sum + i.differenceQty, 0);
  const totalDiffValue = items.reduce((sum, i) => sum + i.differenceValue, 0);

  const updated: StockAudit = {
    ...existing,
    auditorName: data.auditorName !== undefined ? data.auditorName : existing.auditorName,
    items,
    totalSystemQty,
    totalActualQty,
    totalDiffQty,
    totalDiffValue,
    note: data.note !== undefined ? data.note.trim() : existing.note,
  };

  stockAudits[index] = updated;
  return updated;
};

// Cân bằng kho (Hoàn tất kiểm kho) - Cập nhật tồn kho chi nhánh về bằng actualQty
export const completeStockAudit = (id: string, userRole: string): StockAudit => {
  if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
    throw new Error('Chỉ có Quản lý (`MANAGER`) hoặc Admin (`ADMIN`) mới có quyền Duyệt Cân Bằng Kho!');
  }

  const audit = stockAudits.find((a) => a.id === id);
  if (!audit) {
    throw new Error('Không tìm thấy Phiếu kiểm kho');
  }

  if (audit.status === 'COMPLETED') {
    throw new Error('Phiếu kiểm kho này đã được cân bằng!');
  }

  if (audit.status === 'CANCELLED') {
    throw new Error('Không thể cân bằng phiếu kiểm kho đã bị hủy!');
  }

  // Thực hiện điều chỉnh tồn kho chi nhánh cho từng sản phẩm
  audit.items.forEach((item) => {
    try {
      const prod = ProductService.getProductById(item.productId);
      if (prod) {
        if (!prod.branchStocks) {
          prod.branchStocks = {};
        }
        // Cập nhật tồn kho chi nhánh chính xác về bằng actualQty
        prod.branchStocks[audit.branchId] = item.actualQty;

        // Cập nhật tổng tồn kho toàn hệ thống
        prod.stockQuantity = Object.values(prod.branchStocks).reduce((sum, val) => sum + (Number(val) || 0), 0);
        ProductService.updateProduct(prod.id, {
          branchStocks: prod.branchStocks,
          stockQuantity: prod.stockQuantity,
        });
      }
    } catch (e) {
      console.error(`Lỗi cập nhật tồn kho SP ${item.productId}:`, e);
    }
  });

  audit.status = 'COMPLETED';
  audit.completedAt = new Date().toISOString();
  return audit;
};

// Gộp nhiều phiếu kiểm kho tạm (DRAFT) thành 1 phiếu tổng hợp
export const mergeStockAudits = (auditIds: string[], userRole: string, creatorName: string): StockAudit => {
  if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
    throw new Error('Chỉ có Quản lý (`MANAGER`) hoặc Admin (`ADMIN`) mới có quyền Gộp phiếu kiểm kho!');
  }

  if (!auditIds || auditIds.length < 2) {
    throw new Error('Vui lòng chọn ít nhất 2 phiếu kiểm tạm để gộp!');
  }

  const selectedAudits = stockAudits.filter((a) => auditIds.includes(a.id));
  if (selectedAudits.length !== auditIds.length) {
    throw new Error('Một số phiếu kiểm không tồn tại');
  }

  const nonDraft = selectedAudits.find((a) => a.status !== 'DRAFT');
  if (nonDraft) {
    throw new Error(`Phiếu "${nonDraft.code}" đã hoàn thành hoặc hủy, chỉ được gộp phiếu tạm (DRAFT)!`);
  }

  const firstBranchId = selectedAudits[0].branchId;
  const sameBranch = selectedAudits.every((a) => a.branchId === firstBranchId);
  if (!sameBranch) {
    throw new Error('Tất cả các phiếu cần gộp phải thuộc cùng 1 Chi nhánh!');
  }

  // Tổng hợp items từ tất cả phiếu chọn (Cộng dồn actualQty nếu trùng sản phẩm)
  const itemMap: Map<string, StockAuditItem> = new Map();

  selectedAudits.forEach((audit) => {
    audit.items.forEach((item) => {
      if (itemMap.has(item.productId)) {
        const existingItem = itemMap.get(item.productId)!;
        existingItem.actualQty += item.actualQty;
        existingItem.differenceQty = existingItem.actualQty - existingItem.systemQty;
        existingItem.differenceValue = existingItem.differenceQty * existingItem.costPrice;
      } else {
        itemMap.set(item.productId, { ...item });
      }
    });
  });

  const mergedItems = Array.from(itemMap.values());
  const mergedCodes = selectedAudits.map((a) => a.code).join(', ');

  // Tạo phiếu tạm gộp mới
  const newMergedAudit = createStockAudit({
    branchId: firstBranchId,
    branchName: selectedAudits[0].branchName,
    creatorName,
    auditorName: `Tổng hợp từ (${selectedAudits.length} phiếu)`,
    items: mergedItems,
    status: 'DRAFT',
    note: `Phiếu gộp tổng hợp từ các phiếu tạm: [${mergedCodes}]`,
  });

  // Đánh dấu các phiếu cũ là đã bị hủy do gộp
  selectedAudits.forEach((a) => {
    a.status = 'CANCELLED';
    a.note = `[Đã gộp vào phiếu ${newMergedAudit.code}] ${a.note || ''}`;
  });

  return newMergedAudit;
};

// Hủy phiếu kiểm kho
export const cancelStockAudit = (id: string, userRole: string, reason?: string): StockAudit => {
  if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
    throw new Error('Chỉ có Quản lý (`MANAGER`) hoặc Admin (`ADMIN`) mới có quyền Hủy phiếu kiểm kho!');
  }

  const audit = stockAudits.find((a) => a.id === id);
  if (!audit) {
    throw new Error('Không tìm thấy Phiếu kiểm kho');
  }

  if (audit.status === 'CANCELLED') {
    throw new Error('Phiếu kiểm kho này đã bị hủy trước đó!');
  }

  // Nếu phiếu đã CÂN BẰNG KHO trước đó, hoàn tác tồn kho chi nhánh về bằng systemQty
  if (audit.status === 'COMPLETED') {
    audit.items.forEach((item) => {
      try {
        const prod = ProductService.getProductById(item.productId);
        if (prod && prod.branchStocks) {
          prod.branchStocks[audit.branchId] = item.systemQty; // Revert back to original systemQty
          prod.stockQuantity = Object.values(prod.branchStocks).reduce((sum, val) => sum + (Number(val) || 0), 0);
          ProductService.updateProduct(prod.id, {
            branchStocks: prod.branchStocks,
            stockQuantity: prod.stockQuantity,
          });
        }
      } catch (e) {
        console.error(`Lỗi khôi phục tồn kho SP ${item.productId}:`, e);
      }
    });
  }

  audit.status = 'CANCELLED';
  if (reason) {
    audit.note = `[Hủy bởi ${userRole}]: ${reason}. ${audit.note || ''}`;
  }

  return audit;
};
