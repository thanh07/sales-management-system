export interface ProductAttribute {
  name: string; // e.g. "Hương vị", "Dung tích", "Trọng lượng", "Màu sắc"
  values: string[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string;
  variantName: string;
  attributeValues: Record<string, string>;
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
  unit: string; // Smallest unit (e.g. Lon, Chai, Gói, Bịch)
  conversionUnit?: string; // Larger unit (e.g. Thùng, Lốc, Hộp, Két)
  conversionFactor?: number; // e.g. 24
  conversionSellingPrice?: number;
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
  'Thùng',
  'Lốc',
  'Két',
  'Vỉ',
  'Bao',
  'Kg',
];

function generate300GroceryProducts(): Product[] {
  const groceryTemplates = [
    // 1. Nước Giải Khát & Đồ Uống
    { cat: 'Nước Giải Khát & Đồ Uống', brand: 'Red Bull', baseName: 'Nước Tăng Lực Red Bull Bò Cụtn', unit: 'Lon', convUnit: 'Thùng', convFactor: 24, cost: 11000, sell: 15000, convSell: 340000, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80', attr: { name: 'Dung tích', values: ['250ml', '330ml'] } },
    { cat: 'Nước Giải Khát & Đồ Uống', brand: 'Heineken', baseName: 'Bia Heineken Silver Lon', unit: 'Lon', convUnit: 'Thùng', convFactor: 24, cost: 15000, sell: 19000, convSell: 430000, img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80' },
    { cat: 'Nước Giải Khát & Đồ Uống', brand: 'Coca-Cola', baseName: 'Nước Ngọt Coca-Cola Vị Nguyên Bản', unit: 'Lon', convUnit: 'Thùng', convFactor: 24, cost: 8000, sell: 11000, convSell: 240000, img: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80', attr: { name: 'Loại', values: ['Lon 320ml', 'Chai 1.5L', 'Chai 390ml'] } },
    { cat: 'Nước Giải Khát & Đồ Uống', brand: 'Pepsi', baseName: 'Nước Ngọt Pepsi Không Calo', unit: 'Lon', convUnit: 'Thùng', convFactor: 24, cost: 7500, sell: 10500, convSell: 230000, img: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&q=80' },
    { cat: 'Nước Giải Khát & Đồ Uống', brand: 'Lavie', baseName: 'Nước Khoáng Thiên Nhiên Lavie', unit: 'Chai', convUnit: 'Thùng', convFactor: 24, cost: 4000, sell: 6000, convSell: 125000, img: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&q=80', attr: { name: 'Dung tích', values: ['500ml', '1.5L', '6L'] } },

    // 2. Sữa & Sản Phẩm Từ Sữa
    { cat: 'Sữa & Sản Phẩm Từ Sữa', brand: 'Vinamilk', baseName: 'Sữa Tươi Tiệt Trùng Vinamilk 100%', unit: 'Bịch', convUnit: 'Thùng', convFactor: 48, cost: 6500, sell: 8500, convSell: 380000, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80', attr: { name: 'Hương vị', values: ['Có Đường', 'Ít Đường', 'Không Đường', 'Socola'] } },
    { cat: 'Sữa & Sản Phẩm Từ Sữa', brand: 'TH True Milk', baseName: 'Sữa Tươi TH True Milk Tiệt Trùng', unit: 'Hộp', convUnit: 'Thùng', convFactor: 48, cost: 8000, sell: 10500, convSell: 480000, img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80', attr: { name: 'Hương vị', values: ['Nguyên Chất', 'Có Đường', 'Dâu'] } },
    { cat: 'Sữa & Sản Phẩm Từ Sữa', brand: 'Vinamilk', baseName: 'Sữa Đặc Có Đường Ông Thọ Nhãn Xanh', unit: 'Hộp', convUnit: 'Thùng', convFactor: 24, cost: 18000, sell: 23000, convSell: 520000, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80' },

    // 3. Mì, Phở & Thực Phẩm Khô
    { cat: 'Mì, Phở & Thực Phẩm Khô', brand: 'Acecook', baseName: 'Mì Tôm Chua Cay Hảo Hảo', unit: 'Gói', convUnit: 'Thùng', convFactor: 30, cost: 3800, sell: 4800, convSell: 135000, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80', attr: { name: 'Hương vị', values: ['Tôm Chua Cay', 'Sa Bế Tôm', 'Sườn Heo'] } },
    { cat: 'Mì, Phở & Thực Phẩm Khô', brand: 'Acecook', baseName: 'Phở Bò Đệ Nhất Acecook', unit: 'Gói', convUnit: 'Thùng', convFactor: 30, cost: 6500, sell: 8500, convSell: 240000, img: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=400&q=80' },
    { cat: 'Mì, Phở & Thực Phẩm Khô', brand: 'Masan', baseName: 'Mì Omachi Xốt Bò Hầm', unit: 'Gói', convUnit: 'Thùng', convFactor: 30, cost: 7000, sell: 9500, convSell: 270000, img: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&q=80' },

    // 4. Gia Vị & Nước Chấm
    { cat: 'Gia Vị & Nước Chấm', brand: 'Nam Ngư', baseName: 'Nước Mắm Nam Ngư Đệ Nhị 900ml', unit: 'Chai', convUnit: 'Thùng', convFactor: 15, cost: 35000, sell: 45000, convSell: 640000, img: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&q=80' },
    { cat: 'Gia Vị & Nước Chấm', brand: 'Chinsu', baseName: 'Tương Ớt Chinsu Đậm Đặc', unit: 'Chai', convUnit: 'Thùng', convFactor: 24, cost: 11000, sell: 15000, convSell: 340000, img: 'https://images.unsplash.com/photo-1588615419954-e4e614d9b626?w=400&q=80', attr: { name: 'Dung tích', values: ['250g', '500g', '1kg'] } },
    { cat: 'Gia Vị & Nước Chấm', brand: 'Simply', baseName: 'Dầu Ăn Đậu Nành Simply 1L', unit: 'Chai', convUnit: 'Thùng', convFactor: 12, cost: 48000, sell: 59000, convSell: 680000, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80' },

    // 5. Bánh Kẹo & Snack
    { cat: 'Bánh Kẹo & Snack', brand: 'Orion', baseName: 'Bánh ChocoPie Orion Hộp 12 Chiếc', unit: 'Hộp', convUnit: 'Thùng', convFactor: 12, cost: 45000, sell: 58000, convSell: 660000, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80', attr: { name: 'Hương vị', values: ['Truyền Thống', 'Vị Cacao', 'Vị Matcha'] } },
    { cat: 'Bánh Kẹo & Snack', brand: 'Lay\'s', baseName: 'Snack Khoai Tây Lay\'s Stax', unit: 'Lon', convUnit: 'Thùng', convFactor: 24, cost: 18000, sell: 24000, convSell: 540000, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80', attr: { name: 'Vị', values: ['Tự Nhiên', 'Tôm Mực', 'Sườn Nướng BBQ'] } },

    // 6. Hóa Mỹ Phẩm & Chăm Sóc Cá Nhân
    { cat: 'Hóa Mỹ Phẩm & Chăm Sóc Cá Nhân', brand: 'Sunlight', baseName: 'Nước Rửa Bát Sunlight Chanh Rửa Sạch Dầu Mỡ', unit: 'Chai', convUnit: 'Thùng', convFactor: 12, cost: 26000, sell: 34000, convSell: 390000, img: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=400&q=80', attr: { name: 'Mùi hương', values: ['Chanh Tươi', 'Trà Xanh', 'Muối Khoe'] } },
    { cat: 'Hóa Mỹ Phẩm & Chăm Sóc Cá Nhân', brand: 'Lifebuoy', baseName: 'Sữa Tắm Diệt Khuẩn Lifebuoy Bảo Vệ Vượt Trội', unit: 'Chai', convUnit: 'Thùng', convFactor: 12, cost: 85000, sell: 110000, convSell: 1250000, img: 'https://images.unsplash.com/photo-1608248597263-00079e964474?w=400&q=80' },
    { cat: 'Hóa Mỹ Phẩm & Chăm Sóc Cá Nhân', brand: 'P/S', baseName: 'Kem Đánh Răng P/S Bảo Vệ 123 Ngừa Sâu Răng', unit: 'Tuýp', convUnit: 'Thùng', convFactor: 36, cost: 22000, sell: 29000, convSell: 990000, img: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400&q=80' },

    // 7. Đồ Dùng Gia Đình & Tạp Hóa
    { cat: 'Đồ Dùng Gia Đình & Tạp Hóa', brand: 'Pulppy', baseName: 'Giấy Vệ Sinh Pulppy 2 Lớp Lốc 10 Cuộn', unit: 'Lốc', convUnit: 'Thùng', convFactor: 10, cost: 42000, sell: 55000, convSell: 520000, img: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400&q=80' },
  ];

  const products: Product[] = [];
  let count = 1;

  // Generate 300 rich grocery products loop
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
      variants = tpl.attr.values.map((v, idx) => ({
        id: `var-${count}-${idx + 1}`,
        sku: `${sku}-${v.toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
        barcode: `893800${(200000 + count * 10 + idx).toString()}`,
        variantName: `${name} - ${tpl.attr!.name}: ${v}`,
        attributeValues: { [tpl.attr!.name]: v },
        costPrice: tpl.cost + idx * 1000,
        sellingPrice: tpl.sell + idx * 1500,
        stockQuantity: (count * 7 + idx * 5) % 80 + 10,
        minStock: 10,
      }));
    }

    const costPrice = tpl.cost + ((count * 500) % 5000);
    const sellingPrice = tpl.sell + ((count * 800) % 8000);
    const stockQuantity = (count * 13) % 150 + 15;

    products.push({
      id: `prod-taphoap-${itemNum}`,
      sku,
      barcode,
      name,
      category: tpl.cat,
      brand: tpl.brand,
      unit: tpl.unit,
      conversionUnit: tpl.convUnit,
      conversionFactor: tpl.convFactor,
      conversionSellingPrice: tpl.convSell ? tpl.convSell + ((count * 2000) % 20000) : undefined,
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

const MOCK_PRODUCTS: Product[] = generate300GroceryProducts();

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
        const barcode = item.barcode || '893800' + Math.floor(100000 + Math.random() * 900000);
        const newProduct: Product = {
          id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          sku: item.sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
          barcode,
          name: item.name,
          category: item.category || 'Nước Giải Khát & Đồ Uống',
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
