import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { 
  Building2, 
  Store, 
  Phone, 
  MapPin, 
  FileText, 
  DollarSign, 
  QrCode, 
  Edit3, 
  Save, 
  RotateCcw, 
  Check, 
  ShieldAlert, 
  Globe, 
  Printer,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';

const VIETNAM_PROVINCES = [
  'Hà Nội',
  'Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Bình Dương',
  'Đồng Nai',
  'Bà Rịa - Vũng Tàu',
  'Quảng Ninh',
  'Khánh Hòa',
  'Lâm Đồng',
  'Thừa Thiên Huế',
  'Bắc Ninh',
  'Hải Dương',
  'Thanh Hóa',
  'Nghệ An',
  'An Giang',
  'Kiên Giang',
  'Khác',
];

const VIETNAM_BANKS = [
  { code: 'MB', name: 'MBBank - Ngân hàng Quân Đội' },
  { code: 'VCB', name: 'Vietcombank - Ngoại Thương VN' },
  { code: 'TCB', name: 'Techcombank - Kỹ Thương VN' },
  { code: 'VPB', name: 'VPBank - Việt Nam Thịnh Vượng' },
  { code: 'ACB', name: 'ACB - Á Châu' },
  { code: 'BIDV', name: 'BIDV - Đầu tư & Phát triển VN' },
  { code: 'CTG', name: 'VietinBank - Công Thương VN' },
  { code: 'VBA', name: 'Agribank - Nông nghiệp VN' },
  { code: 'TPB', name: 'TPBank - Tiên Phong' },
  { code: 'STB', name: 'Sacombank - Sài Gòn Thương Tín' },
];

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SALES_PURCHASE'>('GENERAL');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form State
  const [settings, setSettings] = useState({
    storeName: 'CHUỖI CỬA HÀNG TẠP HÓA & SIÊU THỊ TIỆN LỢI THÀNH ĐẠT',
    storeType: 'CHAIN' as 'SINGLE' | 'CHAIN',
    phone: '0973634595',
    country: 'Việt Nam',
    address: 'Số 33 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    city: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    street: '33 Nguyễn Huệ',
    taxCode: '0101243150-997',
    logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80',

    catalogMode: 'CHAIN_WIDE' as 'CHAIN_WIDE' | 'PER_BRANCH',
    enableBranchMinMaxStock: true,
    allowCustomerImportWithoutPhone: true,
    trackDebtChainWide: true,
    enableOnlineOrderPage: true,

    currency: 'VND',
    currencySymbol: 'đ',
    receiptHeader: 'TẠP HÓA & SIÊU THỊ TIỆN LỢI THÀNH ĐẠT',
    receiptFooter: 'Cảm ơn Quý Khách - Hẹn Gặp Lại Quý Khách Lần Sau!',
    printLogoOnReceipt: true,
    paperSize: 'K80' as 'K80' | 'K58' | 'A4',

    bankCode: 'MB',
    bankName: 'Ngân hàng Quân Đội (MBBank)',
    bankAccountNo: '999988886666',
    bankAccountName: 'NGUYEN VAN THANH',
    enableVietQR: true,
  });

  // Backup state for Cancel/Hoãn
  const [originalSettings, setOriginalSettings] = useState({ ...settings });

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res: any = await api.get('/settings');
      if (res.data) {
        setSettings(res.data);
        setOriginalSettings(res.data);
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveStore = async () => {
    if (!isAdmin) return;
    try {
      setIsLoading(true);
      const res: any = await api.put('/settings', settings);
      setSettings(res.data);
      setOriginalSettings(res.data);
      setIsEditingStore(false);
      setSaveSuccessMsg('Đã lưu thông tin cửa hàng thành công!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu thiết lập');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelStore = () => {
    setSettings({ ...originalSettings });
    setIsEditingStore(false);
  };

  const handleSaveCurrency = async () => {
    if (!isAdmin) return;
    try {
      setIsLoading(true);
      const res: any = await api.put('/settings', settings);
      setSettings(res.data);
      setOriginalSettings(res.data);
      setIsEditingCurrency(false);
      setSaveSuccessMsg('Đã lưu cấu hình tiền tệ & hóa đơn thành công!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu thiết lập');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCurrency = () => {
    setSettings({ ...originalSettings });
    setIsEditingCurrency(false);
  };

  return (
    <div className="p-3 sm:p-6 h-[calc(100vh-4rem)] overflow-y-auto space-y-5 w-full max-w-7xl mx-auto">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300 font-bold text-xs">
          <Check className="w-4 h-4" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" />
            <span>Thông tin chung</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Quản lý hồ sơ định danh, cơ cấu chuỗi chi nhánh và mẫu hóa đơn in</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-400" />
            <span>{settings.storeType === 'CHAIN' ? 'Chuỗi của hàng' : 'Cửa hàng đơn'}</span>
          </div>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('GENERAL')}
          className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'GENERAL'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Thiết lập chung</span>
        </button>
        <button
          onClick={() => setActiveTab('SALES_PURCHASE')}
          className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'SALES_PURCHASE'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Mua hàng bán hàng</span>
        </button>
      </div>

      {/* TAB 1: THIẾT LẬP CHUNG */}
      {activeTab === 'GENERAL' && (
        <div className="space-y-6">
          {/* Section 1: THÔNG TIN CỬA HÀNG */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-6 shadow-xl">
            {/* Header Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white uppercase tracking-wider">THÔNG TIN CỬA HÀNG</span>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  {!isEditingStore ? (
                    <button
                      onClick={() => setIsEditingStore(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveStore}
                        disabled={isLoading}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu</span>
                      </button>
                      <button
                        onClick={handleCancelStore}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Hoãn</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Form Fields Grid */}
            <div className="space-y-4 text-xs">
              {/* Row 1: Tên cửa hàng */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <label className="md:col-span-3 text-slate-300 font-semibold flex items-center gap-1">
                  <span>Tên cửa hàng</span>
                  <span className="text-red-400">*</span>
                </label>
                <div className="md:col-span-9">
                  {isEditingStore ? (
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl glass-input font-bold text-white text-sm"
                      placeholder="Nhập tên doanh nghiệp / chuỗi cửa hàng..."
                    />
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 font-bold text-white text-sm">
                      {settings.storeName}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Loại hình cửa hàng */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <label className="md:col-span-3 text-slate-300 font-semibold">Loại hình cửa hàng</label>
                <div className="md:col-span-9 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="storeType"
                      disabled={!isEditingStore}
                      checked={settings.storeType === 'SINGLE'}
                      onChange={() => setSettings({ ...settings, storeType: 'SINGLE' })}
                      className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700"
                    />
                    <span className={settings.storeType === 'SINGLE' ? 'text-white font-bold' : 'text-slate-400'}>
                      Cửa hàng đơn
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="storeType"
                      disabled={!isEditingStore}
                      checked={settings.storeType === 'CHAIN'}
                      onChange={() => setSettings({ ...settings, storeType: 'CHAIN' })}
                      className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700"
                    />
                    <span className={settings.storeType === 'CHAIN' ? 'text-white font-bold' : 'text-slate-400'}>
                      Chuỗi cửa hàng
                    </span>
                  </label>
                </div>
              </div>

              {/* Row 3: Số điện thoại */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <label className="md:col-span-3 text-slate-300 font-semibold">Số điện thoại</label>
                <div className="md:col-span-9">
                  {isEditingStore ? (
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full max-w-md px-3 py-2 rounded-xl glass-input text-xs"
                      placeholder="0973634595"
                    />
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-200 max-w-md font-mono">
                      {settings.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4: Quốc gia */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <label className="md:col-span-3 text-slate-300 font-semibold">Quốc gia</label>
                <div className="md:col-span-9">
                  {isEditingStore ? (
                    <input
                      type="text"
                      value={settings.country}
                      onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                      className="w-full max-w-md px-3 py-2 rounded-xl glass-input text-xs"
                    />
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-200 max-w-md">
                      {settings.country}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Địa chỉ */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
                <label className="md:col-span-3 text-slate-300 font-semibold pt-2">Địa chỉ</label>
                <div className="md:col-span-9">
                  {isEditingStore ? (
                    <textarea
                      rows={2}
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                      placeholder="Nhập địa chỉ chi tiết hiển thị trên hóa đơn..."
                    />
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-200">
                      {settings.address}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 6: Tỉnh / Thành phố */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <label className="md:col-span-3 text-slate-300 font-semibold">Tỉnh/Thành phố</label>
                <div className="md:col-span-9">
                  {isEditingStore ? (
                    <select
                      value={settings.city}
                      onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                      className="w-full max-w-md px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    >
                      {VIETNAM_PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-200 max-w-md">
                      {settings.city}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 7: Quận/Huyện */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <label className="md:col-span-3 text-slate-300 font-semibold">Quận/Huyện</label>
                <div className="md:col-span-9">
                  {isEditingStore ? (
                    <input
                      type="text"
                      value={settings.district}
                      onChange={(e) => setSettings({ ...settings, district: e.target.value })}
                      className="w-full max-w-md px-3 py-2 rounded-xl glass-input text-xs"
                      placeholder="Nhập để tìm kiếm hoặc điền quận huyện..."
                    />
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-200 max-w-md">
                      {settings.district}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 8: Phường/Xã */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <label className="md:col-span-3 text-slate-300 font-semibold">Phường/Xã</label>
                <div className="md:col-span-9">
                  {isEditingStore ? (
                    <input
                      type="text"
                      value={settings.ward}
                      onChange={(e) => setSettings({ ...settings, ward: e.target.value })}
                      className="w-full max-w-md px-3 py-2 rounded-xl glass-input text-xs"
                      placeholder="Nhập để tìm kiếm hoặc điền phường xã..."
                    />
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-200 max-w-md">
                      {settings.ward}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 9: Đường phố */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <label className="md:col-span-3 text-slate-300 font-semibold">Đường phố</label>
                <div className="md:col-span-9">
                  {isEditingStore ? (
                    <input
                      type="text"
                      value={settings.street}
                      onChange={(e) => setSettings({ ...settings, street: e.target.value })}
                      className="w-full max-w-md px-3 py-2 rounded-xl glass-input text-xs"
                      placeholder="Số nhà, đường..."
                    />
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-200 max-w-md">
                      {settings.street}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 10: Mã số thuế / CCCD */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <label className="md:col-span-3 text-slate-300 font-semibold">Mã số thuế/CCCD</label>
                <div className="md:col-span-9">
                  {isEditingStore ? (
                    <input
                      type="text"
                      value={settings.taxCode}
                      onChange={(e) => setSettings({ ...settings, taxCode: e.target.value })}
                      className="w-full max-w-md px-3 py-2 rounded-xl glass-input text-xs font-mono"
                      placeholder="0101243150-997"
                    />
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-200 max-w-md font-mono">
                      {settings.taxCode}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 11: Thiết lập danh mục */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start pt-2 border-t border-slate-800/80">
                <label className="md:col-span-3 text-slate-300 font-semibold pt-1">Thiết lập danh mục</label>
                <div className="md:col-span-9 space-y-2">
                  <div className="flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="catalogMode"
                        disabled={!isEditingStore}
                        checked={settings.catalogMode === 'CHAIN_WIDE'}
                        onChange={() => setSettings({ ...settings, catalogMode: 'CHAIN_WIDE' })}
                        className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700"
                      />
                      <span className={settings.catalogMode === 'CHAIN_WIDE' ? 'text-white font-bold' : 'text-slate-400'}>
                        Dùng chung toàn chuỗi
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="catalogMode"
                        disabled={!isEditingStore}
                        checked={settings.catalogMode === 'PER_BRANCH'}
                        onChange={() => setSettings({ ...settings, catalogMode: 'PER_BRANCH' })}
                        className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700"
                      />
                      <span className={settings.catalogMode === 'PER_BRANCH' ? 'text-white font-bold' : 'text-slate-400'}>
                        Dùng riêng cho từng cửa hàng
                      </span>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Áp dụng cho danh mục hàng hóa, thương hiệu và bảng giá chung toàn hệ thống.
                  </p>
                </div>
              </div>

              {/* Policy Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start pt-2">
                <div className="md:col-span-3"></div>
                <div className="md:col-span-9 space-y-2.5">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isEditingStore}
                      checked={settings.enableBranchMinMaxStock}
                      onChange={(e) => setSettings({ ...settings, enableBranchMinMaxStock: e.target.checked })}
                      className="w-4 h-4 rounded mt-0.5 text-blue-600 bg-slate-900 border-slate-700"
                    />
                    <span className="text-slate-300">
                      Khai báo riêng cho từng chi nhánh tồn kho tối thiểu và tồn kho tối đa của hàng hóa
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isEditingStore}
                      checked={settings.allowCustomerImportWithoutPhone}
                      onChange={(e) => setSettings({ ...settings, allowCustomerImportWithoutPhone: e.target.checked })}
                      className="w-4 h-4 rounded mt-0.5 text-blue-600 bg-slate-900 border-slate-700"
                    />
                    <span className="text-slate-300">
                      Cho phép nhập khẩu Excel danh mục khách hàng mà không bắt buộc số điện thoại
                    </span>
                  </label>
                </div>
              </div>

              {/* Row 12: Quản lý công nợ */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start pt-2 border-t border-slate-800/80">
                <label className="md:col-span-3 text-slate-300 font-semibold pt-1">Quản lý công nợ</label>
                <div className="md:col-span-9 space-y-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isEditingStore}
                      checked={settings.trackDebtChainWide}
                      onChange={(e) => setSettings({ ...settings, trackDebtChainWide: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                    />
                    <span className="text-slate-300 font-semibold">Theo dõi công nợ theo chuỗi</span>
                  </label>
                  <p className="text-[11px] text-slate-500 italic">
                    Cửa hàng với danh mục khách hàng dùng riêng không thể theo dõi công nợ theo chuỗi.
                  </p>
                </div>
              </div>

              {/* Row 13: Trang đặt hàng */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start pt-2 border-t border-slate-800/80">
                <label className="md:col-span-3 text-slate-300 font-semibold pt-1">Trang đặt hàng</label>
                <div className="md:col-span-9 space-y-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isEditingStore}
                      checked={settings.enableOnlineOrderPage}
                      onChange={(e) => setSettings({ ...settings, enableOnlineOrderPage: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                    />
                    <span className="text-slate-300 font-semibold">Có sử dụng bán hàng qua Trang đặt hàng (Online Menu/Web Order)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: TIỀN TỆ & THIẾT LẬP HÓA ĐƠN IN RA */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-6 shadow-xl">
            {/* Header Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white uppercase tracking-wider">TIỀN TỆ & CẤU HÌNH IN HÓA ĐƠN</span>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  {!isEditingCurrency ? (
                    <button
                      onClick={() => setIsEditingCurrency(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveCurrency}
                        disabled={isLoading}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu</span>
                      </button>
                      <button
                        onClick={handleCancelCurrency}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Hoãn</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Currency & Receipt Form Fields */}
            <div className="space-y-4 text-xs">
              {/* Row: Loại tiền */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <label className="md:col-span-3 text-slate-300 font-semibold">Loại tiền</label>
                <div className="md:col-span-9">
                  {isEditingCurrency ? (
                    <input
                      type="text"
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-48 px-3 py-2 rounded-xl glass-input text-xs font-bold text-white"
                    />
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-white font-bold w-48">
                      {settings.currency}
                    </div>
                  )}
                </div>
              </div>

              {/* Row: Ký hiệu tiền tệ */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
                <label className="md:col-span-3 text-slate-300 font-semibold pt-2">Ký hiệu tiền tệ</label>
                <div className="md:col-span-9 space-y-1">
                  {isEditingCurrency ? (
                    <input
                      type="text"
                      value={settings.currencySymbol}
                      onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                      className="w-48 px-3 py-2 rounded-xl glass-input text-xs font-bold text-emerald-400"
                    />
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-emerald-400 font-bold w-48 font-mono">
                      {settings.currencySymbol}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 italic">
                    Ký hiệu sẽ được hiển thị trên hóa đơn bán hàng in ra. Bỏ trống nếu không muốn hiển thị.
                  </p>
                </div>
              </div>

              {/* Row: Khổ giấy in */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center pt-2 border-t border-slate-800/80">
                <label className="md:col-span-3 text-slate-300 font-semibold">Khổ giấy in hóa đơn</label>
                <div className="md:col-span-9">
                  {isEditingCurrency ? (
                    <select
                      value={settings.paperSize}
                      onChange={(e) => setSettings({ ...settings, paperSize: e.target.value as any })}
                      className="w-48 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                    >
                      <option value="K80">K80 (Khổ chuẩn 80mm)</option>
                      <option value="K58">K58 (Khổ nhỏ 58mm)</option>
                      <option value="A4">A4 / A5 (Khổ văn phòng)</option>
                    </select>
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-white font-bold w-48">
                      {settings.paperSize === 'K80' ? 'K80 (80mm)' : settings.paperSize === 'K58' ? 'K58 (58mm)' : 'A4 / A5'}
                    </div>
                  )}
                </div>
              </div>

              {/* Row: Lời chào cuối bill */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <label className="md:col-span-3 text-slate-300 font-semibold">Lời chào chân trang bill</label>
                <div className="md:col-span-9">
                  {isEditingCurrency ? (
                    <input
                      type="text"
                      value={settings.receiptFooter}
                      onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                      className="w-full max-w-xl px-3 py-2 rounded-xl glass-input text-xs"
                      placeholder="Cảm ơn Quý Khách - Hẹn Gặp Lại!"
                    />
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-300 max-w-xl italic">
                      "{settings.receiptFooter}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: CẤU HÌNH TÀI KHOẢN NGÂN HÀNG VIETQR */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <QrCode className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm text-white uppercase tracking-wider">
                TÀI KHOẢN NGÂN HÀNG NHẬN TIỀN & SINH MÃ VIETQR ĐỘNG
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ngân hàng thụ hưởng</label>
                  {isEditingCurrency ? (
                    <select
                      value={settings.bankCode}
                      onChange={(e) => {
                        const b = VIETNAM_BANKS.find(x => x.code === e.target.value);
                        setSettings({ ...settings, bankCode: e.target.value, bankName: b?.name || e.target.value });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold"
                    >
                      {VIETNAM_BANKS.map((b) => (
                        <option key={b.code} value={b.code}>{b.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-white font-semibold">
                      {settings.bankName}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Số tài khoản ngân hàng</label>
                    {isEditingCurrency ? (
                      <input
                        type="text"
                        value={settings.bankAccountNo}
                        onChange={(e) => setSettings({ ...settings, bankAccountNo: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono font-bold text-emerald-400"
                        placeholder="Số tài khoản..."
                      />
                    ) : (
                      <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 font-mono font-bold text-emerald-400 text-sm">
                        {settings.bankAccountNo}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Tên chủ tài khoản (In hoa)</label>
                    {isEditingCurrency ? (
                      <input
                        type="text"
                        value={settings.bankAccountName}
                        onChange={(e) => setSettings({ ...settings, bankAccountName: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-white uppercase"
                        placeholder="NGUYEN VAN A"
                      />
                    ) : (
                      <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 font-bold text-white uppercase text-sm">
                        {settings.bankAccountName}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* VietQR Live Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-2 shadow-inner">
                <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wide">Mẫu VietQR Tự Động</div>
                <img
                  src={`https://api.vietqr.io/image/${settings.bankCode}-${settings.bankAccountNo}-compact2.png?amount=100000&accountName=${encodeURIComponent(settings.bankAccountName)}`}
                  alt="Mẫu VietQR"
                  className="w-36 h-36 rounded-xl bg-white p-1.5 shadow-md border border-slate-700 object-contain"
                  onError={(e) => {
                    (e.target as any).src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VietQR_Demo';
                  }}
                />
                <span className="text-[10px] text-slate-400">Tự sinh mã kèm số tiền khi thanh toán</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MUA HÀNG BÁN HÀNG */}
      {activeTab === 'SALES_PURCHASE' && (
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Printer className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">CẤU HÌNH NGHIỆP VỤ BÁN HÀNG & HÓA ĐƠN</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">Tự động in hóa đơn ngay sau khi hoàn tất thanh toán</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">Không cần bấm nút In Bill thủ công trên màn hình POS</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">Cho phép bán hàng khi tồn kho bằng 0 (Bán âm kho)</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">Sản phẩm chưa kịp nhập kho vẫn được phép xuất bán lẻ</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">In kèm mã QR chuyển khoản VietQR trên hóa đơn bán lẻ</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">In mã QR động dưới chân bill để khách thanh toán không tiền mặt</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
