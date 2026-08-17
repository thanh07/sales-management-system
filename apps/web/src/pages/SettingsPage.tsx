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
  EyeOff,
  ShoppingBag,
  Sliders,
  CheckCircle2,
  Lock,
  Zap,
  CreditCard,
  Building,
  AlertTriangle
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
  { code: 'VIB', name: 'VIB - Quốc Tế VN' },
  { code: 'OCB', name: 'OCB - Phương Đông' },
  { code: 'SHB', name: 'SHB - Sài Gòn - Hà Nội' },
  { code: 'HDB', name: 'HDBank - Phát Triển TP.HCM' },
  { code: 'MSB', name: 'MSB - Hàng Hải VN' },
  { code: 'LPB', name: 'LPBank - Lộc Phát VN' },
  { code: 'SEAB', name: 'SeABank - Đông Nam Á' },
  { code: 'MOMO', name: 'Ví MoMo - QR Tài khoản' },
];

const EMOJI_LIST = ['🥤', '🥛', '🍜', '🧂', '🍪', '🧼', '📦', '🥩', '🥬', '🍞', '🍦', '☕', '🍺', '📱', '👕', '🎁', '🍎', '🧴', '🥚', '🥫', '🏷️'];

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'POS_RULES' | 'RBAC_MATRIX' | 'STORE_PROFILE' | 'PRINT_PAYMENTS' | 'MASTER_CATALOGS'>('POS_RULES');
  const [catalogSubTab, setCatalogSubTab] = useState<'CATEGORIES' | 'BRANDS' | 'LOCATIONS' | 'UNITS'>('CATEGORIES');

  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    printVietQRReceipt: true,
    vietQrTemplate: 'compact2',

    // POS Rules
    allowNegativeStock: false,
    allowCustomerDebt: true,
    maxDebtLimitPerCustomer: 5000000,
    maxDiscountPercent: 10,
    allowCashierChangePrice: false,
    autoPrintInvoice: true,
    roundCashAmount: true,
  });

  const [originalSettings, setOriginalSettings] = useState({ ...settings });

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res: any = await api.get('/settings');
      if (res.data) {
        setSettings({ ...settings, ...res.data });
        setOriginalSettings({ ...settings, ...res.data });
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

  const handleSaveGlobalSettings = async () => {
    if (!isAdmin) {
      alert('Chỉ tài khoản Admin mới có quyền thay đổi thiết lập hệ thống!');
      return;
    }
    try {
      setIsLoading(true);
      const res: any = await api.put('/settings', settings);
      setSettings({ ...settings, ...res.data });
      setOriginalSettings({ ...settings, ...res.data });
      showToast('Đã lưu toàn bộ cấu hình hệ thống thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu thiết lập');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToOriginal = () => {
    setSettings({ ...originalSettings });
    showToast('Đã phục hồi cấu hình ban đầu!');
  };

  const handleResetAllData = async () => {
    if (confirm('⚠️ BẠN CÓ CHẮC CHẮN MUỐN XÓA TOÀN BỘ DỮ LIỆU ĐƠN HÀNG VÀ NẠP LẠI 100 SẢN PHẨM MỚI CHO TẤT CẢ CÁC CHI NHÁNH KHÔNG?')) {
      try {
        setIsLoading(true);
        await api.post('/settings/reset-data');
        alert('✅ Đã xóa sạch dữ liệu ứng dụng và tái nạp 100 sản phẩm với đầy đủ số lượng tồn kho cho tất cả 3 chi nhánh!');
        window.location.reload();
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa và nạp lại dữ liệu');
      } finally {
        setIsLoading(false);
      }
    }
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

  const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(n || 0) + ' đ';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto min-h-screen text-slate-200 pb-24">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Centralized Control Hub Header Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Thiết Lập Hệ Thống (Centralized Control Hub)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] border border-purple-500/30">
                Admin Super Control
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Trung tâm cấu hình tập trung quy tắc bán hàng, mẫu hóa đơn K80, VietQR và thông tin chuỗi
            </p>
          </div>
        </div>

        {/* Header Actions */}
        {isAdmin && (
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleResetAllData}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-red-500/40 shadow"
              title="Xóa toàn bộ dữ liệu đơn hàng và nạp lại 100 sản phẩm với tồn kho đầy đủ cho tất cả chi nhánh"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Reset & Nạp 100 SP/Chi Nhánh</span>
            </button>
            <button
              onClick={handleResetToOriginal}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Hoàn tác</span>
            </button>
            <button
              onClick={handleSaveGlobalSettings}
              disabled={isLoading}
              className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Đang lưu...' : 'Lưu Toàn Bộ Cấu Hình'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Settings Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm nhanh cấu hình... (Gõ: 'bán âm', 'nợ', 'giảm giá', 'K80', 'VietQR', 'tên cửa hàng', 'nhóm hàng'...)"
          className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-xs font-semibold"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Hub Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('POS_RULES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'POS_RULES'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-blue-400" />
          <span>1. Quy Tắc Bán Hàng POS</span>
        </button>

        <button
          onClick={() => setActiveTab('RBAC_MATRIX')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'RBAC_MATRIX'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>2. Bảng Phân Quyền Vai Trò (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveTab('STORE_PROFILE')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'STORE_PROFILE'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Store className="w-4 h-4 text-cyan-400" />
          <span>3. Thông Tin Cửa Hàng & Chuỗi</span>
        </button>

        <button
          onClick={() => setActiveTab('PRINT_PAYMENTS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'PRINT_PAYMENTS'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>4. Mẫu In Hóa Đơn & VietQR</span>
        </button>

        <button
          onClick={() => setActiveTab('MASTER_CATALOGS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'MASTER_CATALOGS'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FolderTree className="w-4 h-4 text-purple-400" />
          <span>5. Danh Mục Dùng Chung ({categories.length + brands.length + locations.length + units.length})</span>
        </button>
      </div>

      {/* HUB CONTENT 1: QUY TẮC BÁN HÀNG POS */}
      {activeTab === 'POS_RULES' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-white">Cấu Hình Quy Tắc Bán Hàng & Giới Hạn Thu Ngân (POS Operational Rules)</h2>
                <p className="text-xs text-slate-400">Kiểm soát chặt chẽ việc bán nợ, bán âm kho, giới hạn giảm giá nhằm tránh tổn thất gian lận</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Rule 1: Bán âm kho */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <span>Cho phép Bán âm kho</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${settings.allowNegativeStock ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                      {settings.allowNegativeStock ? 'Đang Bật' : 'Đang Tắt'}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Cho phép thu ngân bán xuất hàng lẻ ngay cả khi số lượng tồn kho trên máy bằng 0 hoặc âm.
                  </p>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={settings.allowNegativeStock}
                  onChange={(e) => setSettings({ ...settings, allowNegativeStock: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 bg-slate-950 border-slate-700 cursor-pointer mt-1"
                />
              </div>

              {/* Rule 2: Cho nợ & Hạn mức nợ */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span>Cho phép Khách hàng mua nợ (Ghi Nợ)</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${settings.allowCustomerDebt ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                        {settings.allowCustomerDebt ? 'Đang Bật' : 'Đang Tắt'}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      Hiển thị phương thức ghi nợ trên màn hình Thu ngân và ghi nhận sổ nợ cho khách hàng thân thiết.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={settings.allowCustomerDebt}
                    onChange={(e) => setSettings({ ...settings, allowCustomerDebt: e.target.checked })}
                    className="w-5 h-5 rounded text-blue-600 bg-slate-950 border-slate-700 cursor-pointer mt-1"
                  />
                </div>

                {settings.allowCustomerDebt && (
                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-slate-300 font-semibold mb-1">Hạn mức nợ tối đa cho 1 Khách hàng (VNĐ)</label>
                    <input
                      type="number"
                      disabled={!isAdmin}
                      min="0"
                      step="500000"
                      value={settings.maxDebtLimitPerCustomer}
                      onChange={(e) => setSettings({ ...settings, maxDebtLimitPerCustomer: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl glass-input font-mono font-bold text-emerald-400"
                    />
                  </div>
                )}
              </div>

              {/* Rule 3: Mức giảm giá tối đa (%) */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Giới hạn % Giảm Giá tối đa của Thu Ngân</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Ngăn chặn thu ngân tự ý chiết khấu giảm giá quá mức quy định trên hóa đơn bán lẻ.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="number"
                    disabled={!isAdmin}
                    min="0"
                    max="100"
                    value={settings.maxDiscountPercent}
                    onChange={(e) => setSettings({ ...settings, maxDiscountPercent: Number(e.target.value) })}
                    className="w-24 px-3 py-2 rounded-xl glass-input font-mono font-bold text-amber-400 text-center text-sm"
                  />
                  <span className="font-bold text-slate-300 text-sm">% (Tối đa giảm {settings.maxDiscountPercent}%)</span>
                </div>
              </div>

              {/* Rule 4: Sửa giá lẻ trực tiếp */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <span>Cho phép Thu ngân tự đổi giá bán lẻ tại quầy</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${settings.allowCashierChangePrice ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                      {settings.allowCashierChangePrice ? 'Cho Phép' : 'Khóa'}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Nếu tắt, thu ngân bắt buộc bán đúng giá bán lẻ công bố trong bảng giá và không thể gõ lại đơn giá sản phẩm.
                  </p>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={settings.allowCashierChangePrice}
                  onChange={(e) => setSettings({ ...settings, allowCashierChangePrice: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 bg-slate-950 border-slate-700 cursor-pointer mt-1"
                />
              </div>

              {/* Rule 5: Tự động in hóa đơn */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <span>Tự động mở in Hóa đơn khi Thanh toán</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${settings.autoPrintInvoice ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'}`}>
                      {settings.autoPrintInvoice ? 'Tự Động In' : 'Thủ Công'}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Tự động gọi lệnh máy in ngay sau khi thu ngân bấm thanh toán đơn hàng thành công.
                  </p>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={settings.autoPrintInvoice}
                  onChange={(e) => setSettings({ ...settings, autoPrintInvoice: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 bg-slate-950 border-slate-700 cursor-pointer mt-1"
                />
              </div>

              {/* Rule 6: Làm tròn tiền lẻ */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <span>Làm tròn tiền lẻ khi thu tiền mặt</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${settings.roundCashAmount ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {settings.roundCashAmount ? 'Đã Bật' : 'Không'}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Tự động làm tròn tiền tổng thanh toán đến mốc 500đ / 1.000đ gần nhất giúp thối tiền nhanh hơn.
                  </p>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={settings.roundCashAmount}
                  onChange={(e) => setSettings({ ...settings, roundCashAmount: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 bg-slate-950 border-slate-700 cursor-pointer mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HUB CONTENT 2: BẢNG PHÂN QUYỀN VAI TRÒ NGƯỜI DÙNG (RBAC MATRIX STUDIO) */}
      {activeTab === 'RBAC_MATRIX' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white">Ma Trận Phân Quyền Vai Trò Người Dùng (Role & Permission Matrix Studio)</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Quy định và kiểm soát trực quan quyền hạn truy cập chức năng hệ thống của 4 nhóm vai trò</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5 shadow">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Chuẩn RBAC MISA eShop</span>
                </span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-xl">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 w-72 min-w-[220px]">Chức Năng / Menu Sidebar</th>
                    <th className="p-4 text-center text-blue-400">🛡️ ADMIN<br/><span className="text-[10px] text-slate-400 font-normal font-sans">(Quản trị tối cao)</span></th>
                    <th className="p-4 text-center text-indigo-400">🏬 MANAGER<br/><span className="text-[10px] text-slate-400 font-normal font-sans">(Quản lý Chi nhánh)</span></th>
                    <th className="p-4 text-center text-amber-400">📦 WAREHOUSE<br/><span className="text-[10px] text-slate-400 font-normal font-sans">(Thủ kho)</span></th>
                    <th className="p-4 text-center text-emerald-400">🛍️ SALE / CASHIER<br/><span className="text-[10px] text-slate-400 font-normal font-sans">(Tư vấn Bán hàng)</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-medium">
                  {/* Row 1: POS */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-blue-400" />
                      <span>🛒 Bán quầy (POS)</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Tất cả
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Tất cả
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]">
                        ❌ Ẩn
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ CHÍNH (Full POS)
                      </span>
                    </td>
                  </tr>

                  {/* Row 2: Dashboard */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <span>📊 Tổng quan (Dashboard)</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Toàn chuỗi
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Chi nhánh mình
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]">
                        ❌ Ẩn
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]">
                        ❌ ẨN HOÀN TOÀN
                      </span>
                    </td>
                  </tr>

                  {/* Row 3: Products */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Store className="w-4 h-4 text-emerald-400" />
                      <span>📦 Sản phẩm & Kho</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Full (Sửa/Xóa/Giá vốn)
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Sửa/Xem tồn kho
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Thêm/Sửa/Nhập kho
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                        👁️ Chỉ XEM (Ẩn Giá vốn & Ẩn nút Sửa/Xóa)
                      </span>
                    </td>
                  </tr>

                  {/* Row 4: Branches */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span>🏢 Chi nhánh</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Full CRUD
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                        👁️ Chỉ xem CN mình
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]">
                        ❌ Ẩn
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]">
                        ❌ ẨN HOÀN TOÀN
                      </span>
                    </td>
                  </tr>

                  {/* Row 5: Price Lists */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-400" />
                      <span>🏷️ Thiết lập Bảng giá</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Full CRUD
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                        👁️ Chỉ xem
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]">
                        ❌ Ẩn
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]">
                        ❌ ẨN HOÀN TOÀN
                      </span>
                    </td>
                  </tr>

                  {/* Row 6: CRM */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Building className="w-4 h-4 text-purple-400" />
                      <span>👥 Khách hàng (CRM)</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Full CRUD
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Chi nhánh
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]">
                        ❌ Ẩn
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Tìm & Thêm Khách tại POS
                      </span>
                    </td>
                  </tr>

                  {/* Row 7: Users */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>👤 Quản lý Nhân viên</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Full CRUD
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                        👁️ Nhân viên CN mình
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]">
                        ❌ Ẩn
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]">
                        ❌ ẨN HOÀN TOÀN
                      </span>
                    </td>
                  </tr>

                  {/* Row 8: Reports */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>📈 Báo cáo doanh thu</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Full Báo cáo
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Báo cáo CN mình
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                        👁️ Báo cáo kho
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]">
                        ❌ ẨN HOÀN TOÀN
                      </span>
                    </td>
                  </tr>

                  {/* Row 9: Settings */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      <span>⚙️ Thiết lập chung</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Full Control
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]">
                        ❌ Ẩn
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]">
                        ❌ Ẩn
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]">
                        ❌ ẨN HOÀN TOÀN
                      </span>
                    </td>
                  </tr>

                  {/* Row 10: Header Branch Switcher */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-cyan-400" />
                      <span>🔄 Đổi Chi nhánh trên Header</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Chọn mọi kho
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                        🔒 Khóa đúng CN mình
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                        🔒 Khóa đúng CN mình
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]">
                        🔒 KHÓA CỨNG CHI NHÁNH LÀM VIỆC
                      </span>
                    </td>
                  </tr>

                  {/* Row 11: Cost Price Column */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <span>👁️ Hiển thị Cột Giá Vốn</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Hiển thị
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Hiển thị
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                        ✅ Hiển thị
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]">
                        ❌ ẨN HOÀN TOÀN
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* HUB CONTENT 3: THÔNG TIN CỬA HÀNG & PHÂN CẤP CHUỖI */}
      {activeTab === 'STORE_PROFILE' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Hồ Sơ Cửa Hàng & Cấu Hình Quản Lý Chuỗi Chi Nhánh</h2>
              <p className="text-xs text-slate-400">Thiết lập thông tin thương hiệu, mã số thuế và quy tắc đồng bộ toàn chuỗi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Tên Cửa Hàng / Tên Chuỗi (*)</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input font-bold text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Số Điện Thoại Hotline (*)</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input font-mono font-bold text-blue-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Mã Số Thuế Doanh Nghiệp (*)</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={settings.taxCode}
                onChange={(e) => setSettings({ ...settings, taxCode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input font-mono font-bold text-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Tỉnh / Thành Phố</label>
              <select
                disabled={!isAdmin}
                value={settings.city}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs"
              >
                {VIETNAM_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1.5">Địa Chỉ Chi Tiết In Đầu Hóa Đơn</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* HUB CONTENT 3: MẪU IN HÓA ĐƠN & VIETQR */}
      {activeTab === 'PRINT_PAYMENTS' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-white">Cấu Hình Mẫu In Hóa Đơn K80 & Mã VietQR Chuyển Khoản</h2>
                <p className="text-xs text-slate-400">Tùy chỉnh khổ in, tiêu đề hóa đơn và cài đặt tài khoản ngân hàng sinh VietQR tự động in lên Bill</p>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={handleSaveGlobalSettings}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Cấu Hình</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Configuration Form */}
            <div className="lg:col-span-7 space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Khổ giấy in Hóa đơn mặc định</label>
                  <select
                    disabled={!isAdmin}
                    value={settings.paperSize}
                    onChange={(e: any) => setSettings({ ...settings, paperSize: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs"
                  >
                    <option value="K80">Khổ Giấy K80 (80mm - Siêu thị / Tạp hóa phổ biến nhất)</option>
                    <option value="K58">Khổ Giấy K58 (58mm - Máy in bill cầm tay Bluetooth)</option>
                    <option value="A4">Khổ Giấy A4 / A5 (Hóa đơn GTGT / Bán buôn)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Ngân Hàng Nhận Tiền Chuyển Khoản VietQR (*)</label>
                  <select
                    disabled={!isAdmin}
                    value={settings.bankCode}
                    onChange={(e) => {
                      const bObj = VIETNAM_BANKS.find((x) => x.code === e.target.value);
                      setSettings({
                        ...settings,
                        bankCode: e.target.value,
                        bankName: bObj?.name || e.target.value,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs"
                  >
                    {VIETNAM_BANKS.map((b) => (
                      <option key={b.code} value={b.code}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-blue-400 font-semibold mb-1.5">Số Tài Khoản Ngân Hàng (*)</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={settings.bankAccountNo}
                    onChange={(e) => setSettings({ ...settings, bankAccountNo: e.target.value.replace(/\s+/g, '') })}
                    placeholder="VD: 999988886666"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input font-mono font-bold text-blue-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-emerald-400 font-semibold mb-1.5">Tên Chủ Tài Khoản Ngân Hàng (*)</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={settings.bankAccountName}
                    onChange={(e) => setSettings({ ...settings, bankAccountName: e.target.value.toUpperCase() })}
                    placeholder="VD: NGUYEN VAN THANH"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input font-mono font-bold text-emerald-400 uppercase text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1.5">Tiêu đề Hóa Đơn In</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={settings.receiptHeader}
                    onChange={(e) => setSettings({ ...settings, receiptHeader: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold text-slate-200"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1.5">Lời Cảm Ơn In Chân Hóa Đơn</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={settings.receiptFooter}
                    onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold text-slate-200"
                  />
                </div>
              </div>

              {/* VietQR Features Toggles */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-blue-400" />
                      <span>1. Kích hoạt tính năng thanh toán Chuyển Khoản VietQR</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Hiển thị tab Chuyển khoản QR tại màn hình thanh toán POS thu ngân.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={settings.enableVietQR !== false}
                    onChange={(e) => setSettings({ ...settings, enableVietQR: e.target.checked })}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                  />
                </div>

                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                      <Printer className="w-4 h-4 text-emerald-400" />
                      <span>2. Tự động in mã QR chuyển khoản lên Hóa đơn (Bill K80/K58)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tự động tính tiền và in mã VietQR kèm mã đơn hàng vào bill để khách quét trả tiền.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={settings.printVietQRReceipt !== false}
                    onChange={(e) => setSettings({ ...settings, printVietQRReceipt: e.target.checked })}
                    className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Live VietQR & Thermal Invoice Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Xem Trước Mã VietQR Động</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    Chuẩn Napas 247
                  </span>
                </div>

                {settings.bankAccountNo ? (
                  <div className="bg-white text-slate-900 p-5 rounded-2xl border border-slate-300 shadow-xl flex flex-col items-center text-center">
                    <div className="font-extrabold text-xs uppercase text-blue-900 tracking-wider mb-2">
                      {settings.bankName || settings.bankCode}
                    </div>
                    {/* Pure Large High-Resolution QR Code (qr_only) without extra clutter */}
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                      <img
                        src={`https://img.vietqr.io/image/${settings.bankCode || 'MB'}-${settings.bankAccountNo}-qr_only.png?amount=50000&addInfo=HD99999&accountName=${encodeURIComponent(settings.bankAccountName || '')}`}
                        alt="VietQR Preview"
                        className="w-56 h-56 object-contain"
                      />
                    </div>
                    <div className="text-sm font-mono font-black text-blue-800 mt-2.5">
                      STK: {settings.bankAccountNo}
                    </div>
                    <div className="text-xs font-bold uppercase text-slate-800">
                      {settings.bankAccountName || 'CHỦ TÀI KHOẢN'}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    Vui lòng chọn ngân hàng và nhập số tài khoản để hiển thị mã QR xem trước.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HUB CONTENT 4: DANH MỤC QUẢN LÝ DÙNG CHUNG */}
      {activeTab === 'MASTER_CATALOGS' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-white">Quản Lý Danh Mục Cơ Bản Dùng Chung Toàn Chuỗi</h2>
                <p className="text-xs text-slate-400">Quản lý Nhóm Hàng, Thương Hiệu, Vị Trí Kho và Đơn Vị Tính quy đổi</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {catalogSubTab === 'CATEGORIES' && (
                <button onClick={handleOpenAddCategory} className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Thêm Nhóm Hàng</span>
                </button>
              )}
              {catalogSubTab === 'BRANDS' && (
                <button onClick={handleOpenAddBrand} className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Thêm Thương Hiệu</span>
                </button>
              )}
              {catalogSubTab === 'LOCATIONS' && (
                <button onClick={handleOpenAddLocation} className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Thêm Vị Trí Kho</span>
                </button>
              )}
              {catalogSubTab === 'UNITS' && (
                <button onClick={handleOpenAddUnit} className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Thêm ĐVT</span>
                </button>
              )}
            </div>
          </div>

          {/* Catalog Sub Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
            <button
              onClick={() => setCatalogSubTab('CATEGORIES')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${catalogSubTab === 'CATEGORIES' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              📁 Nhóm Hàng ({categories.length})
            </button>
            <button
              onClick={() => setCatalogSubTab('BRANDS')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${catalogSubTab === 'BRANDS' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              🏷️ Thương Hiệu ({brands.length})
            </button>
            <button
              onClick={() => setCatalogSubTab('LOCATIONS')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${catalogSubTab === 'LOCATIONS' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              📍 Vị Trí Kho ({locations.length})
            </button>
            <button
              onClick={() => setCatalogSubTab('UNITS')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${catalogSubTab === 'UNITS' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              ⚖️ Đơn Vị Tính ({units.length})
            </button>
          </div>

          {/* Catalog Grid View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {catalogSubTab === 'CATEGORIES' && categories.map((c) => (
              <div key={c.name} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-white">
                  <span className="text-lg">{c.icon || '🏷️'}</span>
                  <span>{c.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleToggleCategoryPos(c)} className="p-1 rounded text-slate-400 hover:text-blue-400">
                    {c.showOnPos !== false ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                  </button>
                  <button onClick={() => handleOpenEditCategory(c)} className="p-1 rounded text-slate-400 hover:text-blue-400">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteCategory(c.name)} className="p-1 rounded text-slate-400 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {catalogSubTab === 'BRANDS' && brands.map((b) => (
              <div key={b.name || b} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="font-bold text-purple-300">{b.name || b}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenEditBrand(b)} className="p-1 rounded text-slate-400 hover:text-blue-400">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteBrand(b.name || b)} className="p-1 rounded text-slate-400 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {catalogSubTab === 'LOCATIONS' && locations.map((l) => (
              <div key={l.name || l} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="font-bold text-amber-300">{l.name || l}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenEditLocation(l)} className="p-1 rounded text-slate-400 hover:text-blue-400">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteLocation(l.name || l)} className="p-1 rounded text-slate-400 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {catalogSubTab === 'UNITS' && units.map((u) => (
              <div key={u.name || u} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="font-bold text-emerald-300">{u.name || u}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenEditUnit(u)} className="p-1 rounded text-slate-400 hover:text-blue-400">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteUnit(u.name || u)} className="p-1 rounded text-slate-400 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">{editingCategory ? 'Sửa Nhóm Hàng' : 'Thêm Nhóm Hàng Mới'}</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Biểu tượng Icon</label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCatIconInput(emoji)}
                      className={`p-1.5 text-base rounded-lg transition-all ${catIconInput === emoji ? 'bg-blue-600 scale-110' : 'hover:bg-slate-800'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên Nhóm Hàng (*)</label>
                <input
                  type="text"
                  required
                  value={catNameInput}
                  onChange={(e) => setCatNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-white"
                  placeholder="Nhập tên nhóm..."
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={catShowOnPosInput}
                  onChange={(e) => setCatShowOnPosInput(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
                />
                <span className="font-semibold">Hiển thị làm Tab trên màn hình Bán hàng (POS)</span>
              </label>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">{editingBrand ? 'Sửa Thương Hiệu' : 'Thêm Thương Hiệu Mới'}</h3>
              <button onClick={() => setIsBrandModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveBrand} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên Thương Hiệu (*)</label>
                <input
                  type="text"
                  required
                  value={brandNameInput}
                  onChange={(e) => setBrandNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-purple-300"
                  placeholder="Nhập tên thương hiệu..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setIsBrandModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">{editingLocation ? 'Sửa Vị Trí Kho' : 'Thêm Vị Trí Kho Mới'}</h3>
              <button onClick={() => setIsLocationModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveLocation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên Vị Trí Kho (*)</label>
                <input
                  type="text"
                  required
                  value={locationNameInput}
                  onChange={(e) => setLocationNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-amber-300"
                  placeholder="VD: Kệ Nước A1 - Dãy 1..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setIsLocationModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/30">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unit Modal */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">{editingUnit ? 'Sửa Đơn Vị Tính' : 'Thêm Đơn Vị Tính Mới'}</h3>
              <button onClick={() => setIsUnitModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveUnit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên Đơn Vị Tính (*)</label>
                <input
                  type="text"
                  required
                  value={unitNameInput}
                  onChange={(e) => setUnitNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-emerald-300"
                  placeholder="VD: Lon, Chai, Thùng, Lốc..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setIsUnitModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
