import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useBranchStore } from '../store/branchStore';
import { 
  PackagePlus, 
  Truck, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText, 
  Printer, 
  Building2, 
  UserCheck, 
  Filter, 
  X, 
  CreditCard, 
  Sparkles,
  Store,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Tag,
  History,
  Check,
  AlertCircle
} from 'lucide-react';

const SUPPLIER_GROUPS = [
  'Bao bì & Carton',
  'Gốm sứ & Bình hoa',
  'Phụ kiện & Nhựa',
  'Nông sản & Đất trồng',
  'Khác',
];

export const PurchaseOrdersPage: React.FC = () => {
  const { user } = useAuthStore();
  const { branches } = useBranchStore();

  const [activeMainTab, setActiveMainTab] = useState<'PURCHASE_ORDERS' | 'SUPPLIERS'>('PURCHASE_ORDERS');

  // Suppliers States
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierGroupFilter, setSupplierGroupFilter] = useState('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);

  // Supplier Modal States
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [suppCode, setSuppCode] = useState('');
  const [suppName, setSuppName] = useState('');
  const [suppGroup, setSuppGroup] = useState(SUPPLIER_GROUPS[0]);
  const [suppPhone, setSuppPhone] = useState('');
  const [suppEmail, setSuppEmail] = useState('');
  const [suppAddress, setSuppAddress] = useState('');
  const [suppTaxCode, setSuppTaxCode] = useState('');
  const [suppInitialDebt, setSuppInitialDebt] = useState<number>(0);
  const [suppNote, setSuppNote] = useState('');

  // Supplier Detail & Payment History Modal States
  const [isSupplierDetailModalOpen, setIsSupplierDetailModalOpen] = useState(false);
  const [supplierDetailTab, setSupplierDetailTab] = useState<'INFO' | 'POS_HISTORY' | 'PAYMENT_LOGS'>('INFO');
  const [supplierPaymentLogs, setSupplierPaymentLogs] = useState<any[]>([]);

  // Supplier Pay Debt Modal States
  const [isPayDebtModalOpen, setIsPayDebtModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDiscount, setPayDiscount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD'>('CASH');
  const [payNote, setPayNote] = useState('');

  // Purchase Orders States
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [poSearch, setPoSearch] = useState('');
  const [poBranchFilter, setPoBranchFilter] = useState('ALL');
  const [poStatusFilter, setPoStatusFilter] = useState('ALL');

  // Create PO Modal States
  const [isCreatePoModalOpen, setIsCreatePoModalOpen] = useState(false);
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poBranchId, setPoBranchId] = useState(branches[0]?.id || 'branch-01');
  const [poItems, setPoItems] = useState<any[]>([]);
  const [poDiscount, setPoDiscount] = useState<number>(0);
  const [poTax, setPoTax] = useState<number>(0);
  const [poPaidAmount, setPoPaidAmount] = useState<number>(0);
  const [poPaymentMethod, setPoPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD'>('CASH');
  const [poNote, setPoNote] = useState('');

  // Product Autocomplete Search inside Create PO
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // Print/View PO Modal
  const [selectedPo, setSelectedPo] = useState<any | null>(null);
  const [isPrintPoModalOpen, setIsPrintPoModalOpen] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchSuppliers = async () => {
    try {
      const res: any = await api.get('/suppliers');
      const list = Array.isArray(res) ? res : (res?.data || []);
      setSuppliers(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error('Fetch suppliers error:', err);
      setSuppliers([]);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const res: any = await api.get('/purchase-orders');
      const list = Array.isArray(res) ? res : (res?.data || []);
      setPurchaseOrders(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error('Fetch purchase orders error:', err);
      setPurchaseOrders([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const res: any = await api.get('/products');
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : (res?.data?.products || res?.products || []);
      setAllProducts(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error('Fetch products error:', err);
      setAllProducts([]);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchPurchaseOrders();
    fetchProducts();
  }, []);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  // --- SUPPLIER HANDLERS ---
  const handleOpenAddSupplierModal = () => {
    setEditingSupplierId(null);
    setSuppCode(`NCC${Math.floor(100 + Math.random() * 900)}`);
    setSuppName('');
    setSuppGroup(SUPPLIER_GROUPS[0]);
    setSuppPhone('');
    setSuppEmail('');
    setSuppAddress('');
    setSuppTaxCode('');
    setSuppInitialDebt(0);
    setSuppNote('');
    setIsSupplierModalOpen(true);
  };

  const handleOpenEditSupplierModal = (s: any) => {
    setEditingSupplierId(s.id);
    setSuppCode(s.code || '');
    setSuppName(s.name || '');
    setSuppGroup(s.group || SUPPLIER_GROUPS[0]);
    setSuppPhone(s.phone || '');
    setSuppEmail(s.email || '');
    setSuppAddress(s.address || '');
    setSuppTaxCode(s.taxCode || '');
    setSuppInitialDebt(s.initialDebt || 0);
    setSuppNote(s.note || '');
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = async () => {
    if (!suppName.trim()) {
      alert('Vui lòng nhập Tên Nhà cung cấp');
      return;
    }

    const payload = {
      code: suppCode,
      name: suppName,
      group: suppGroup,
      phone: suppPhone,
      email: suppEmail,
      address: suppAddress,
      taxCode: suppTaxCode,
      initialDebt: suppInitialDebt,
      note: suppNote,
    };

    try {
      if (editingSupplierId) {
        await api.put(`/suppliers/${editingSupplierId}`, payload);
        showToast('Cập nhật thông tin Nhà cung cấp thành công!');
      } else {
        await api.post('/suppliers', payload);
        showToast('Thêm mới Nhà cung cấp thành công!');
      }
      setIsSupplierModalOpen(false);
      fetchSuppliers();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu Nhà cung cấp');
    }
  };

  const handleDeleteSupplier = async (s: any) => {
    if (!confirm(`Bạn có chắc muốn xóa Nhà cung cấp "${s.name}"?`)) return;
    try {
      await api.delete(`/suppliers/${s.id}`);
      showToast('Đã xóa Nhà cung cấp');
      fetchSuppliers();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa Nhà cung cấp');
    }
  };

  const handleOpenPayDebtModal = (s: any) => {
    setSelectedSupplier(s);
    setPayAmount(s.debtAmount || 0);
    setPayDiscount(0);
    setPayMethod('CASH');
    setPayNote('');
    setIsPayDebtModalOpen(true);
  };

  const handleSavePayDebt = async () => {
    if (!selectedSupplier) return;
    if (payAmount <= 0 && payDiscount <= 0) {
      alert('Số tiền thanh toán hoặc chiết khấu phải lớn hơn 0');
      return;
    }

    try {
      await api.post(`/suppliers/${selectedSupplier.id}/pay-debt`, {
        amount: payAmount,
        discount: payDiscount,
        paymentMethod: payMethod,
        note: payNote,
        creatorName: `${user?.fullName || 'Quản lý'} (${user?.role || 'ADMIN'})`,
      });
      showToast(`Đã thanh toán nợ cho "${selectedSupplier.name}"!`);
      setIsPayDebtModalOpen(false);
      fetchSuppliers();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thanh toán nợ');
    }
  };

  const handleOpenSupplierDetailModal = async (s: any) => {
    setSelectedSupplier(s);
    setSupplierDetailTab('INFO');
    setIsSupplierDetailModalOpen(true);
    try {
      const res: any = await api.get(`/suppliers/${s.id}/payments`);
      setSupplierPaymentLogs(res.data || []);
    } catch (err) {
      setSupplierPaymentLogs([]);
    }
  };

  // --- PURCHASE ORDER HANDLERS ---
  const handleOpenCreatePoModal = () => {
    setPoSupplierId(suppliers[0]?.id || '');
    setPoBranchId(branches[0]?.id || 'branch-01');
    setPoItems([]);
    setPoDiscount(0);
    setPoTax(0);
    setPoPaidAmount(0);
    setPoPaymentMethod('CASH');
    setPoNote('');
    setProductSearchQuery('');
    setIsCreatePoModalOpen(true);
  };

  const handleAddProductToPo = (prod: any) => {
    if (!prod) return;
    const defaultUnit = prod.unit || 'Cái';
    const defaultRatio = 1;
    const importPrice = prod.costPrice || Math.round((prod.sellingPrice || 0) * 0.7);
    const prodCode = prod.code || prod.sku || 'SP000';
    const prodName = prod.name || 'Sản phẩm không tên';

    const existingIndex = poItems.findIndex((i) => i.productId === prod.id && i.unit === defaultUnit);
    if (existingIndex > -1) {
      const updated = [...poItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].baseQuantity = updated[existingIndex].quantity * updated[existingIndex].unitRatio;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].importPrice;
      setPoItems(updated);
    } else {
      setPoItems([
        ...poItems,
        {
          productId: prod.id,
          productCode: prodCode,
          productName: prodName,
          unit: defaultUnit,
          unitRatio: defaultRatio,
          quantity: 1,
          baseQuantity: 1,
          importPrice,
          subtotal: importPrice,
          availableConversions: prod.conversions || [],
        },
      ]);
    }
    setProductSearchQuery('');
    setIsProductDropdownOpen(false);
  };

  const handleUpdatePoItem = (index: number, field: string, value: any) => {
    const updated = [...poItems];
    const item = { ...updated[index] };

    if (field === 'unit') {
      item.unit = value;
      if (value === 'Cái') {
        item.unitRatio = 1;
      } else {
        const conv = item.availableConversions?.find((c: any) => c.unitName === value);
        item.unitRatio = conv ? conv.conversionRate : 1;
      }
      item.baseQuantity = item.quantity * item.unitRatio;
      item.subtotal = item.quantity * item.importPrice;
    } else if (field === 'quantity') {
      item.quantity = Math.max(1, Number(value) || 1);
      item.baseQuantity = item.quantity * item.unitRatio;
      item.subtotal = item.quantity * item.importPrice;
    } else if (field === 'importPrice') {
      item.importPrice = Math.max(0, Number(value) || 0);
      item.subtotal = item.quantity * item.importPrice;
    }

    updated[index] = item;
    setPoItems(updated);
  };

  const handleRemovePoItem = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const calculatePoTotals = () => {
    const subtotal = poItems.reduce((sum, item) => sum + item.subtotal, 0);
    const finalTotal = Math.max(0, subtotal - poDiscount + poTax);
    const debtRemainder = Math.max(0, finalTotal - poPaidAmount);
    return { subtotal, finalTotal, debtRemainder };
  };

  const handleSavePurchaseOrder = async (isComplete: boolean = true) => {
    if (poItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 mặt hàng nhập kho');
      return;
    }

    const branch = branches.find((b) => b.id === poBranchId);
    const supplier = suppliers.find((s) => s.id === poSupplierId);

    const payload = {
      supplierId: poSupplierId,
      supplierName: supplier ? supplier.name : 'Nhà cung cấp lẻ',
      branchId: poBranchId,
      branchName: branch ? branch.name : 'Chi nhánh mặc định',
      creatorName: `${user?.fullName || 'Quản lý'} (${user?.role || 'ADMIN'})`,
      items: poItems,
      discount: poDiscount,
      tax: poTax,
      paidAmount: poPaidAmount,
      paymentMethod: poPaymentMethod,
      status: isComplete ? 'COMPLETED' : 'DRAFT',
      note: poNote,
    };

    try {
      const res: any = await api.post('/purchase-orders', payload);
      showToast(isComplete ? 'Duyệt nhập kho & Cập nhật giá vốn WAC thành công!' : 'Đã lưu nháp Phiếu nhập kho!');
      setIsCreatePoModalOpen(false);
      fetchPurchaseOrders();
      fetchSuppliers();
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu phiếu nhập kho');
    }
  };

  const handleCompleteDraftPo = async (po: any) => {
    if (!confirm(`Bạn có chắc chắn muốn Duyệt Hoàn Tất phiếu nhập "${po.code}"? Tồn kho và giá vốn bình quân sẽ được cập nhật ngay lập tức.`)) return;
    try {
      await api.post(`/purchase-orders/${po.id}/complete`);
      showToast(`Đã duyệt hoàn tất nhập kho phiếu "${po.code}"!`);
      fetchPurchaseOrders();
      fetchSuppliers();
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi duyệt phiếu');
    }
  };

  // Filtered Lists
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const safePurchaseOrders = Array.isArray(purchaseOrders) ? purchaseOrders : [];
  const safeProducts = Array.isArray(allProducts) ? allProducts : [];

  const filteredSuppliers = safeSuppliers.filter((s) => {
    const q = supplierSearch.toLowerCase().trim();
    const nameStr = s?.name ? String(s.name).toLowerCase() : '';
    const codeStr = s?.code ? String(s.code).toLowerCase() : '';
    const phoneStr = s?.phone ? String(s.phone).toLowerCase() : '';
    const emailStr = s?.email ? String(s.email).toLowerCase() : '';

    const matchesQuery =
      nameStr.includes(q) ||
      codeStr.includes(q) ||
      phoneStr.includes(q) ||
      emailStr.includes(q);
    const matchesGroup = supplierGroupFilter === 'ALL' || s.group === supplierGroupFilter;
    return matchesQuery && matchesGroup;
  });

  const filteredPurchaseOrders = safePurchaseOrders.filter((po) => {
    const q = poSearch.toLowerCase().trim();
    const codeStr = po?.code ? String(po.code).toLowerCase() : '';
    const suppNameStr = po?.supplierName ? String(po.supplierName).toLowerCase() : '';

    const matchesQuery =
      codeStr.includes(q) ||
      suppNameStr.includes(q) ||
      (Array.isArray(po?.items) &&
        po.items.some((i: any) => {
          const iName = i?.productName ? String(i.productName).toLowerCase() : '';
          const iCode = i?.productCode ? String(i.productCode).toLowerCase() : '';
          return iName.includes(q) || iCode.includes(q);
        }));

    const matchesBranch = poBranchFilter === 'ALL' || po.branchId === poBranchFilter;
    const matchesStatus = poStatusFilter === 'ALL' || po.status === poStatusFilter;
    return matchesQuery && matchesBranch && matchesStatus;
  });

  const totalSupplierDebt = safeSuppliers.reduce((sum, s) => sum + (s.debtAmount || 0), 0);
  const totalPoMonth = safePurchaseOrders.filter((p) => p.status === 'COMPLETED').reduce((sum, p) => sum + (p.finalTotal || 0), 0);

  const searchedProducts = safeProducts.filter((p) => {
    if (!productSearchQuery.trim()) return false;
    const q = productSearchQuery.toLowerCase().trim();
    const nameStr = p?.name ? String(p.name).toLowerCase() : '';
    const codeStr = p?.code ? String(p.code).toLowerCase() : p?.sku ? String(p.sku).toLowerCase() : '';
    const barcodeStr = p?.barcode ? String(p.barcode).toLowerCase() : '';
    return nameStr.includes(q) || codeStr.includes(q) || barcodeStr.includes(q);
  });

  const { subtotal: currentPoSubtotal, finalTotal: currentPoFinalTotal, debtRemainder: currentPoDebtRemainder } = calculatePoTotals();

  return (
    <div className="p-3 sm:p-6 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col space-y-5 max-w-7xl mx-auto w-full">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 p-4 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2.5">
            <PackagePlus className="w-6 h-6 text-blue-400" />
            <span>Phân Hệ Nhập Hàng & Nhà Cung Cấp</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý phiếu nhập kho, theo dõi công nợ NCC và tính Giá vốn Bình quân Gia quyền (WAC)
          </p>
        </div>

        {/* Main Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveMainTab('PURCHASE_ORDERS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeMainTab === 'PURCHASE_ORDERS'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Phiếu Nhập Kho ({purchaseOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveMainTab('SUPPLIERS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeMainTab === 'SUPPLIERS'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Nhà Cung Cấp ({suppliers.length})</span>
          </button>
        </div>
      </div>

      {/* Top Stat Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng nhập hàng tháng</span>
            <div className="text-xl font-black text-blue-400 mt-0.5 font-mono">{formatVND(totalPoMonth)}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{purchaseOrders.length} phiếu nhập đã duyệt</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Tổng nợ Nhà Cung Cấp</span>
            <div className="text-xl font-black text-amber-300 mt-0.5 font-mono">{formatVND(totalSupplierDebt)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{suppliers.filter((s) => s.debtAmount > 0).length} NCC đang có nợ</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nhà cung cấp hợp tác</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{suppliers.length} đối tác</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Phân theo {SUPPLIER_GROUPS.length} nhóm đối tác</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* --- MAIN TAB 1: PHIẾU NHẬP KHO --- */}
      {activeMainTab === 'PURCHASE_ORDERS' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={poSearch}
                  onChange={(e) => setPoSearch(e.target.value)}
                  placeholder="Tìm mã PNK, Tên NCC, Tên SP..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <select
                value={poBranchFilter}
                onChange={(e) => setPoBranchFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-blue-400"
              >
                <option value="ALL">🏬 Tất cả chi nhánh</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.isCentralWarehouse ? '📦' : '🏬'} {b.name}
                  </option>
                ))}
              </select>

              <select
                value={poStatusFilter}
                onChange={(e) => setPoStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="COMPLETED">✅ Hoàn tất nhập kho</option>
                <option value="DRAFT">📝 Bản nháp</option>
              </select>
            </div>

            <button
              onClick={handleOpenCreatePoModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>[ + Tạo Phiếu Nhập Kho ]</span>
            </button>
          </div>

          {/* PO Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Mã Phiếu</th>
                    <th className="p-3">Ngày nhập</th>
                    <th className="p-3">Nhà cung cấp</th>
                    <th className="p-3">Chi nhánh nhập</th>
                    <th className="p-3 text-right">Tổng tiền hàng</th>
                    <th className="p-3 text-right">Đã trả NCC</th>
                    <th className="p-3 text-right">Nợ NCC</th>
                    <th className="p-3 text-center">Trạng thái</th>
                    <th className="p-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredPurchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-400">{po.code}</td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">
                        {new Date(po.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-3 text-white font-semibold">{po.supplierName}</td>
                      <td className="p-3 text-slate-300">{po.branchName}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">{formatVND(po.finalTotal)}</td>
                      <td className="p-3 text-right font-mono text-slate-300">{formatVND(po.paidAmount)}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-400">{formatVND(po.debtAmount)}</td>
                      <td className="p-3 text-center">
                        {po.status === 'COMPLETED' ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã nhập kho
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Bản nháp
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => {
                            setSelectedPo(po);
                            setIsPrintPoModalOpen(true);
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold text-[11px] border border-slate-700"
                          title="Xem & In phiếu"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {po.status === 'DRAFT' && (
                          <button
                            onClick={() => handleCompleteDraftPo(po)}
                            className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-[11px] border border-emerald-500/40"
                            title="Duyệt hoàn tất nhập kho"
                          >
                            Duyệt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredPurchaseOrders.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        Chưa có phiếu nhập kho nào. Bấm <strong>[ + Tạo Phiếu Nhập Kho ]</strong> để bắt đầu nhập hàng.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN TAB 2: QUẢN LÝ NHÀ CUNG CẤP --- */}
      {activeMainTab === 'SUPPLIERS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  placeholder="Tìm Tên NCC, Mã, SĐT, Email..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <select
                value={supplierGroupFilter}
                onChange={(e) => setSupplierGroupFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-blue-400"
              >
                <option value="ALL">🏬 Tất cả nhóm Nhà cung cấp</option>
                {SUPPLIER_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAddSupplierModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>[ + Thêm Nhà Cung Cấp ]</span>
            </button>
          </div>

          {/* Suppliers Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Mã NCC</th>
                    <th className="p-3">Tên Nhà Cung Cấp</th>
                    <th className="p-3">Nhóm NCC</th>
                    <th className="p-3">Số điện thoại</th>
                    <th className="p-3">Địa chỉ</th>
                    <th className="p-3 text-right">Nợ đầu kỳ</th>
                    <th className="p-3 text-right">Công Nợ Hiện Tại</th>
                    <th className="p-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredSuppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-400">{s.code}</td>
                      <td className="p-3 font-bold text-white">
                        <button
                          onClick={() => handleOpenSupplierDetailModal(s)}
                          className="hover:underline text-left"
                        >
                          {s.name}
                        </button>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700 text-[11px]">
                          {s.group || 'Khác'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 font-mono">{s.phone}</td>
                      <td className="p-3 text-slate-400 max-w-[200px] truncate">{s.address || '--'}</td>
                      <td className="p-3 text-right font-mono text-slate-400">{formatVND(s.initialDebt)}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-400 text-sm">
                        {formatVND(s.debtAmount)}
                      </td>
                      <td className="p-3 text-center space-x-1 shrink-0">
                        <button
                          onClick={() => handleOpenSupplierDetailModal(s)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-[11px] border border-slate-700"
                          title="Xem chi tiết & lịch sử"
                        >
                          Lịch sử
                        </button>
                        <button
                          onClick={() => handleOpenPayDebtModal(s)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-[11px] border border-emerald-500/40 transition-all"
                        >
                          💵 Trả nợ
                        </button>
                        <button
                          onClick={() => handleOpenEditSupplierModal(s)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(s)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-red-500/20 text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSuppliers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        Không tìm thấy Nhà cung cấp nào. Bấm <strong>[ + Thêm Nhà Cung Cấp ]</strong> để tạo mới.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL THÊM / SỬA NHÀ CUNG CẤP --- */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <span>{editingSupplierId ? 'Chỉnh Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}</span>
              </h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Mã Nhà Cung Cấp</label>
                  <input
                    type="text"
                    value={suppCode}
                    onChange={(e) => setSuppCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nhóm Nhà Cung Cấp</label>
                  <select
                    value={suppGroup}
                    onChange={(e) => setSuppGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-semibold"
                  >
                    {SUPPLIER_GROUPS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tên Nhà Cung Cấp / Công ty <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={suppName}
                  onChange={(e) => setSuppName(e.target.value)}
                  placeholder="Ví dụ: Công Ty TNHH Bao Bì Đức Minh"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Số điện thoại di động</label>
                  <input
                    type="text"
                    value={suppPhone}
                    onChange={(e) => setSuppPhone(e.target.value)}
                    placeholder="0978123456"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Mã số thuế (MST)</label>
                  <input
                    type="text"
                    value={suppTaxCode}
                    onChange={(e) => setSuppTaxCode(e.target.value)}
                    placeholder="0312456789"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Email liên hệ</label>
                  <input
                    type="email"
                    value={suppEmail}
                    onChange={(e) => setSuppEmail(e.target.value)}
                    placeholder="contact@ducminhpack.vn"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nợ đầu kỳ (VNĐ)</label>
                  <input
                    type="number"
                    value={suppInitialDebt}
                    onChange={(e) => setSuppInitialDebt(Number(e.target.value) || 0)}
                    disabled={!!editingSupplierId}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Địa chỉ trụ sở / kho</label>
                <input
                  type="text"
                  value={suppAddress}
                  onChange={(e) => setSuppAddress(e.target.value)}
                  placeholder="KCN Tân Bình, Q. Tân Bình, TP.HCM"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Ghi chú đối tác</label>
                <textarea
                  rows={2}
                  value={suppNote}
                  onChange={(e) => setSuppNote(e.target.value)}
                  placeholder="Cung cấp thùng carton 3 lớp, túi gói hàng..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveSupplier}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
              >
                Lưu Nhà Cung Cấp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL THANH TOÁN CÔNG NỢ NCC --- */}
      {isPayDebtModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Thanh Toán Công Nợ NCC</h3>
                <span className="text-xs text-slate-400">{selectedSupplier.name} ({selectedSupplier.code})</span>
              </div>
              <button onClick={() => setIsPayDebtModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Nợ hiện tại phải trả:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{formatVND(selectedSupplier.debtAmount)}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Số tiền trả (VNĐ)</label>
                <input
                  type="number"
                  value={payAmount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setPayAmount(Number(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-bold text-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Chiết khấu thanh toán được giảm (VNĐ)</label>
                <input
                  type="number"
                  value={payDiscount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setPayDiscount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-bold font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Khoản tiền NCC miễn giảm cho bạn khi trả sớm</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Hình thức thanh toán</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CASH', label: 'Tiền mặt' },
                    { id: 'BANK_TRANSFER', label: 'Chuyển khoản' },
                    { id: 'CREDIT_CARD', label: 'Thẻ / POS' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayMethod(m.id as any)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        payMethod === m.id
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Ghi chú thanh toán</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Ví dụ: Chuyển khoản qua VCB đợt 2"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => setIsPayDebtModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSavePayDebt}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
              >
                Xác Nhận Trả Nợ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CHI TIẾT NCC & LỊCH SỬ GIAO DỊCH --- */}
      {isSupplierDetailModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-400" />
                  <span>Hồ Sơ Nhà Cung Cấp: {selectedSupplier.name}</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Mã: <strong className="text-blue-300 font-mono">{selectedSupplier.code}</strong> | Nhóm: <strong>{selectedSupplier.group}</strong>
                </span>
              </div>
              <button onClick={() => setIsSupplierDetailModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inner Modal Tabs */}
            <div className="flex items-center gap-2 px-5 py-2 bg-slate-950/40 border-b border-slate-800 text-xs">
              <button
                onClick={() => setSupplierDetailTab('INFO')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  supplierDetailTab === 'INFO' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Thông tin chung
              </button>
              <button
                onClick={() => setSupplierDetailTab('POS_HISTORY')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  supplierDetailTab === 'POS_HISTORY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lịch sử Nhập hàng ({purchaseOrders.filter((p) => p.supplierId === selectedSupplier.id).length})
              </button>
              <button
                onClick={() => setSupplierDetailTab('PAYMENT_LOGS')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  supplierDetailTab === 'PAYMENT_LOGS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lịch sử Trả nợ ({supplierPaymentLogs.length})
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 text-xs space-y-4">
              {supplierDetailTab === 'INFO' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-slate-400">Số điện thoại: <strong className="text-white font-mono">{selectedSupplier.phone}</strong></div>
                    <div className="text-slate-400">Email: <strong className="text-white">{selectedSupplier.email || '--'}</strong></div>
                    <div className="text-slate-400">Mã số thuế: <strong className="text-white font-mono">{selectedSupplier.taxCode || '--'}</strong></div>
                    <div className="text-slate-400">Địa chỉ trụ sở: <strong className="text-white">{selectedSupplier.address || '--'}</strong></div>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-slate-400">Nợ ban đầu (Đầu kỳ): <strong className="text-slate-200 font-mono">{formatVND(selectedSupplier.initialDebt)}</strong></div>
                    <div className="text-slate-400">Nợ hiện tại phải trả: <strong className="text-amber-400 font-mono font-bold text-base">{formatVND(selectedSupplier.debtAmount)}</strong></div>
                    <div className="text-slate-400">Ghi chú đối tác: <em className="text-slate-300 block mt-1">{selectedSupplier.note || 'Không có ghi chú'}</em></div>
                  </div>
                </div>
              )}

              {supplierDetailTab === 'POS_HISTORY' && (
                <div className="space-y-2">
                  {purchaseOrders.filter((p) => p.supplierId === selectedSupplier.id).map((po) => (
                    <div key={po.id} className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-mono font-bold text-blue-400">{po.code}</div>
                        <div className="text-slate-400 text-[11px]">{new Date(po.createdAt).toLocaleString('vi-VN')} • {po.branchName}</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-emerald-400">{formatVND(po.finalTotal)}</div>
                        <div className="text-[10px] text-slate-400">Đã trả: {formatVND(po.paidAmount)} | Nợ: {formatVND(po.debtAmount)}</div>
                      </div>
                    </div>
                  ))}
                  {purchaseOrders.filter((p) => p.supplierId === selectedSupplier.id).length === 0 && (
                    <div className="text-center py-6 text-slate-500">Chưa có lịch sử phiếu nhập kho nào với Nhà cung cấp này.</div>
                  )}
                </div>
              )}

              {supplierDetailTab === 'PAYMENT_LOGS' && (
                <div className="space-y-2">
                  {supplierPaymentLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Thanh toán nợ qua {log.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}</div>
                        <div className="text-slate-400 text-[11px]">{new Date(log.createdAt).toLocaleString('vi-VN')} • Người chi: {log.creatorName}</div>
                        {log.note && <div className="text-[11px] text-slate-400 italic mt-0.5">{log.note}</div>}
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-emerald-400">-{formatVND(log.amount)}</div>
                        {log.discount > 0 && <div className="text-[10px] text-amber-300">Chiết khấu giảm: -{formatVND(log.discount)}</div>}
                      </div>
                    </div>
                  ))}
                  {supplierPaymentLogs.length === 0 && (
                    <div className="text-center py-6 text-slate-500">Chưa có lịch sử phiếu chi trả nợ nào.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL TẠO PHIẾU NHẬP KHO MỚI --- */}
      {isCreatePoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-blue-400" />
                <span>Tạo Phiếu Nhập Kho Mới (Purchase Order)</span>
              </h3>
              <button onClick={() => setIsCreatePoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Header Info Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Chọn Nhà Cung Cấp Hàng <span className="text-red-400">*</span></label>
                  <select
                    value={poSupplierId}
                    onChange={(e) => setPoSupplierId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}) - Nợ: {formatVND(s.debtAmount)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Chọn Chi Nhánh Nhận Kho <span className="text-red-400">*</span></label>
                  <select
                    value={poBranchId}
                    onChange={(e) => setPoBranchId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-blue-300 font-bold text-xs"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.isCentralWarehouse ? '📦' : '🏬'} {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Autocomplete Search */}
              <div className="relative">
                <label className="block text-slate-300 mb-1 font-semibold flex items-center justify-between">
                  <span>Tìm kiếm sản phẩm nhập kho:</span>
                  <span className="text-[10px] text-slate-400">(Hỗ trợ gõ mã barcode hoặc tên sản phẩm)</span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onFocus={() => setIsProductDropdownOpen(true)}
                    onChange={(e) => {
                      setProductSearchQuery(e.target.value);
                      setIsProductDropdownOpen(true);
                    }}
                    placeholder="Gõ tên sản phẩm, mã SKU, barcode..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-blue-500/40 text-white font-bold text-xs"
                  />
                </div>

                {/* Autocomplete Dropdown */}
                {isProductDropdownOpen && searchedProducts.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 p-1 divide-y divide-slate-800">
                    {searchedProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleAddProductToPo(p)}
                        className="w-full p-2 text-left hover:bg-slate-800 flex items-center justify-between transition-colors rounded-xl"
                      >
                        <div>
                          <div className="font-bold text-white">{p.name || 'Sản phẩm không tên'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">SKU: {p.code || p.sku || '--'} | Tồn: {p.stockQuantity ?? p.stock ?? 0}</div>
                        </div>
                        <div className="text-right font-mono text-emerald-400 font-bold">
                          Giá vốn: {formatVND(p.costPrice || Math.round((p.sellingPrice || 0) * 0.7))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">STT</th>
                      <th className="p-2.5">Sản phẩm</th>
                      <th className="p-2.5">Đơn vị nhập</th>
                      <th className="p-2.5 text-center">Số lượng</th>
                      <th className="p-2.5 text-right">Giá nhập đơn vị</th>
                      <th className="p-2.5 text-right">Thành tiền</th>
                      <th className="p-2.5 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {poItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-2.5 font-mono text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-white">
                          {item.productName}
                          <div className="text-[10px] text-slate-400 font-mono">Mã: {item.productCode}</div>
                        </td>
                        <td className="p-2.5">
                          <select
                            value={item.unit}
                            onChange={(e) => handleUpdatePoItem(idx, 'unit', e.target.value)}
                            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-blue-300 font-bold text-xs"
                          >
                            <option value="Cái">Cái (1x)</option>
                            {item.availableConversions?.map((c: any) => (
                              <option key={c.unitName} value={c.unitName}>
                                {c.unitName} ({c.conversionRate}x)
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => handleUpdatePoItem(idx, 'quantity', e.target.value)}
                            className="w-16 text-center py-1 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold font-mono"
                          />
                        </td>
                        <td className="p-2.5 text-right">
                          <input
                            type="number"
                            value={item.importPrice}
                            onChange={(e) => handleUpdatePoItem(idx, 'importPrice', e.target.value)}
                            className="w-28 text-right py-1 px-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-bold font-mono"
                          />
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-white">
                          {formatVND(item.subtotal)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleRemovePoItem(idx)}
                            className="p-1 rounded bg-slate-800 hover:bg-red-500/20 text-red-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {poItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-500">
                          Chưa có sản phẩm nào trong phiếu nhập. Gõ tên sản phẩm vào ô tìm kiếm phía trên để chọn.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Payment Breakdown Footer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="space-y-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Ghi chú phiếu nhập</label>
                    <textarea
                      rows={2}
                      value={poNote}
                      onChange={(e) => setPoNote(e.target.value)}
                      placeholder="Ghi chú thêm về lô hàng, số hóa đơn chứng từ..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Hình thức trả tiền mặt/CK</label>
                    <select
                      value={poPaymentMethod}
                      onChange={(e) => setPoPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold"
                    >
                      <option value="CASH">Tiền mặt</option>
                      <option value="BANK_TRANSFER">Chuyển khoản VietQR</option>
                      <option value="CREDIT_CARD">Thẻ / POS</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <div className="flex justify-between text-slate-400">
                    <span>Tổng tiền hàng nhập:</span>
                    <span className="font-mono font-bold text-white">{formatVND(currentPoSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 items-center">
                    <span>Chiết khấu NCC:</span>
                    <input
                      type="number"
                      value={poDiscount}
                      onChange={(e) => setPoDiscount(Number(e.target.value) || 0)}
                      className="w-28 text-right py-0.5 px-2 rounded bg-slate-900 border border-slate-800 text-amber-400 font-mono font-bold"
                    />
                  </div>
                  <div className="flex justify-between text-slate-400 items-center">
                    <span>Thuế VAT:</span>
                    <input
                      type="number"
                      value={poTax}
                      onChange={(e) => setPoTax(Number(e.target.value) || 0)}
                      className="w-28 text-right py-0.5 px-2 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono font-bold"
                    />
                  </div>
                  <div className="flex justify-between text-slate-200 font-bold border-t border-slate-800 pt-1 text-sm">
                    <span>Tổng thanh toán:</span>
                    <span className="font-mono text-emerald-400 font-black">{formatVND(currentPoFinalTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 items-center">
                    <span>Tiền trả trước NCC:</span>
                    <input
                      type="number"
                      value={poPaidAmount}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setPoPaidAmount(Number(e.target.value) || 0)}
                      className="w-32 text-right py-1 px-2 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-sm"
                    />
                  </div>
                  <div className="flex justify-between text-amber-400 font-bold pt-1">
                    <span>Ghi nhận nợ NCC:</span>
                    <span className="font-mono font-black">{formatVND(currentPoDebtRemainder)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950/80">
              <button
                onClick={() => setIsCreatePoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleSavePurchaseOrder(false)}
                className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white font-bold text-xs border border-amber-500/40"
              >
                📝 Lưu Bản Nháp
              </button>
              <button
                onClick={() => handleSavePurchaseOrder(true)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>✅ Duyệt Hoàn Tất & Nhập Kho</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL XEM & IN PHIẾU NHẬP KHO --- */}
      {isPrintPoModalOpen && selectedPo && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-400" />
                <span>Phiếu Nhập Kho: {selectedPo.code}</span>
              </h3>
              <button onClick={() => setIsPrintPoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thermal Receipt Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-white text-slate-900 font-mono text-xs space-y-3">
              <div className="text-center space-y-0.5 border-b pb-3 border-slate-300">
                <h2 className="font-bold text-base uppercase">{selectedPo.branchName}</h2>
                <div className="text-[11px]">PHIẾU NHẬP KHO HÀNG HÓA</div>
                <div className="text-[10px] text-slate-600">Số: {selectedPo.code} | Ngày: {new Date(selectedPo.createdAt).toLocaleString('vi-VN')}</div>
              </div>

              <div className="space-y-1 border-b pb-2 border-slate-300">
                <div>Nhà cung cấp: <strong>{selectedPo.supplierName}</strong></div>
                <div>Người lập phiếu: <strong>{selectedPo.creatorName}</strong></div>
                {selectedPo.note && <div>Ghi chú: {selectedPo.note}</div>}
              </div>

              <table className="w-full text-left border-b border-slate-300">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="py-1">Tên SP</th>
                    <th className="py-1 text-center">SL</th>
                    <th className="py-1 text-right">Đơn giá</th>
                    <th className="py-1 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedPo.items?.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-1.5 font-sans font-bold">{item.productName} ({item.unit})</td>
                      <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                      <td className="py-1.5 text-right">{item.importPrice.toLocaleString('vi-VN')}</td>
                      <td className="py-1.5 text-right font-bold">{(item.subtotal || item.quantity * item.importPrice).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1 text-right pt-1 font-bold">
                <div>Tổng tiền hàng: {formatVND(selectedPo.subtotal)}</div>
                {selectedPo.discount > 0 && <div>Chiết khấu: -{formatVND(selectedPo.discount)}</div>}
                {selectedPo.tax > 0 && <div>Thuế VAT: +{formatVND(selectedPo.tax)}</div>}
                <div className="text-sm font-black text-black">Tổng thanh toán: {formatVND(selectedPo.finalTotal)}</div>
                <div className="text-slate-700">Đã trả NCC: {formatVND(selectedPo.paidAmount)}</div>
                <div className="text-red-600">Ghi nợ NCC: {formatVND(selectedPo.debtAmount)}</div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu Nhập</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
