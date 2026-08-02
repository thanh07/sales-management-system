import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Tag, Plus, Search, Calendar, Users, Calculator, X, Edit3, Save, Trash2, Copy, ToggleLeft, ToggleRight, Edit2, Columns, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const PriceListsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'CATALOG' | 'COMPARISON'>('CATALOG');
  const [priceLists, setPriceLists] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  // Comparison View State
  const [comparisonMatrix, setComparisonMatrix] = useState<any | null>(null);
  const [selectedComparisonListIds, setSelectedComparisonListIds] = useState<string[]>([]);
  const [comparisonSearch, setComparisonSearch] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPriceList, setEditingPriceList] = useState<any | null>(null);

  // Editable Matrix State inside KiotViet Editor Modal
  const [matrixItems, setMatrixItems] = useState<any[]>([]);
  const [matrixSearch, setMatrixSearch] = useState('');
  const [bulkFormulaMethod, setBulkFormulaMethod] = useState<'PERCENT_BASE' | 'PERCENT_COST' | 'FIXED_OFFSET'>('PERCENT_BASE');
  const [bulkFormulaValue, setBulkFormulaValue] = useState<number>(10);

  // Form State (for both Create & Edit Settings)
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'STANDARD' | 'WHOLESALE' | 'PROMOTION' | 'CUSTOMER_GROUP'>('WHOLESALE');
  const [calculationMethod, setCalculationMethod] = useState<'FIXED' | 'PERCENT_BASE' | 'PERCENT_COST' | 'FIXED_OFFSET'>('PERCENT_BASE');
  const [value, setValue] = useState<number>(10);
  const [appliedCustomerGroups, setAppliedCustomerGroups] = useState<string[]>(['WHOLESALE']);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchPriceLists = async () => {
    try {
      const res: any = await api.get('/pricelists', {
        params: { query: searchQuery, type: selectedType },
      });
      const lists = res.data || [];
      setPriceLists(lists);
      if (selectedComparisonListIds.length === 0 && lists.length > 0) {
        setSelectedComparisonListIds(lists.map((l: any) => l.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComparisonMatrix = async () => {
    try {
      const res: any = await api.get('/pricelists/comparison', {
        params: { ids: selectedComparisonListIds.join(',') },
      });
      setComparisonMatrix(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPriceLists();
  }, [searchQuery, selectedType]);

  useEffect(() => {
    if (viewMode === 'COMPARISON') {
      fetchComparisonMatrix();
    }
  }, [viewMode, selectedComparisonListIds]);

  const handleToggleComparisonListId = (id: string) => {
    if (selectedComparisonListIds.includes(id)) {
      if (selectedComparisonListIds.length === 1) {
        alert('Cần chọn ít nhất 1 bảng giá để so sánh');
        return;
      }
      setSelectedComparisonListIds(selectedComparisonListIds.filter((item) => item !== id));
    } else {
      setSelectedComparisonListIds([...selectedComparisonListIds, id]);
    }
  };

  const handleCreatePriceList = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/pricelists', {
        name,
        type,
        calculationMethod,
        value,
        appliedCustomerGroups,
        appliedBranches: ['ALL'],
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isActive: true,
        notes,
      });

      setIsAddModalOpen(false);
      resetForm();
      fetchPriceLists();
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo bảng giá mới');
    }
  };

  const handleOpenEditSettingsModal = (pl: any) => {
    setEditId(pl.id);
    setName(pl.name);
    setType(pl.type);
    setCalculationMethod(pl.calculationMethod);
    setValue(pl.value);
    setAppliedCustomerGroups(pl.appliedCustomerGroups || ['WHOLESALE']);
    setStartDate(pl.startDate || '');
    setEndDate(pl.endDate || '');
    setNotes(pl.notes || '');
    setIsActive(pl.isActive);
    setIsEditModalOpen(true);
  };

  const handleUpdatePriceListSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    try {
      await api.put(`/pricelists/${editId}`, {
        name,
        type,
        calculationMethod,
        value,
        appliedCustomerGroups,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isActive,
        notes,
      });

      setIsEditModalOpen(false);
      resetForm();
      fetchPriceLists();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật bảng giá');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/pricelists/${id}/toggle`);
      fetchPriceLists();
    } catch (err: any) {
      alert(err.message || 'Lỗi đổi trạng thái bảng giá');
    }
  };

  const handleDuplicatePriceList = async (id: string) => {
    try {
      const res: any = await api.post(`/pricelists/${id}/duplicate`);
      alert(`Đã sao chép thành công bảng giá: "${res.data.name}"!`);
      fetchPriceLists();
    } catch (err: any) {
      alert(err.message || 'Lỗi sao chép bảng giá');
    }
  };

  const handleDeletePriceList = async (pl: any) => {
    if (pl.code === 'BG-BASE' || pl.type === 'STANDARD') {
      alert('Không thể xóa Bảng Giá Bán Lẻ Mặc Định (Giá Chung) của hệ thống!');
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa Bảng giá "${pl.name}"? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    try {
      await api.delete(`/pricelists/${pl.id}`);
      fetchPriceLists();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa bảng giá');
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setValue(10);
    setStartDate('');
    setEndDate('');
    setNotes('');
    setIsActive(true);
  };

  const handleOpenMatrixEditor = async (id: string) => {
    try {
      const res: any = await api.get(`/pricelists/${id}`);
      setEditingPriceList(res.data);
      setMatrixItems(res.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemPriceChange = (productId: string, newPrice: number, isConversion: boolean = false) => {
    setMatrixItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          if (isConversion) {
            return { ...item, customConversionPrice: newPrice, isOverridden: true };
          } else {
            return { ...item, customPrice: newPrice, isOverridden: true };
          }
        }
        return item;
      })
    );
  };

  const handleApplyBulkFormula = () => {
    setMatrixItems((prev) =>
      prev.map((item) => {
        let newCustomPrice = item.basePrice;
        let newConversionPrice = item.customConversionPrice;

        if (bulkFormulaMethod === 'PERCENT_BASE') {
          newCustomPrice = Math.round((item.basePrice * (1 - bulkFormulaValue / 100)) / 1000) * 1000;
        } else if (bulkFormulaMethod === 'PERCENT_COST') {
          newCustomPrice = Math.round((item.costPrice * (1 + bulkFormulaValue / 100)) / 1000) * 1000;
        } else if (bulkFormulaMethod === 'FIXED_OFFSET') {
          newCustomPrice = Math.max(0, item.basePrice - bulkFormulaValue);
        }

        return {
          ...item,
          customPrice: newCustomPrice,
          customConversionPrice: newConversionPrice,
          isOverridden: false,
        };
      })
    );
  };

  const handleSaveMatrixChanges = async () => {
    if (!editingPriceList) return;
    try {
      const payload = {
        items: matrixItems.map((item) => ({
          productId: item.productId,
          customPrice: Number(item.customPrice),
          customConversionPrice: item.customConversionPrice ? Number(item.customConversionPrice) : undefined,
        })),
      };

      await api.put(`/pricelists/${editingPriceList.id}/items`, payload);
      alert(`Đã lưu thành công thiết lập giá cho ${matrixItems.length} sản phẩm trong Bảng giá!`);
      setEditingPriceList(null);
      fetchPriceLists();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu bảng giá');
    }
  };

  const handleExportComparisonCsv = () => {
    if (!comparisonMatrix) return;
    const headers = ['SKU', 'Barcode', 'Tên sản phẩm', 'Đơn vị tính', 'Giá nhập', 'Giá bán niêm yết', ...comparisonMatrix.priceLists.map((p: any) => `"${p.name}"`)];
    const rows = comparisonMatrix.rows.map((r: any) => {
      const p = r.product;
      const listPrices = comparisonMatrix.priceLists.map((pl: any) => r.prices[pl.id]?.price || p.sellingPrice);
      return [p.sku, p.barcode, `"${p.name.replace(/"/g, '""')}"`, p.unit, p.costPrice, p.sellingPrice, ...listPrices];
    });

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ma_tran_so_sanh_bang_gia.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const getMethodText = (method: string, val: number) => {
    switch (method) {
      case 'PERCENT_BASE':
        return `Giảm ${val}% so với Giá Chung (Niêm Yết)`;
      case 'PERCENT_COST':
        return `Giá Nhập + ${val}% Lợi Nhuận Gộp`;
      case 'FIXED_OFFSET':
        return `Giảm cố định -${formatVND(val)}`;
      default:
        return 'Giá Cố Định Tự Nhập';
    }
  };

  const filteredMatrixItems = matrixItems.filter(
    (item) =>
      item.productName.toLowerCase().includes(matrixSearch.toLowerCase()) ||
      item.sku.toLowerCase().includes(matrixSearch.toLowerCase()) ||
      item.barcode.includes(matrixSearch)
  );

  const filteredComparisonRows = comparisonMatrix?.rows?.filter(
    (r: any) =>
      r.product.name.toLowerCase().includes(comparisonSearch.toLowerCase()) ||
      r.product.sku.toLowerCase().includes(comparisonSearch.toLowerCase()) ||
      r.product.barcode.includes(comparisonSearch)
  ) || [];

  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto space-y-6">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Thiết Lập & So Sánh Bảng Giá (KiotViet Standard)</h1>
          <p className="text-slate-400 text-xs mt-1">Xem, quản lý, chỉnh sửa và so sánh song song nhiều bảng giá cùng lúc</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle Buttons */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('CATALOG')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'CATALOG'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Danh Sách Bảng Giá</span>
            </button>
            <button
              onClick={() => setViewMode('COMPARISON')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'COMPARISON'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-4 h-4 text-emerald-400" />
              <span>📊 Ma Trận So Sánh Nhanh</span>
            </button>
          </div>

          {viewMode === 'CATALOG' ? (
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Mới Bảng Giá</span>
            </button>
          ) : (
            <button
              onClick={handleExportComparisonCsv}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel So Sánh</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: CATALOG VIEW */}
      {viewMode === 'CATALOG' && (
        <div className="space-y-6">
          {/* Filter Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên bảng giá, mã BG..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {[
                { label: 'Tất cả', val: 'Tất cả' },
                { label: 'Giá chung', val: 'STANDARD' },
                { label: 'Bán sỉ', val: 'WHOLESALE' },
                { label: 'Khách VIP', val: 'CUSTOMER_GROUP' },
                { label: 'Khuyến mãi', val: 'PROMOTION' },
              ].map((t) => (
                <button
                  key={t.val}
                  onClick={() => setSelectedType(t.val)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedType === t.val
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Lists Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Mã / Tên Bảng Giá</th>
                    <th className="p-4">Loại Bảng Giá</th>
                    <th className="p-4">Công Thức Tự Động</th>
                    <th className="p-4">Đối Tượng Áp Dụng</th>
                    <th className="p-4">Hiệu Lực</th>
                    <th className="p-4">Trạng Thái</th>
                    <th className="p-4 text-right">Thao Tác (KiotViet)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {priceLists.map((pl) => (
                    <tr key={pl.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{pl.name}</div>
                        <span className="text-[11px] text-blue-400 font-mono">{pl.code}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            pl.type === 'STANDARD'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : pl.type === 'WHOLESALE'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : pl.type === 'PROMOTION'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {pl.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <Calculator className="w-3.5 h-3.5 text-blue-400" />
                          <span>{getMethodText(pl.calculationMethod, pl.value)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>{pl.appliedCustomerGroups.join(', ')}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        {pl.startDate ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            <span>{pl.startDate} → {pl.endDate || 'Vô thời hạn'}</span>
                          </div>
                        ) : (
                          'Vô thời hạn'
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(pl.id)}
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] border flex items-center gap-1 transition-all ${
                            pl.isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                          title="Click để Bật / Tắt trạng thái áp dụng"
                        >
                          {pl.isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                          <span>{pl.isActive ? 'Đang Áp Dụng' : 'Ngưng Áp Dụng'}</span>
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenMatrixEditor(pl.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-md shadow-blue-600/20"
                            title="Thêm & Chỉnh sửa giá sản phẩm chi tiết"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Thêm/Sửa SP</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditSettingsModal(pl)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700/80"
                            title="Chỉnh sửa thông tin thiết lập bảng giá"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDuplicatePriceList(pl.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/80"
                            title="Sao chép / Nhân bản bảng giá này"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeletePriceList(pl)}
                            disabled={pl.code === 'BG-BASE' || pl.type === 'STANDARD'}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/80 disabled:opacity-30 disabled:pointer-events-none"
                            title="Xóa bảng giá"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: KIOTVIET MULTI-PRICE LIST COMPARISON MATRIX */}
      {viewMode === 'COMPARISON' && (
        <div className="space-y-4">
          {/* Price Lists Column Selector Bar */}
          <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-bold text-sm text-blue-400">
                <Columns className="w-4 h-4" />
                <span>Chọn Các Bảng Giá Cần So Sánh Song Song:</span>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={comparisonSearch}
                  onChange={(e) => setComparisonSearch(e.target.value)}
                  placeholder="Lọc sản phẩm cần so sánh..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg glass-input text-xs"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {priceLists.map((pl) => {
                const isSelected = selectedComparisonListIds.includes(pl.id);
                return (
                  <label
                    key={pl.id}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleComparisonListId(pl.id)}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{pl.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4 min-w-[220px]">Sản phẩm / SKU</th>
                    <th className="p-4">Đơn vị</th>
                    <th className="p-4">Giá nhập</th>
                    <th className="p-4 text-white font-bold bg-slate-950/40">Giá Bán Niêm Yết</th>

                    {comparisonMatrix?.priceLists?.map((pl: any) => (
                      <th key={pl.id} className="p-4 min-w-[170px] text-emerald-400 border-l border-slate-800/80">
                        <div className="font-bold">{pl.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono font-normal">{pl.code}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredComparisonRows.map((r: any) => {
                    const prod = r.product;
                    return (
                      <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-white text-xs">{prod.name}</div>
                          <div className="text-[10px] text-blue-400 font-mono">
                            {prod.sku} | Barcode: {prod.barcode}
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-400">{prod.unit}</td>
                        <td className="p-4 text-slate-500 font-medium">{formatVND(prod.costPrice)}</td>
                        <td className="p-4 font-bold text-white bg-slate-950/20">{formatVND(prod.sellingPrice)}</td>

                        {/* Price List Columns Side-by-side */}
                        {comparisonMatrix?.priceLists?.map((pl: any) => {
                          const priceData = r.prices[pl.id];
                          const price = priceData?.price || prod.sellingPrice;
                          const diffPercent = priceData?.diffPercent || 0;
                          const isOverridden = priceData?.isOverridden;

                          return (
                            <td key={pl.id} className="p-4 border-l border-slate-800/80 bg-slate-900/30">
                              <div className="font-bold text-emerald-400 text-sm">{formatVND(price)}</div>
                              <div className="flex items-center gap-1 mt-0.5">
                                {diffPercent !== 0 && (
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold flex items-center ${
                                      diffPercent < 0
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-amber-500/20 text-amber-300'
                                    }`}
                                  >
                                    {diffPercent < 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                    {diffPercent}%
                                  </span>
                                )}
                                {isOverridden && (
                                  <span className="text-[9px] text-amber-400 font-bold" title="Giá tùy chỉnh thủ công">
                                    ✏️ Lẻ
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal KiotViet Interactive Product Price List Matrix Editor */}
      {editingPriceList && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-blue-400">
                  <Edit3 className="w-5 h-5" />
                  <h3 className="font-bold text-lg text-white">Chỉnh Sửa Sản Phẩm Vào Bảng Giá</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Bảng giá: <b>{editingPriceList.name}</b> ({editingPriceList.code})
                </span>
              </div>
              <button onClick={() => setEditingPriceList(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-400 shrink-0">⚡ Áp dụng công thức chung hàng loạt:</span>
                <select
                  value={bulkFormulaMethod}
                  onChange={(e: any) => setBulkFormulaMethod(e.target.value)}
                  className="px-3 py-2 rounded-lg glass-input bg-slate-900 font-medium"
                >
                  <option value="PERCENT_BASE">% Giảm so với Giá Bán Niêm Yết (Giá chung - %)</option>
                  <option value="PERCENT_COST">% Lợi Nhuận so với Giá Nhập (Giá nhập + %)</option>
                  <option value="FIXED_OFFSET">Giảm số tiền cố định (Giá chung - VNĐ)</option>
                </select>
                <input
                  type="number"
                  value={bulkFormulaValue}
                  onChange={(e) => setBulkFormulaValue(Number(e.target.value))}
                  placeholder="10"
                  className="w-20 px-3 py-2 rounded-lg glass-input font-bold text-emerald-400"
                />
                <button
                  onClick={handleApplyBulkFormula}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shrink-0 shadow-md shadow-blue-600/30"
                >
                  Áp Dụng Tất Cả
                </button>
              </div>

              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={matrixSearch}
                  onChange={(e) => setMatrixSearch(e.target.value)}
                  placeholder="Lọc theo tên, SKU, Barcode..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 font-bold border-b border-slate-800 text-slate-400 uppercase">
                  <tr>
                    <th className="p-3">Sản phẩm / Mã SKU</th>
                    <th className="p-3">Đơn Vị Tính</th>
                    <th className="p-3">Giá Nhập</th>
                    <th className="p-3">Giá Bán Niêm Yết</th>
                    <th className="p-3">Giá Trong Bảng Giá (Tùy chỉnh trực tiếp)</th>
                    <th className="p-3">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMatrixItems.map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="font-bold text-white text-xs">{item.productName}</div>
                        <div className="text-[10px] text-blue-400 font-mono">
                          {item.sku} | Barcode: {item.barcode}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-300">
                        {item.unit}
                        {item.conversionUnit && (
                          <div className="text-[10px] text-slate-400">Quy đổi: {item.conversionUnit}</div>
                        )}
                      </td>
                      <td className="p-3 text-slate-500">{formatVND(item.costPrice)}</td>
                      <td className="p-3 text-slate-400 font-medium">{formatVND(item.basePrice)}</td>

                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400 w-12">{item.unit}:</span>
                            <input
                              type="number"
                              value={item.customPrice}
                              onChange={(e) => handleItemPriceChange(item.productId, Number(e.target.value), false)}
                              className="w-32 px-2.5 py-1 rounded bg-slate-950 border border-blue-500/60 font-bold text-emerald-400 text-xs focus:border-blue-500"
                            />
                            <span className="text-[11px] text-slate-400">đ</span>
                          </div>

                          {item.conversionUnit && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-400 w-12">{item.conversionUnit}:</span>
                              <input
                                type="number"
                                value={item.customConversionPrice || 0}
                                onChange={(e) =>
                                  handleItemPriceChange(item.productId, Number(e.target.value), true)
                                }
                                className="w-32 px-2.5 py-1 rounded bg-slate-950 border border-purple-500/60 font-bold text-purple-400 text-xs focus:border-purple-500"
                              />
                              <span className="text-[11px] text-slate-400">đ</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        {item.isOverridden ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px] border border-amber-500/30">
                            ✏️ Giá Tùy Chỉnh Lẻ
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px]">
                            ⚡ Theo Công Thức
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">Đang hiển thị {filteredMatrixItems.length} sản phẩm trong bảng giá</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingPriceList(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveMatrixChanges}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Thiết Lập Bảng Giá</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Settings Price List */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-blue-400">
                <Edit2 className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">Chỉnh Sửa Thiết Lập Bảng Giá</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePriceListSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên bảng giá (*)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Loại Bảng Giá</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-semibold"
                  >
                    <option value="WHOLESALE">Bán Sỉ / Đại Lý</option>
                    <option value="CUSTOMER_GROUP">Khách Hàng VIP</option>
                    <option value="PROMOTION">Khuyến Mãi Sự Kiện</option>
                    <option value="STANDARD">Giá Chung</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nhóm Áp Dụng</label>
                  <select
                    value={appliedCustomerGroups[0]}
                    onChange={(e) => setAppliedCustomerGroups([e.target.value])}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-semibold text-amber-400"
                  >
                    <option value="WHOLESALE">Bán sỉ (WHOLESALE)</option>
                    <option value="VIP">VIP Member</option>
                    <option value="RETAIL">Bán lẻ (RETAIL)</option>
                    <option value="ALL">Tất cả Khách hàng</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-blue-400 font-bold">⚙️ Thiết Lập Công Thức Tính Giá Tự Động</label>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Phương thức tính giá:</label>
                  <select
                    value={calculationMethod}
                    onChange={(e: any) => setCalculationMethod(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900"
                  >
                    <option value="PERCENT_BASE">% Giảm so với Giá Bán Niêm Yết (Giá chung - %)</option>
                    <option value="PERCENT_COST">% Lợi Nhuận Gộp so với Giá Nhập (Giá nhập + %)</option>
                    <option value="FIXED_OFFSET">Giảm số tiền cố định (Giá chung - VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Giá trị điều chỉnh ({calculationMethod.includes('PERCENT') ? '%' : 'VNĐ'}):
                  </label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-emerald-400 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Từ ngày (Hiệu lực)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Đến ngày</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-300">Trạng Thái Áp Dụng:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className={isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {isActive ? 'Đang Áp Dụng' : 'Ngưng Áp Dụng'}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ghi chú</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 mt-2"
              >
                Cập Nhật Thông Tin Bảng Giá
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal KiotViet Style Create Price List */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-blue-400">
                <Calculator className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">Tạo Mới Bảng Giá (Chuẩn KiotViet)</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePriceList} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên bảng giá (*)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bảng Giá Bán Sỉ Tết 2026"
                  className="w-full px-3 py-2.5 rounded-xl glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Loại Bảng Giá</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-semibold"
                  >
                    <option value="WHOLESALE">Bán Sỉ / Đại Lý</option>
                    <option value="CUSTOMER_GROUP">Khách Hàng VIP</option>
                    <option value="PROMOTION">Khuyến Mãi Sự Kiện</option>
                    <option value="STANDARD">Giá Chung</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nhóm Áp Dụng</label>
                  <select
                    onChange={(e) => setAppliedCustomerGroups([e.target.value])}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-semibold text-amber-400"
                  >
                    <option value="WHOLESALE">Bán sỉ (WHOLESALE)</option>
                    <option value="VIP">VIP Member</option>
                    <option value="RETAIL">Bán lẻ (RETAIL)</option>
                    <option value="ALL">Tất cả Khách hàng</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-blue-400 font-bold">⚙️ Thiết Lập Công Thức Tính Giá Tự Động</label>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Phương thức tính giá:</label>
                  <select
                    value={calculationMethod}
                    onChange={(e: any) => setCalculationMethod(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900"
                  >
                    <option value="PERCENT_BASE">% Giảm so với Giá Bán Niêm Yết (Giá chung - %)</option>
                    <option value="PERCENT_COST">% Lợi Nhuận Gộp so với Giá Nhập (Giá nhập + %)</option>
                    <option value="FIXED_OFFSET">Giảm số tiền cố định (Giá chung - VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Giá trị điều chỉnh ({calculationMethod.includes('PERCENT') ? '%' : 'VNĐ'}):
                  </label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-emerald-400 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Từ ngày (Hiệu lực)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Đến ngày</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ghi chú</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú điều kiện bảng giá..."
                  className="w-full px-3 py-2.5 rounded-xl glass-input"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 mt-2"
              >
                Lưu Bảng Giá & Khởi Tạo Ma Trận
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceListsPage;
