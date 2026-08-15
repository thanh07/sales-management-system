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

  allowNegativeStock: false,
  allowCustomerDebt: true,
  maxDebtLimitPerCustomer: 5000000,
  maxDiscountPercent: 10,
  allowCashierChangePrice: false,
  autoPrintInvoice: true,
  roundCashAmount: true,
};

import { ProductService } from './product.service';
import { PosService } from './pos.service';

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

  static resetAppAllData() {
    ProductService.resetAllData();
    PosService.resetAllOrders();
    return { success: true, message: 'Đã xóa toàn bộ dữ liệu và tái nạp 100 sản phẩm đầy đủ cho tất cả chi nhánh' };
  }
}
