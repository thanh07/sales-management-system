import { create } from 'zustand';

export interface CartItem {
  product: any;
  quantity: number;
  selectedUnit: string;
  selectedConversionFactor: number;
  selectedPrice: number;
  notes?: string;
}

export interface ParkedOrder {
  id: string;
  code: string;
  customer: any;
  items: CartItem[];
  parkedAt: string;
}

export const calculateProductPrice = (product: any, unitName?: string, activePriceList?: any | null) => {
  if (!product) return { price: 0, factor: 1, unit: '' };

  const convList = product.conversions && product.conversions.length > 0
    ? product.conversions
    : (product.conversionUnit ? [{ id: 'c0', unitName: product.conversionUnit, conversionFactor: product.conversionFactor || 24, sellingPrice: product.conversionSellingPrice || product.sellingPrice * 24 }] : []);

  const targetUnit = unitName || product.unit;
  let targetFactor = 1;
  let targetPrice = product.sellingPrice || 0;

  if (targetUnit !== product.unit) {
    const conv = convList.find((c: any) => c.unitName === targetUnit);
    if (conv) {
      targetFactor = conv.conversionFactor || 1;
      if (product.variantConversions && product.variantConversions[targetUnit]) {
        targetPrice = product.variantConversions[targetUnit];
      } else {
        targetPrice = (product.sellingPrice || 0) * targetFactor;
      }
    }
  }

  // Apply active price list rules
  if (activePriceList && activePriceList.code !== 'BG-BASE') {
    const priceListItem = activePriceList.items?.find((i: any) => i.productId === product.id);
    if (priceListItem) {
      if (targetUnit !== product.unit && priceListItem.customConversionPrice) {
        targetPrice = priceListItem.customConversionPrice;
      } else if (targetUnit === product.unit && priceListItem.customPrice) {
        targetPrice = priceListItem.customPrice;
      }
    } else if (activePriceList.calculationMethod === 'PERCENT_BASE' && activePriceList.value > 0) {
      const discountRatio = 1 - (activePriceList.value / 100);
      targetPrice = Math.round((targetPrice * discountRatio) / 500) * 500;
    } else if (activePriceList.calculationMethod === 'PERCENT_COST' && activePriceList.value > 0) {
      const baseCost = product.costPrice || ((product.sellingPrice || 0) * 0.7);
      const unitCost = targetUnit === product.unit ? baseCost : baseCost * targetFactor;
      targetPrice = Math.round((unitCost * (1 + activePriceList.value / 100)) / 500) * 500;
    } else if (activePriceList.calculationMethod === 'FIXED_OFFSET' && activePriceList.value > 0) {
      targetPrice = Math.max(0, targetPrice - activePriceList.value);
    }
  }

  return { price: targetPrice, factor: targetFactor, unit: targetUnit };
};

interface PosState {
  cart: CartItem[];
  customer: any | null;
  selectedCustomer: any | null;
  parkedOrders: ParkedOrder[];
  activePriceList: any | null;
  searchQuery: string;
  selectedCategory: string;

  isCustomerModalOpen: boolean;
  isParkedModalOpen: boolean;
  isInvoiceModalOpen: boolean;
  isPriceListModalOpen: boolean;
  lastOrder: any | null;

  setCustomer: (customer: any | null) => void;
  setActivePriceList: (priceList: any | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;

  setCustomerModalOpen: (open: boolean) => void;
  setParkedModalOpen: (open: boolean) => void;
  setInvoiceModalOpen: (open: boolean) => void;
  setPriceListModalOpen: (open: boolean) => void;
  setLastOrder: (order: any | null) => void;

  addToCart: (product: any, unitName?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemUnit: (productId: string, unitName: string) => void;
  clearCart: () => void;

  parkCurrentOrder: () => Promise<void>;
  restoreParkedOrder: (orderId: string) => void;
  deleteParkedOrder: (orderId: string) => void;
  checkout: () => Promise<any>;

  calculateTotal: () => {
    subtotal: number;
    discount: number;
    total: number;
  };
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  customer: null,
  get selectedCustomer() { return get().customer; },
  parkedOrders: [],
  activePriceList: null,
  searchQuery: '',
  selectedCategory: 'Tất cả',

  isCustomerModalOpen: false,
  isParkedModalOpen: false,
  isInvoiceModalOpen: false,
  isPriceListModalOpen: false,
  lastOrder: null,

  setCustomer: (customer) => set({ customer }),
  setActivePriceList: (priceList) => {
    const { cart } = get();
    // Recalculate prices for all line items in the cart when switching price lists
    const updatedCart = cart.map((item) => {
      const { price } = calculateProductPrice(item.product, item.selectedUnit, priceList);
      return { ...item, selectedPrice: price };
    });
    set({ activePriceList: priceList, cart: updatedCart });
  },
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  setCustomerModalOpen: (isCustomerModalOpen) => set({ isCustomerModalOpen }),
  setParkedModalOpen: (isParkedModalOpen) => set({ isParkedModalOpen }),
  setInvoiceModalOpen: (isInvoiceModalOpen) => set({ isInvoiceModalOpen }),
  setPriceListModalOpen: (isPriceListModalOpen) => set({ isPriceListModalOpen }),
  setLastOrder: (lastOrder) => set({ lastOrder }),

  addToCart: (product, unitName) => {
    const { cart, activePriceList } = get();
    const { price: targetPrice, factor: targetFactor, unit: targetUnit } = calculateProductPrice(product, unitName, activePriceList);

    const existingIndex = cart.findIndex((item) => item.product.id === product.id && item.selectedUnit === targetUnit);

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      updatedCart[existingIndex].selectedPrice = targetPrice;
      set({ cart: updatedCart });
    } else {
      set({
        cart: [
          ...cart,
          {
            product,
            quantity: 1,
            selectedUnit: targetUnit,
            selectedConversionFactor: targetFactor,
            selectedPrice: targetPrice,
          },
        ],
      });
    }
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((item) => item.product.id !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set({
      cart: get().cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    });
  },

  updateItemUnit: (productId, unitName) => {
    const { cart, activePriceList } = get();
    set({
      cart: cart.map((item) => {
        if (item.product.id === productId) {
          const { price, factor } = calculateProductPrice(item.product, unitName, activePriceList);
          return {
            ...item,
            selectedUnit: unitName,
            selectedConversionFactor: factor,
            selectedPrice: price,
          };
        }
        return item;
      }),
    });
  },

  clearCart: () => set({ cart: [] }),

  parkCurrentOrder: async () => {
    const { cart, customer, parkedOrders } = get();
    if (cart.length === 0) return;

    const newOrder: ParkedOrder = {
      id: `parked-${Date.now()}`,
      code: `HD-TAM-${Math.floor(1000 + Math.random() * 9000)}`,
      customer,
      items: [...cart],
      parkedAt: new Date().toISOString(),
    };

    set({
      parkedOrders: [newOrder, ...parkedOrders],
      cart: [],
    });
  },

  restoreParkedOrder: (orderId) => {
    const { parkedOrders } = get();
    const order = parkedOrders.find((o) => o.id === orderId);
    if (order) {
      set({
        cart: order.items,
        customer: order.customer,
        parkedOrders: parkedOrders.filter((o) => o.id !== orderId),
      });
    }
  },

  deleteParkedOrder: (orderId) => {
    set({
      parkedOrders: get().parkedOrders.filter((o) => o.id !== orderId),
    });
  },

  checkout: async () => {
    const { cart, customer, clearCart, setLastOrder, setInvoiceModalOpen } = get();
    if (cart.length === 0) throw new Error('Giỏ hàng đang trống');

    const subTotal = cart.reduce((sum, item) => sum + item.selectedPrice * item.quantity, 0);
    const orderData = {
      orderNumber: `HD-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      customer,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        selectedUnit: item.selectedUnit,
        unitPrice: item.selectedPrice,
      })),
      subTotal,
      discount: 0,
      totalAmount: subTotal,
      paidAmount: subTotal,
      changeAmount: 0,
      paymentMethod: 'Tiền mặt',
    };

    setLastOrder(orderData);
    setInvoiceModalOpen(true);
    clearCart();
    return orderData;
  },

  calculateTotal: () => {
    const { cart } = get();
    const subtotal = cart.reduce((sum, item) => sum + item.selectedPrice * item.quantity, 0);
    return {
      subtotal,
      discount: 0,
      total: subtotal,
    };
  },
}));
