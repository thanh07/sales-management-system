import fs from 'fs';
import path from 'path';

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
  branchMinStocks?: Record<string, number>; // Ngưỡng min riêng cho từng chi nhánh
  branchActiveStatus?: Record<string, boolean>; // Trạng thái bật/tắt kinh doanh riêng theo chi nhánh
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
  wholesalePrice?: number;
  promoPrice?: number;
  stockQuantity: number; // Total across all branches
  minStock: number;
  image: string;
  isActive: boolean;
  branchStocks?: Record<string, number>; // e.g. { 'branch-01': 50, 'branch-02': 120, 'branch-03': 500 }
  branchMinStocks?: Record<string, number>; // Ngưỡng tồn kho tối thiểu độc lập theo chi nhánh
  branchActiveStatus?: Record<string, boolean>; // Bật/Tắt kinh doanh độc lập theo từng chi nhánh
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
  { name: 'Chậu Trồng Cây', icon: '🪴', showOnPos: true },
  { name: 'Bình Bông & Lọ Hoa', icon: '🏺', showOnPos: true },
  { name: 'Dụng Cụ Chì & Vật Tư Lan', icon: '🌿', showOnPos: true },
  { name: 'Đĩa & Khay Lót', icon: '🍽️', showOnPos: true },
  { name: 'Khay & Chậu Rau', icon: '🥬', showOnPos: true },
  { name: 'Vật Tư & Hàng Tổng Hợp', icon: '📦', showOnPos: true },
];

let BRANDS_DB: string[] = ['Đức Minh', 'Á Đông', 'Chì Lan', 'VM', 'Khác'];

let LOCATIONS_DB: string[] = [
  'Kệ Chậu & Vật Tư 01',
  'Kệ Đĩa & Lọ Hoa 02',
  'Kho Tổng Vận Chuyển H02',
];

let UNITS_DB: string[] = [
  'Cái',
  'Bó',
  'Chục (10 cái)',
  'Thùng',
  'Lốc',
];

function generate300GroceryProducts(): Product[] {
  const groceryTemplates = [
    {
      cat: 'Chậu & Khay Trồng',
      brand: 'Monrovia',
      loc: 'Kệ Chậu Nhựa A1 - Dãy 1',
      baseName: 'Chậu Nhựa Trồng Cây Tròn Cao Cấp',
      unit: 'Cái',
      cost: 8000,
      sell: 12000,
      img: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80',
      attr: { name: 'Kích thước (Size)', values: ['Phi 15cm (Nhỏ)', 'Phi 20cm (Vừa)', 'Phi 30cm (Lớn)', 'Phi 40cm (Đại)'] },
      conversions: [
        { id: 'c1', unitName: 'Lốc', conversionFactor: 5, sellingPrice: 55000 },
        { id: 'c2', unitName: 'Thùng', conversionFactor: 50, sellingPrice: 520000 },
      ],
    },
    {
      cat: 'Chậu & Khay Trồng',
      brand: 'Bát Tràng',
      loc: 'Kệ Chậu Sứ A2 - Tầng 2',
      baseName: 'Chậu Sứ Bát Tràng Men Trắng Họa Tiết',
      unit: 'Cái',
      cost: 30000,
      sell: 45000,
      img: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=400&q=80',
      attr: { name: 'Kích thước (Size)', values: ['Size S (15x15cm)', 'Size M (25x25cm)', 'Size L (35x35cm)'] },
    },
    {
      cat: 'Chậu & Khay Trồng',
      brand: 'Nam Điền',
      loc: 'Kệ Chậu Nhựa A1 - Dãy 1',
      baseName: 'Khay Ươm Hạt Giống Ống Lỗ Nông Nghiệp',
      unit: 'Cái',
      cost: 10000,
      sell: 15000,
      img: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a67?w=400&q=80',
      attr: { name: 'Kích thước (Size)', values: ['50 Lỗ Ươm', '84 Lỗ Ươm', '104 Lỗ Ươm'] },
      conversions: [
        { id: 'c1', unitName: 'Lốc', conversionFactor: 10, sellingPrice: 135000 },
      ],
    },
    {
      cat: 'Đất Trồng & Giá Thể',
      brand: 'Tribat',
      loc: 'Bãi Đất Trồng B1 - Dãy Ngoài',
      baseName: 'Đất Sạch Hữu Cơ Tribat Trồng Rau & Hoa',
      unit: 'Bao',
      cost: 25000,
      sell: 35000,
      img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&q=80',
      attr: { name: 'Trọng lượng', values: ['Bao 5kg', 'Bao 10kg', 'Bao 20kg'] },
      conversions: [
        { id: 'c1', unitName: 'Thùng', conversionFactor: 5, sellingPrice: 165000 },
      ],
    },
    {
      cat: 'Đất Trồng & Giá Thể',
      brand: 'Việt Nam Agtech',
      loc: 'Bãi Đất Trồng B1 - Dãy Ngoài',
      baseName: 'Giá Thể Mụn Dừa Ép Viên Xử Lý Chát Tan',
      unit: 'Viên',
      cost: 4000,
      sell: 6000,
      img: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=400&q=80',
      conversions: [
        { id: 'c1', unitName: 'Lốc', conversionFactor: 10, sellingPrice: 55000 },
        { id: 'c2', unitName: 'Thùng', conversionFactor: 100, sellingPrice: 500000 },
      ],
    },
    {
      cat: 'Phân Bón & Dinh Dưỡng',
      brand: 'Đầu Trâu',
      loc: 'Kệ Phân Bón C1 - Tầng 1',
      baseName: 'Phân Bón NPK 16-16-8 Đầu Trâu Cao Cấp',
      unit: 'Gói',
      cost: 20000,
      sell: 28000,
      img: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=400&q=80',
      attr: { name: 'Quy cách', values: ['Gói 1kg', 'Túi 5kg', 'Bao 25kg'] },
      conversions: [
        { id: 'c1', unitName: 'Thùng', conversionFactor: 20, sellingPrice: 520000 },
      ],
    },
    {
      cat: 'Phân Bón & Dinh Dưỡng',
      brand: 'Mỹ Tiến',
      loc: 'Kệ Phân Bón C1 - Tầng 1',
      baseName: 'Thuốc Kích Rễ N3M Đậm Đặc Chuyên Cây Cảnh',
      unit: 'Chai',
      cost: 18000,
      sell: 25000,
      img: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&q=80',
      attr: { name: 'Dung tích', values: ['Hũ 100g', 'Hũ 500g', 'Hũ 1kg'] },
    },
    {
      cat: 'Hạt Giống & Cây Con',
      brand: 'Trang Nông',
      loc: 'Tủ Hạt Giống D1 - Khay Trung Tâm',
      baseName: 'Hạt Giống Rau Muống Lá Tre Trang Nông F1',
      unit: 'Gói',
      cost: 8000,
      sell: 12000,
      img: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&q=80',
      conversions: [
        { id: 'c1', unitName: 'Thùng', conversionFactor: 50, sellingPrice: 550000 },
      ],
    },
    {
      cat: 'Thuốc & Bảo Vệ Thực Vật',
      brand: 'Syngenta',
      loc: 'Kệ Phân Bón C1 - Tầng 1',
      baseName: 'Thuốc Trị Nấm Lá & Thối Rễ Ridomil Gold',
      unit: 'Gói',
      cost: 36000,
      sell: 48000,
      img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
      conversions: [
        { id: 'c1', unitName: 'Thùng', conversionFactor: 40, sellingPrice: 1850000 },
      ],
    },
    {
      cat: 'Dụng Cụ Làm Vườn',
      brand: 'Nhật Bản SK5',
      loc: 'Kệ Dụng Cụ E2 - Dãy 3',
      baseName: 'Kéo Cắt Tỉa Cành Cây Thép SK5 Nhật Bản',
      unit: 'Cái',
      cost: 85000,
      sell: 125000,
      img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
    },
    {
      cat: 'Dụng Cụ Làm Vườn',
      brand: 'Dudaco',
      loc: 'Kệ Dụng Cụ E2 - Dãy 3',
      baseName: 'Bình Xịt Tưới Cây Áp Suất Dudaco',
      unit: 'Cái',
      cost: 40000,
      sell: 55000,
      img: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=400&q=80',
      attr: { name: 'Dung tích', values: ['Bình 2L (Cầm tay)', 'Bình 4L', 'Bình 8L (Đeo vai)'] },
    },
    {
      cat: 'Lưới, Bạt & Dây Tưới',
      brand: 'Việt Nam Agtech',
      loc: 'Kho Lưới & Bạt G01',
      baseName: 'Lưới Che Nắng Thái Lan Cắt Nắng 70%',
      unit: 'Cuộn',
      cost: 60000,
      sell: 85000,
      img: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&q=80',
      attr: { name: 'Kích thước', values: ['Cuộn 2m x 5m', 'Cuộn 2m x 10m', 'Cuộn 2m x 50m'] },
    },
  ];

  const products: Product[] = [];
  let count = 1;

  while (products.length < 100) {
    const tpl = groceryTemplates[(count - 1) % groceryTemplates.length];
    const itemNum = count.toString().padStart(3, '0');
    const sku = `TAP-${tpl.brand.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)}-${itemNum}`;
    const barcode = `893800${(100000 + count).toString()}`;
    const name = `${tpl.baseName} #${count}`;

    let hasVariants = false;
    let attributes: ProductAttribute[] | undefined;
    let variants: ProductVariant[] | undefined;

    // Solid stocks for each branch
    const b1 = 35 + ((count * 7) % 80);
    const b2 = 30 + ((count * 9) % 90);
    const b3 = 120 + ((count * 15) % 400);

    if (tpl.attr && count % 3 === 0) {
      hasVariants = true;
      attributes = [{ name: tpl.attr.name, values: tpl.attr.values }];
      variants = tpl.attr.values.map((v, idx) => {
        const vSellPrice = tpl.sell + idx * 1500;
        const variantConversions: Record<string, number> = {};
        if (tpl.conversions) {
          tpl.conversions.forEach((c) => {
            variantConversions[c.unitName] = vSellPrice * c.conversionFactor;
          });
        }

        const vb1 = 15 + ((count * 3 + idx * 4) % 30);
        const vb2 = 12 + ((count * 4 + idx * 3) % 25);
        const vb3 = 50 + ((count * 10 + idx * 10) % 150);
        const varTotalStock = vb1 + vb2 + vb3;

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

function loadImportedProductsFromFile(): Product[] {
  let list: Product[] = [];
  try {
    const filePath = path.join(__dirname, '../../data/imported_products.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data) && data.length > 0) {
        list = data;
      }
    }
  } catch (err) {
    console.error('Lỗi đọc file imported_products.json:', err);
  }

  if (list.length === 0) {
    list = generate300GroceryProducts();
  }

  // Clean up products: move "Giá Sỉ" from conversions array to prod.wholesalePrice property
  return list.map((prod) => {
    let wholesalePrice = prod.wholesalePrice;
    let conversions = prod.conversions ? [...prod.conversions] : [];

    // Find and extract "Giá Sỉ" from conversions if present
    const wholesaleIdx = conversions.findIndex((c) => c.unitName.includes('Sỉ'));
    if (wholesaleIdx !== -1) {
      if (!wholesalePrice || wholesalePrice === 0) {
        wholesalePrice = conversions[wholesaleIdx].sellingPrice;
      }
      conversions.splice(wholesaleIdx, 1); // Remove "Giá Sỉ" from conversions
    }

    // Default wholesalePrice if still missing
    if (!wholesalePrice || wholesalePrice === 0) {
      wholesalePrice = Math.round((prod.sellingPrice * 0.85) / 500) * 500;
    }

    // Main conversion unit should be real unit e.g. "Chục (10 cái)"
    const mainConv = conversions[0];

    return {
      ...prod,
      wholesalePrice,
      conversions,
      conversionUnit: mainConv?.unitName || (prod.conversionUnit === 'Giá Sỉ' ? undefined : prod.conversionUnit),
      conversionFactor: mainConv?.conversionFactor || prod.conversionFactor,
      conversionSellingPrice: mainConv?.sellingPrice || prod.conversionSellingPrice,
    };
  });
}

let MOCK_PRODUCTS: Product[] = loadImportedProductsFromFile();

export class ProductService {
  static resetAllData() {
    MOCK_PRODUCTS = loadImportedProductsFromFile();
    return MOCK_PRODUCTS;
  }
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
    MOCK_PRODUCTS = loadImportedProductsFromFile();
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

  static generateExcelExportCsv(query?: string, category?: string, brand?: string, location?: string, branchId?: string) {
    const headers = [
      'SKU',
      'Mã Barcode',
      'Tên sản phẩm',
      'Phân loại / Biến thể',
      'Danh mục (Category)',
      'Thương hiệu (Brand)',
      'Vị trí kho (Location)',
      'Đơn vị nhỏ nhất',
      'Đơn vị quy đổi',
      'Hệ số quy đổi',
      'Giá nhập (Vốn)',
      'Giá bán lẻ',
      'Giá sỉ',
      'Giá bán đơn vị lớn',
      'Tồn kho',
      'Ngưỡng cảnh báo',
      'Trạng thái'
    ];
    const rows: (string | number)[][] = [];

    const products = this.getAllProducts(query, category, brand, location);

    products.forEach((p) => {
      const stock = (branchId && p.branchStocks && p.branchStocks[branchId] !== undefined)
        ? p.branchStocks[branchId]
        : p.stockQuantity;

      const minStock = (branchId && p.branchMinStocks && p.branchMinStocks[branchId] !== undefined)
        ? p.branchMinStocks[branchId]
        : p.minStock;

      const firstConv = (p.conversions && p.conversions.length > 0) ? p.conversions[0] : null;
      const convUnit = p.conversionUnit || (firstConv ? firstConv.unitName : '');
      const convFactor = p.conversionFactor || (firstConv ? firstConv.conversionFactor : '');
      const convPrice = p.conversionSellingPrice || (firstConv ? firstConv.sellingPrice : '');
      const statusStr = p.isActive !== false ? 'Đang kinh doanh' : 'Ngưng kinh doanh';

      if (p.hasVariants && p.variants && p.variants.length > 0) {
        p.variants.forEach((v) => {
          rows.push([
            `"${v.sku}"`,
            `"\t${v.barcode || v.sku}"`,
            `"${v.variantName.replace(/"/g, '""')}"`,
            `"${v.attributeValues ? Object.entries(v.attributeValues).map(([k, val]) => `${k}: ${val}`).join('; ') : v.variantName}"`,
            `"${p.category.replace(/"/g, '""')}"`,
            `"${p.brand.replace(/"/g, '""')}"`,
            `"${(p.location || '').replace(/"/g, '""')}"`,
            `"${p.unit}"`,
            `"${convUnit}"`,
            convFactor,
            v.costPrice || p.costPrice || 0,
            v.sellingPrice || 0,
            p.wholesalePrice || 0,
            convPrice || 0,
            stock,
            v.minStock || minStock || 0,
            `"${statusStr}"`,
          ]);
        });
      } else {
        rows.push([
          `"${p.sku}"`,
          `"\t${p.barcode || p.sku}"`,
          `"${p.name.replace(/"/g, '""')}"`,
          '"Hàng tiêu chuẩn"',
          `"${p.category.replace(/"/g, '""')}"`,
          `"${p.brand.replace(/"/g, '""')}"`,
          `"${(p.location || '').replace(/"/g, '""')}"`,
          `"${p.unit}"`,
          `"${convUnit}"`,
          convFactor,
          p.costPrice || 0,
          p.sellingPrice || 0,
          p.wholesalePrice || 0,
          convPrice || 0,
          stock,
          minStock || 0,
          `"${statusStr}"`,
        ]);
      }
    });

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  static updateStock(productId: string, quantityChange: number, branchId: string = 'branch-01') {
    const targetBranch = branchId || 'branch-01';

    for (const p of MOCK_PRODUCTS) {
      if (p.id === productId || p.sku === productId || p.barcode === productId) {
        if (!p.branchStocks) {
          p.branchStocks = { b1: 100, b2: 100, b3: 100, 'branch-01': 100, 'branch-02': 100, 'branch-03': 100 };
        }

        // Identify matching branch aliases
        const isB1 = targetBranch === 'b1' || targetBranch === 'branch-01' || targetBranch === 'CN-01';
        const isB2 = targetBranch === 'b2' || targetBranch === 'branch-02' || targetBranch === 'CN-02';
        const isB3 = targetBranch === 'b3' || targetBranch === 'branch-03' || targetBranch === 'CN-03';

        const keysToUpdate = isB1 ? ['b1', 'branch-01', 'CN-01'] : isB2 ? ['b2', 'branch-02', 'CN-02'] : isB3 ? ['b3', 'branch-03', 'CN-03'] : [targetBranch];

        const currentVal = p.branchStocks[keysToUpdate[0]] !== undefined ? p.branchStocks[keysToUpdate[0]] : (p.branchStocks[targetBranch] || 0);
        const newVal = Math.max(0, currentVal + quantityChange);

        const branchMap = p.branchStocks || {};
        keysToUpdate.forEach((k) => {
          branchMap[k] = newVal;
        });
        p.branchStocks = branchMap;

        // Recalculate total stock (using primary keys b1, b2, b3 or branch-01, branch-02, branch-03)
        const primaryB1 = p.branchStocks['b1'] ?? p.branchStocks['branch-01'] ?? 0;
        const primaryB2 = p.branchStocks['b2'] ?? p.branchStocks['branch-02'] ?? 0;
        const primaryB3 = p.branchStocks['b3'] ?? p.branchStocks['branch-03'] ?? 0;
        p.stockQuantity = primaryB1 + primaryB2 + primaryB3;
        return;
      }

      if (p.variants) {
        const v = p.variants.find((vr) => vr.id === productId || vr.sku === productId || vr.barcode === productId);
        if (v) {
          if (!v.branchStocks) {
            v.branchStocks = { b1: 100, b2: 100, b3: 100, 'branch-01': 100, 'branch-02': 100, 'branch-03': 100 };
          }

          const isB1 = targetBranch === 'b1' || targetBranch === 'branch-01' || targetBranch === 'CN-01';
          const isB2 = targetBranch === 'b2' || targetBranch === 'branch-02' || targetBranch === 'CN-02';
          const isB3 = targetBranch === 'b3' || targetBranch === 'branch-03' || targetBranch === 'CN-03';

          const keysToUpdate = isB1 ? ['b1', 'branch-01', 'CN-01'] : isB2 ? ['b2', 'branch-02', 'CN-02'] : isB3 ? ['b3', 'branch-03', 'CN-03'] : [targetBranch];

          const currentVal = v.branchStocks[keysToUpdate[0]] !== undefined ? v.branchStocks[keysToUpdate[0]] : (v.branchStocks[targetBranch] || 0);
          const newVal = Math.max(0, currentVal + quantityChange);

          const vBranchMap = v.branchStocks || {};
          keysToUpdate.forEach((k) => {
            vBranchMap[k] = newVal;
          });
          v.branchStocks = vBranchMap;

          const vb1 = v.branchStocks['b1'] ?? v.branchStocks['branch-01'] ?? 0;
          const vb2 = v.branchStocks['b2'] ?? v.branchStocks['branch-02'] ?? 0;
          const vb3 = v.branchStocks['b3'] ?? v.branchStocks['branch-03'] ?? 0;
          v.stockQuantity = vb1 + vb2 + vb3;
          p.stockQuantity = p.variants.reduce((sum, vr) => sum + Number(vr.stockQuantity), 0);
          return;
        }
      }
    }
  }

  static toggleBranchActiveStatus(productId: string, branchId: string, isActive: boolean) {
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (!product) throw new Error('Không tìm thấy sản phẩm');
    if (!product.branchActiveStatus) {
      product.branchActiveStatus = {};
    }
    product.branchActiveStatus[branchId] = isActive;
    return product;
  }

  static updateBranchMinStock(productId: string, branchId: string, minStock: number) {
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (!product) throw new Error('Không tìm thấy sản phẩm');
    if (!product.branchMinStocks) {
      product.branchMinStocks = {};
    }
    product.branchMinStocks[branchId] = Math.max(0, minStock);
    return product;
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

  static getRawMasterCatalogs() {
    return {
      categories: [...CATEGORIES_DB],
      brands: [...BRANDS_DB],
      locations: [...LOCATIONS_DB],
      units: [...UNITS_DB],
    };
  }

  static setRawMasterCatalogs(data: {
    categories?: (CategoryData | string)[];
    brands?: string[];
    locations?: string[];
    units?: string[];
  }) {
    if (data.categories && Array.isArray(data.categories)) {
      CATEGORIES_DB = data.categories.map((c) =>
        typeof c === 'string' ? { name: c, icon: '📦', showOnPos: true } : c
      );
    }
    if (data.brands && Array.isArray(data.brands)) {
      BRANDS_DB = [...data.brands];
    }
    if (data.locations && Array.isArray(data.locations)) {
      LOCATIONS_DB = [...data.locations];
    }
    if (data.units && Array.isArray(data.units)) {
      UNITS_DB = [...data.units];
    }
  }
}
