export interface ProductImagePreset {
  id: string;
  label: string;
  url: string;
}

export interface StoreSettings {
  // 1. Thông tin cửa hàng
  storeName: string;
  storeType: 'SINGLE' | 'CHAIN';
  phone: string;
  country: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  taxCode: string;
  logoUrl: string;

  // 2. Thiết lập danh mục & chính sách chuỗi
  catalogMode: 'CHAIN_WIDE' | 'PER_BRANCH';
  enableBranchMinMaxStock: boolean;
  allowCustomerImportWithoutPhone: boolean;
  trackDebtChainWide: boolean;
  enableOnlineOrderPage: boolean;
  imagePresets: ProductImagePreset[];

  // 3. Tiền tệ & In hóa đơn (Receipt)
  currency: string;
  currencySymbol: string;
  receiptHeader: string;
  receiptFooter: string;
  printLogoOnReceipt: boolean;
  paperSize: 'K80' | 'K58' | 'A4';

  // 4. Ngân hàng & VietQR chuyển khoản
  bankCode: string;
  bankName: string;
  bankAccountNo: string;
  bankAccountName: string;
  enableVietQR: boolean;
  printVietQRReceipt: boolean;
  vietQrTemplate: string;

  // 5. Quy tắc bán hàng POS & Quản lý Thu ngân
  allowNegativeStock: boolean;
  allowCustomerDebt: boolean;
  maxDebtLimitPerCustomer: number;
  maxDiscountPercent: number;
  allowCashierChangePrice: boolean;
  autoPrintInvoice: boolean;
  roundCashAmount: boolean;
}

let STORE_SETTINGS: StoreSettings = {
  storeName: 'CHUỖI CỬA HÀNG TẠP HÓA & SIÊU THỊ TIỆN LỢI THÀNH ĐẠT',
  storeType: 'CHAIN',
  phone: '0973634595',
  country: 'Việt Nam',
  address: 'Số 33 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  city: 'Hồ Chí Minh',
  district: 'Quận 1',
  ward: 'Phường Bến Nghé',
  street: '33 Nguyễn Huệ',
  taxCode: '0101243150-997',
  logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80',

  catalogMode: 'CHAIN_WIDE',
  enableBranchMinMaxStock: true,
  allowCustomerImportWithoutPhone: true,
  trackDebtChainWide: true,
  enableOnlineOrderPage: true,
  imagePresets: [
    { id: 'img-preset-1', label: '🥤 Nước ngọt / Đồ uống', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80' },
    { id: 'img-preset-2', label: '🥛 Sữa / Đồ tươi', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },
    { id: 'img-preset-3', label: '🍜 Mì / Thực phẩm khô', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80' },
    { id: 'img-preset-4', label: '🍪 Bánh kẹo / Snack', url: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=400&q=80' },
    { id: 'img-preset-5', label: '🧂 Gia vị / Nước mắm', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80' },
    { id: 'img-preset-6', label: '🧼 Hóa mỹ phẩm / Tạp hóa', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80' },
    { id: 'img-preset-7', label: '🍎 Trái cây / Rau củ', url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80' },
    { id: 'img-preset-8', label: '🥩 Thịt / Hải sản tươi', url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80' },
    { id: 'img-preset-9', label: '🌱 Hạt giống / Nông nghiệp', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&q=80' },
  ],

  currency: 'VND',
  currencySymbol: 'đ',
  receiptHeader: 'TẠP HÓA & SIÊU THỊ TIỆN LỢI THÀNH ĐẠT',
  receiptFooter: 'Cảm ơn Quý Khách - Hẹn Gặp Lại Quý Khách Lần Sau!',
  printLogoOnReceipt: true,
  paperSize: 'K80',

  bankCode: 'MB',
  bankName: 'Ngân hàng Quân Đội (MBBank)',
  bankAccountNo: '999988886666',
  bankAccountName: 'NGUYEN VAN THANH',
  enableVietQR: true,
  printVietQRReceipt: true,
  vietQrTemplate: 'compact2',

  allowNegativeStock: false,
  allowCustomerDebt: true,
  maxDebtLimitPerCustomer: 5000000,
  maxDiscountPercent: 10,
  allowCashierChangePrice: false,
  autoPrintInvoice: true,
  roundCashAmount: true,
};

import fs from 'fs';
import path from 'path';
import { ProductService } from './product.service';
import { PosService } from './pos.service';
import { BranchService } from './branch.service';

export class SettingsService {
  static getSettings(): StoreSettings {
    return { ...STORE_SETTINGS };
  }

  static updateSettings(data: Partial<StoreSettings>): StoreSettings {
    STORE_SETTINGS = {
      ...STORE_SETTINGS,
      ...data,
    };
    return { ...STORE_SETTINGS };
  }

  static getImagePresets(): ProductImagePreset[] {
    return STORE_SETTINGS.imagePresets || [];
  }

  static addImagePreset(label: string, url: string): ProductImagePreset[] {
    const newPreset: ProductImagePreset = {
      id: `img-preset-${Date.now()}`,
      label: label.trim(),
      url: url.trim(),
    };
    STORE_SETTINGS.imagePresets = [newPreset, ...(STORE_SETTINGS.imagePresets || [])];
    return STORE_SETTINGS.imagePresets;
  }

  static updateImagePreset(id: string, label: string, url: string): ProductImagePreset[] {
    STORE_SETTINGS.imagePresets = (STORE_SETTINGS.imagePresets || []).map((p) =>
      p.id === id ? { ...p, label: label.trim(), url: url.trim() } : p
    );
    return STORE_SETTINGS.imagePresets;
  }

  static deleteImagePreset(id: string): ProductImagePreset[] {
    STORE_SETTINGS.imagePresets = (STORE_SETTINGS.imagePresets || []).filter((p) => p.id !== id);
    return STORE_SETTINGS.imagePresets;
  }

  static resetAppAllData() {
    ProductService.resetAllData();
    PosService.resetAllOrders();
    return { success: true, message: 'Đã xóa toàn bộ dữ liệu và tái nạp 100 sản phẩm đầy đủ cho tất cả chi nhánh' };
  }

  static exportSystemBundle() {
    return {
      meta: {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        appName: 'Sales Management System',
        systemType: STORE_SETTINGS.storeType,
      },
      storeSettings: { ...STORE_SETTINGS },
      masterCatalogs: {
        ...ProductService.getRawMasterCatalogs(),
        imagePresets: SettingsService.getImagePresets(),
      },
      branches: BranchService.getAllBranches(),
    };
  }

  static importSystemBundle(bundle: any) {
    if (!bundle || typeof bundle !== 'object') {
      throw new Error('Dữ liệu file cấu hình không hợp lệ!');
    }

    if (bundle.storeSettings && typeof bundle.storeSettings === 'object') {
      STORE_SETTINGS = {
        ...STORE_SETTINGS,
        ...bundle.storeSettings,
      };
    }

    if (bundle.masterCatalogs && typeof bundle.masterCatalogs === 'object') {
      ProductService.setRawMasterCatalogs(bundle.masterCatalogs);
      if (bundle.masterCatalogs.imagePresets && Array.isArray(bundle.masterCatalogs.imagePresets)) {
        STORE_SETTINGS.imagePresets = [...bundle.masterCatalogs.imagePresets];
      }
    }

    if (bundle.branches && Array.isArray(bundle.branches)) {
      BranchService.setBranches(bundle.branches);
    }

    return {
      success: true,
      message: 'Đã nạp toàn bộ cấu hình hệ thống thành công!',
      exportedAt: bundle.meta?.exportedAt || null,
      storeSettings: STORE_SETTINGS,
    };
  }

  static loadDefaultSystemConfig() {
    try {
      const configPath = path.resolve(__dirname, '../../data/system_default_config.json');
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf-8');
        const bundle = JSON.parse(raw);
        return this.importSystemBundle(bundle);
      }
    } catch (err: any) {
      console.warn('Cannot load default system config from file, using memory state:', err.message);
    }
    return {
      success: true,
      message: 'Đã nạp cấu hình hệ thống mặc định',
      storeSettings: STORE_SETTINGS,
    };
  }
}
