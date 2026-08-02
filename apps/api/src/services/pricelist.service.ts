import { ProductService } from './product.service';

export interface PriceListItem {
  productId: string;
  productName: string;
  sku: string;
  barcode: string;
  unit: string;
  conversionUnit?: string;
  conversionFactor?: number;
  basePrice: number;
  costPrice: number;
  customPrice: number;
  customConversionPrice?: number;
  isOverridden?: boolean;
}

export interface PriceList {
  id: string;
  code: string;
  name: string;
  type: 'STANDARD' | 'WHOLESALE' | 'PROMOTION' | 'CUSTOMER_GROUP';
  calculationMethod: 'FIXED' | 'PERCENT_BASE' | 'PERCENT_COST' | 'FIXED_OFFSET';
  value: number;
  startDate?: string;
  endDate?: string;
  appliedCustomerGroups: string[];
  appliedBranches: string[];
  isActive: boolean;
  notes?: string;
  customOverrides?: Record<string, { customPrice: number; customConversionPrice?: number }>;
  items?: PriceListItem[];
  createdAt: string;
}

let PRICE_LISTS_DB: PriceList[] = [
  {
    id: 'pl-01',
    code: 'BG-BASE',
    name: 'Bảng Giá Bán Lẻ Mặc Định (Giá Chung)',
    type: 'STANDARD',
    calculationMethod: 'FIXED',
    value: 0,
    appliedCustomerGroups: ['RETAIL', 'ALL'],
    appliedBranches: ['ALL'],
    isActive: true,
    notes: 'Bảng giá bán lẻ niêm yết chuẩn tại quầy',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'pl-02',
    code: 'BG-SI-2026',
    name: 'Bảng Giá Bán Sỉ / Đại Lý (Giảm 12% Giá Nhãn)',
    type: 'WHOLESALE',
    calculationMethod: 'PERCENT_BASE',
    value: 12,
    appliedCustomerGroups: ['WHOLESALE'],
    appliedBranches: ['ALL'],
    isActive: true,
    notes: 'Áp dụng tự động cho các đại lý bán sỉ',
    createdAt: '2026-02-10T08:30:00Z',
  },
  {
    id: 'pl-03',
    code: 'BG-VIP-MEMBER',
    name: 'Bảng Giá Đặc Quyền Khách Hàng VIP (Giảm 8%)',
    type: 'CUSTOMER_GROUP',
    calculationMethod: 'PERCENT_BASE',
    value: 8,
    appliedCustomerGroups: ['VIP'],
    appliedBranches: ['ALL'],
    isActive: true,
    notes: 'Áp dụng tự động khi chọn Khách hàng VIP',
    createdAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'pl-04',
    code: 'BG-SUMMER-SALE',
    name: 'Bảng Giá Khuyến Mãi Hè 2026 (Đồng Giá Lợi Nhuận + 15%)',
    type: 'PROMOTION',
    calculationMethod: 'PERCENT_COST',
    value: 15,
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    appliedCustomerGroups: ['ALL'],
    appliedBranches: ['ALL'],
    isActive: true,
    notes: 'Chương trình xả hàng khuyến mãi hè',
    createdAt: '2026-05-20T14:00:00Z',
  },
];

export class PriceListService {
  static getAllPriceLists(query?: string, type?: string) {
    let list = [...PRICE_LISTS_DB];

    if (type && type !== 'Tất cả') {
      list = list.filter((p) => p.type === type);
    }

    if (query) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      );
    }

    return list;
  }

  static getPriceListById(id: string): PriceList {
    const pl = PRICE_LISTS_DB.find((p) => p.id === id);
    if (!pl) throw new Error('Không tìm thấy bảng giá');

    const products = ProductService.getAllProducts();
    const items: PriceListItem[] = products.map((prod) => {
      const override = pl.customOverrides?.[prod.id];
      let customPrice = prod.sellingPrice;
      let customConversionPrice = prod.conversionSellingPrice;
      let isOverridden = false;

      if (override) {
        customPrice = override.customPrice;
        if (override.customConversionPrice) customConversionPrice = override.customConversionPrice;
        isOverridden = true;
      } else {
        if (pl.calculationMethod === 'PERCENT_BASE') {
          customPrice = Math.round((prod.sellingPrice * (1 - pl.value / 100)) / 1000) * 1000;
          if (prod.conversionSellingPrice) {
            customConversionPrice = Math.round((prod.conversionSellingPrice * (1 - pl.value / 100)) / 1000) * 1000;
          }
        } else if (pl.calculationMethod === 'PERCENT_COST') {
          customPrice = Math.round((prod.costPrice * (1 + pl.value / 100)) / 1000) * 1000;
          if (prod.conversionSellingPrice) {
            customConversionPrice = Math.round((prod.costPrice * (prod.conversionFactor || 1) * (1 + pl.value / 100)) / 1000) * 1000;
          }
        } else if (pl.calculationMethod === 'FIXED_OFFSET') {
          customPrice = Math.max(0, prod.sellingPrice - pl.value);
        }
      }

      return {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        barcode: prod.barcode,
        unit: prod.unit,
        conversionUnit: prod.conversionUnit,
        conversionFactor: prod.conversionFactor,
        basePrice: prod.sellingPrice,
        costPrice: prod.costPrice,
        customPrice,
        customConversionPrice,
        isOverridden,
      };
    });

    return { ...pl, items };
  }

  // Multi-Price List Comparison Matrix Generator (KiotViet 4.3 Feature #2)
  static getMultiPriceListComparisonMatrix(selectedPriceListIds?: string[]) {
    const targetLists = selectedPriceListIds && selectedPriceListIds.length > 0
      ? PRICE_LISTS_DB.filter((p) => selectedPriceListIds.includes(p.id))
      : PRICE_LISTS_DB;

    const populatedLists = targetLists.map((pl) => this.getPriceListById(pl.id));
    const products = ProductService.getAllProducts();

    const comparisonRows = products.map((prod) => {
      const priceMap: Record<string, { price: number; diffPercent: number; isOverridden?: boolean }> = {};

      populatedLists.forEach((pl) => {
        const item = pl.items?.find((i) => i.productId === prod.id);
        const finalPrice = item ? item.customPrice : prod.sellingPrice;
        const diffPercent = prod.sellingPrice > 0
          ? Math.round(((finalPrice - prod.sellingPrice) / prod.sellingPrice) * 100)
          : 0;

        priceMap[pl.id] = {
          price: finalPrice,
          diffPercent,
          isOverridden: item?.isOverridden,
        };
      });

      return {
        product: prod,
        prices: priceMap,
      };
    });

    return {
      priceLists: populatedLists.map((p) => ({ id: p.id, code: p.code, name: p.name, type: p.type })),
      rows: comparisonRows,
    };
  }

  static createPriceList(data: Omit<PriceList, 'id' | 'code' | 'createdAt'>) {
    const newPriceList: PriceList = {
      ...data,
      id: `pl-${Date.now()}`,
      code: `BG-${Math.floor(1000 + Math.random() * 9000)}`,
      customOverrides: {},
      createdAt: new Date().toISOString(),
    };
    PRICE_LISTS_DB.unshift(newPriceList);
    return newPriceList;
  }

  static updatePriceList(id: string, data: Partial<PriceList>) {
    const index = PRICE_LISTS_DB.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Không tìm thấy bảng giá');
    PRICE_LISTS_DB[index] = { ...PRICE_LISTS_DB[index], ...data };
    return PRICE_LISTS_DB[index];
  }

  static toggleStatus(id: string) {
    const pl = PRICE_LISTS_DB.find((p) => p.id === id);
    if (!pl) throw new Error('Không tìm thấy bảng giá');
    pl.isActive = !pl.isActive;
    return pl;
  }

  static duplicatePriceList(id: string) {
    const source = PRICE_LISTS_DB.find((p) => p.id === id);
    if (!source) throw new Error('Không tìm thấy bảng giá nguồn để sao chép');

    const cloned: PriceList = {
      ...source,
      id: `pl-${Date.now()}`,
      code: `BG-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${source.name} (Bản sao)`,
      customOverrides: source.customOverrides ? JSON.parse(JSON.stringify(source.customOverrides)) : {},
      createdAt: new Date().toISOString(),
    };

    PRICE_LISTS_DB.unshift(cloned);
    return cloned;
  }

  static updatePriceListItems(id: string, items: { productId: string; customPrice: number; customConversionPrice?: number }[]) {
    const pl = PRICE_LISTS_DB.find((p) => p.id === id);
    if (!pl) throw new Error('Không tìm thấy bảng giá');

    if (!pl.customOverrides) pl.customOverrides = {};

    items.forEach((item) => {
      pl.customOverrides![item.productId] = {
        customPrice: item.customPrice,
        customConversionPrice: item.customConversionPrice,
      };
    });

    return this.getPriceListById(id);
  }

  static deletePriceList(id: string) {
    const pl = PRICE_LISTS_DB.find((p) => p.id === id);
    if (!pl) throw new Error('Không tìm thấy bảng giá để xóa');

    if (pl.code === 'BG-BASE' || pl.type === 'STANDARD') {
      throw new Error('Không thể xóa Bảng Giá Bán Lẻ Mặc Định (Giá Chung) của hệ thống!');
    }

    PRICE_LISTS_DB = PRICE_LISTS_DB.filter((p) => p.id !== id);
    return true;
  }

  static getActivePriceListForCustomerGroup(customerGroup?: string) {
    if (!customerGroup) return PRICE_LISTS_DB.find((p) => p.code === 'BG-BASE');

    const activeList = PRICE_LISTS_DB.find(
      (p) => p.isActive && p.appliedCustomerGroups.includes(customerGroup)
    );

    return activeList || PRICE_LISTS_DB.find((p) => p.code === 'BG-BASE');
  }
}
