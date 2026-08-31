import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useBranchStore } from '../store/branchStore';
import {
  ClipboardCheck,
  Search,
  Plus,
  Edit3,
  CheckCircle2,
  Clock,
  Printer,
  X,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  Ban,
  ArrowRightLeft,
  Barcode,
  RotateCcw,
} from 'lucide-react';

export const StockAuditPage: React.FC = () => {
  const { user } = useAuthStore();
  const { branches } = useBranchStore();

  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const canBalance = isAdmin || isManager;

  const [audits, setAudits] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Multi-select for merging audits
  const [selectedAuditIds, setSelectedAuditIds] = useState<string[]>([]);

  // Create / Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuditId, setEditingAuditId] = useState<string | null>(null);
  const [auditBranchId, setAuditBranchId] = useState(branches[0]?.id || 'branch-01');
  const [auditorName, setAuditorName] = useState(user?.fullName || 'Người kiểm kho');
  const [inputMode, setInputMode] = useState<'OVERWRITE' | 'ACCUMULATE'>('OVERWRITE');
  const [auditItems, setAuditItems] = useState<any[]>([]);
  const [auditNote, setAuditNote] = useState('');

  // Product Autocomplete Search
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // Print Modal
  const [selectedAuditForPrint, setSelectedAuditForPrint] = useState<any | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchAudits = async () => {
    try {
      const res: any = await api.get('/stock-audits');
      const list = Array.isArray(res) ? res : res?.data || [];
      setAudits(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Fetch audits error:', err);
      setAudits([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const res: any = await api.get('/products');
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : res?.data?.products || res?.products || [];
      setAllProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Fetch products error:', err);
      setAllProducts([]);
    }
  };

  useEffect(() => {
    fetchAudits();
    fetchProducts();
  }, []);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingAuditId(null);
    setAuditBranchId(branches[0]?.id || 'branch-01');
    setAuditorName(user?.fullName || 'Người kiểm kho');
    setInputMode('OVERWRITE');
    setAuditItems([]);
    setAuditNote('');
    setProductSearchQuery('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (audit: any) => {
    setEditingAuditId(audit.id);
    setAuditBranchId(audit.branchId || branches[0]?.id || 'branch-01');
    setAuditorName(audit.auditorName || user?.fullName || 'Người kiểm kho');
    setInputMode('OVERWRITE');
    setAuditItems(audit.items || []);
    setAuditNote(audit.note || '');
    setProductSearchQuery('');
    setIsModalOpen(true);
  };

  const handleAddProductToAudit = (prod: any) => {
    if (!prod) return;
    const defaultUnit = prod.unit || 'Cái';
    const prodCode = prod.code || prod.sku || 'SP000';
    const prodName = prod.name || 'Sản phẩm không tên';
    const costPrice = prod.costPrice || Math.round((prod.sellingPrice || 0) * 0.7);

    // Get system stock for selected branch
    const branchStock = prod.branchStocks ? (prod.branchStocks[auditBranchId] ?? prod.stockQuantity ?? 0) : prod.stockQuantity ?? 0;

    const existingIndex = auditItems.findIndex((i) => i.productId === prod.id);

    if (existingIndex > -1) {
      const updated = [...auditItems];
      if (inputMode === 'ACCUMULATE') {
        updated[existingIndex].actualQty += 1;
      } else {
        updated[existingIndex].actualQty = branchStock; // default match
      }
      updated[existingIndex].differenceQty = updated[existingIndex].actualQty - updated[existingIndex].systemQty;
      updated[existingIndex].differenceValue = updated[existingIndex].differenceQty * updated[existingIndex].costPrice;
      setAuditItems(updated);
    } else {
      const initialActual = branchStock;
      setAuditItems([
        ...auditItems,
        {
          productId: prod.id,
          productCode: prodCode,
          productName: prodName,
          unit: defaultUnit,
          systemQty: branchStock,
          actualQty: initialActual,
          differenceQty: initialActual - branchStock,
          costPrice,
          differenceValue: (initialActual - branchStock) * costPrice,
        },
      ]);
    }

    setProductSearchQuery('');
    setIsProductDropdownOpen(false);
  };

  const handleAutoMatchAll = () => {
    const updated = auditItems.map((item) => ({
      ...item,
      actualQty: item.systemQty,
      differenceQty: 0,
      differenceValue: 0,
    }));
    setAuditItems(updated);
    showToast('Đã tự động khớp Thực tế = Sổ sách cho tất cả mặt hàng!');
  };

  const handleSaveAudit = async (isComplete: boolean = false) => {
    if (auditItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm kiểm kho');
      return;
    }

    if (isComplete && !canBalance) {
      alert('Chỉ có Quản lý (`MANAGER`) hoặc Admin (`ADMIN`) mới có quyền Duyệt Cân Bằng Kho!');
      return;
    }

    const branch = branches.find((b) => b.id === auditBranchId);

    const payload = {
      branchId: auditBranchId,
      branchName: branch ? branch.name : 'Chi nhánh mặc định',
      creatorName: `${user?.fullName || 'Quản lý'} (${user?.role || 'ADMIN'})`,
      auditorName,
      items: auditItems,
      status: 'DRAFT',
      note: auditNote,
    };

    try {
      let savedAudit: any;
      if (editingAuditId) {
        const res: any = await api.put(`/stock-audits/${editingAuditId}`, payload);
        savedAudit = res.data;
      } else {
        const res: any = await api.post('/stock-audits', payload);
        savedAudit = res.data;
      }

      if (isComplete && savedAudit?.id) {
        await api.post(`/stock-audits/${savedAudit.id}/complete`, {
          userRole: user?.role || 'STAFF',
        });
        showToast('✅ Đã Cân Bằng Kho & Cập nhật tồn kho chi nhánh thành công!');
      } else {
        showToast(editingAuditId ? 'Đã cập nhật Phiếu kiểm kho tạm!' : 'Đã lưu nháp Phiếu kiểm kho!');
      }

      setIsModalOpen(false);
      fetchAudits();
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu phiếu kiểm kho');
    }
  };

  const handleCompleteAuditDirect = async (audit: any) => {
    if (!canBalance) {
      alert('Chỉ có Quản lý (`MANAGER`) hoặc Admin (`ADMIN`) mới có quyền Duyệt Cân Bằng Kho!');
      return;
    }

    if (!confirm(`Bạn có chắc muốn Duyệt Cân Bằng Kho theo phiếu "${audit.code}"? Tồn kho chi nhánh sẽ được cập nhật lại theo số lượng Thực tế.`)) {
      return;
    }

    try {
      await api.post(`/stock-audits/${audit.id}/complete`, {
        userRole: user?.role || 'STAFF',
      });
      showToast(`Đã Cân Bằng Kho cho phiếu "${audit.code}" thành công!`);
      fetchAudits();
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cân bằng kho');
    }
  };

  const handleMergeAudits = async () => {
    if (!canBalance) {
      alert('Chỉ có Quản lý (`MANAGER`) hoặc Admin (`ADMIN`) mới có quyền Gộp phiếu kiểm kho!');
      return;
    }

    if (selectedAuditIds.length < 2) {
      alert('Vui lòng chọn ít nhất 2 phiếu kiểm tạm (DRAFT) để gộp');
      return;
    }

    try {
      await api.post('/stock-audits/merge', {
        auditIds: selectedAuditIds,
        userRole: user?.role || 'STAFF',
        creatorName: `${user?.fullName || 'Quản lý'} (${user?.role || 'ADMIN'})`,
      });

      showToast(`Đã gộp ${selectedAuditIds.length} phiếu kiểm tạm thành 1 phiếu tổng hợp!`);
      setSelectedAuditIds([]);
      fetchAudits();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gộp phiếu');
    }
  };

  const handleCancelAudit = async (audit: any) => {
    if (!canBalance) {
      alert('Chỉ có Quản lý (`MANAGER`) hoặc Admin (`ADMIN`) mới có quyền Hủy phiếu kiểm kho!');
      return;
    }

    const reason = prompt(`Nhập lý do hủy Phiếu kiểm kho "${audit.code}":`);
    if (reason === null) return;

    try {
      await api.post(`/stock-audits/${audit.id}/cancel`, {
        userRole: user?.role || 'STAFF',
        reason,
      });

      showToast(`Đã hủy Phiếu kiểm kho "${audit.code}"!`);
      fetchAudits();
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi hủy phiếu');
    }
  };

  const safeAudits = Array.isArray(audits) ? audits : [];
  const safeProducts = Array.isArray(allProducts) ? allProducts : [];

  const filteredAudits = safeAudits.filter((a) => {
    const q = search.toLowerCase().trim();
    const codeStr = a?.code ? String(a.code).toLowerCase() : '';
    const creatorStr = a?.creatorName ? String(a.creatorName).toLowerCase() : '';
    const auditorStr = a?.auditorName ? String(a.auditorName).toLowerCase() : '';

    const matchesQuery =
      codeStr.includes(q) ||
      creatorStr.includes(q) ||
      auditorStr.includes(q) ||
      (Array.isArray(a?.items) &&
        a.items.some((i: any) => {
          const iName = i?.productName ? String(i.productName).toLowerCase() : '';
          const iCode = i?.productCode ? String(i.productCode).toLowerCase() : '';
          return iName.includes(q) || iCode.includes(q);
        }));

    const matchesBranch = branchFilter === 'ALL' || a.branchId === branchFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesQuery && matchesBranch && matchesStatus;
  });

  const searchedProducts = safeProducts.filter((p) => {
    if (!productSearchQuery.trim()) return false;
    const q = productSearchQuery.toLowerCase().trim();
    const nameStr = p?.name ? String(p.name).toLowerCase() : '';
    const codeStr = p?.code ? String(p.code).toLowerCase() : p?.sku ? String(p.sku).toLowerCase() : '';
    const barcodeStr = p?.barcode ? String(p.barcode).toLowerCase() : '';
    return nameStr.includes(q) || codeStr.includes(q) || barcodeStr.includes(q);
  });

  // Calculate top stats
  const completedAudits = safeAudits.filter((a) => a.status === 'COMPLETED');
  const totalOverStock = completedAudits.reduce(
    (sum, a) => sum + (a.items?.filter((i: any) => i.differenceQty > 0).reduce((s: number, i: any) => s + i.differenceQty, 0) || 0),
    0
  );
  const totalUnderStock = completedAudits.reduce(
    (sum, a) => sum + (a.items?.filter((i: any) => i.differenceQty < 0).reduce((s: number, i: any) => s + Math.abs(i.differenceQty), 0) || 0),
    0
  );
  const totalNetDiffValue = completedAudits.reduce((sum, a) => sum + (a.totalDiffValue || 0), 0);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 p-4 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-emerald-400" />
            <span>Phân Hệ Kiểm Kho & Cân Bằng Tồn Kho</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Đối chiếu số tồn sổ sách vs. thực tế kiểm đếm $\rightarrow$ Tự động điều chỉnh tồn kho chi nhánh chuẩn KiotViet
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedAuditIds.length >= 2 && canBalance && (
            <button
              onClick={handleMergeAudits}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>[ 🔗 Gộp {selectedAuditIds.length} Phiếu Chọn ]</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>[ + Tạo Phiếu Kiểm Kho Mới ]</span>
          </button>
        </div>
      </div>

      {/* Top Stat Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng phiếu kiểm</span>
            <div className="text-xl font-black text-white mt-0.5 font-mono">{safeAudits.length}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{completedAudits.length} phiếu đã cân bằng kho</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ClipboardCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Chênh lệch thừa (+)</span>
            <div className="text-xl font-black text-emerald-300 mt-0.5 font-mono">+{totalOverStock} SP</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Số lượng thực tế nhiều hơn sổ sách</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-red-500/30 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Chênh lệch thiếu (-)</span>
            <div className="text-xl font-black text-red-300 mt-0.5 font-mono">-{totalUnderStock} SP</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Thất thoát hoặc hư hỏng thực tế</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Giá trị chênh lệch (VNĐ)</span>
            <div className="text-lg font-black text-amber-300 mt-0.5 font-mono">{formatVND(totalNetDiffValue)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Tác động giá trị kho sau cân bằng</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã PKK, Người kiểm, SP..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="DRAFT">⏳ Phiếu tạm (DRAFT)</option>
            <option value="COMPLETED">✅ Đã cân bằng kho</option>
            <option value="CANCELLED">🚫 Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Table Stock Audits */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3 w-8 text-center">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        const drafts = filteredAudits.filter((a) => a.status === 'DRAFT').map((a) => a.id);
                        setSelectedAuditIds(drafts);
                      } else {
                        setSelectedAuditIds([]);
                      }
                    }}
                    className="rounded border-slate-700 bg-slate-900 text-blue-600"
                  />
                </th>
                <th className="p-3">Mã Phiếu</th>
                <th className="p-3">Ngày tạo</th>
                <th className="p-3">Chi nhánh</th>
                <th className="p-3">Người kiểm</th>
                <th className="p-3 text-center">Tồn sổ / Thực tế</th>
                <th className="p-3 text-right">Chênh lệch</th>
                <th className="p-3 text-right">Giá trị chênh lệch</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredAudits.map((audit) => (
                <tr key={audit.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 text-center">
                    {audit.status === 'DRAFT' && (
                      <input
                        type="checkbox"
                        checked={selectedAuditIds.includes(audit.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAuditIds([...selectedAuditIds, audit.id]);
                          } else {
                            setSelectedAuditIds(selectedAuditIds.filter((id) => id !== audit.id));
                          }
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600"
                      />
                    )}
                  </td>
                  <td className="p-3 font-mono font-bold text-blue-400">{audit.code}</td>
                  <td className="p-3 text-slate-400 font-mono text-[11px]">
                    {new Date(audit.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-3 text-slate-200">{audit.branchName}</td>
                  <td className="p-3 font-bold text-white">{audit.auditorName || audit.creatorName}</td>
                  <td className="p-3 text-center font-mono">
                    <span className="text-slate-400">{audit.totalSystemQty}</span> /{' '}
                    <strong className="text-white">{audit.totalActualQty}</strong>
                  </td>
                  <td className="p-3 text-right font-mono font-bold">
                    {audit.totalDiffQty > 0 ? (
                      <span className="text-emerald-400">+{audit.totalDiffQty}</span>
                    ) : audit.totalDiffQty < 0 ? (
                      <span className="text-red-400">{audit.totalDiffQty}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="p-3 text-right font-mono font-bold">
                    {audit.totalDiffValue > 0 ? (
                      <span className="text-emerald-400">+{formatVND(audit.totalDiffValue)}</span>
                    ) : audit.totalDiffValue < 0 ? (
                      <span className="text-red-400">{formatVND(audit.totalDiffValue)}</span>
                    ) : (
                      <span className="text-slate-400">0 ₫</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {audit.status === 'DRAFT' && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Phiếu tạm (DRAFT)
                      </span>
                    )}
                    {audit.status === 'COMPLETED' && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã cân bằng kho
                      </span>
                    )}
                    {audit.status === 'CANCELLED' && (
                      <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-bold inline-flex items-center gap-1">
                        <Ban className="w-3.5 h-3.5" /> Đã hủy
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center space-x-1">
                    {audit.status === 'DRAFT' && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(audit)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700"
                          title="Tiếp tục kiểm kho / Chỉnh sửa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {canBalance && (
                          <button
                            onClick={() => handleCompleteAuditDirect(audit)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-md flex-inline items-center gap-1"
                            title="Quản lý Duyệt Cân Bằng Kho"
                          >
                            ⚖️ Cân Bằng Kho
                          </button>
                        )}
                      </>
                    )}

                    <button
                      onClick={() => {
                        setSelectedAuditForPrint(audit);
                        setIsPrintModalOpen(true);
                      }}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      title="In phiếu kiểm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    {audit.status !== 'CANCELLED' && canBalance && (
                      <button
                        onClick={() => handleCancelAudit(audit)}
                        className="p-1 rounded bg-slate-800 hover:bg-red-500/20 text-red-400"
                        title="Hủy phiếu kiểm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAudits.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    Chưa có phiếu kiểm kho nào. Bấm <strong>[ + Tạo Phiếu Kiểm Kho Mới ]</strong> để lên đợt kiểm kho.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL TẠO / CHỈNH SỬA PHIẾU KIỂM KHO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-400" />
                <span>{editingAuditId ? 'Tiếp Tục Kiểm Kho / Chỉnh Sửa Phiếu' : 'Tạo Phiếu Kiểm Kho & Cân Bằng Tồn Kho'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Chi Nhánh Kiểm Kho <span className="text-red-400">*</span></label>
                  <select
                    value={auditBranchId}
                    onChange={(e) => setAuditBranchId(e.target.value)}
                    disabled={auditItems.length > 0}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-blue-300 font-bold text-xs"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.isCentralWarehouse ? '📦' : '🏬'} {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tên Người Kiểm Kho</label>
                  <input
                    type="text"
                    value={auditorName}
                    onChange={(e) => setAuditorName(e.target.value)}
                    placeholder="Nhập tên người kiểm đếm..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Chế độ nhập số lượng</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInputMode('OVERWRITE')}
                      className={`py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        inputMode === 'OVERWRITE'
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Ghi Đè (Overwrite)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('ACCUMULATE')}
                      className={`py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        inputMode === 'ACCUMULATE'
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Cộng Dồn (Kệ/Thùng)
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Autocomplete Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full">
                  <div className="relative">
                    <Barcode className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={productSearchQuery}
                      onFocus={() => setIsProductDropdownOpen(true)}
                      onChange={(e) => {
                        setProductSearchQuery(e.target.value);
                        setIsProductDropdownOpen(true);
                      }}
                      placeholder="Quét mã barcode hoặc gõ tên SP, mã SKU..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-blue-500/40 text-white font-bold text-xs"
                    />
                  </div>

                  {isProductDropdownOpen && searchedProducts.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 p-1 divide-y divide-slate-800">
                      {searchedProducts.map((p) => {
                        const bStock = p.branchStocks ? (p.branchStocks[auditBranchId] ?? p.stockQuantity ?? 0) : p.stockQuantity ?? 0;
                        return (
                          <button
                            key={p.id}
                            onClick={() => handleAddProductToAudit(p)}
                            className="w-full p-2 text-left hover:bg-slate-800 flex items-center justify-between transition-colors rounded-xl"
                          >
                            <div>
                              <div className="font-bold text-white">{p.name || 'Sản phẩm'}</div>
                              <div className="text-[10px] text-slate-400 font-mono">SKU: {p.code || p.sku || '--'}</div>
                            </div>
                            <div className="text-right font-mono text-blue-300 font-bold">
                              Tồn sổ sách: {bStock} {p.unit || 'Cái'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {auditItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAutoMatchAll}
                    className="px-3.5 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white font-bold text-xs border border-amber-500/40 flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>[ ⚡ Tự Động Khớp Khởi Tạo ]</span>
                  </button>
                )}
              </div>

              {/* Items Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">STT</th>
                      <th className="p-2.5">Mã & Tên SP</th>
                      <th className="p-2.5">Đơn vị</th>
                      <th className="p-2.5 text-center">Tồn sổ sách</th>
                      <th className="p-2.5 text-center">Thực tế đếm</th>
                      <th className="p-2.5 text-center">Chênh lệch</th>
                      <th className="p-2.5 text-right">Giá vốn</th>
                      <th className="p-2.5 text-right">Giá trị chênh lệch</th>
                      <th className="p-2.5 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {auditItems.map((item, idx) => {
                      const diff = item.actualQty - item.systemQty;
                      const diffVal = diff * item.costPrice;

                      return (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="p-2.5 font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-white">
                            <div>{item.productName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{item.productCode}</div>
                          </td>
                          <td className="p-2.5 text-slate-300 font-semibold">{item.unit}</td>
                          <td className="p-2.5 text-center font-mono text-slate-400 font-bold">{item.systemQty}</td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              min={0}
                              value={item.actualQty}
                              onChange={(e) => {
                                const updated = [...auditItems];
                                const act = Math.max(0, Number(e.target.value) || 0);
                                updated[idx].actualQty = act;
                                updated[idx].differenceQty = act - updated[idx].systemQty;
                                updated[idx].differenceValue = updated[idx].differenceQty * updated[idx].costPrice;
                                setAuditItems(updated);
                              }}
                              className="w-20 text-center py-1 rounded-lg bg-slate-900 border border-emerald-500/50 text-emerald-400 font-bold font-mono text-sm"
                            />
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold">
                            {diff > 0 ? (
                              <span className="text-emerald-400">+{diff}</span>
                            ) : diff < 0 ? (
                              <span className="text-red-400">{diff}</span>
                            ) : (
                              <span className="text-slate-500">0</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-400">{formatVND(item.costPrice)}</td>
                          <td className="p-2.5 text-right font-mono font-bold">
                            {diffVal > 0 ? (
                              <span className="text-emerald-400">+{formatVND(diffVal)}</span>
                            ) : diffVal < 0 ? (
                              <span className="text-red-400">{formatVND(diffVal)}</span>
                            ) : (
                              <span className="text-slate-500">0 ₫</span>
                            )}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => setAuditItems(auditItems.filter((_, i) => i !== idx))}
                              className="p-1 rounded bg-slate-800 text-red-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {auditItems.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-slate-500">
                          Chưa có sản phẩm nào trong phiếu kiểm. Gõ tên hoặc quét mã barcode sản phẩm ở trên để chọn.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Ghi chú kiểm kho</label>
                <textarea
                  rows={2}
                  value={auditNote}
                  onChange={(e) => setAuditNote(e.target.value)}
                  placeholder="Ghi chú đợt kiểm kho (Hao hụt hỏng hóc, nứt vỡ...)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Hủy bỏ
              </button>

              <button
                onClick={() => handleSaveAudit(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4" />
                <span>Lưu Tạm (DRAFT)</span>
              </button>

              {canBalance && (
                <button
                  onClick={() => handleSaveAudit(true)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✅ Duyệt Cân Bằng Kho</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL IN PHIẾU KIỂM KHO --- */}
      {isPrintModalOpen && selectedAuditForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-400" />
                <span>Phiếu Kiểm Kho: {selectedAuditForPrint.code}</span>
              </h3>
              <button onClick={() => setIsPrintModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-white text-slate-900 font-mono text-xs space-y-3">
              <div className="text-center space-y-0.5 border-b pb-3 border-slate-300">
                <h2 className="font-bold text-base uppercase">{selectedAuditForPrint.branchName}</h2>
                <div className="text-[11px]">PHIẾU KIỂM KÊ VÀ CÂN BẰNG TỒN KHO</div>
                <div className="text-[10px] text-slate-600">
                  Mã phiếu: {selectedAuditForPrint.code} | Ngày: {new Date(selectedAuditForPrint.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>

              <div className="space-y-1 border-b pb-2 border-slate-300">
                <div>Người kiểm kho: <strong>{selectedAuditForPrint.auditorName || selectedAuditForPrint.creatorName}</strong></div>
                <div>Trạng thái: <strong>{selectedAuditForPrint.status === 'COMPLETED' ? 'Đã cân bằng kho' : 'Phiếu tạm (DRAFT)'}</strong></div>
                {selectedAuditForPrint.note && <div>Ghi chú: {selectedAuditForPrint.note}</div>}
              </div>

              <table className="w-full text-left border-b border-slate-300">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="py-1">Mã - Tên SP</th>
                    <th className="py-1 text-center">Sổ sách</th>
                    <th className="py-1 text-center">Thực tế</th>
                    <th className="py-1 text-right">Lệch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedAuditForPrint.items?.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-1.5 font-sans font-bold">{item.productName} ({item.unit})</td>
                      <td className="py-1.5 text-center">{item.systemQty}</td>
                      <td className="py-1.5 text-center font-bold">{item.actualQty}</td>
                      <td className="py-1.5 text-right font-bold">
                        {item.differenceQty > 0 ? `+${item.differenceQty}` : item.differenceQty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1 text-right pt-1 font-bold">
                <div>Tổng tồn sổ sách: {selectedAuditForPrint.totalSystemQty} SP</div>
                <div>Tổng tồn thực tế: {selectedAuditForPrint.totalActualQty} SP</div>
                <div className="text-sm font-black text-black">Tổng lệch giá trị: {formatVND(selectedAuditForPrint.totalDiffValue)}</div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu Kiểm Kho</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
