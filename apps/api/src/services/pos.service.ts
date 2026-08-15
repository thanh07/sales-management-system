import { ProductService } from './product.service';

export interface OrderItemInput {
  productId: string;
  name?: string;
  sku?: string;
  barcode?: string;
  selectedUnit?: string;
  conversionFactor?: number;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface ReturnItemInput {
  productId: string;
  name?: string;
  sku?: string;
  selectedUnit?: string;
  conversionFactor?: number;
  quantity: number;
  unitPrice: number;
  returnReason?: string;
}

export interface ReturnRecord {
  id: string;
  orderId: string;
  returnNumber: string;
  items: ReturnItemInput[];
  refundAmount: number;
  refundMethod: 'CASH' | 'BANK_TRANSFER';
  notes?: string;
  cashierId?: string;
  createdAt: string;
}

export interface DeliveryInfo {
  isDelivery: boolean;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  deliveryNotes?: string;
  shippingFee: number;
  codAmount: number;
  depositAmount: number;
  partnerType: 'INTERNAL_SHIPPER' | 'GHN' | 'GHTK' | 'VIETTEL_POST' | 'AHAMOVE' | 'GRAB';
  partnerName?: string;
  deliveryStatus: 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'FAILED' | 'RETURNED';
  codStatus: 'PENDING' | 'COLLECTED';
  failureReason?: string;
}

export interface CheckoutInput {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  cashierId: string;
  branchId: string;
  items: OrderItemInput[];
  subTotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET' | 'SPLIT';
  notes?: string;
  deliveryInfo?: DeliveryInfo;
}

export interface OrderRecord extends CheckoutInput {
  id: string;
  orderNumber: string;
  changeAmount: number;
  status: 'COMPLETED' | 'PARTIALLY_RETURNED' | 'RETURNED' | 'CANCELLED';
  returnedItems?: ReturnItemInput[];
  refundAmount?: number;
  returns?: ReturnRecord[];
  createdAt: string;
}

const ORDERS_DB: OrderRecord[] = [
  {
    id: 'ord-sample-01',
    orderNumber: `HD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}1001`,
    customerId: 'cust-01',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0901234567',
    cashierId: 'usr-cashier-01',
    branchId: 'branch-01',
    items: [
      {
        productId: 'prod-taphoap-001',
        name: 'Nước Tăng Lực Red Bull Bò Cụng #1',
        sku: 'TAP-REDB-001',
        selectedUnit: 'Lon',
        conversionFactor: 1,
        quantity: 2,
        unitPrice: 15800,
        discount: 0,
      },
      {
        productId: 'prod-taphoap-002',
        name: 'Bia Heineken Silver Lon #2',
        sku: 'TAP-HEIN-002',
        selectedUnit: 'Lon',
        conversionFactor: 1,
        quantity: 3,
        unitPrice: 20600,
        discount: 0,
      },
    ],
    subTotal: 93400,
    discount: 0,
    tax: 0,
    totalAmount: 93400,
    paidAmount: 100000,
    changeAmount: 6600,
    paymentMethod: 'CASH',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'ord-sample-02',
    orderNumber: `HD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}1002`,
    customerId: 'cust-02',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    cashierId: 'usr-cashier-01',
    branchId: 'branch-01',
    items: [
      {
        productId: 'prod-taphoap-004',
        name: 'Mì Tôm Chua Cay Hảo Hảo #4',
        sku: 'TAP-ACEC-004',
        selectedUnit: 'Thùng',
        conversionFactor: 30,
        quantity: 1,
        unitPrice: 135000,
        discount: 0,
      },
    ],
    subTotal: 135000,
    discount: 5000,
    tax: 0,
    totalAmount: 130000,
    paidAmount: 130000,
    changeAmount: 0,
    paymentMethod: 'BANK_TRANSFER',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

let PARKED_ORDERS: any[] = [];
const RETURNS_DB: ReturnRecord[] = [];

export class PosService {
  static checkout(input: CheckoutInput): OrderRecord {
    if (!input.items || input.items.length === 0) {
      throw new Error('Giỏ hàng trống, không thể thanh toán');
    }

    // Deduct stock levels in ProductService in SMALLEST unit (quantity * conversionFactor) for the active branch
    const branchId = input.branchId || 'branch-01';
    input.items.forEach((item) => {
      const factor = item.conversionFactor || 1;
      const totalSmallestUnitsDeducted = item.quantity * factor;
      ProductService.updateStock(item.productId, -totalSmallestUnitsDeducted, branchId);
    });

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `HD${dateStr}${randomSeq}`;

    const changeAmount = Math.max(0, input.paidAmount - input.totalAmount);

    const newOrder: OrderRecord = {
      ...input,
      id: `ord-${Date.now()}`,
      orderNumber,
      changeAmount,
      status: 'COMPLETED',
      createdAt: now.toISOString(),
      returns: [],
      returnedItems: [],
      refundAmount: 0,
    };

    ORDERS_DB.unshift(newOrder);
    return newOrder;
  }

  static getOrders(filter?: { date?: string; query?: string; status?: string; branchId?: string }) {
    let list = [...ORDERS_DB];

    if (filter?.branchId) {
      list = list.filter((o) => o.branchId === filter.branchId);
    }

    if (filter?.date) {
      const targetDate = filter.date; // e.g. "2026-08-10"
      list = list.filter((o) => o.createdAt.startsWith(targetDate));
    }

    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((o) => o.status === filter.status);
    }

    if (filter?.query && filter.query.trim()) {
      const q = filter.query.trim().toLowerCase();
      list = list.filter((o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.notes && o.notes.toLowerCase().includes(q))
      );
    }

    return list;
  }

  static getOrderById(orderId: string) {
    const order = ORDERS_DB.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) throw new Error('Không tìm thấy hóa đơn');
    return order;
  }

  static returnOrder(orderId: string, returnInput: {
    items: ReturnItemInput[];
    refundAmount?: number;
    refundMethod?: 'CASH' | 'BANK_TRANSFER';
    notes?: string;
    cashierId?: string;
  }) {
    const order = ORDERS_DB.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      throw new Error('Không tìm thấy hóa đơn cần trả hàng');
    }

    if (order.status === 'CANCELLED' || order.status === 'RETURNED') {
      throw new Error('Hóa đơn này đã được hủy hoặc trả toàn bộ trước đó');
    }

    if (!returnInput.items || returnInput.items.length === 0) {
      throw new Error('Chưa chọn sản phẩm cần trả');
    }

    // Validate quantities against original purchased items
    const alreadyReturned = order.returnedItems || [];
    let calculatedRefund = 0;

    returnInput.items.forEach((retItem) => {
      const origItem = order.items.find((i) => i.productId === retItem.productId && i.selectedUnit === retItem.selectedUnit);
      if (!origItem) {
        throw new Error(`Sản phẩm ${retItem.name || retItem.productId} không có trong đơn hàng gốc`);
      }

      const prevReturnedQty = alreadyReturned
        .filter((r) => r.productId === retItem.productId && r.selectedUnit === retItem.selectedUnit)
        .reduce((sum, r) => sum + r.quantity, 0);

      const maxReturnable = origItem.quantity - prevReturnedQty;
      if (retItem.quantity > maxReturnable) {
        throw new Error(`Số lượng trả của ${origItem.name} (${retItem.quantity}) vượt quá số lượng tối đa có thể trả (${maxReturnable})`);
      }

      calculatedRefund += retItem.quantity * origItem.unitPrice;

      // Restock Product in SMALLEST unit (quantity * conversionFactor) to the branch
      const factor = retItem.conversionFactor || origItem.conversionFactor || 1;
      const totalUnitsRestocked = retItem.quantity * factor;
      const branchId = order.branchId || 'branch-01';
      ProductService.updateStock(retItem.productId, totalUnitsRestocked, branchId);
    });

    const refundAmount = returnInput.refundAmount ?? calculatedRefund;
    const now = new Date();
    const returnNumber = `TH${now.toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(1000 + Math.random() * 9000)}`;

    const returnRecord: ReturnRecord = {
      id: `ret-${Date.now()}`,
      orderId: order.id,
      returnNumber,
      items: returnInput.items,
      refundAmount,
      refundMethod: returnInput.refundMethod || 'CASH',
      notes: returnInput.notes || '',
      cashierId: returnInput.cashierId || order.cashierId,
      createdAt: now.toISOString(),
    };

    RETURNS_DB.unshift(returnRecord);

    // Update order status and records
    if (!order.returns) order.returns = [];
    order.returns.push(returnRecord);

    if (!order.returnedItems) order.returnedItems = [];
    order.returnedItems.push(...returnInput.items);

    order.refundAmount = (order.refundAmount || 0) + refundAmount;

    // Check if fully returned
    const totalOriginalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
    const totalReturnedQty = order.returnedItems.reduce((sum, i) => sum + i.quantity, 0);

    if (totalReturnedQty >= totalOriginalQty) {
      order.status = 'RETURNED';
    } else {
      order.status = 'PARTIALLY_RETURNED';
    }

    return {
      order,
      returnRecord,
    };
  }

  static parkOrder(cartData: any) {
    const parked = {
      id: `parked-${Date.now()}`,
      time: new Date().toLocaleTimeString('vi-VN'),
      ...cartData,
    };
    PARKED_ORDERS.push(parked);
    return parked;
  }

  static getParkedOrders() {
    return PARKED_ORDERS;
  }

  static deleteParkedOrder(id: string) {
    PARKED_ORDERS = PARKED_ORDERS.filter((p) => p.id !== id);
    return true;
  }

  static updateDeliveryStatus(orderId: string, status: 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'FAILED' | 'RETURNED', failureReason?: string) {
    const order = ORDERS_DB.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) throw new Error('Không tìm thấy hóa đơn giao hàng');
    if (!order.deliveryInfo) throw new Error('Đơn hàng này không có thông tin giao hàng');

    order.deliveryInfo.deliveryStatus = status;
    if (failureReason) {
      order.deliveryInfo.failureReason = failureReason;
    }

    // If returned (chuyển hoàn kho), restock all items back to branch
    if (status === 'RETURNED') {
      const branchId = order.branchId || 'branch-01';
      order.items.forEach((item) => {
        const factor = item.conversionFactor || 1;
        const totalSmallestUnitsRestocked = item.quantity * factor;
        ProductService.updateStock(item.productId, totalSmallestUnitsRestocked, branchId);
      });
      order.status = 'CANCELLED';
    }

    return order;
  }

  static collectCod(orderId: string) {
    const order = ORDERS_DB.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) throw new Error('Không tìm thấy hóa đơn');
    if (!order.deliveryInfo) throw new Error('Đơn hàng này không có thông tin giao hàng');

    order.deliveryInfo.codStatus = 'COLLECTED';
    return order;
  }

  static resetAllOrders() {
    ORDERS_DB.length = 0;
    PARKED_ORDERS.length = 0;
    RETURNS_DB.length = 0;
    return true;
  }
}
