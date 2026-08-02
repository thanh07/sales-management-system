export interface ProductAttribute {
  name: string; // e.g. "Màu sắc", "Kích thước", "Dung lượng"
  values: string[]; // e.g. ["Đen", "Trắng", "Xanh"] or ["S", "M", "L"]
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string;
  variantName: string; // e.g. "iPhone 15 Pro Max - Đen - 256GB"
  attributeValues: Record<string, string>; // e.g. { "Màu sắc": "Đen", "Dung lượng": "256GB" }
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStock: number;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string; // Unique Barcode
  name: string;
  category: string;
  brand: string;
  unit: string; // Smallest unit (e.g. Lon, Chai, Cái, Bộ)
  conversionUnit?: string; // Larger unit (e.g. Thùng, Lốc, Hộp)
  conversionFactor?: number; // Conversion factor (e.g. 24)
  conversionSellingPrice?: number;
  costPrice: number; // Cost price per smallest unit
  sellingPrice: number; // Retail selling price per smallest unit
  promoPrice?: number;
  stockQuantity: number; // Total stock in smallest unit
  minStock: number; // Min stock warning threshold
  image: string;
  isActive: boolean;
  hasVariants?: boolean;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
}

let CATEGORIES_DB: string[] = [
  'Thời Trang & May Mặc',
  'Nước Giải Khát & Bia',
  'Thực Phẩm & Bánh Kẹo',
  'Điện Thoại & Máy Tính Bảng',
  'Laptop & Phụ Kiện',
  'Phụ Kiện Công Nghệ',
  'Đồ Gia Dụng Thông Minh',
];

let UNITS_DB: string[] = [
  'Lon',
  'Chai',
  'Gói',
  'Bịch',
  'Cái',
  'Máy',
  'Hộp',
  'Bộ',
  'Chiếc',
  'Thùng',
  'Lốc',
  'Két',
  'Vỉ',
  'Bao',
  'Kg',
  'Gram',
  'Tập',
];

function generateProductsWithAttributes(): Product[] {
  const list: Product[] = [
    // Product with Attributes & Variants (KiotViet 4.3 Feature)
    {
      id: 'prod-attr-01',
      sku: 'SP-POLO-COOL',
      barcode: '893500333001',
      name: 'Áo Nam Polo Coolmax Cao Cấp',
      category: 'Thời Trang & May Mặc',
      brand: 'Coolmate',
      unit: 'Cái',
      costPrice: 150000,
      sellingPrice: 250000,
      stockQuantity: 120,
      minStock: 10,
      image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&q=80',
      isActive: true,
      hasVariants: true,
      attributes: [
        { name: 'Màu sắc', values: ['Đen', 'Trắng', 'Xanh Thẫm'] },
        { name: 'Kích thước', values: ['M', 'L', 'XL'] },
      ],
      variants: [
        { id: 'v-1', sku: 'POLO-DEN-M', barcode: '893500333011', variantName: 'Áo Polo Coolmax - Đen - Size M', attributeValues: { 'Màu sắc': 'Đen', 'Kích thước': 'M' }, costPrice: 150000, sellingPrice: 250000, stockQuantity: 20, minStock: 5 },
        { id: 'v-2', sku: 'POLO-DEN-L', barcode: '893500333012', variantName: 'Áo Polo Coolmax - Đen - Size L', attributeValues: { 'Màu sắc': 'Đen', 'Kích thước': 'L' }, costPrice: 150000, sellingPrice: 250000, stockQuantity: 25, minStock: 5 },
        { id: 'v-3', sku: 'POLO-DEN-XL', barcode: '893500333013', variantName: 'Áo Polo Coolmax - Đen - Size XL', attributeValues: { 'Màu sắc': 'Đen', 'Kích thước': 'XL' }, costPrice: 150000, sellingPrice: 250000, stockQuantity: 15, minStock: 5 },
        { id: 'v-4', sku: 'POLO-TRANG-M', barcode: '893500333021', variantName: 'Áo Polo Coolmax - Trắng - Size M', attributeValues: { 'Màu sắc': 'Trắng', 'Kích thước': 'M' }, costPrice: 150000, sellingPrice: 250000, stockQuantity: 20, minStock: 5 },
        { id: 'v-5', sku: 'POLO-TRANG-L', barcode: '893500333022', variantName: 'Áo Polo Coolmax - Trắng - Size L', attributeValues: { 'Màu sắc': 'Trắng', 'Kích thước': 'L' }, costPrice: 150000, sellingPrice: 250000, stockQuantity: 20, minStock: 5 },
        { id: 'v-6', sku: 'POLO-XANH-M', barcode: '893500333031', variantName: 'Áo Polo Coolmax - Xanh Thẫm - Size M', attributeValues: { 'Màu sắc': 'Xanh Thẫm', 'Kích thước': 'M' }, costPrice: 150000, sellingPrice: 250000, stockQuantity: 20, minStock: 5 },
      ],
    },
    {
      id: 'prod-unit-01',
      sku: 'SP-REDBULL-250',
      barcode: '893500111001',
      name: 'Nước Tăng Lực Red Bull Bò Cụtn 250ml',
      category: 'Nước Giải Khát & Bia',
      brand: 'Red Bull',
      unit: 'Lon',
      conversionUnit: 'Thùng',
      conversionFactor: 24,
      conversionSellingPrice: 340000,
      costPrice: 11000,
      sellingPrice: 15000,
      stockQuantity: 240,
      minStock: 48,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
      isActive: true,
    },
    {
      id: 'prod-unit-02',
      sku: 'SP-HEINEKEN-330',
      barcode: '893500111002',
      name: 'Bia Heineken Silver Lon 330ml',
      category: 'Nước Giải Khát & Bia',
      brand: 'Heineken',
      unit: 'Lon',
      conversionUnit: 'Thùng',
      conversionFactor: 24,
      conversionSellingPrice: 420000,
      costPrice: 15000,
      sellingPrice: 19000,
      stockQuantity: 480,
      minStock: 96,
      image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80',
      isActive: true,
    },
    {
      id: 'prod-unit-03',
      sku: 'SP-HAOHAO-TOM',
      barcode: '893500111003',
      name: 'Mì Tôm Chua Cay Hảo Hảo 75g',
      category: 'Thực Phẩm & Bánh Kẹo',
      brand: 'Acecook',
      unit: 'Gói',
      conversionUnit: 'Thùng',
      conversionFactor: 30,
      conversionSellingPrice: 135000,
      costPrice: 3800,
      sellingPrice: 4800,
      stockQuantity: 600,
      minStock: 60,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
      isActive: true,
    },
    {
      id: 'prod-unit-04',
      sku: 'SP-VINAMILK-100',
      barcode: '893500111004',
      name: 'Sữa Tươi Tiệt Trùng Vinamilk 100% Có Đường 220ml',
      category: 'Thực Phẩm & Bánh Kẹo',
      brand: 'Vinamilk',
      unit: 'Bịch',
      conversionUnit: 'Thùng',
      conversionFactor: 48,
      conversionSellingPrice: 360000,
      costPrice: 6500,
      sellingPrice: 8000,
      stockQuantity: 144,
      minStock: 48,
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
      isActive: true,
    },
  ];

  const electronics = [
    { name: 'iPhone 15 Pro Max 256GB Titan', brand: 'Apple', category: 'Điện Thoại & Máy Tính Bảng', unit: 'Máy', cost: 28000000, sell: 32990000, stock: 18 },
    { name: 'Samsung Galaxy S24 Ultra 512GB', brand: 'Samsung', category: 'Điện Thoại & Máy Tính Bảng', unit: 'Máy', cost: 26500000, sell: 31490000, stock: 4 },
    { name: 'MacBook Air 15 inch M3 16GB', brand: 'Apple', category: 'Laptop & Phụ Kiện', unit: 'Máy', cost: 32000000, sell: 36990000, stock: 12 },
    { name: 'Tai nghe Bluetooth Apple AirPods Pro 2', brand: 'Apple', category: 'Phụ Kiện Công Nghệ', unit: 'Cái', cost: 4800000, sell: 5990000, stock: 45 },
    { name: 'Chuột không dây Logitech MX Master 3S', brand: 'Logitech', category: 'Phụ Kiện Công Nghệ', unit: 'Cái', cost: 1950000, sell: 2490000, stock: 28 },
  ];

  electronics.forEach((e, idx) => {
    list.push({
      id: `prod-elec-${idx + 1}`,
      sku: `SP-ELEC-${idx + 1}`,
      barcode: `89350022200${idx + 1}`,
      name: e.name,
      category: e.category,
      brand: e.brand,
      unit: e.unit,
      costPrice: e.cost,
      sellingPrice: e.sell,
      stockQuantity: e.stock,
      minStock: 5,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
      isActive: true,
    });
  });

  return list;
}

const MOCK_PRODUCTS: Product[] = generateProductsWithAttributes();

export class ProductService {
  static getAllProducts(query?: string, category?: string) {
    let list = [...MOCK_PRODUCTS];

    if (category && category !== 'Tất cả') {
      list = list.filter((p) => p.category === category);
    }

    if (query) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.includes(q)
      );
    }

    return list;
  }

  static getProductByBarcode(barcode: string) {
    const p = MOCK_PRODUCTS.find(
      (item) => item.barcode === barcode || item.sku === barcode
    );
    if (p) return p;

    // Search in variants barcodes
    for (const prod of MOCK_PRODUCTS) {
      if (prod.variants) {
        const v = prod.variants.find((variant) => variant.barcode === barcode || variant.sku === barcode);
        if (v) {
          return {
            ...prod,
            name: v.variantName,
            sku: v.sku,
            barcode: v.barcode,
            costPrice: v.costPrice,
            sellingPrice: v.sellingPrice,
            stockQuantity: v.stockQuantity,
          };
        }
      }
    }

    throw new Error(`Không tìm thấy sản phẩm với mã barcode: ${barcode}`);
  }

  static addProduct(data: Omit<Product, 'id'>) {
    const existingBarcode = MOCK_PRODUCTS.find((p) => p.barcode === data.barcode);
    if (existingBarcode) {
      throw new Error(`Mã vạch Barcode "${data.barcode}" đã được sử dụng bởi sản phẩm "${existingBarcode.name}". Vui lòng dùng mã vạch độc nhất!`);
    }

    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
    };

    // Calculate total stock from variants if present
    if (newProduct.variants && newProduct.variants.length > 0) {
      newProduct.hasVariants = true;
      newProduct.stockQuantity = newProduct.variants.reduce((sum, v) => sum + Number(v.stockQuantity), 0);
    }

    MOCK_PRODUCTS.unshift(newProduct);
    if (!CATEGORIES_DB.includes(data.category)) {
      CATEGORIES_DB.push(data.category);
    }
    if (data.unit && !UNITS_DB.includes(data.unit)) {
      UNITS_DB.push(data.unit);
    }
    return newProduct;
  }

  static importProductsFromExcel(items: any[]) {
    let count = 0;
    items.forEach((item) => {
      if (item.name) {
        const barcode = item.barcode || '893' + Math.floor(100000000 + Math.random() * 900000000);
        const newProduct: Product = {
          id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          sku: item.sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
          barcode,
          name: item.name,
          category: item.category || 'Nước Giải Khát & Bia',
          brand: item.brand || 'Khác',
          unit: item.unit || 'Lon',
          conversionUnit: item.conversionUnit || undefined,
          conversionFactor: item.conversionFactor ? Number(item.conversionFactor) : undefined,
          conversionSellingPrice: item.conversionSellingPrice ? Number(item.conversionSellingPrice) : undefined,
          costPrice: Number(item.costPrice) || 10000,
          sellingPrice: Number(item.sellingPrice) || 15000,
          stockQuantity: Number(item.stockQuantity) || 100,
          minStock: Number(item.minStock) || 10,
          image: item.image || 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
          isActive: true,
        };
        MOCK_PRODUCTS.unshift(newProduct);
        if (!CATEGORIES_DB.includes(newProduct.category)) {
          CATEGORIES_DB.push(newProduct.category);
        }
        count++;
      }
    });
    return count;
  }

  static generateExcelExportCsv() {
    const headers = ['SKU', 'Mã Barcode (Độc nhất)', 'Tên sản phẩm', 'Danh mục', 'Đơn vị nhỏ nhất', 'Đơn vị quy đổi', 'Hệ số quy đổi', 'Giá nhập (ĐV nhỏ)', 'Giá bán lẻ (ĐV nhỏ)', 'Giá bán đơn vị lớn', 'Tồn kho (ĐV nhỏ nhất)', 'Ngưỡng cảnh báo'];
    const rows = MOCK_PRODUCTS.map((p) => [
      p.sku,
      p.barcode,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.unit,
      p.conversionUnit || '',
      p.conversionFactor || '',
      p.costPrice,
      p.sellingPrice,
      p.conversionSellingPrice || '',
      p.stockQuantity,
      p.minStock,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  static updateStock(productId: string, quantityChange: number) {
    const p = MOCK_PRODUCTS.find((item) => item.id === productId);
    if (p) {
      p.stockQuantity += quantityChange;
    }
  }

  static getCategories() {
    return CATEGORIES_DB;
  }

  static addCategory(categoryName: string) {
    if (!categoryName.trim()) throw new Error('Tên danh mục không được trống');
    if (CATEGORIES_DB.includes(categoryName)) throw new Error('Danh mục đã tồn tại');
    CATEGORIES_DB.push(categoryName);
    return CATEGORIES_DB;
  }

  static updateCategory(oldName: string, newName: string) {
    const index = CATEGORIES_DB.indexOf(oldName);
    if (index === -1) throw new Error('Không tìm thấy danh mục');
    CATEGORIES_DB[index] = newName;
    MOCK_PRODUCTS.forEach((p) => {
      if (p.category === oldName) p.category = newName;
    });
    return CATEGORIES_DB;
  }

  static deleteCategory(categoryName: string) {
    CATEGORIES_DB = CATEGORIES_DB.filter((c) => c !== categoryName);
    return CATEGORIES_DB;
  }

  static getUnits() {
    return UNITS_DB;
  }

  static addUnit(unitName: string) {
    if (!unitName.trim()) throw new Error('Tên đơn vị tính không được trống');
    if (UNITS_DB.includes(unitName.trim())) throw new Error('Đơn vị tính đã tồn tại');
    UNITS_DB.push(unitName.trim());
    return UNITS_DB;
  }

  static deleteUnit(unitName: string) {
    UNITS_DB = UNITS_DB.filter((u) => u !== unitName);
    return UNITS_DB;
  }
}
