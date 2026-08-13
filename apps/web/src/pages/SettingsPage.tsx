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
  HelpCircle,
  FolderTree,
  Tag,
  Scale,
  Plus,
  Trash2,
  X,
  Search,
  Eye,
  EyeOff
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

const EMOJI_LIST = ['🥤', '🥛', '🍜', '🧂', '🍪', '🧼', '📦', '🥩', '🥬', '🍞', '🍦', '☕', '🍺', '📱', '👕', '🎁', '🍎', '🧴', '🥚', '🥫', '🏷️'];

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'GENERAL' | 'CATALOG_MASTER' | 'SALES_PURCHASE'>('GENERAL');
  const [catalogSubTab, setCatalogSubTab] = useState<'CATEGORIES' | 'BRANDS' | 'LOCATIONS' | 'UNITS'>('CATEGORIES');

  const [isLoading, setIsLoading] = useState(false);
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Catalogs State
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Catalog Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [catNameInput, setCatNameInput] = useState('');
  const [catIconInput, setCatIconInput] = useState('🏷️');
  const [catShowOnPosInput, setCatShowOnPosInput] = useState(true);

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [brandNameInput, setBrandNameInput] = useState('');

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any | null>(null);
  const [locationNameInput, setLocationNameInput] = useState('');

  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any | null>(null);
  const [unitNameInput, setUnitNameInput] = useState('');

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

  const fetchCatalogs = async () => {
    try {
      const [catRes, brandRes, locRes, unitRes]: any[] = await Promise.all([
        api.get('/products/categories'),
        api.get('/products/brands'),
        api.get('/products/locations'),
        api.get('/products/units'),
      ]);
      setCategories(catRes.data || []);
      setBrands(brandRes.data || []);
      setLocations(locRes.data || []);
      setUnits(unitRes.data || []);
    } catch (err) {
      console.error('Fetch catalogs error:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCatalogs();
  }, []);

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleSaveStore = async () => {
    if (!isAdmin) return;
    try {
      setIsLoading(true);
      const res: any = await api.put('/settings', settings);
      setSettings(res.data);
      setOriginalSettings(res.data);
      setIsEditingStore(false);
      showToast('Đã lưu thông tin cửa hàng thành công!');
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
      showToast('Đã lưu cấu hình tiền tệ & hóa đơn thành công!');
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

  // --- Category Actions ---
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatNameInput('');
    setCatIconInput('🏷️');
    setCatShowOnPosInput(true);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCatNameInput(cat.name);
    setCatIconInput(cat.icon || '🏷️');
    setCatShowOnPosInput(cat.showOnPos !== false);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameInput.trim()) return;
    try {
      if (editingCategory) {
        await api.put(`/products/categories/${encodeURIComponent(editingCategory.name)}`, {
          newName: catNameInput.trim(),
          icon: catIconInput,
          showOnPos: catShowOnPosInput,
        });
        showToast('Cập nhật nhóm hàng thành công!');
      } else {
        await api.post('/products/categories', {
          name: catNameInput.trim(),
          icon: catIconInput,
          showOnPos: catShowOnPosInput,
        });
        showToast('Thêm nhóm hàng mới thành công!');
      }
      setIsCategoryModalOpen(false);
      fetchCatalogs();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu nhóm hàng');
    }
  };

  const handleDeleteCategory = async (catName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhóm hàng "${catName}"?`)) return;
    try {
      await api.delete(`/products/categories/${encodeURIComponent(catName)}`);
      showToast('Đã xóa nhóm hàng!');
      fetchCatalogs();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa nhóm hàng');
    }
  };

  const handleToggleCategoryPos = async (cat: any) => {
    try {
      await api.put(`/products/categories/${encodeURIComponent(cat.name)}`, {
        newName: cat.name,
        icon: cat.icon || '🏷️',
        showOnPos: !(cat.showOnPos !== false),
      });
      showToast(`Đã ${cat.showOnPos !== false ? 'ẩn khỏi' : 'hiện lên'} thanh POS!`);
      fetchCatalogs();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật hiển thị POS');
    }
  };

  // --- Brand Actions ---
  const handleOpenAddBrand = () => {
    setEditingBrand(null);
    setBrandNameInput('');
    setIsBrandModalOpen(true);
  };

  const handleOpenEditBrand = (brand: any) => {
    setEditingBrand(brand);
    setBrandNameInput(brand.name);
    setIsBrandModalOpen(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandNameInput.trim()) return;
    try {
      if (editingBrand) {
        await api.put(`/products/brands/${encodeURIComponent(editingBrand.name)}`, {
          newName: brandNameInput.trim(),
        });
        showToast('Cập nhật thương hiệu thành công!');
      } else {
        await api.post('/products/brands', {
          name: brandNameInput.trim(),
        });
        showToast('Thêm thương hiệu mới thành công!');
      }
      setIsBrandModalOpen(false);
      fetchCatalogs();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu thương hiệu');
    }
  };

  const handleDeleteBrand = async (brandName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa thương hiệu "${brandName}"?`)) return;
    try {
      await api.delete(`/products/brands/${encodeURIComponent(brandName)}`);
      showToast('Đã xóa thương hiệu!');
      fetchCatalogs();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa thương hiệu');
    }
  };

  // --- Location Actions ---
  const handleOpenAddLocation = () => {
    setEditingLocation(null);
    setLocationNameInput('');
    setIsLocationModalOpen(true);
  };

  const handleOpenEditLocation = (loc: any) => {
    setEditingLocation(loc);
    setLocationNameInput(loc.name);
    setIsLocationModalOpen(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationNameInput.trim()) return;
    try {
      if (editingLocation) {
        await api.put(`/products/locations/${encodeURIComponent(editingLocation.name)}`, {
          newName: locationNameInput.trim(),
        });
        showToast('Cập nhật vị trí kho thành công!');
      } else {
        await api.post('/products/locations', {
          name: locationNameInput.trim(),
        });
        showToast('Thêm vị trí kho mới thành công!');
      }
      setIsLocationModalOpen(false);
      fetchCatalogs();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu vị trí kho');
    }
  };

  const handleDeleteLocation = async (locName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vị trí kho "${locName}"?`)) return;
    try {
      await api.delete(`/products/locations/${encodeURIComponent(locName)}`);
      showToast('Đã xóa vị trí kho!');
      fetchCatalogs();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa vị trí kho');
    }
  };

  // --- Unit Actions ---
  const handleOpenAddUnit = () => {
    setEditingUnit(null);
    setUnitNameInput('');
    setIsUnitModalOpen(true);
  };

  const handleOpenEditUnit = (unit: any) => {
    setEditingUnit(unit);
    setUnitNameInput(unit.name);
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitNameInput.trim()) return;
    try {
      if (editingUnit) {
        await api.put(`/products/units/${encodeURIComponent(editingUnit.name)}`, {
          newName: unitNameInput.trim(),
        });
        showToast('Cập nhật đơn vị tính thành công!');
      } else {
        await api.post('/products/units', {
          name: unitNameInput.trim(),
        });
        showToast('Thêm đơn vị tính mới thành công!');
      }
      setIsUnitModalOpen(false);
      fetchCatalogs();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu đơn vị tính');
    }
  };

  const handleDeleteUnit = async (unitName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đơn vị tính "${unitName}"?`)) return;
    try {
      await api.delete(`/products/units/${encodeURIComponent(unitName)}`);
      showToast('Đã xóa đơn vị tính!');
      fetchCatalogs();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa đơn vị tính');
    }
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
            <span>Thiết Lập Hệ Thống</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Quản lý hồ sơ định danh, danh mục hàng hóa và cấu hình thanh toán bán hàng</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-400" />
            <span>{settings.storeType === 'CHAIN' ? 'Chuỗi cửa hàng' : 'Cửa hàng đơn'}</span>
          </div>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-bold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('GENERAL')}
          className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'GENERAL'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Thiết lập chung</span>
        </button>

        <button
          onClick={() => setActiveTab('CATALOG_MASTER')}
          className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'CATALOG_MASTER'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderTree className="w-4 h-4 text-emerald-400" />
          <span>Danh mục & Phân loại (POS & SP)</span>
        </button>

        <button
          onClick={() => setActiveTab('SALES_PURCHASE')}
          className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
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

            <div className="space-y-4 text-xs">
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

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <label className="md:col-span-3 text-slate-300 font-semibold">Số điện thoại</label>
                <div className="md:col-span-9">
                  {isEditingStore ? (
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full max-w-md px-3 py-2 rounded-xl glass-input text-xs"
                    />
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-200 max-w-md font-mono">
                      {settings.phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
                <label className="md:col-span-3 text-slate-300 font-semibold pt-2">Địa chỉ</label>
                <div className="md:col-span-9">
                  {isEditingStore ? (
                    <textarea
                      rows={2}
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    />
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-200">
                      {settings.address}
                    </div>
                  )}
                </div>
              </div>

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

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <label className="md:col-span-3 text-slate-300 font-semibold">Mã số thuế/CCCD</label>
                <div className="md:col-span-9">
                  {isEditingStore ? (
                    <input
                      type="text"
                      value={settings.taxCode}
                      onChange={(e) => setSettings({ ...settings, taxCode: e.target.value })}
                      className="w-full max-w-md px-3 py-2 rounded-xl glass-input text-xs font-mono"
                    />
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-200 max-w-md font-mono">
                      {settings.taxCode}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: TIỀN TỆ & HÓA ĐƠN */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white uppercase tracking-wider">TIỀN TỆ & HÓA ĐƠN IN RA</span>
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

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <label className="md:col-span-3 text-slate-300 font-semibold">Loại tiền & Ký hiệu</label>
                <div className="md:col-span-9 flex items-center gap-3">
                  <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-white font-bold w-28">
                    {settings.currency}
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-emerald-400 font-bold w-20 text-center font-mono">
                    {settings.currencySymbol}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <label className="md:col-span-3 text-slate-300 font-semibold">Lời chào chân trang bill</label>
                <div className="md:col-span-9">
                  {isEditingCurrency ? (
                    <input
                      type="text"
                      value={settings.receiptFooter}
                      onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                      className="w-full max-w-xl px-3 py-2 rounded-xl glass-input text-xs"
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
        </div>
      )}

      {/* TAB 2: QUẢN LÝ DANH MỤC & PHÂN LOẠI (MASTER CATALOGS) */}
      {activeTab === 'CATALOG_MASTER' && (
        <div className="space-y-5">
          {/* Sub Navigation for Catalogs */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'CATEGORIES', label: '1. Nhóm hàng (POS & SP)', icon: FolderTree, count: categories.length, color: 'text-blue-400' },
                { id: 'BRANDS', label: '2. Thương hiệu', icon: Tag, count: brands.length, color: 'text-purple-400' },
                { id: 'LOCATIONS', label: '3. Vị trí kho & Kệ', icon: MapPin, count: locations.length, color: 'text-amber-400' },
                { id: 'UNITS', label: '4. Đơn vị tính (ĐVT)', icon: Scale, count: units.length, color: 'text-emerald-400' },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = catalogSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCatalogSubTab(tab.id as any);
                      setCatalogSearch('');
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : tab.color}`} />
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Filter Search inside Sub Tab */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Tìm kiếm danh mục..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          {/* SUB-TAB 1: NHÓM HÀNG (CATEGORIES) */}
          {catalogSubTab === 'CATEGORIES' && (
            <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-blue-400" />
                    <span>DANH SÁCH NHÓM HÀNG (ĐỒNG BỘ THANH POS & BỘ LỌC)</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Quản lý tên nhóm, biểu tượng icon và bật/tắt hiển thị trên thanh bấm nhanh POS
                  </p>
                </div>

                {isAdmin && (
                  <button
                    onClick={handleOpenAddCategory}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm Nhóm Hàng</span>
                  </button>
                )}
              </div>

              {/* Categories Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3 w-16 text-center">Icon</th>
                      <th className="p-3">Tên Nhóm Hàng</th>
                      <th className="p-3 text-center">Hiện trên POS</th>
                      <th className="p-3 text-center">Số lượng Sản phẩm</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {categories
                      .filter((c) => c.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                      .map((cat, idx) => (
                        <tr key={cat.name || idx} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3 text-center text-lg">{cat.icon || '🏷️'}</td>
                          <td className="p-3 font-bold text-white text-sm">{cat.name}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleToggleCategoryPos(cat)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all inline-flex items-center gap-1.5 ${
                                cat.showOnPos !== false
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                              }`}
                            >
                              {cat.showOnPos !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              <span>{cat.showOnPos !== false ? 'Hiển thị' : 'Đang ẩn'}</span>
                            </button>
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                              {cat.productCount || 0} sản phẩm
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {isAdmin && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditCategory(cat)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-all"
                                  title="Chỉnh sửa nhóm hàng"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat.name)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition-all"
                                  title="Xóa nhóm hàng"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: THƯƠNG HIỆU (BRANDS) */}
          {catalogSubTab === 'BRANDS' && (
            <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-400" />
                    <span>DANH SÁCH THƯƠNG HIỆU / NHÀ SẢN XUẤT</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">Quản lý nhãn hàng, hãng sản xuất áp dụng cho sản phẩm</p>
                </div>

                {isAdmin && (
                  <button
                    onClick={handleOpenAddBrand}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm Thương Hiệu</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3 w-16 text-center">#</th>
                      <th className="p-3">Tên Thương Hiệu</th>
                      <th className="p-3 text-center">Số lượng Sản phẩm</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {brands
                      .filter((b) => b.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                      .map((brand, idx) => (
                        <tr key={brand.name || idx} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                          <td className="p-3 font-bold text-purple-300 text-sm">{brand.name}</td>
                          <td className="p-3 text-center">
                            <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20">
                              {brand.productCount || 0} sản phẩm
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {isAdmin && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditBrand(brand)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition-all"
                                  title="Chỉnh sửa thương hiệu"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBrand(brand.name)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition-all"
                                  title="Xóa thương hiệu"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: VỊ TRÍ KHO & KỆ HÀNG (LOCATIONS) */}
          {catalogSubTab === 'LOCATIONS' && (
            <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>DANH SÁCH VỊ TRÍ LƯU KHO & KỆ HÀNG</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">Giúp nhân viên tìm kiếm vị trí hàng hóa nhanh chóng trong cửa hàng</p>
                </div>

                {isAdmin && (
                  <button
                    onClick={handleOpenAddLocation}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-600/30 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm Vị Trí Kho</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3 w-16 text-center">#</th>
                      <th className="p-3">Tên Vị Trí Kho / Kệ</th>
                      <th className="p-3 text-center">Số lượng Sản phẩm</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {locations
                      .filter((l) => l.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                      .map((loc, idx) => (
                        <tr key={loc.name || idx} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                          <td className="p-3 font-bold text-amber-300 text-sm">📍 {loc.name}</td>
                          <td className="p-3 text-center">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                              {loc.productCount || 0} sản phẩm
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {isAdmin && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditLocation(loc)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white transition-all"
                                  title="Chỉnh sửa vị trí kho"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLocation(loc.name)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition-all"
                                  title="Xóa vị trí kho"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 4: ĐƠN VỊ TÍNH (UNITS) */}
          {catalogSubTab === 'UNITS' && (
            <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    <span>DANH SÁCH ĐƠN VỊ TÍNH (ĐVT) CHUẨN</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">Đơn vị cơ bản và các cấp quy đổi (Lon, Chai, Lốc, Thùng, Hộp...)</p>
                </div>

                {isAdmin && (
                  <button
                    onClick={handleOpenAddUnit}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm Đơn Vị Tính</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3 w-16 text-center">#</th>
                      <th className="p-3">Tên Đơn Vị Tính (ĐVT)</th>
                      <th className="p-3 text-center">Số lượng Sản phẩm</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {units
                      .filter((u) => u.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                      .map((unit, idx) => (
                        <tr key={unit.name || idx} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                          <td className="p-3 font-bold text-emerald-400 text-sm">{unit.name}</td>
                          <td className="p-3 text-center">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                              {unit.productCount || 0} sản phẩm
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {isAdmin && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditUnit(unit)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-all"
                                  title="Chỉnh sửa ĐVT"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUnit(unit.name)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition-all"
                                  title="Xóa ĐVT"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MUA HÀNG BÁN HÀNG */}
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

      {/* --- MODAL CATEGORY --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-blue-400" />
                <span>{editingCategory ? 'Chỉnh Sửa Nhóm Hàng' : 'Thêm Nhóm Hàng Mới'}</span>
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên nhóm hàng (*)</label>
                <input
                  type="text"
                  required
                  value={catNameInput}
                  onChange={(e) => setCatNameInput(e.target.value)}
                  placeholder="VD: Nước Giải Khát & Đồ Uống..."
                  className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Biểu tượng Icon đại diện</label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shadow-inner">
                    {catIconInput}
                  </div>
                  <input
                    type="text"
                    value={catIconInput}
                    onChange={(e) => setCatIconInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
                    placeholder="Nhập hoặc bấm chọn emoji bên dưới"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800 max-h-24 overflow-y-auto">
                  {EMOJI_LIST.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setCatIconInput(em)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center hover:bg-slate-800 transition-all ${
                        catIconInput === em ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-900'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={catShowOnPosInput}
                    onChange={(e) => setCatShowOnPosInput(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                  />
                  <div>
                    <span className="text-white font-bold block">Hiển thị trên thanh chọn nhanh POS</span>
                    <span className="text-slate-400 text-[11px] block">Cho phép thu ngân bấm lọc nhanh theo nhóm này</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30"
                >
                  {editingCategory ? 'Lưu Thay Đổi' : 'Tạo Nhóm Hàng'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL BRAND --- */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-400" />
                <span>{editingBrand ? 'Chỉnh Sửa Thương Hiệu' : 'Thêm Thương Hiệu Mới'}</span>
              </h3>
              <button onClick={() => setIsBrandModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên thương hiệu (*)</label>
                <input
                  type="text"
                  required
                  value={brandNameInput}
                  onChange={(e) => setBrandNameInput(e.target.value)}
                  placeholder="VD: Vinamilk, Coca-Cola, Masan..."
                  className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-white text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
                >
                  {editingBrand ? 'Lưu Thay Đổi' : 'Tạo Thương Hiệu'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL LOCATION --- */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{editingLocation ? 'Chỉnh Sửa Vị Trí Kho' : 'Thêm Vị Trí Kho Mới'}</span>
              </h3>
              <button onClick={() => setIsLocationModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên vị trí kho / Kệ hàng (*)</label>
                <input
                  type="text"
                  required
                  value={locationNameInput}
                  onChange={(e) => setLocationNameInput(e.target.value)}
                  placeholder="VD: Kệ Nước A1 - Dãy 1, Kho Lạnh 01..."
                  className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-white text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30"
                >
                  {editingLocation ? 'Lưu Thay Đổi' : 'Tạo Vị Trí Kho'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL UNIT --- */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>{editingUnit ? 'Chỉnh Sửa Đơn Vị Tính' : 'Thêm Đơn Vị Tính Mới'}</span>
              </h3>
              <button onClick={() => setIsUnitModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên đơn vị tính (*)</label>
                <input
                  type="text"
                  required
                  value={unitNameInput}
                  onChange={(e) => setUnitNameInput(e.target.value)}
                  placeholder="VD: Lon, Chai, Lốc, Thùng, Gói, Kg..."
                  className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-white text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
                >
                  {editingUnit ? 'Lưu Thay Đổi' : 'Tạo Đơn Vị Tính'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsUnitModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
