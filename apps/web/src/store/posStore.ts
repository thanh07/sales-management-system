import { create } from 'zustand';
import api from '../services/api';

export interface CartItem {
  productId: string;
  sku: string;
  barcode: string;
  name: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  totalPrice: number;
  image: string;
  unit: string; // Smallest unit (e.g. Lon, Gói, Cái)
  conversionUnit?: string; // Larger unit (e.g. Thùng, Lốc)
  conversionFactor?: number; // e.g. 24
  conversionSellingPrice?: number;
  selectedUnit: string; // Active chosen unit (e.g. Lon or Thùng)
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  group: string;
  rewardPoints: number;
}

interface PosState {
  cart: CartItem[];
  selectedCategory: string;
  searchQuery: string;
  selectedCustomer: Customer | null;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET';
  paidAmount: number;
  discountPercent: number;
  isInvoiceModalOpen: boolean;
  isParkedModalOpen: boolean;
  isCustomerModalOpen: boolean;
  lastOrder: any | null;
  parkedOrdersCount: number;

  // Actions
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemUnit: (productId: string, chosenUnit: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setCustomer: (customer: Customer | null) => void;
  setPaymentMethod: (method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET') => void;
  setPaidAmount: (amount: number) => void;
  setDiscountPercent: (percent: number) => void;
  clearCart: () => void;
  checkout: () => Promise<any>;
  parkCurrentOrder: () => Promise<void>;
  setInvoiceModalOpen: (open: boolean) => void;
  setParkedModalOpen: (open: boolean) => void;
  setCustomerModalOpen: (open: boolean) => void;
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  selectedCategory: 'Tất cả',
  searchQuery: '',
  selectedCustomer: null,
  paymentMethod: 'CASH',
  paidAmount: 0,
  discountPercent: 0,
  isInvoiceModalOpen: false,
  isParkedModalOpen: false,
  isCustomerModalOpen: false,
  lastOrder: null,
  parkedOrdersCount: 0,

  addToCart: (product) => {
    const { cart } = get();
    const existingIndex = cart.findIndex((item) => item.productId === product.id);

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      const item = updatedCart[existingIndex];
      item.quantity += 1;
      item.totalPrice = item.quantity * item.unitPrice - item.discount;
      set({ cart: updatedCart });
    } else {
      const defaultUnit = product.unit || 'Cái';
      const defaultPrice = product.promoPrice || product.sellingPrice;

      const newItem: CartItem = {
        productId: product.id,
        sku: product.sku,
        barcode: product.barcode,
        name: product.name,
        unitPrice: defaultPrice,
        quantity: 1,
        discount: 0,
        totalPrice: defaultPrice,
        image: product.image,
        unit: defaultUnit,
        conversionUnit: product.conversionUnit,
        conversionFactor: product.conversionFactor,
        conversionSellingPrice: product.conversionSellingPrice,
        selectedUnit: defaultUnit, // Default to smallest unit
      };
      set({ cart: [...cart, newItem] });
    }
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((item) => item.productId !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const updatedCart = get().cart.map((item) => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity,
          totalPrice: quantity * item.unitPrice - item.discount,
        };
      }
      return item;
    });
    set({ cart: updatedCart });
  },

  updateItemUnit: (productId, chosenUnit) => {
    const updatedCart = get().cart.map((item) => {
      if (item.productId === productId) {
        let newUnitPrice = item.unitPrice;

        if (chosenUnit === item.conversionUnit && item.conversionUnit) {
          // Switch to larger unit (e.g. Thùng)
          newUnitPrice = item.conversionSellingPrice || item.unitPrice * (item.conversionFactor || 1);
        } else {
          // Switch back to smallest unit (e.g. Lon)
          newUnitPrice = item.unitPrice; // Base retail price per smallest unit
        }

        return {
          ...item,
          selectedUnit: chosenUnit,
          unitPrice: newUnitPrice,
          totalPrice: item.quantity * newUnitPrice - item.discount,
        };
      }
      return item;
    });
    set({ cart: updatedCart });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setCustomer: (customer) => set({ selectedCustomer: customer }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setPaidAmount: (amount) => set({ paidAmount: amount }),
  setDiscountPercent: (percent) => set({ discountPercent: percent }),

  clearCart: () =>
    set({
      cart: [],
      selectedCustomer: null,
      paidAmount: 0,
      discountPercent: 0,
    }),

  checkout: async () => {
    const { cart, selectedCustomer, paymentMethod, paidAmount, discountPercent } = get();
    if (cart.length === 0) throw new Error('Giỏ hàng đang trống!');

    const subTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = (subTotal * discountPercent) / 100;
    const totalAmount = subTotal - discount;
    const actualPaid = paidAmount > 0 ? paidAmount : totalAmount;

    const payload = {
      customerId: selectedCustomer?.id,
      items: cart.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        selectedUnit: i.selectedUnit,
        conversionFactor: i.selectedUnit === i.conversionUnit ? (i.conversionFactor || 1) : 1,
        unitPrice: i.unitPrice,
        discount: i.discount,
      })),
      subTotal,
      discount,
      tax: 0,
      totalAmount,
      paidAmount: actualPaid,
      paymentMethod,
    };

    const res: any = await api.post('/pos/checkout', payload);
    set({
      lastOrder: res.data,
      isInvoiceModalOpen: true,
    });
    get().clearCart();
    return res.data;
  },

  parkCurrentOrder: async () => {
    const { cart, selectedCustomer } = get();
    if (cart.length === 0) return;

    await api.post('/pos/parked-orders', { cart, customer: selectedCustomer });
    set((state) => ({ parkedOrdersCount: state.parkedOrdersCount + 1 }));
    get().clearCart();
  },

  setInvoiceModalOpen: (open) => set({ isInvoiceModalOpen: open }),
  setParkedModalOpen: (open) => set({ isParkedModalOpen: open }),
  setCustomerModalOpen: (open) => set({ isCustomerModalOpen: open }),
}));
