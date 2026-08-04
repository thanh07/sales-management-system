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
  stockQuantity: number;
  minStock: number;
  image: string;
  isActive: boolean;
  hasVariants?: boolean;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
}

let CATEGORIES_DB: string[] = [
  'Nước Giải Khát & Đồ Uống',
  'Sữa & Sản Phẩm Từ Sữa',
  'Mì, Phở & Thực Phẩm Khô',
  'Gia Vị & Nước Chấm',
  'Bánh Kẹo & Snack',
  'Hóa Mỹ Phẩm & Chăm Sóc Cá Nhân',
  'Đồ Dùng Gia Đình & Tạp Hóa',
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

        return {
          id: `var-${count}-${idx + 1}`,
          sku: `${sku}-${v.toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
          barcode: `893800${(200000 + count * 10 + idx).toString()}`,
          variantName: `${name} - ${tpl.attr!.name}: ${v}`,
          attributeValues: { [tpl.attr!.name]: v },
          costPrice: tpl.cost + idx * 1000,
          sellingPrice: vSellPrice,
          variantConversions,
          stockQuantity: (count * 7 + idx * 5) % 80 + 10,
          minStock: 10,
        };
      });
    }

    const costPrice = tpl.cost + ((count * 500) % 5000);
    const sellingPrice = tpl.sell + ((count * 800) % 8000);
    const stockQuantity = (count * 13) % 150 + 15;

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
      stockQuantity: hasVariants ? variants!.reduce((s, v) => s + v.stockQuantity, 0) : stockQuantity,
      minStock: 12,
      image: tpl.img,
      isActive: true,
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

    if (newProduct.variants && newProduct.variants.length > 0) {
      newProduct.hasVariants = true;
      newProduct.stockQuantity = newProduct.variants.reduce((sum, v) => sum + Number(v.stockQuantity), 0);
    }

    MOCK_PRODUCTS.unshift(newProduct);
    if (!CATEGORIES_DB.includes(data.category)) {
      CATEGORIES_DB.push(data.category);
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

  static resetAndSeed300GroceryProducts() {
    MOCK_PRODUCTS = generate300GroceryProducts();
    return MOCK_PRODUCTS.length;
  }

  static importProductsFromExcel(items: any[]) {
    let count = 0;
    items.forEach((item) => {
      if (item.name) {
        const barcode = item.barcode || '893800' + Math.floor(100000 + Math.random() * 900000);
        const newProduct: Product = {
          id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          sku: item.sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
          barcode,
          name: item.name,
          category: item.category || 'Nước Giải Khát & Đồ Uống',
          brand: item.brand || 'Khác',
          location: item.location || 'Kho Lạnh 01',
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
        count++;
      }
    });
    return count;
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

  static updateStock(productId: string, quantityChange: number) {
    const p = MOCK_PRODUCTS.find((item) => item.id === productId);
    if (p) {
      p.stockQuantity += quantityChange;
    }
  }

  static getCategories() { return CATEGORIES_DB; }
  static getBrands() { return BRANDS_DB; }
  static getLocations() { return LOCATIONS_DB; }
  static getUnits() { return UNITS_DB; }

  static addBrand(brandName: string) {
    if (!brandName.trim()) throw new Error('Tên thương hiệu không được trống');
    if (BRANDS_DB.includes(brandName.trim())) throw new Error('Thương hiệu đã tồn tại');
    BRANDS_DB.push(brandName.trim());
    return BRANDS_DB;
  }

  static deleteBrand(brandName: string) {
    BRANDS_DB = BRANDS_DB.filter((b) => b !== brandName);
    return BRANDS_DB;
  }

  static addLocation(locName: string) {
    if (!locName.trim()) throw new Error('Vị trí kho không được trống');
    if (LOCATIONS_DB.includes(locName.trim())) throw new Error('Vị trí kho đã tồn tại');
    LOCATIONS_DB.push(locName.trim());
    return LOCATIONS_DB;
  }

  static deleteLocation(locName: string) {
    LOCATIONS_DB = LOCATIONS_DB.filter((l) => l !== locName);
    return LOCATIONS_DB;
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
