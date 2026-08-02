import { ProductService } from './product.service';

export interface OrderItemInput {
  productId: string;
  name?: string;
  selectedUnit?: string;
  conversionFactor?: number;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface CheckoutInput {
  customerId?: string;
  cashierId: string;
  branchId: string;
  items: OrderItemInput[];
  subTotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET';
  notes?: string;
}

export interface OrderRecord extends CheckoutInput {
  id: string;
  orderNumber: string;
  changeAmount: number;
  status: 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

const ORDERS_DB: OrderRecord[] = [];
let PARKED_ORDERS: any[] = [];

export class PosService {
  static checkout(input: CheckoutInput): OrderRecord {
    if (!input.items || input.items.length === 0) {
      throw new Error('Giỏ hàng trống, không thể thanh toán');
    }

    // Deduct stock levels in ProductService in SMALLEST unit (quantity * conversionFactor)
    input.items.forEach((item) => {
      const factor = item.conversionFactor || 1;
      const totalSmallestUnitsDeducted = item.quantity * factor;
      ProductService.updateStock(item.productId, -totalSmallestUnitsDeducted);
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
    };

    ORDERS_DB.unshift(newOrder);
    return newOrder;
  }

  static getOrders() {
    return ORDERS_DB;
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
}
