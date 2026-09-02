import { create } from 'zustand';
import api from '../services/api';
import { useBranchStore } from './branchStore';

export interface CartItem {
  product: any;
  quantity: number;
  selectedUnit: string;
  selectedConversionFactor: number;
  selectedPrice: number;
  discount?: number;
  notes?: string;
}

export interface OrderTab {
  id: string;
  name: string;
  cart: CartItem[];
  customer: any | null;
  activePriceList: any | null;
  discount: number;
  discountType: 'AMOUNT' | 'PERCENT';
  notes: string;
  deliveryInfo?: any | null;
  createdAt: string;
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
    : (product.conversionUnit ? [{ id: 'c0', unitName: product.conversionUnit, conversionFactor: product.conversionFactor || product.conversionRate || 10, sellingPrice: product.conversionSellingPrice || (product.sellingPrice || 0) * 10 }] : []);

  const targetUnit = unitName || product.unit;
  let targetFactor = 1;
  let targetPrice = product.sellingPrice || 0;

  if (targetUnit !== product.unit) {
    const conv = convList.find((c: any) =>
      c.unitName === targetUnit ||
      (c.unitName && targetUnit && (c.unitName.toLowerCase().includes(targetUnit.toLowerCase()) || targetUnit.toLowerCase().includes(c.unitName.toLowerCase())))
    );

    if (conv) {
      targetFactor = conv.conversionFactor || conv.conversionRate || 10;
      if (conv.sellingPrice && conv.sellingPrice > 0) {
        targetPrice = conv.sellingPrice;
      } else if (product.variantConversions && product.variantConversions[targetUnit]) {
        targetPrice = product.variantConversions[targetUnit];
      } else {
        targetPrice = (product.sellingPrice || 0) * targetFactor;
      }
    } else if (targetUnit.toLowerCase().includes('chục')) {
      targetFactor = 10;
      targetPrice = (product.sellingPrice || 0) * targetFactor;
    }
  }

  // Apply active price list rules
  if (activePriceList && activePriceList.code !== 'BG-BASE') {
    const priceListItem = activePriceList.items?.find((i: any) => i.productId === product.id);
    if (priceListItem) {
      if (targetUnit !== product.unit && priceListItem.customConversionPrice && priceListItem.customConversionPrice > 0) {
        targetPrice = priceListItem.customConversionPrice;
      } else if (priceListItem.customPrice && priceListItem.customPrice > 0) {
        targetPrice = targetUnit === product.unit ? priceListItem.customPrice : priceListItem.customPrice * targetFactor;
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

const createInitialTab = (index: number = 1): OrderTab => ({
  id: `tab-${Date.now()}-${index}`,
  name: `Hóa đơn ${index}`,
  cart: [],
  customer: null,
  activePriceList: null,
  discount: 0,
  discountType: 'AMOUNT',
  notes: '',
  createdAt: new Date().toISOString(),
});

interface PosState {
  // Multi-tab Management
  tabs: OrderTab[];
  activeTabId: string;

  // Direct Reactive Mirror Properties for Active Tab
  cart: CartItem[];
  customer: any | null;
  selectedCustomer: any | null;
  activePriceList: any | null;

  parkedOrders: ParkedOrder[];
  searchQuery: string;
  selectedCategory: string;

  isCustomerModalOpen: boolean;
  isParkedModalOpen: boolean;
  isInvoiceModalOpen: boolean;
  isPriceListModalOpen: boolean;
  isCheckoutModalOpen: boolean;
  isOrderHistoryModalOpen: boolean;
  isDeliveryModalOpen: boolean;
  isDeliveryLogModalOpen: boolean;
  deliveryInfo: any | null;
  lastOrder: any | null;

  // Tab Actions
  addTab: () => void;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  renameTab: (tabId: string, name: string) => void;

  setCustomer: (customer: any | null) => void;
  setActivePriceList: (priceList: any | null) => void;
  setDiscount: (discount: number, discountType?: 'AMOUNT' | 'PERCENT') => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;

  setCustomerModalOpen: (open: boolean) => void;
  setParkedModalOpen: (open: boolean) => void;
  setInvoiceModalOpen: (open: boolean) => void;
  setPriceListModalOpen: (open: boolean) => void;
  setCheckoutModalOpen: (open: boolean) => void;
  setOrderHistoryModalOpen: (open: boolean) => void;
  setDeliveryModalOpen: (open: boolean) => void;
  setDeliveryLogModalOpen: (open: boolean) => void;
  setDeliveryInfo: (info: any | null) => void;
  setLastOrder: (order: any | null) => void;

  addToCart: (product: any, unitName?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemUnit: (productId: string, unitName: string) => void;
  updateItemPrice: (productId: string, price: number) => void;
  clearCart: () => void;

  parkCurrentOrder: () => Promise<void>;
  restoreParkedOrder: (orderId: string) => void;
  deleteParkedOrder: (orderId: string) => void;
  checkout: (paymentData?: {
    method?: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET' | 'SPLIT';
    paidAmount?: number;
    cashAmount?: number;
    bankAmount?: number;
    notes?: string;
  }) => Promise<any>;

  calculateTotal: () => {
    subtotal: number;
    discount: number;
    shippingFee: number;
    total: number;
  };
}

const initialTab = createInitialTab(1);

export const usePosStore = create<PosState>((set, get) => ({
  tabs: [initialTab],
  activeTabId: initialTab.id,
  cart: [],
  customer: null,
  selectedCustomer: null,
  activePriceList: null,

  parkedOrders: [],
  searchQuery: '',
  selectedCategory: 'Tất cả',

  isCustomerModalOpen: false,
  isParkedModalOpen: false,
  isInvoiceModalOpen: false,
  isPriceListModalOpen: false,
  isCheckoutModalOpen: false,
  isOrderHistoryModalOpen: false,
  isDeliveryModalOpen: false,
  isDeliveryLogModalOpen: false,
  deliveryInfo: null,
  lastOrder: null,

  setDeliveryModalOpen: (open: boolean) => set({ isDeliveryModalOpen: open }),
  setDeliveryLogModalOpen: (open: boolean) => set({ isDeliveryLogModalOpen: open }),
  setDeliveryInfo: (info: any | null) => {
    const { tabs, activeTabId } = get();
    const updatedTabs = tabs.map((t) => (t.id === activeTabId ? { ...t, deliveryInfo: info } : t));
    set({ deliveryInfo: info, tabs: updatedTabs });
  },

  // Tab Management
  addTab: () => {
    const { tabs } = get();
    if (tabs.length >= 10) {
      alert('Tối đa có thể mở cùng lúc 10 tab hóa đơn');
      return;
    }
    const newTab = createInitialTab(tabs.length + 1);
    const newTabs = [...tabs, newTab];
    set({
      tabs: newTabs,
      activeTabId: newTab.id,
      cart: newTab.cart,
      customer: newTab.customer,
      selectedCustomer: newTab.customer,
      activePriceList: newTab.activePriceList,
    });
  },

  closeTab: (tabId: string) => {
    const { tabs, activeTabId } = get();
    if (tabs.length === 1) {
      get().clearCart();
      return;
    }

    const newTabs = tabs.filter((t) => t.id !== tabId);
    let nextActiveId = activeTabId;
    if (activeTabId === tabId) {
      const closedIndex = tabs.findIndex((t) => t.id === tabId);
      const nextTab = newTabs[Math.max(0, closedIndex - 1)];
      nextActiveId = nextTab.id;
    }

    const activeTab = newTabs.find((t) => t.id === nextActiveId) || newTabs[0];
    set({
      tabs: newTabs,
      activeTabId: nextActiveId,
      cart: activeTab ? activeTab.cart : [],
      customer: activeTab ? activeTab.customer : null,
      selectedCustomer: activeTab ? activeTab.customer : null,
      activePriceList: activeTab ? activeTab.activePriceList : null,
    });
  },

  switchTab: (tabId: string) => {
    const { tabs } = get();
    const activeTab = tabs.find((t) => t.id === tabId) || tabs[0];
    set({
      activeTabId: tabId,
      cart: activeTab ? activeTab.cart : [],
      customer: activeTab ? activeTab.customer : null,
      selectedCustomer: activeTab ? activeTab.customer : null,
      activePriceList: activeTab ? activeTab.activePriceList : null,
      deliveryInfo: activeTab ? (activeTab.cart.length > 0 ? activeTab.deliveryInfo : null) : null,
    });
  },

  renameTab: (tabId: string, name: string) => {
    const { tabs } = get();
    set({
      tabs: tabs.map((t) => (t.id === tabId ? { ...t, name } : t)),
    });
  },

  setCustomer: (customer) => {
    const { tabs, activeTabId } = get();
    const newTabs = tabs.map((t) => (t.id === activeTabId ? { ...t, customer } : t));
    set({
      tabs: newTabs,
      customer,
      selectedCustomer: customer,
    });
  },

  setActivePriceList: (priceList) => {
    const { tabs, activeTabId } = get();
    let updatedActiveCart: CartItem[] = [];

    const newTabs = tabs.map((t) => {
      if (t.id !== activeTabId) return t;
      const updatedCart = t.cart.map((item) => {
        const { price } = calculateProductPrice(item.product, item.selectedUnit, priceList);
        return { ...item, selectedPrice: price };
      });
      updatedActiveCart = updatedCart;
      return { ...t, activePriceList: priceList, cart: updatedCart };
    });

    set({
      tabs: newTabs,
      activePriceList: priceList,
      cart: updatedActiveCart,
    });
  },

  setDiscount: (discount, discountType = 'AMOUNT') => {
    const { tabs, activeTabId } = get();
    set({
      tabs: tabs.map((t) => (t.id === activeTabId ? { ...t, discount, discountType } : t)),
    });
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  setCustomerModalOpen: (isCustomerModalOpen) => set({ isCustomerModalOpen }),
  setParkedModalOpen: (isParkedModalOpen) => set({ isParkedModalOpen }),
  setInvoiceModalOpen: (isInvoiceModalOpen) => set({ isInvoiceModalOpen }),
  setPriceListModalOpen: (isPriceListModalOpen) => set({ isPriceListModalOpen }),
  setCheckoutModalOpen: (isCheckoutModalOpen) => set({ isCheckoutModalOpen }),
  setOrderHistoryModalOpen: (isOrderHistoryModalOpen) => set({ isOrderHistoryModalOpen }),
  setLastOrder: (lastOrder) => set({ lastOrder }),

  addToCart: (product, unitName) => {
    const { tabs, activeTabId } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
    const { price: targetPrice, factor: targetFactor, unit: targetUnit } = calculateProductPrice(product, unitName, activeTab.activePriceList);

    const existingIndex = activeTab.cart.findIndex((item) => item.product.id === product.id && item.selectedUnit === targetUnit);

    let updatedCart = [...activeTab.cart];
    if (existingIndex > -1) {
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: updatedCart[existingIndex].quantity + 1,
        selectedPrice: targetPrice,
      };
    } else {
      updatedCart.push({
        product,
        quantity: 1,
        selectedUnit: targetUnit,
        selectedConversionFactor: targetFactor,
        selectedPrice: targetPrice,
      });
    }

    const newTabs = tabs.map((t) => (t.id === activeTabId ? { ...t, cart: updatedCart } : t));
    set({
      tabs: newTabs,
      cart: updatedCart,
    });
  },

  removeFromCart: (productId) => {
    const { tabs, activeTabId } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
    const updatedCart = activeTab.cart.filter((item) => item.product.id !== productId);
    const updatedDeliveryInfo = updatedCart.length > 0 ? activeTab.deliveryInfo : null;
    const newTabs = tabs.map((t) => (t.id === activeTabId ? { ...t, cart: updatedCart, deliveryInfo: updatedDeliveryInfo } : t));
    set({
      tabs: newTabs,
      cart: updatedCart,
      deliveryInfo: updatedDeliveryInfo,
    });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const { tabs, activeTabId } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
    const updatedCart = activeTab.cart.map((item) => (item.product.id === productId ? { ...item, quantity } : item));
    const newTabs = tabs.map((t) => (t.id === activeTabId ? { ...t, cart: updatedCart } : t));
    set({
      tabs: newTabs,
      cart: updatedCart,
    });
  },

  updateItemUnit: (productId, unitName) => {
    const { tabs, activeTabId } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
    const updatedCart = activeTab.cart.map((item) => {
      if (item.product.id === productId) {
        const { price, factor } = calculateProductPrice(item.product, unitName, activeTab.activePriceList);
        return {
          ...item,
          selectedUnit: unitName,
          selectedConversionFactor: factor,
          selectedPrice: price,
        };
      }
      return item;
    });

    const newTabs = tabs.map((t) => (t.id === activeTabId ? { ...t, cart: updatedCart } : t));
    set({
      tabs: newTabs,
      cart: updatedCart,
    });
  },

  updateItemPrice: (productId, price) => {
    const { tabs, activeTabId } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
    const updatedCart = activeTab.cart.map((item) => (item.product.id === productId ? { ...item, selectedPrice: Math.max(0, price) } : item));
    const newTabs = tabs.map((t) => (t.id === activeTabId ? { ...t, cart: updatedCart } : t));
    set({
      tabs: newTabs,
      cart: updatedCart,
    });
  },

  clearCart: () => {
    const { tabs, activeTabId } = get();
    const newTabs = tabs.map((t) => (t.id === activeTabId ? { ...t, cart: [], customer: null, discount: 0, deliveryInfo: null } : t));
    set({
      tabs: newTabs,
      cart: [],
      customer: null,
      selectedCustomer: null,
      deliveryInfo: null,
    });
  },

  parkCurrentOrder: async () => {
    const { tabs, activeTabId, parkedOrders } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
    const itemsToPark = activeTab?.cart || [];
    if (itemsToPark.length === 0) return;

    const newOrder: ParkedOrder = {
      id: `parked-${Date.now()}`,
      code: `HD-TAM-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: activeTab?.customer || null,
      items: [...itemsToPark],
      parkedAt: new Date().toISOString(),
    };

    set({
      parkedOrders: [newOrder, ...parkedOrders],
    });
    get().clearCart();
  },

  restoreParkedOrder: (orderId) => {
    const { parkedOrders, tabs, activeTabId } = get();
    const order = parkedOrders.find((o) => o.id === orderId);
    if (order) {
      const newTabs = tabs.map((t) =>
        t.id === activeTabId ? { ...t, cart: order.items, customer: order.customer } : t
      );
      set({
        tabs: newTabs,
        cart: order.items,
        customer: order.customer,
        selectedCustomer: order.customer,
        parkedOrders: parkedOrders.filter((o) => o.id !== orderId),
      });
    }
  },

  deleteParkedOrder: (orderId) => {
    set({
      parkedOrders: get().parkedOrders.filter((o) => o.id !== orderId),
    });
  },

  checkout: async (paymentData) => {
    const { tabs, activeTabId, calculateTotal, setLastOrder, setInvoiceModalOpen } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
    if (activeTab.cart.length === 0) throw new Error('Giỏ hàng đang trống');

    const { subtotal, discount, total } = calculateTotal();
    const method = paymentData?.method || 'CASH';
    const paidAmount = paymentData?.paidAmount ?? total;

    const activeBranchId = useBranchStore.getState().selectedBranchId || 'branch-01';

    const checkoutPayload = {
      customerId: activeTab.customer?.id,
      customerName: activeTab.customer ? (activeTab.customer.fullName || activeTab.customer.name) : 'Khách lẻ',
      customerPhone: activeTab.customer?.phone || '',
      cashierId: 'usr-cashier-01',
      branchId: activeBranchId,
      items: activeTab.cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        barcode: item.product.barcode,
        selectedUnit: item.selectedUnit,
        conversionFactor: item.selectedConversionFactor,
        quantity: item.quantity,
        unitPrice: item.selectedPrice,
        discount: 0,
      })),
      subTotal: subtotal,
      discount,
      tax: 0,
      totalAmount: total,
      paidAmount,
      paymentMethod: method,
      notes: paymentData?.notes || activeTab.notes,
      deliveryInfo: activeTab.cart.length > 0 ? activeTab.deliveryInfo : null,
    };

    let serverOrder: any = null;
    try {
      const res: any = await api.post('/pos/checkout', checkoutPayload);
      serverOrder = res.data;
    } catch (err) {
      console.warn('Fallback offline order creation:', err);
    }

    const orderData = serverOrder || {
      orderNumber: `HD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      customer: activeTab.customer,
      items: checkoutPayload.items,
      subTotal: subtotal,
      discount,
      totalAmount: total,
      paidAmount,
      changeAmount: Math.max(0, paidAmount - total),
      paymentMethod: method === 'CASH' ? 'Tiền mặt' : method === 'BANK_TRANSFER' ? 'Chuyển khoản (VietQR)' : method === 'CREDIT_CARD' ? 'Thẻ POS' : 'Tách tiền mặt/CK',
    };

    setLastOrder(orderData);
    setInvoiceModalOpen(true);

    // Dispatch realtime stock update event across all components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pos:stock-updated', {
        detail: { items: checkoutPayload.items, branchId: activeBranchId }
      }));
    }

    // If more than 1 tab, close current tab, otherwise clear it
    if (tabs.length > 1) {
      get().closeTab(activeTabId);
    } else {
      get().clearCart();
    }

    return orderData;
  },

  calculateTotal: () => {
    const { tabs, activeTabId } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
    const cartItems = activeTab?.cart || [];
    const subtotal = cartItems.reduce((sum, item) => sum + item.selectedPrice * item.quantity, 0);

    let discount = 0;
    if (activeTab?.discount > 0) {
      if (activeTab.discountType === 'PERCENT') {
        discount = Math.round((subtotal * activeTab.discount) / 100);
      } else {
        discount = activeTab.discount;
      }
    }

    const shippingFee = (cartItems.length > 0 && activeTab?.deliveryInfo?.isDelivery) ? (activeTab.deliveryInfo.shippingFee || 0) : 0;
    const total = Math.max(0, subtotal - discount) + shippingFee;

    return {
      subtotal,
      discount,
      shippingFee,
      total,
    };
  },
}));
