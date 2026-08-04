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

interface PosState {
  cart: CartItem[];
  customer: any | null;
  parkedOrders: ParkedOrder[];
  activePriceList: any | null;
  searchQuery: string;
  selectedCategory: string;

  setCustomer: (customer: any | null) => void;
  setActivePriceList: (priceList: any | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;

  addToCart: (product: any, unitName?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemUnit: (productId: string, unitName: string) => void;
  clearCart: () => void;

  parkCurrentOrder: () => void;
  restoreParkedOrder: (orderId: string) => void;
  deleteParkedOrder: (orderId: string) => void;

  calculateTotal: () => {
    subtotal: number;
    discount: number;
    total: number;
  };
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  customer: null,
  parkedOrders: [],
  activePriceList: null,
  searchQuery: '',
  selectedCategory: 'Tất cả',

  setCustomer: (customer) => set({ customer }),
  setActivePriceList: (priceList) => set({ activePriceList: priceList }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  addToCart: (product, unitName) => {
    const { cart, activePriceList } = get();

    // Available unit conversions list
    const convList = product.conversions && product.conversions.length > 0
      ? product.conversions
      : (product.conversionUnit ? [{ id: 'c0', unitName: product.conversionUnit, conversionFactor: product.conversionFactor || 24, sellingPrice: product.conversionSellingPrice || product.sellingPrice * 24 }] : []);

    const targetUnit = unitName || product.unit;

    let targetFactor = 1;
    let targetPrice = product.sellingPrice;

    if (targetUnit !== product.unit) {
      const conv = convList.find((c: any) => c.unitName === targetUnit);
      if (conv) {
        targetFactor = conv.conversionFactor;
        // Check if variant has custom conversion price override, else auto-calculate using conversion factor
        if (product.variantConversions && product.variantConversions[targetUnit]) {
          targetPrice = product.variantConversions[targetUnit];
        } else {
          targetPrice = product.sellingPrice * targetFactor;
        }
      }
    }

    // Check if active price list applies discount
    if (activePriceList && activePriceList.code !== 'BG-BASE') {
      const priceListItem = activePriceList.items?.find((i: any) => i.productId === product.id);
      if (priceListItem) {
        if (targetUnit !== product.unit && priceListItem.customConversionPrice) {
          targetPrice = priceListItem.customConversionPrice;
        } else if (targetUnit === product.unit) {
          targetPrice = priceListItem.customPrice;
        }
      }
    }

    const existingIndex = cart.findIndex((item) => item.product.id === product.id && item.selectedUnit === targetUnit);

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
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
          const product = item.product;
          const convList = product.conversions && product.conversions.length > 0
            ? product.conversions
            : (product.conversionUnit ? [{ id: 'c0', unitName: product.conversionUnit, conversionFactor: product.conversionFactor || 24, sellingPrice: product.conversionSellingPrice || product.sellingPrice * 24 }] : []);

          let factor = 1;
          let price = product.sellingPrice;

          if (unitName !== product.unit) {
            const conv = convList.find((c: any) => c.unitName === unitName);
            if (conv) {
              factor = conv.conversionFactor;
              if (product.variantConversions && product.variantConversions[unitName]) {
                price = product.variantConversions[unitName];
              } else {
                price = product.sellingPrice * factor;
              }
            }
          }

          if (activePriceList && activePriceList.code !== 'BG-BASE') {
            const priceListItem = activePriceList.items?.find((i: any) => i.productId === product.id);
            if (priceListItem) {
              if (unitName !== product.unit && priceListItem.customConversionPrice) {
                price = priceListItem.customConversionPrice;
              } else if (unitName === product.unit) {
                price = priceListItem.customPrice;
              }
            }
          }

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

  parkCurrentOrder: () => {
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
