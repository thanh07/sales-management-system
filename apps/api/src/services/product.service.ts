export interface ProductAttribute {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string;
  variantName: string;
  attributeValues: Record<string, string>;
  costPrice: number;
  sellingPrice: number; // Base unit price
  variantConversions?: Record<string, number>; // Custom unit conversion prices for this variant e.g. { "Lốc": 45000, "Thùng": 500000 }
  stockQuantity: number;
  minStock: number;
  branchStocks?: Record<string, number>; // e.g. { 'branch-01': 20, 'branch-02': 15, 'branch-03': 40 }
}

export interface ProductUnitConversion {
  id: string;
  unitName: string; // e.g. "Lốc", "Thùng", "Két", "Vỉ"
  conversionFactor: number; // e.g. 6, 24, 96
  costPrice?: number;
  sellingPrice: number; // e.g. 85000, 340000
}

export interface Product {
  id: string;
  sku: string;
  barcode: string; // Unique Barcode
  name: string;
  category: string;
  brand: string;
  location?: string; // Vị trí lưu kho (e.g. "Kệ A1-Tầng 2", "Kho Lạnh 01", "Dãy B3")
  unit: string; // Smallest unit
  conversionUnit?: string; // Legacy single unit support
  conversionFactor?: number;
  conversionSellingPrice?: number;
  conversions?: ProductUnitConversion[]; // Multiple conversion levels (Lốc, Thùng, Két...)
  costPrice: number;
  sellingPrice: number;
  promoPrice?: number;
  stockQuantity: number; // Total across all branches
  minStock: number;
  image: string;
  isActive: boolean;
  branchStocks?: Record<string, number>; // e.g. { 'branch-01': 50, 'branch-02': 120, 'branch-03': 500 }
  hasVariants?: boolean;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
}

export interface CategoryData {
  name: string;
  icon?: string;
  showOnPos?: boolean;
}

let CATEGORIES_DB: CategoryData[] = [
  { name: 'Nước Giải Khát & Đồ Uống', icon: '🥤', showOnPos: true },
  { name: 'Sữa & Sản Phẩm Từ Sữa', icon: '🥛', showOnPos: true },
  { name: 'Mì, Phở & Thực Phẩm Khô', icon: '🍜', showOnPos: true },
  { name: 'Gia Vị & Nước Chấm', icon: '🧂', showOnPos: true },
  { name: 'Bánh Kẹo & Snack', icon: '🍪', showOnPos: true },
  { name: 'Hóa Mỹ Phẩm & Chăm Sóc Cá Nhân', icon: '🧼', showOnPos: true },
  { name: 'Đồ Dùng Gia Đình & Tạp Hóa', icon: '📦', showOnPos: true },
];

let BRANDS_DB: string[] = [
  'Red Bull',
  'Heineken',
  'Coca-Cola',
  'Pepsi',
  'Lavie',
  'Vinamilk',
  'TH True Milk',
  'Acecook',
  'Masan',
  'Nam Ngư',
  'Chinsu',
  'Simply',
  'Orion',
  'Lay\'s',
  'Sunlight',
  'Lifebuoy',
  'P/S',
  'Pulppy',
];

let LOCATIONS_DB: string[] = [
  'Kệ Nước A1 - Dãy 1',
  'Kệ Sữa B2 - Tầng 1',
  'Kệ Mì C1 - Tầng 2',
  'Kệ Gia Vị D3 - Dãy 2',
  'Kệ Bánh Kẹo E1 - Tầng 1',
  'Kệ Hóa Mỹ Phẩm F2 - Dãy 3',
  'Kho Lạnh 01',
  'Kho Tổng G05',
];

let UNITS_DB: string[] = [
  'Lon',
  'Chai',
  'Gói',
  'Bịch',
  'Hộp',
  'Hũ',
  'Tuýp',
  'Chai 1L',
  'Cái',
  'Lốc',
  'Thùng',
  'Két',
  'Vỉ',
  'Bao',
  'Kg',
];

function generate300GroceryProducts(): Product[] {
  const groceryTemplates = [
    {
      cat: 'Nước Giải Khát & Đồ Uống',
      brand: 'Red Bull',
      loc: 'Kệ Nước A1 - Dãy 1',
      baseName: 'Nước Tăng Lực Red Bull Bò Cụtn',
      unit: 'Lon',
      cost: 11000,
      sell: 15000,
      img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
      attr: { name: 'Dung tích', values: ['250ml', '330ml'] },
      conversions: [
        { id: 'c1', unitName: 'Lốc', conversionFactor: 6, sellingPrice: 85000 },
        { id: 'c2', unitName: 'Thùng', conversionFactor: 24, sellingPrice: 340000 },
      ],
    },
    {
      cat: 'Nước Giải Khát & Đồ Uống',
      brand: 'Heineken',
      loc: 'Kệ Nước A1 - Dãy 1',
      baseName: 'Bia Heineken Silver Lon',
      unit: 'Lon',
      cost: 15000,
      sell: 19000,
      img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80',
      conversions: [
        { id: 'c1', unitName: 'Lốc', conversionFactor: 6, sellingPrice: 110000 },
        { id: 'c2', unitName: 'Thùng', conversionFactor: 24, sellingPrice: 430000 },
      ],
    },
    {
      cat: 'Sữa & Sản Phẩm Từ Sữa',
      brand: 'Vinamilk',
      loc: 'Kệ Sữa B2 - Tầng 1',
      baseName: 'Sữa Tươi Tiệt Trùng Vinamilk 100%',
      unit: 'Bịch',
      cost: 6500,
      sell: 8500,
      img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
      attr: { name: 'Hương vị', values: ['Có Đường', 'Ít Đường', 'Không Đường', 'Socola'] },
      conversions: [
        { id: 'c1', unitName: 'Lốc', conversionFactor: 4, sellingPrice: 33000 },
        { id: 'c2', unitName: 'Thùng', conversionFactor: 48, sellingPrice: 380000 },
      ],
    },
    {
      cat: 'Mì, Phở & Thực Phẩm Khô',
      brand: 'Acecook',
      loc: 'Kệ Mì C1 - Tầng 2',
      baseName: 'Mì Tôm Chua Cay Hảo Hảo',
      unit: 'Gói',
      cost: 3800,
      sell: 4800,
      img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
      attr: { name: 'Hương vị', values: ['Tôm Chua Cay', 'Sa Bế Tôm', 'Sườn Heo'] },
      conversions: [
        { id: 'c1', unitName: 'Thùng', conversionFactor: 30, sellingPrice: 135000 },
      ],
    },
    {
      cat: 'Gia Vị & Nước Chấm',
      brand: 'Nam Ngư',
      loc: 'Kệ Gia Vị D3 - Dãy 2',
      baseName: 'Nước Mắm Nam Ngư Đệ Nhị 900ml',
      unit: 'Chai',
      cost: 35000,
      sell: 45000,
      img: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&q=80',
      conversions: [
        { id: 'c1', unitName: 'Thùng', conversionFactor: 15, sellingPrice: 640000 },
      ],
    },
    {
      cat: 'Gia Vị & Nước Chấm',
      brand: 'Chinsu',
      loc: 'Kệ Gia Vị D3 - Dãy 2',
      baseName: 'Tương Ớt Chinsu Đậm Đặc',
      unit: 'Chai',
      cost: 11000,
      sell: 15000,
      img: 'https://images.unsplash.com/photo-1588615419954-e4e614d9b626?w=400&q=80',
      attr: { name: 'Dung tích', values: ['250g', '500g', '1kg'] },
      conversions: [
        { id: 'c1', unitName: 'Thùng', conversionFactor: 24, sellingPrice: 340000 },
      ],
    },
    {
      cat: 'Bánh Kẹo & Snack',
      brand: 'Orion',
      loc: 'Kệ Bánh Kẹo E1 - Tầng 1',
      baseName: 'Bánh ChocoPie Orion Hộp 12 Chiếc',
      unit: 'Hộp',
      cost: 45000,
      sell: 58000,
      img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',
      attr: { name: 'Hương vị', values: ['Truyền Thống', 'Vị Cacao', 'Vị Matcha'] },
      conversions: [
        { id: 'c1', unitName: 'Thùng', conversionFactor: 12, sellingPrice: 660000 },
      ],
    },
    {
      cat: 'Hóa Mỹ Phẩm & Chăm Sóc Cá Nhân',
      brand: 'Sunlight',
      loc: 'Kệ Hóa Mỹ Phẩm F2 - Dãy 3',
      baseName: 'Nước Rửa Bát Sunlight Chanh Rửa Sạch Dầu Mỡ',
      unit: 'Chai',
      cost: 26000,
      sell: 34000,
      img: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=400&q=80',
      attr: { name: 'Mùi hương', values: ['Chanh Tươi', 'Trà Xanh', 'Muối Khoe'] },
      conversions: [
        { id: 'c1', unitName: 'Thùng', conversionFactor: 12, sellingPrice: 390000 },
      ],
    },
  ];

  const products: Product[] = [];
  let count = 1;

  while (products.length < 300) {
    const tpl = groceryTemplates[(count - 1) % groceryTemplates.length];
    const itemNum = count.toString().padStart(3, '0');
    const sku = `TAP-${tpl.brand.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)}-${itemNum}`;
    const barcode = `893800${(100000 + count).toString()}`;
    const name = `${tpl.baseName} #${count}`;

    let hasVariants = false;
    let attributes: ProductAttribute[] | undefined;
    let variants: ProductVariant[] | undefined;

    if (tpl.attr && count % 3 === 0) {
      hasVariants = true;
      attributes = [{ name: tpl.attr.name, values: tpl.attr.values }];
      variants = tpl.attr.values.map((v, idx) => {
        const vSellPrice = tpl.sell + idx * 1500;
        // Auto calculate variant conversion prices based on parent conversion factors
        const variantConversions: Record<string, number> = {};
        if (tpl.conversions) {
          tpl.conversions.forEach((c) => {
            variantConversions[c.unitName] = vSellPrice * c.conversionFactor;
          });
        }

        const varTotalStock = (count * 7 + idx * 5) % 80 + 15;
        const vb1 = Math.round(varTotalStock * 0.4);
        const vb2 = Math.round(varTotalStock * 0.35);
        const vb3 = Math.max(0, varTotalStock - vb1 - vb2);

        return {
          id: `var-${count}-${idx + 1}`,
          sku: `${sku}-${v.toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
          barcode: `893800${(200000 + count * 10 + idx).toString()}`,
          variantName: `${name} - ${tpl.attr!.name}: ${v}`,
          attributeValues: { [tpl.attr!.name]: v },
          costPrice: tpl.cost + idx * 1000,
          sellingPrice: vSellPrice,
          variantConversions,
          stockQuantity: varTotalStock,
          minStock: 10,
          branchStocks: {
            'branch-01': vb1,
            'branch-02': vb2,
            'branch-03': vb3,
          },
        };
      });
    }

    const costPrice = tpl.cost + ((count * 500) % 5000);
    const sellingPrice = tpl.sell + ((count * 800) % 8000);
    const rawStock = (count * 13) % 150 + 20;

    const b1 = Math.round(rawStock * 0.4);
    const b2 = Math.round(rawStock * 0.35);
    const b3 = Math.max(0, rawStock - b1 - b2);

    const branchStocks: Record<string, number> = hasVariants
      ? {
          'branch-01': variants!.reduce((sum, v) => sum + (v.branchStocks?.['branch-01'] || 0), 0),
          'branch-02': variants!.reduce((sum, v) => sum + (v.branchStocks?.['branch-02'] || 0), 0),
          'branch-03': variants!.reduce((sum, v) => sum + (v.branchStocks?.['branch-03'] || 0), 0),
        }
      : {
          'branch-01': b1,
          'branch-02': b2,
          'branch-03': b3,
        };

    const finalTotalStock = Object.values(branchStocks).reduce((sum, q) => sum + Number(q), 0);
    const mainConv = tpl.conversions?.[0];

    products.push({
      id: `prod-taphoap-${itemNum}`,
      sku,
      barcode,
      name,
      category: tpl.cat,
      brand: tpl.brand,
      location: tpl.loc,
      unit: tpl.unit,
      conversionUnit: mainConv?.unitName || 'Thùng',
      conversionFactor: mainConv?.conversionFactor || 24,
      conversionSellingPrice: mainConv?.sellingPrice || sellingPrice * 23,
      conversions: tpl.conversions || [
        { id: 'c1', unitName: 'Thùng', conversionFactor: 24, sellingPrice: sellingPrice * 23 }
      ],
      costPrice,
      sellingPrice,
      stockQuantity: finalTotalStock,
      minStock: 12,
      image: tpl.img,
      isActive: true,
      branchStocks,
      hasVariants,
      attributes,
      variants,
    });

    count++;
  }

  return products;
}

let MOCK_PRODUCTS: Product[] = generate300GroceryProducts();

export class ProductService {
  static getAllProducts(query?: string, category?: string, brand?: string, location?: string) {
    let list = [...MOCK_PRODUCTS];

    if (category && category !== 'Tất cả') {
      list = list.filter((p) => p.category === category);
    }

    if (brand && brand !== 'Tất cả') {
      list = list.filter((p) => p.brand === brand);
    }

    if (location && location !== 'Tất cả') {
      list = list.filter((p) => p.location === location);
    }

    if (query) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.location && p.location.toLowerCase().includes(q))
      );
    }

    return list;
  }

  static getProductById(id: string) {
    const p = MOCK_PRODUCTS.find((item) => item.id === id);
    if (!p) throw new Error(`Không tìm thấy sản phẩm với ID: ${id}`);
    return p;
  }

  static getProductByBarcode(barcode: string) {
    const p = MOCK_PRODUCTS.find(
      (item) => item.barcode === barcode || item.sku === barcode
    );
    if (p) return p;

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
            variantConversions: v.variantConversions,
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

    if (newProduct.conversions && newProduct.conversions.length > 0) {
      newProduct.conversionUnit = newProduct.conversions[0].unitName;
      newProduct.conversionFactor = newProduct.conversions[0].conversionFactor;
      newProduct.conversionSellingPrice = newProduct.conversions[0].sellingPrice;
    }

    if (newProduct.branchStocks) {
      newProduct.stockQuantity = Object.values(newProduct.branchStocks).reduce((sum, q) => sum + Number(q), 0);
    } else {
      const b1 = Math.round((newProduct.stockQuantity || 0) * 0.4);
      const b2 = Math.round((newProduct.stockQuantity || 0) * 0.35);
      const b3 = Math.max(0, (newProduct.stockQuantity || 0) - b1 - b2);
      newProduct.branchStocks = {
        'branch-01': b1,
        'branch-02': b2,
        'branch-03': b3,
      };
    }

    if (newProduct.variants && newProduct.variants.length > 0) {
      newProduct.hasVariants = true;
      newProduct.stockQuantity = newProduct.variants.reduce((sum, v) => sum + Number(v.stockQuantity), 0);
    }

    MOCK_PRODUCTS.unshift(newProduct);
    if (data.category && !CATEGORIES_DB.some(c => c.name === data.category)) {
      CATEGORIES_DB.push({ name: data.category, icon: '🏷️', showOnPos: true });
    }
    if (data.brand && !BRANDS_DB.includes(data.brand)) {
      BRANDS_DB.push(data.brand);
    }
    if (data.location && !LOCATIONS_DB.includes(data.location)) {
      LOCATIONS_DB.push(data.location);
    }
    if (data.unit && !UNITS_DB.includes(data.unit)) {
      UNITS_DB.push(data.unit);
    }
    return newProduct;
  }

  static updateProduct(id: string, data: Partial<Product>) {
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Không tìm thấy sản phẩm với ID: ${id}`);

    if (data.barcode && data.barcode !== MOCK_PRODUCTS[index].barcode) {
      const existingBarcode = MOCK_PRODUCTS.find((p) => p.barcode === data.barcode && p.id !== id);
      if (existingBarcode) {
        throw new Error(`Mã vạch Barcode "${data.barcode}" đã trùng với sản phẩm "${existingBarcode.name}".`);
      }
    }

    const updatedProduct = {
      ...MOCK_PRODUCTS[index],
      ...data,
    };

    if (data.branchStocks) {
      updatedProduct.branchStocks = data.branchStocks;
      updatedProduct.stockQuantity = Object.values(data.branchStocks).reduce((sum, q) => sum + Number(q), 0);
    }

    if (updatedProduct.conversions && updatedProduct.conversions.length > 0) {
      updatedProduct.conversionUnit = updatedProduct.conversions[0].unitName;
      updatedProduct.conversionFactor = updatedProduct.conversions[0].conversionFactor;
      updatedProduct.conversionSellingPrice = updatedProduct.conversions[0].sellingPrice;
    }

    MOCK_PRODUCTS[index] = updatedProduct;
    return updatedProduct;
  }

  static deleteProduct(id: string) {
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Không tìm thấy sản phẩm với ID: ${id}`);
    MOCK_PRODUCTS.splice(index, 1);
    return true;
  }

  static deleteAllProducts() {
    MOCK_PRODUCTS = [];
    return 0;
  }

  static resetAndSeed300GroceryProducts() {
    MOCK_PRODUCTS = generate300GroceryProducts();
    return MOCK_PRODUCTS.length;
  }

  static importProductsFromExcel(items: any[]) {
    let count = 0;
    items.forEach((item, idx) => {
      const name = item.name || item['Tên sản phẩm (*)'] || item['Tên sản phẩm'] || item['Ten san pham'];
      if (name && name.trim()) {
        const barcode = item.barcode || item['Mã Barcode / Mã vạch'] || item['Mã Barcode (Độc nhất)'] || item['Barcode'] || ('893800' + Math.floor(100000 + Math.random() * 900000));
        const sku = item.sku || item['Mã SKU'] || item['SKU'] || ('SKU-' + Math.floor(1000 + Math.random() * 9000));
        const category = item.category || item['Nhóm hàng / Danh mục'] || item['Danh mục (Category)'] || 'Đồ Dùng Gia Đình & Tạp Hóa';
        const brand = item.brand || item['Thương hiệu'] || item['Thương hiệu (Brand)'] || 'Khác';
        const location = item.location || item['Vị trí lưu kho'] || item['Vị trí kho (Location)'] || 'Kho Tổng G05';
        const unit = item.unit || item['Đơn vị cơ bản (*)'] || item['Đơn vị nhỏ nhất'] || item['Đơn vị tính'] || 'Cái';

        const costPrice = Number(item.costPrice || item['Giá nhập (Giá vốn)'] || item['Giá nhập']) || 0;
        const sellingPrice = Number(item.sellingPrice || item['Giá bán lẻ (*)'] || item['Giá bán lẻ'] || item['Giá bán']) || 0;
        const stockQuantity = Number(item.stockQuantity || item['Tồn kho ban đầu'] || item['Tồn kho']) || 0;
        const minStock = Number(item.minStock || item['Ngưỡng báo sắp hết'] || item['Ngưỡng cảnh báo']) || 10;

        const conversionUnit = item.conversionUnit || item['Đơn vị quy đổi lớn'] || item['Đơn vị quy đổi'] || '';
        const conversionFactor = Number(item.conversionFactor || item['Hệ số quy đổi']) || (conversionUnit ? 24 : undefined);
        const conversionSellingPrice = Number(item.conversionSellingPrice || item['Giá bán đơn vị lớn']) || (conversionUnit && conversionFactor ? sellingPrice * conversionFactor : undefined);

        const conversions = conversionUnit && conversionFactor
          ? [{ id: `c-${Date.now()}-${idx}`, unitName: conversionUnit, conversionFactor, sellingPrice: conversionSellingPrice || sellingPrice * conversionFactor }]
          : [];

        const existingIdx = MOCK_PRODUCTS.findIndex((p) => p.barcode === barcode || p.sku === sku);
        const newProduct: Product = {
          id: existingIdx > -1 ? MOCK_PRODUCTS[existingIdx].id : `prod-${Date.now()}-${idx}`,
          sku,
          barcode,
          name: name.trim(),
          category,
          brand,
          location,
          unit,
          conversionUnit: conversionUnit || undefined,
          conversionFactor,
          conversionSellingPrice,
          conversions,
          costPrice,
          sellingPrice,
          stockQuantity,
          minStock,
          image: item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
          isActive: true,
        };

        if (existingIdx > -1) {
          MOCK_PRODUCTS[existingIdx] = newProduct;
        } else {
          MOCK_PRODUCTS.push(newProduct);
        }

        // Auto-register new master categories, brands, locations, units
        if (category && !CATEGORIES_DB.some(c => c.name === category)) {
          CATEGORIES_DB.push({ name: category, icon: '🏷️', showOnPos: true });
        }
        if (brand && brand !== 'Khác' && !BRANDS_DB.includes(brand)) BRANDS_DB.push(brand);
        if (location && !LOCATIONS_DB.includes(location)) LOCATIONS_DB.push(location);
        if (unit && !UNITS_DB.includes(unit)) UNITS_DB.push(unit);
        if (conversionUnit && !UNITS_DB.includes(conversionUnit)) UNITS_DB.push(conversionUnit);

        count++;
      }
    });
    return count;
  }

  static generateExcelTemplateCsv() {
    const headers = [
      'Tên sản phẩm (*)',
      'Mã SKU',
      'Mã Barcode / Mã vạch',
      'Nhóm hàng / Danh mục',
      'Thương hiệu',
      'Vị trí lưu kho',
      'Đơn vị cơ bản (*)',
      'Giá nhập (Giá vốn)',
      'Giá bán lẻ (*)',
      'Tồn kho ban đầu',
      'Ngưỡng báo sắp hết',
      'Đơn vị quy đổi lớn',
      'Hệ số quy đổi',
      'Giá bán đơn vị lớn',
    ];

    const sampleRows = [
      [
        '"Nước Tăng Lực Red Bull 250ml"',
        'TAP-REDB-001',
        '893800100001',
        '"Nước Giải Khát & Đồ Uống"',
        '"Red Bull"',
        '"Kệ A1 - Dãy 1"',
        'Lon',
        '11000',
        '15800',
        '120',
        '12',
        'Thùng',
        '24',
        '360000',
      ],
      [
        '"Bia Heineken Silver Lon 330ml"',
        'TAP-HEIN-002',
        '893800100002',
        '"Nước Giải Khát & Đồ Uống"',
        '"Heineken"',
        '"Kệ A1 - Dãy 2"',
        'Lon',
        '16500',
        '20600',
        '96',
        '24',
        'Thùng',
        '24',
        '480000',
      ],
      [
        '"Mì Tôm Chua Cay Hảo Hảo 75g"',
        'TAP-ACEC-004',
        '893800100004',
        '"Mì, Phở & Thực Phẩm Khô"',
        '"Acecook"',
        '"Kệ C1 - Tầng 2"',
        'Gói',
        '3500',
        '4500',
        '300',
        '30',
        'Thùng',
        '30',
        '130000',
      ],
    ];

    return [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
  }

  static generateExcelExportCsv() {
    const headers = ['SKU', 'Mã Barcode (Độc nhất)', 'Tên sản phẩm', 'Danh mục (Category)', 'Thương hiệu (Brand)', 'Vị trí kho (Location)', 'Đơn vị nhỏ nhất', 'Đơn vị quy đổi', 'Hệ số quy đổi', 'Giá nhập', 'Giá bán lẻ', 'Giá bán đơn vị lớn', 'Tồn kho', 'Ngưỡng cảnh báo'];
    const rows = MOCK_PRODUCTS.map((p) => [
      p.sku,
      p.barcode,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.brand}"`,
      `"${p.location || ''}"`,
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

  static updateStock(productId: string, quantityChange: number, branchId: string = 'branch-01') {
    for (const p of MOCK_PRODUCTS) {
      if (p.id === productId) {
        if (!p.branchStocks) {
          const b1 = Math.round(p.stockQuantity * 0.4);
          const b2 = Math.round(p.stockQuantity * 0.35);
          const b3 = Math.max(0, p.stockQuantity - b1 - b2);
          p.branchStocks = { 'branch-01': b1, 'branch-02': b2, 'branch-03': b3 };
        }
        p.branchStocks[branchId] = Math.max(0, (p.branchStocks[branchId] || 0) + quantityChange);
        p.stockQuantity = Object.values(p.branchStocks).reduce((sum, q) => sum + Number(q), 0);
        return;
      }
      if (p.variants) {
        const v = p.variants.find((vr) => vr.id === productId);
        if (v) {
          if (!v.branchStocks) {
            const vb1 = Math.round(v.stockQuantity * 0.4);
            const vb2 = Math.round(v.stockQuantity * 0.35);
            const vb3 = Math.max(0, v.stockQuantity - vb1 - vb2);
            v.branchStocks = { 'branch-01': vb1, 'branch-02': vb2, 'branch-03': vb3 };
          }
          v.branchStocks[branchId] = Math.max(0, (v.branchStocks[branchId] || 0) + quantityChange);
          v.stockQuantity = Object.values(v.branchStocks).reduce((sum, q) => sum + Number(q), 0);
          p.stockQuantity = p.variants.reduce((sum, vr) => sum + Number(vr.stockQuantity), 0);
          return;
        }
      }
    }
  }

  static getCategories() {
    return CATEGORIES_DB.map((cat) => {
      const catName = typeof cat === 'string' ? cat : cat.name;
      const catIcon = typeof cat === 'string' ? '🏷️' : (cat.icon || '🏷️');
      const catShow = typeof cat === 'string' ? true : (cat.showOnPos !== false);
      return {
        name: catName,
        icon: catIcon,
        showOnPos: catShow,
        productCount: MOCK_PRODUCTS.filter((p) => p.category === catName).length,
      };
    });
  }

  static addCategory(categoryName: string, icon?: string, showOnPos: boolean = true) {
    const trimmed = categoryName.trim();
    if (!trimmed) throw new Error('Tên nhóm hàng không được trống');
    if (CATEGORIES_DB.some((c) => (typeof c === 'string' ? c : c.name) === trimmed)) {
      throw new Error('Nhóm hàng này đã tồn tại');
    }
    CATEGORIES_DB.push({
      name: trimmed,
      icon: icon || '🏷️',
      showOnPos,
    });
    return this.getCategories();
  }

  static updateCategory(oldName: string, newName: string, icon?: string, showOnPos?: boolean) {
    const trimmed = newName.trim();
    if (!trimmed) throw new Error('Tên nhóm hàng mới không được trống');
    const idx = CATEGORIES_DB.findIndex((c) => (typeof c === 'string' ? c : c.name) === oldName);
    if (idx === -1) throw new Error(`Không tìm thấy nhóm hàng: ${oldName}`);

    const existing = CATEGORIES_DB[idx];
    const prevIcon = typeof existing === 'string' ? '🏷️' : (existing.icon || '🏷️');
    const prevShow = typeof existing === 'string' ? true : existing.showOnPos !== false;

    CATEGORIES_DB[idx] = {
      name: trimmed,
      icon: icon !== undefined ? icon : prevIcon,
      showOnPos: showOnPos !== undefined ? showOnPos : prevShow,
    };

    // Cascade update to all matching products
    MOCK_PRODUCTS.forEach((p) => {
      if (p.category === oldName) {
        p.category = trimmed;
      }
    });

    return this.getCategories();
  }

  static deleteCategory(categoryName: string) {
    CATEGORIES_DB = CATEGORIES_DB.filter((c) => (typeof c === 'string' ? c : c.name) !== categoryName);
    return this.getCategories();
  }

  static getBrands() {
    return BRANDS_DB.map((brand) => ({
      name: brand,
      productCount: MOCK_PRODUCTS.filter((p) => p.brand === brand).length,
    }));
  }

  static addBrand(brandName: string) {
    const trimmed = brandName.trim();
    if (!trimmed) throw new Error('Tên thương hiệu không được trống');
    if (BRANDS_DB.includes(trimmed)) throw new Error('Thương hiệu đã tồn tại');
    BRANDS_DB.push(trimmed);
    return this.getBrands();
  }

  static updateBrand(oldName: string, newName: string) {
    const trimmed = newName.trim();
    if (!trimmed) throw new Error('Tên thương hiệu mới không được trống');
    const idx = BRANDS_DB.indexOf(oldName);
    if (idx === -1) throw new Error(`Không tìm thấy thương hiệu: ${oldName}`);
    BRANDS_DB[idx] = trimmed;

    // Cascade update to all matching products
    MOCK_PRODUCTS.forEach((p) => {
      if (p.brand === oldName) {
        p.brand = trimmed;
      }
    });

    return this.getBrands();
  }

  static deleteBrand(brandName: string) {
    BRANDS_DB = BRANDS_DB.filter((b) => b !== brandName);
    return this.getBrands();
  }

  static getLocations() {
    return LOCATIONS_DB.map((loc) => ({
      name: loc,
      productCount: MOCK_PRODUCTS.filter((p) => p.location === loc).length,
    }));
  }

  static addLocation(locName: string) {
    const trimmed = locName.trim();
    if (!trimmed) throw new Error('Vị trí kho không được trống');
    if (LOCATIONS_DB.includes(trimmed)) throw new Error('Vị trí kho đã tồn tại');
    LOCATIONS_DB.push(trimmed);
    return this.getLocations();
  }

  static updateLocation(oldName: string, newName: string) {
    const trimmed = newName.trim();
    if (!trimmed) throw new Error('Tên vị trí kho mới không được trống');
    const idx = LOCATIONS_DB.indexOf(oldName);
    if (idx === -1) throw new Error(`Không tìm thấy vị trí kho: ${oldName}`);
    LOCATIONS_DB[idx] = trimmed;

    // Cascade update to all matching products
    MOCK_PRODUCTS.forEach((p) => {
      if (p.location === oldName) {
        p.location = trimmed;
      }
    });

    return this.getLocations();
  }

  static deleteLocation(locName: string) {
    LOCATIONS_DB = LOCATIONS_DB.filter((l) => l !== locName);
    return this.getLocations();
  }

  static getUnits() {
    return UNITS_DB.map((unit) => ({
      name: unit,
      productCount: MOCK_PRODUCTS.filter((p) => p.unit === unit || p.conversionUnit === unit).length,
    }));
  }

  static addUnit(unitName: string) {
    const trimmed = unitName.trim();
    if (!trimmed) throw new Error('Tên đơn vị tính không được trống');
    if (UNITS_DB.includes(trimmed)) throw new Error('Đơn vị tính đã tồn tại');
    UNITS_DB.push(trimmed);
    return this.getUnits();
  }

  static updateUnit(oldName: string, newName: string) {
    const trimmed = newName.trim();
    if (!trimmed) throw new Error('Tên đơn vị tính mới không được trống');
    const idx = UNITS_DB.indexOf(oldName);
    if (idx === -1) throw new Error(`Không tìm thấy đơn vị tính: ${oldName}`);
    UNITS_DB[idx] = trimmed;

    // Cascade update to all matching products
    MOCK_PRODUCTS.forEach((p) => {
      if (p.unit === oldName) p.unit = trimmed;
      if (p.conversionUnit === oldName) p.conversionUnit = trimmed;
    });

    return this.getUnits();
  }

  static deleteUnit(unitName: string) {
    UNITS_DB = UNITS_DB.filter((u) => u !== unitName);
    return this.getUnits();
  }
}
