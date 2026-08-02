import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { PackagePlus, Search, Tag, Barcode, Layers, Edit2, Trash2, Plus, X, Download, Upload, ArrowRightLeft, ShieldAlert, Scale, ChevronDown, ChevronRight, Check } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [expandedProductIds, setExpandedProductIds] = useState<string[]>(['prod-attr-01']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category Edit State
  const [newCatName, setNewCatName] = useState('');
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Unit Manager State
  const [newUnitName, setNewUnitName] = useState('');

  // Form Product State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('Thời Trang & May Mặc');
  const [brand, setBrand] = useState('Coolmate');
  const [unit, setUnit] = useState('Cái');
  const [conversionUnit, setConversionUnit] = useState('');
  const [conversionFactor, setConversionFactor] = useState<number>(1);
  const [costPrice, setCostPrice] = useState<number>(150000);
  const [sellingPrice, setSellingPrice] = useState<number>(250000);
  const [stockQuantity, setStockQuantity] = useState<number>(100);
  const [minStock, setMinStock] = useState<number>(10);
  const [image, setImage] = useState('');

  // Product Attributes Builder State (KiotViet 4.3 Feature #1)
  const [hasVariants, setHasVariants] = useState(false);
  const [attributes, setAttributes] = useState<{ name: string; values: string[] }[]>([
    { name: 'Màu sắc', values: ['Đen', 'Trắng'] },
    { name: 'Kích thước', values: ['M', 'L'] },
  ]);
  const [tempAttrValue, setTempAttrValue] = useState<Record<number, string>>({});
  const [variantMatrix, setVariantMatrix] = useState<any[]>([]);

  const fetchProducts = async () => {
    try {
      const res: any = await api.get('/products', {
        params: { query: searchQuery, category: selectedCategory },
      });
      setProducts(res.data.products || []);
      setCategories(res.data.categories || []);
      setUnits(res.data.units || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory]);

  // Generate Cartesian Product Variant Matrix whenever attributes change
  useEffect(() => {
    if (!hasVariants || attributes.length === 0) {
      setVariantMatrix([]);
      return;
    }

    const combinations = (acc: Record<string, string>[], attrIdx: number): Record<string, string>[] => {
      if (attrIdx >= attributes.length) return acc;
      const currentAttr = attributes[attrIdx];
      if (!currentAttr.values || currentAttr.values.length === 0) return combinations(acc, attrIdx + 1);

      const newAcc: Record<string, string>[] = [];
      if (acc.length === 0) {
        currentAttr.values.forEach((v) => newAcc.push({ [currentAttr.name]: v }));
      } else {
        acc.forEach((existing) => {
          currentAttr.values.forEach((v) => {
            newAcc.push({ ...existing, [currentAttr.name]: v });
          });
        });
      }
      return combinations(newAcc, attrIdx + 1);
    };

    const matrix = combinations([], 0);
    const generatedVariants = matrix.map((combination, idx) => {
      const suffix = Object.values(combination).join(' - ');
      const skuSuffix = Object.values(combination).join('-').toUpperCase();
      return {
        id: `v-${idx + 1}`,
        variantName: `${name || 'Sản Phẩm'} - ${suffix}`,
        sku: `${sku || 'SKU'}-${skuSuffix}`,
        barcode: `893500${(400000 + idx).toString()}`,
        attributeValues: combination,
        costPrice,
        sellingPrice,
        stockQuantity: 20,
        minStock: 5,
      };
    });

    setVariantMatrix(generatedVariants);
  }, [hasVariants, attributes, name, sku, costPrice, sellingPrice]);

  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: `Thuộc tính ${attributes.length + 1}`, values: [] }]);
  };

  const handleRemoveAttribute = (idx: number) => {
    setAttributes(attributes.filter((_, i) => i !== idx));
  };

  const handleAddAttrValue = (attrIdx: number) => {
    const val = tempAttrValue[attrIdx]?.trim();
    if (!val) return;
    const updated = [...attributes];
    if (!updated[attrIdx].values.includes(val)) {
      updated[attrIdx].values.push(val);
      setAttributes(updated);
    }
    setTempAttrValue({ ...tempAttrValue, [attrIdx]: '' });
  };

  const handleRemoveAttrValue = (attrIdx: number, val: string) => {
    const updated = [...attributes];
    updated[attrIdx].values = updated[attrIdx].values.filter((v) => v !== val);
    setAttributes(updated);
  };

  const handleGenerateBarcode = () => {
    const randomCode = '893500' + Math.floor(100000 + Math.random() * 900000);
    setBarcode(randomCode);
    setSku('SP-' + Math.floor(1000 + Math.random() * 9000));
  };

  const toggleExpandProduct = (id: string) => {
    setExpandedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const defaultImg = image || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&q=80';
      await api.post('/products', {
        name,
        sku: sku || 'SP-' + Date.now(),
        barcode: barcode || '893' + Date.now(),
        category,
        brand,
        unit,
        conversionUnit: conversionUnit || undefined,
        conversionFactor: conversionFactor ? Number(conversionFactor) : undefined,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        stockQuantity: Number(stockQuantity),
        minStock: Number(minStock),
        image: defaultImg,
        isActive: true,
        hasVariants,
        attributes: hasVariants ? attributes : undefined,
        variants: hasVariants ? variantMatrix : undefined,
      });

      setIsAddModalOpen(false);
      setName('');
      setSku('');
      setBarcode('');
      setImage('');
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo sản phẩm mới');
    }
  };

  // Export Excel CSV
  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/v1/products/export-excel', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Không thể tải file Excel');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'danh_sach_san_pham_bien_the.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Lỗi xuất file Excel');
    }
  };

  const handleImportExcelClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const lines = content.split('\n').filter((l) => l.trim().length > 0);
      const items = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 3) {
          items.push({
            sku: parts[0]?.replace(/"/g, '').trim(),
            barcode: parts[1]?.replace(/"/g, '').trim(),
            name: parts[2]?.replace(/"/g, '').trim(),
            category: parts[3]?.replace(/"/g, '').trim() || 'Thời Trang & May Mặc',
            unit: parts[4]?.replace(/"/g, '').trim() || 'Cái',
            costPrice: Number(parts[7]) || 150000,
            sellingPrice: Number(parts[8]) || 250000,
            stockQuantity: Number(parts[10]) || 100,
            minStock: Number(parts[11]) || 10,
          });
        }
      }

      try {
        const res: any = await api.post('/products/import-excel', { items });
        alert(res.message || 'Đã import thành công danh sách sản phẩm');
        fetchProducts();
      } catch (err: any) {
        alert(err.message || 'Lỗi import file');
      }
    };
    reader.readAsText(file);
  };

  // Custom Unit Actions
  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    try {
      await api.post('/products/units', { name: newUnitName });
      setNewUnitName('');
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi thêm đơn vị tính mới');
    }
  };

  const handleDeleteUnit = async (unitName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa đơn vị tính "${unitName}"?`)) return;
    try {
      await api.delete(`/products/units/${encodeURIComponent(unitName)}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa đơn vị tính');
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto space-y-6">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,.xlsx" className="hidden" />

      {/* Header & Main Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản Lý Hàng Hóa Có Thuộc Tính & Đơn Vị Tính</h1>
          <p className="text-slate-400 text-xs mt-1">Tự động sinh Ma trận biến thể (Màu sắc, Size, Dung lượng...), Barcode độc nhất & Đơn vị tính quy đổi</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={handleImportExcelClick}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-all shadow-md"
          >
            <Upload className="w-4 h-4" />
            <span>Nhập Excel</span>
          </button>
          <button
            onClick={() => setIsUnitModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-all shadow-md"
          >
            <Scale className="w-4 h-4" />
            <span>Đơn Vị Tính ({units.length})</span>
          </button>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-all shadow-md"
          >
            <Layers className="w-4 h-4" />
            <span>Danh Mục</span>
          </button>
          <button
            onClick={() => {
              handleGenerateBarcode();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Thêm Sản Phẩm Mới</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, SKU, mã Barcode độc nhất..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['Tất cả', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/50'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Catalog Table with Expandable Variants */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4 w-10"></th>
                <th className="p-4">Hình ảnh / Tên Sản Phẩm</th>
                <th className="p-4">SKU / Barcode</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4">Đơn vị & Quy Đổi</th>
                <th className="p-4">Giá nhập / Bán lẻ</th>
                <th className="p-4">Tổng Tồn kho</th>
                <th className="p-4">Thuộc Tính</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map((p) => {
                const isExpanded = expandedProductIds.includes(p.id);
                const hasChildren = p.hasVariants && p.variants && p.variants.length > 0;

                return (
                  <React.Fragment key={p.id}>
                    {/* Main Parent Product Row */}
                    <tr className={`hover:bg-slate-800/40 transition-colors ${hasChildren ? 'bg-slate-900/40 font-semibold' : ''}`}>
                      <td className="p-4 text-center">
                        {hasChildren && (
                          <button
                            onClick={() => toggleExpandProduct(p.id)}
                            className="p-1 rounded-lg hover:bg-slate-800 text-blue-400"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0" />
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {hasChildren && (
                                <span className="px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-500/30">
                                  {p.variants.length} biến thể
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono">Thương hiệu: {p.brand}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-[11px]">
                        <div className="text-blue-400 font-bold">{p.sku}</div>
                        <div className="flex items-center gap-1 text-amber-400">
                          <Barcode className="w-3.5 h-3.5" />
                          <span>{p.barcode}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium border border-slate-700/60">
                          {p.category}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-white">
                          {p.conversionUnit ? `1 ${p.conversionUnit} = ${p.conversionFactor} ${p.unit}` : p.unit}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-slate-400 text-[11px]">Nhập: {formatVND(p.costPrice)}</div>
                        <div className="font-bold text-blue-400">Bán lẻ: {formatVND(p.sellingPrice)}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-emerald-400 text-sm">
                          {p.stockQuantity} {p.unit}
                        </div>
                      </td>

                      <td className="p-4">
                        {p.attributes ? (
                          <div className="flex flex-wrap gap-1">
                            {p.attributes.map((attr: any) => (
                              <span key={attr.name} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                                {attr.name}: {attr.values.length}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Không có</span>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Child Variants Matrix Rows (KiotViet Standard) */}
                    {hasChildren && isExpanded && (
                      p.variants.map((variant: any) => (
                        <tr key={variant.id} className="bg-slate-950/60 border-l-4 border-blue-500">
                          <td></td>
                          <td className="p-3 pl-8">
                            <div className="font-medium text-slate-200 text-xs flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                              <span>{variant.variantName}</span>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[11px]">
                            <div className="text-blue-300">{variant.sku}</div>
                            <div className="text-amber-400 text-[10px]">{variant.barcode}</div>
                          </td>
                          <td className="p-3 text-slate-500 text-[11px]">{p.category}</td>
                          <td className="p-3 text-slate-400">{p.unit}</td>
                          <td className="p-3 font-bold text-blue-400">{formatVND(variant.sellingPrice)}</td>
                          <td className="p-3 font-bold text-emerald-400">{variant.stockQuantity} {p.unit}</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              {Object.entries(variant.attributeValues || {}).map(([k, v]) => (
                                <span key={k} className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                                  {k}: {v as string}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Manage Custom Units */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <Scale className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">Quản Lý Đơn Vị Tính Tự Tạo</h3>
              </div>
              <button onClick={() => setIsUnitModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUnit} className="flex gap-2">
              <input
                type="text"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                placeholder="Nhập tên đơn vị tính mới (VD: Chai, Lon, Khay...)"
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm ĐVT</span>
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {units.map((u) => (
                <div key={u} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <span className="font-semibold text-white">{u}</span>
                  <button
                    onClick={() => handleDeleteUnit(u)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Product Form with Attributes Builder (KiotViet Standard) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-blue-400">
                <PackagePlus className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">Thêm Sản Phẩm Mới (Có Thuộc Tính & Biến Thể)</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên sản phẩm (*)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Áo Polo Coolmax Cao Cấp"
                  className="w-full px-3 py-2.5 rounded-xl glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mã SKU (*)</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 font-semibold mb-1">Mã Vạch Barcode (*)</label>
                  <input
                    type="text"
                    required
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input font-mono text-amber-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Danh mục</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input"
                  />
                </div>
              </div>

              {/* Toggle Has Product Attributes / Variants */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => setHasVariants(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-bold text-blue-400">✨ Hàng hóa có thuộc tính (Màu sắc, Kích thước, Size...)</span>
                  </label>
                  {hasVariants && (
                    <button
                      type="button"
                      onClick={handleAddAttribute}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm Thuộc Tính</span>
                    </button>
                  )}
                </div>

                {/* Attributes Builder */}
                {hasVariants && (
                  <div className="space-y-3 pt-2">
                    {attributes.map((attr, attrIdx) => (
                      <div key={attrIdx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={attr.name}
                            onChange={(e) => {
                              const updated = [...attributes];
                              updated[attrIdx].name = e.target.value;
                              setAttributes(updated);
                            }}
                            placeholder="Tên thuộc tính (VD: Màu sắc, Size...)"
                            className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-white font-bold text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAttribute(attrIdx)}
                            className="text-slate-500 hover:text-red-400 text-xs"
                          >
                            Xóa
                          </button>
                        </div>

                        {/* Values list tags */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {attr.values.map((val) => (
                            <span key={val} className="px-2 py-1 rounded-md bg-blue-600/20 text-blue-300 text-xs font-semibold border border-blue-500/30 flex items-center gap-1">
                              <span>{val}</span>
                              <X
                                className="w-3 h-3 cursor-pointer hover:text-red-400"
                                onClick={() => handleRemoveAttrValue(attrIdx, val)}
                              />
                            </span>
                          ))}

                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={tempAttrValue[attrIdx] || ''}
                              onChange={(e) => setTempAttrValue({ ...tempAttrValue, [attrIdx]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddAttrValue(attrIdx);
                                }
                              }}
                              placeholder="Nhập giá trị + Enter..."
                              className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs w-36"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddAttrValue(attrIdx)}
                              className="px-2 py-1 bg-slate-800 text-slate-200 text-[11px] rounded hover:bg-slate-700"
                            >
                              Thêm
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Matrix Live Preview Table */}
                    {variantMatrix.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="font-bold text-emerald-400">
                          ⚡ Ma trận biến thể tự động ({variantMatrix.length} mặt hàng):
                        </div>
                        <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-lg">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-950 text-slate-400 font-bold sticky top-0">
                              <tr>
                                <th className="p-2">Tên Biến Thể</th>
                                <th className="p-2">Mã SKU</th>
                                <th className="p-2">Mã Barcode</th>
                                <th className="p-2">Giá Bán</th>
                                <th className="p-2">Tồn Kho</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {variantMatrix.map((v, idx) => (
                                <tr key={v.id}>
                                  <td className="p-2 font-bold text-white">{v.variantName}</td>
                                  <td className="p-2 text-blue-300 font-mono">{v.sku}</td>
                                  <td className="p-2 text-amber-400 font-mono">{v.barcode}</td>
                                  <td className="p-2 font-bold text-blue-400">{formatVND(v.sellingPrice)}</td>
                                  <td className="p-2 font-bold text-emerald-400">{v.stockQuantity} {unit}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pricing Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Giá nhập chuẩn (VNĐ)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Giá bán lẻ chuẩn (VNĐ)</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-blue-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 mt-2"
              >
                Lưu Sản Phẩm & Khởi Tạo Ma Trận Biến Thể
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
