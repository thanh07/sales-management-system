import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { PackagePlus, Search, Tag, Barcode, Layers, Edit2, Trash2, Plus, X, Download, Upload, ArrowRightLeft, ShieldAlert, Scale, ChevronDown, ChevronRight, MapPin, Award, Filter, RefreshCw, DollarSign, RotateCcw, Edit3, Save, Check, Sparkles, FileSpreadsheet } from 'lucide-react';
import { ImportExcelModal, downloadProductExcelTemplate } from '../components/products/ImportExcelModal';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedBrand, setSelectedBrand] = useState('Tất cả');
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');

  // Modals States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [expandedProductIds, setExpandedProductIds] = useState<string[]>(['prod-taphoap-003']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Entity States
  const [newCatName, setNewCatName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newLocName, setNewLocName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');

  // Form Product State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('Nước Giải Khát & Đồ Uống');
  const [brand, setBrand] = useState('Red Bull');
  const [location, setLocation] = useState('Kệ Nước A1 - Dãy 1');
  const [unit, setUnit] = useState('Lon');

  // MULTI-LEVEL UNIT CONVERSIONS STATE
  const [hasConversion, setHasConversion] = useState(true);
  const [conversions, setConversions] = useState<{ id: string; unitName: string; conversionFactor: number; sellingPrice: number }[]>([
    { id: 'c-1', unitName: 'Lốc', conversionFactor: 6, sellingPrice: 85000 },
    { id: 'c-2', unitName: 'Thùng', conversionFactor: 24, sellingPrice: 340000 },
  ]);

  const [costPrice, setCostPrice] = useState<number>(11000);
  const [sellingPrice, setSellingPrice] = useState<number>(15000);
  const [stockQuantity, setStockQuantity] = useState<number>(240);
  const [minStock, setMinStock] = useState<number>(24);
  const [image, setImage] = useState('');

  // Product Attributes Builder State
  const [hasVariants, setHasVariants] = useState(false);
  const [attributes, setAttributes] = useState<{ name: string; values: string[] }[]>([
    { name: 'Hương vị', values: ['Truyền Thống', 'Ít Đường'] },
  ]);
  const [tempAttrValue, setTempAttrValue] = useState<Record<number, string>>({});
  const [variantMatrix, setVariantMatrix] = useState<any[]>([]);

  // Inline Quick Editing for Variant Prices in Catalog Table
  const [inlineEditingVariantId, setInlineEditingVariantId] = useState<string | null>(null);
  const [inlineVariantPrice, setInlineVariantPrice] = useState<number>(0);
  const [inlineVariantStock, setInlineVariantStock] = useState<number>(0);
  const [inlineVariantConversions, setInlineVariantConversions] = useState<Record<string, number>>({});

  const fetchProducts = async () => {
    try {
      const res: any = await api.get('/products', {
        params: {
          query: searchQuery,
          category: selectedCategory,
          brand: selectedBrand,
          location: selectedLocation,
        },
      });
      setProducts(res.data.products || []);
      setCategories(res.data.categories || []);
      setBrands(res.data.brands || []);
      setLocations(res.data.locations || []);
      const fetchedUnits = res.data.units || [];
      setUnits(fetchedUnits);

      if (fetchedUnits.length > 0 && !unit) {
        setUnit(fetchedUnits[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, selectedBrand, selectedLocation]);

  // Generate or rebuild matrix when attributes or conversions change (Proposal 1)
  const rebuildVariantMatrix = (attrs: { name: string; values: string[] }[]) => {
    if (attrs.length === 0) {
      setVariantMatrix([]);
      return;
    }

    const combinations = (acc: Record<string, string>[], attrIdx: number): Record<string, string>[] => {
      if (attrIdx >= attrs.length) return acc;
      const currentAttr = attrs[attrIdx];
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
      const skuSuffix = Object.values(combination).join('-').toUpperCase().replace(/\s+/g, '');
      const existing = variantMatrix.find((v) => v.variantName.endsWith(suffix));

      const basePrice = existing?.sellingPrice || sellingPrice;
      // Inherit Parent Unit Conversions & Auto Calculate Variant Conversion Prices
      const variantConversions: Record<string, number> = existing?.variantConversions ? { ...existing.variantConversions } : {};
      if (hasConversion && conversions.length > 0) {
        conversions.forEach((c) => {
          if (!variantConversions[c.unitName]) {
            variantConversions[c.unitName] = basePrice * c.conversionFactor;
          }
        });
      }

      return {
        id: existing?.id || `v-${Date.now()}-${idx + 1}`,
        variantName: `${name || 'Sản Phẩm'} - ${suffix}`,
        sku: existing?.sku || `${sku || 'SKU'}-${skuSuffix}`,
        barcode: existing?.barcode || `893500${(400000 + idx).toString()}`,
        attributeValues: combination,
        costPrice: existing?.costPrice || costPrice,
        sellingPrice: basePrice,
        variantConversions,
        stockQuantity: existing?.stockQuantity || 20,
        minStock: existing?.minStock || 5,
      };
    });

    setVariantMatrix(generatedVariants);
  };

  const handleToggleVariants = (enabled: boolean) => {
    setHasVariants(enabled);
    if (enabled && attributes.length === 0) {
      const initialAttrs = [{ name: 'Hương vị', values: ['Truyền Thống', 'Ít Đường'] }];
      setAttributes(initialAttrs);
      rebuildVariantMatrix(initialAttrs);
    } else if (enabled) {
      rebuildVariantMatrix(attributes);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Bạn có chắc chắn muốn XÓA HẾT dữ liệu cũ và khởi tạo lại 300 sản phẩm hàng tạp hóa mới?')) return;
    try {
      const res: any = await api.post('/products/reset');
      alert(res.message || 'Đã tạo lại 300 sản phẩm mới thành công');
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo lại dữ liệu');
    }
  };

  const handleClearAllData = async () => {
    if (!confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ dữ liệu sản phẩm hàng hóa không?')) return;
    try {
      const res: any = await api.post('/products/clear-all');
      alert(res.message || 'Đã xóa toàn bộ sản phẩm');
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa dữ liệu');
    }
  };

  const handleOpenAddModal = () => {
    handleGenerateBarcode();
    setName('');
    setHasVariants(false);
    setAttributes([{ name: 'Hương vị', values: ['Truyền Thống', 'Ít Đường'] }]);
    setVariantMatrix([]);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (p: any) => {
    setEditingProduct(p);
    setName(p.name || '');
    setSku(p.sku || '');
    setBarcode(p.barcode || '');
    setCategory(p.category || categories[0] || 'Nước Giải Khát & Đồ Uống');
    setBrand(p.brand || brands[0] || 'Red Bull');
    setLocation(p.location || locations[0] || 'Kệ Nước A1 - Dãy 1');
    setUnit(p.unit || units[0] || 'Lon');
    setCostPrice(p.costPrice || 0);
    setSellingPrice(p.sellingPrice || 0);
    setStockQuantity(p.stockQuantity || 0);
    setMinStock(p.minStock || 10);
    setImage(p.image || '');

    const convList = p.conversions && p.conversions.length > 0
      ? p.conversions
      : (p.conversionUnit ? [{ id: 'c0', unitName: p.conversionUnit, conversionFactor: p.conversionFactor || 24, sellingPrice: p.conversionSellingPrice || p.sellingPrice * 24 }] : []);

    if (convList.length > 0) {
      setHasConversion(true);
      setConversions(convList);
    } else {
      setHasConversion(false);
      setConversions([]);
    }

    if (p.hasVariants && p.variants && p.variants.length > 0) {
      setHasVariants(true);
      setAttributes(p.attributes || [{ name: 'Thuộc tính 1', values: ['Mẫu A', 'Mẫu B'] }]);
      setVariantMatrix(p.variants);
    } else {
      setHasVariants(false);
      setAttributes([{ name: 'Hương vị', values: ['Truyền Thống', 'Ít Đường'] }]);
      setVariantMatrix([]);
    }

    setIsEditModalOpen(true);
  };

  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      await api.put(`/products/${editingProduct.id}`, {
        name,
        sku,
        barcode,
        category,
        brand,
        location,
        unit,
        conversions: hasConversion ? conversions : undefined,
        conversionUnit: hasConversion && conversions.length > 0 ? conversions[0].unitName : undefined,
        conversionFactor: hasConversion && conversions.length > 0 ? Number(conversions[0].conversionFactor) : undefined,
        conversionSellingPrice: hasConversion && conversions.length > 0 ? Number(conversions[0].sellingPrice) : undefined,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        stockQuantity: hasVariants ? variantMatrix.reduce((sum, v) => sum + Number(v.stockQuantity), 0) : Number(stockQuantity),
        minStock: Number(minStock),
        image: image || editingProduct.image,
        hasVariants,
        attributes: hasVariants ? attributes : undefined,
        variants: hasVariants ? variantMatrix : undefined,
      });

      alert(`Đã cập nhật thông tin sản phẩm và giá biến thể quy đổi thành công!`);
      setIsEditModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật sản phẩm');
    }
  };

  // Quick Inline Save for Variant Price & Conversions directly in Catalog Table
  const handleSaveInlineVariant = async (parentProduct: any, variantId: string) => {
    try {
      const updatedVariants = parentProduct.variants.map((v: any) => {
        if (v.id === variantId) {
          return {
            ...v,
            sellingPrice: Number(inlineVariantPrice),
            stockQuantity: Number(inlineVariantStock),
            variantConversions: inlineVariantConversions,
          };
        }
        return v;
      });

      await api.put(`/products/${parentProduct.id}`, {
        ...parentProduct,
        variants: updatedVariants,
        stockQuantity: updatedVariants.reduce((sum: number, v: any) => sum + Number(v.stockQuantity), 0),
      });

      setInlineEditingVariantId(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật giá biến thể');
    }
  };

  const handleUpdateVariantInMatrix = (variantId: string, field: string, value: any) => {
    setVariantMatrix((prev) =>
      prev.map((v) => {
        if (v.id === variantId) {
          const updated = { ...v, [field]: value };
          // If selling base price changes, auto re-calculate default variant conversion prices if not customized
          if (field === 'sellingPrice' && hasConversion && conversions.length > 0) {
            const vConvs: Record<string, number> = { ...(updated.variantConversions || {}) };
            conversions.forEach((c) => {
              vConvs[c.unitName] = Number(value) * c.conversionFactor;
            });
            updated.variantConversions = vConvs;
          }
          return updated;
        }
        return v;
      })
    );
  };

  const handleUpdateVariantConversionInMatrix = (variantId: string, unitName: string, price: number) => {
    setVariantMatrix((prev) =>
      prev.map((v) => {
        if (v.id === variantId) {
          const vConvs = { ...(v.variantConversions || {}), [unitName]: price };
          return { ...v, variantConversions: vConvs };
        }
        return v;
      })
    );
  };

  const handleDeleteProduct = async (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${p.name}"?`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa sản phẩm');
    }
  };

  const handleAddConversionRow = () => {
    const availableUnits = units.filter((u) => u !== unit && !conversions.some((c) => c.unitName === u));
    const nextUnit = availableUnits.length > 0 ? availableUnits[0] : (units.find((u) => u !== unit) || 'Thùng');
    const updatedConvs = [
      ...conversions,
      {
        id: `conv-${Date.now()}`,
        unitName: nextUnit,
        conversionFactor: 12,
        sellingPrice: sellingPrice * 12,
      },
    ];
    setConversions(updatedConvs);
    if (hasVariants) rebuildVariantMatrix(attributes);
  };

  const handleRemoveConversionRow = (id: string) => {
    const updatedConvs = conversions.filter((c) => c.id !== id);
    setConversions(updatedConvs);
    if (hasVariants) rebuildVariantMatrix(attributes);
  };

  const handleUpdateConversionRow = (id: string, field: string, val: any) => {
    setConversions((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, [field]: val };
          if (field === 'conversionFactor' && sellingPrice > 0) {
            updated.sellingPrice = Number(val) * sellingPrice;
          }
          return updated;
        }
        return c;
      })
    );
    if (hasVariants) rebuildVariantMatrix(attributes);
  };

  const handleAddAttribute = () => {
    const updated = [...attributes, { name: `Thuộc tính ${attributes.length + 1}`, values: [] }];
    setAttributes(updated);
    rebuildVariantMatrix(updated);
  };

  const handleRemoveAttribute = (idx: number) => {
    const updated = attributes.filter((_, i) => i !== idx);
    setAttributes(updated);
    rebuildVariantMatrix(updated);
  };

  const handleAddAttrValue = (attrIdx: number) => {
    const val = tempAttrValue[attrIdx]?.trim();
    if (!val) return;
    const updated = [...attributes];
    if (!updated[attrIdx].values.includes(val)) {
      updated[attrIdx].values.push(val);
      setAttributes(updated);
      rebuildVariantMatrix(updated);
    }
    setTempAttrValue({ ...tempAttrValue, [attrIdx]: '' });
  };

  const handleRemoveAttrValue = (attrIdx: number, val: string) => {
    const updated = [...attributes];
    updated[attrIdx].values = updated[attrIdx].values.filter((v) => v !== val);
    setAttributes(updated);
    rebuildVariantMatrix(updated);
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
        location,
        unit,
        conversions: hasConversion ? conversions : undefined,
        conversionUnit: hasConversion && conversions.length > 0 ? conversions[0].unitName : undefined,
        conversionFactor: hasConversion && conversions.length > 0 ? Number(conversions[0].conversionFactor) : undefined,
        conversionSellingPrice: hasConversion && conversions.length > 0 ? Number(conversions[0].sellingPrice) : undefined,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        stockQuantity: hasVariants ? variantMatrix.reduce((s, v) => s + Number(v.stockQuantity), 0) : Number(stockQuantity),
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
      a.download = 'danh_sach_san_pham_da_don_vi_quy_doi.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Lỗi xuất file Excel');
    }
  };

  const handleDownloadTemplate = () => {
    downloadProductExcelTemplate();
  };

  const handleImportExcelClick = () => {
    setIsImportExcelModalOpen(true);
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
            category: parts[3]?.replace(/"/g, '').trim() || 'Sữa & Sản Phẩm Từ Sữa',
            brand: parts[4]?.replace(/"/g, '').trim() || 'Vinamilk',
            location: parts[5]?.replace(/"/g, '').trim() || 'Kho Lạnh 01',
            unit: parts[6]?.replace(/"/g, '').trim() || 'Hộp',
            costPrice: Number(parts[9]) || 150000,
            sellingPrice: Number(parts[10]) || 250000,
            stockQuantity: Number(parts[12]) || 100,
            minStock: Number(parts[13]) || 10,
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

  // Brand Actions
  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    try {
      await api.post('/products/brands', { name: newBrandName });
      setNewBrandName('');
      setBrand(newBrandName.trim());
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi thêm thương hiệu mới');
    }
  };

  const handleDeleteBrand = async (bName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa thương hiệu "${bName}"?`)) return;
    try {
      await api.delete(`/products/brands/${encodeURIComponent(bName)}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa thương hiệu');
    }
  };

  // Location Actions
  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;
    try {
      await api.post('/products/locations', { name: newLocName });
      setNewLocName('');
      setLocation(newLocName.trim());
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi thêm vị trí kho mới');
    }
  };

  const handleDeleteLocation = async (lName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa vị trí kho "${lName}"?`)) return;
    try {
      await api.delete(`/products/locations/${encodeURIComponent(lName)}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa vị trí kho');
    }
  };

  // Custom Unit Actions
  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    try {
      const res: any = await api.post('/products/units', { name: newUnitName });
      setNewUnitName('');
      setUnit(newUnitName.trim());
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

  // Shared Form Section: Product Attributes & Variant Matrix Builder Component (PROPOSAL 1)
  const renderAttributesAndVariantsSection = () => (
    <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/50 space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => handleToggleVariants(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="font-bold text-blue-300 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>3. Hàng hóa có thuộc tính & biến thể (Màu sắc, Hương vị, Size...)</span>
          </span>
        </label>

        {hasVariants && (
          <button
            type="button"
            onClick={handleAddAttribute}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shrink-0 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Thêm Thuộc Tính</span>
          </button>
        )}
      </div>

      {hasVariants && (
        <div className="space-y-3 pt-2">
          {/* Attributes List */}
          {attributes.map((attr, attrIdx) => (
            <div key={attrIdx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={attr.name}
                  onChange={(e) => {
                    const updated = [...attributes];
                    updated[attrIdx].name = e.target.value;
                    setAttributes(updated);
                    rebuildVariantMatrix(updated);
                  }}
                  placeholder="Tên thuộc tính (VD: Hương vị, Size...)"
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(attrIdx)}
                  className="text-slate-400 hover:text-red-400 text-xs font-semibold"
                >
                  Xóa thuộc tính
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 items-center">
                {attr.values.map((val) => (
                  <span key={val} className="px-2.5 py-1 rounded-md bg-blue-600/20 text-blue-300 text-xs font-bold border border-blue-500/30 flex items-center gap-1">
                    <span>{val}</span>
                    <X
                      className="w-3.5 h-3.5 cursor-pointer hover:text-red-400"
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
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs w-40"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddAttrValue(attrIdx)}
                    className="px-2 py-1 bg-slate-800 text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-700"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Editable Variant Matrix Table (With Kế Thừa ĐVT Quy Đổi) */}
          {variantMatrix.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="font-bold text-emerald-400 text-xs flex items-center justify-between">
                <span>⚡ BẢNG THIẾT LẬP GIÁ BÁN & TỒN KHO CHO TỪNG BIẾN THỂ ({variantMatrix.length} mặt hàng):</span>
                <span className="text-[11px] text-purple-300 font-bold">✓ Tự động kế thừa cấp ĐVT Quy Đổi từ SP Mẹ</span>
              </div>

              <div className="max-h-64 overflow-y-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5">Tên Biến Thể</th>
                      <th className="p-2.5">Mã SKU</th>
                      <th className="p-2.5 text-blue-400">Giá Bán Lẻ ({unit})</th>
                      {hasConversion && conversions.map((c) => (
                        <th key={c.id} className="p-2.5 text-purple-300">Giá 1 {c.unitName} (x{c.conversionFactor})</th>
                      ))}
                      <th className="p-2.5 text-emerald-400">Tồn Kho ({unit})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {variantMatrix.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-900/60">
                        <td className="p-2.5 font-bold text-white">{v.variantName}</td>
                        <td className="p-2.5 text-blue-300 font-mono">{v.sku}</td>

                        {/* Editable Variant Selling Base Price */}
                        <td className="p-2.5">
                          <input
                            type="number"
                            value={v.sellingPrice}
                            onChange={(e) => handleUpdateVariantInMatrix(v.id, 'sellingPrice', Number(e.target.value))}
                            className="w-24 px-2 py-1 rounded bg-slate-950 border border-blue-500/80 font-bold text-blue-400 text-xs"
                          />
                        </td>

                        {/* Inherited Variant Conversion Prices (Auto calculated & Editable) */}
                        {hasConversion && conversions.map((c) => {
                          const convPrice = v.variantConversions?.[c.unitName] !== undefined
                            ? v.variantConversions[c.unitName]
                            : v.sellingPrice * c.conversionFactor;

                          return (
                            <td key={c.id} className="p-2.5">
                              <input
                                type="number"
                                value={convPrice}
                                onChange={(e) => handleUpdateVariantConversionInMatrix(v.id, c.unitName, Number(e.target.value))}
                                className="w-28 px-2 py-1 rounded bg-slate-950 border border-purple-500/80 font-bold text-purple-300 text-xs"
                              />
                            </td>
                          );
                        })}

                        {/* Editable Variant Stock */}
                        <td className="p-2.5">
                          <input
                            type="number"
                            value={v.stockQuantity}
                            onChange={(e) => handleUpdateVariantInMatrix(v.id, 'stockQuantity', Number(e.target.value))}
                            className="w-20 px-2 py-1 rounded bg-slate-950 border border-emerald-500/80 font-bold text-emerald-400 text-xs"
                          />
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
    </div>
  );

  return (
    <div className="p-3 sm:p-6 h-[calc(100vh-4rem)] overflow-y-auto space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,.xlsx" className="hidden" />

      {/* Header & Main Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Quản Lý Hàng Hóa ({products.length} Sản Phẩm)</h1>
          <p className="text-slate-400 text-xs mt-0.5">Quản lý sản phẩm, tồn kho, vị trí kho & bảng giá quy đổi đơn vị</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all shrink-0"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Thêm Sản Phẩm Mới</span>
          </button>

          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-all shadow-md shrink-0"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Vị Trí Kho ({locations.length})</span>
          </button>

          <button
            onClick={() => setIsBrandModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-all shadow-md shrink-0"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Thương Hiệu ({brands.length})</span>
          </button>

          <button
            onClick={() => setIsUnitModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-all shadow-md shrink-0"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>ĐVT ({units.length})</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-all shadow-md shrink-0"
            title="Xuất danh sách sản phẩm hiện tại ra file Excel CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>

          <button
            onClick={() => setIsImportExcelModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/80 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 shrink-0"
            title="Nhập hàng hóa từ file Excel / CSV có xem trước dữ liệu"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Excel</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-all shadow-md shrink-0"
            title="Tải file mẫu Excel chuẩn có sẵn cột bắt buộc và dữ liệu mẫu"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tải File Mẫu</span>
          </button>

          <button
            onClick={handleResetData}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-all shadow-md shrink-0"
            title="Tạo lại 300 sản phẩm mẫu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tạo Lại 300 SP</span>
          </button>

          <button
            onClick={handleClearAllData}
            className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium flex items-center gap-1.5 transition-all shadow-md shrink-0"
            title="Xóa sạch toàn bộ sản phẩm hàng hóa"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xóa Hết SP</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-slate-800 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
          <Filter className="w-4 h-4" />
          <span>Bộ Lọc Tìm Kiếm & Kiểm Kê:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, SKU, Barcode..."
              className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input bg-slate-900 font-semibold text-slate-200"
            >
              <option value="Tất cả">📁 Tất cả Nhóm Hàng ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input bg-slate-900 font-semibold text-purple-300"
            >
              <option value="Tất cả">🏷️ Tất cả Thương Hiệu ({brands.length})</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input bg-slate-900 font-semibold text-amber-400"
            >
              <option value="Tất cả">📍 Tất cả Vị Trí Kho ({locations.length})</option>
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 1. MOBILE RESPONSIVE PRODUCT CARD LIST (Visible on < md screens) */}
      <div className="block md:hidden space-y-3">
        {products.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">Không tìm thấy sản phẩm phù hợp.</div>
        ) : (
          products.map((p) => {
            const isExpanded = expandedProductIds.includes(p.id);
            const hasChildren = p.hasVariants && p.variants && p.variants.length > 0;
            const convList = p.conversions && p.conversions.length > 0
              ? p.conversions
              : (p.conversionUnit ? [{ id: 'c0', unitName: p.conversionUnit, conversionFactor: p.conversionFactor || 24, sellingPrice: p.conversionSellingPrice || p.sellingPrice * 24 }] : []);
            const isLowStock = p.stockQuantity <= p.minStock;

            return (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 shadow-md"
              >
                {/* Header Row: Thumbnail + Title + Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-800" />
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-xs line-clamp-1 flex items-center gap-1">
                        <span>{p.name}</span>
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-bold text-blue-400 text-[11px]">{p.sku}</span>
                        {p.barcode && <span className="font-mono text-slate-500 text-[10px]">| {p.barcode}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30"
                      title="Sửa sản phẩm"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProduct(p, e)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-700/80"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Badges: Category, Brand, Location */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                    📁 {p.category}
                  </span>
                  {p.brand && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                      🏷️ {p.brand}
                    </span>
                  )}
                  {p.location && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-amber-400" />
                      <span>{p.location}</span>
                    </span>
                  )}
                </div>

                {/* Stock & Pricing Breakdown Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Tồn kho thực tế:</span>
                    <div className={`font-bold ${isLowStock ? 'text-red-400' : 'text-emerald-400'}`}>
                      {p.stockQuantity} {p.unit}
                    </div>
                    {convList.length > 0 && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        (= {Math.floor(p.stockQuantity / convList[0].conversionFactor)} {convList[0].unitName})
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Giá bán lẻ:</span>
                    <div className="font-bold text-blue-400">{formatVND(p.sellingPrice)} / {p.unit}</div>
                    {convList.map((c: any) => (
                      <div key={c.id || c.unitName} className="text-[10px] text-purple-300 font-medium">
                        {formatVND(c.sellingPrice)} / {c.unitName} (x{c.conversionFactor})
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variants Dropdown for Mobile */}
                {hasChildren && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => toggleExpandProduct(p.id)}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-bold text-blue-300"
                    >
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        <span>Danh sách {p.variants.length} biến thể</span>
                      </div>
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-2 pl-2 border-l-2 border-blue-500">
                        {p.variants.map((variant: any) => (
                          <div key={variant.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                            <div className="font-bold text-white flex justify-between">
                              <span>{variant.variantName}</span>
                              <span className="text-emerald-400">{variant.stockQuantity} {p.unit}</span>
                            </div>
                            <div className="flex justify-between text-slate-400 text-[10px]">
                              <span className="font-mono text-blue-300">{variant.sku}</span>
                              <span className="font-bold text-blue-400">{formatVND(variant.sellingPrice)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 2. DESKTOP PRODUCTS TABLE (Visible on >= md screens) */}
      <div className="hidden md:block glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4 w-10"></th>
                <th className="p-4">Hình ảnh / Tên Sản Phẩm & Biến Thể</th>
                <th className="p-4">SKU / Barcode</th>
                <th className="p-4">Phân Loại</th>
                <th className="p-4 text-purple-300">Các Cấp Đơn Vị Quy Đổi</th>
                <th className="p-4">Giá Bán Theo Cấp Đơn Vị / Biến Thể</th>
                <th className="p-4">Tồn Kho (Nhỏ Nhất)</th>
                <th className="p-4 text-right">Thao Tác (Chỉnh Sửa)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map((p) => {
                const isExpanded = expandedProductIds.includes(p.id);
                const hasChildren = p.hasVariants && p.variants && p.variants.length > 0;
                const convList = p.conversions && p.conversions.length > 0
                  ? p.conversions
                  : (p.conversionUnit ? [{ id: 'c0', unitName: p.conversionUnit, conversionFactor: p.conversionFactor || 24, sellingPrice: p.conversionSellingPrice || p.sellingPrice * 24 }] : []);

                return (
                  <React.Fragment key={p.id}>
                    {/* Parent Product Row */}
                    <tr
                      onClick={() => handleOpenEditModal(p)}
                      className={`hover:bg-slate-800/50 transition-colors cursor-pointer group/row ${hasChildren ? 'bg-slate-900/40 font-semibold' : ''}`}
                    >
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
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
                            <div className="font-bold text-white text-xs flex items-center gap-1.5 group-hover/row:text-blue-400 transition-colors">
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
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700/60 block w-max text-[11px]">
                            📁 {p.category}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-medium border border-purple-500/20 block w-max text-[10px]">
                            🏷️ {p.brand}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-bold text-emerald-400 text-xs">
                            ĐV nhỏ nhất: {p.unit}
                          </div>
                          {convList.map((c: any) => (
                            <div key={c.id || c.unitName} className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 text-[11px] flex items-center gap-1 w-max">
                              <RefreshCw className="w-3 h-3 text-purple-400" />
                              <span>1 {c.unitName} = {c.conversionFactor} {p.unit}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-blue-400 text-xs">Bán lẻ ({p.unit}): {formatVND(p.sellingPrice)}</div>
                        {convList.map((c: any) => (
                          <div key={c.id || c.unitName} className="font-bold text-purple-300 text-[11px] mt-0.5">
                            Bán {c.unitName}: {formatVND(c.sellingPrice)}
                          </div>
                        ))}
                        <div className="text-slate-400 text-[10px] mt-0.5">Giá nhập: {formatVND(p.costPrice)}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-emerald-400 text-sm">
                          {p.stockQuantity} {p.unit}
                        </div>
                        {convList.length > 0 && (
                          <div className="text-[10px] text-slate-400 font-mono space-y-0.5">
                            {convList.map((c: any) => (
                              <div key={c.id || c.unitName}>
                                (= {Math.floor(p.stockQuantity / c.conversionFactor)} {c.unitName})
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm"
                            title="Click để chỉnh sửa thông tin sản phẩm và ma trận biến thể"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Sửa Sản Phẩm</span>
                          </button>

                          <button
                            onClick={(e) => handleDeleteProduct(p, e)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/80 transition-all"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* VARIANT SUB-ROWS WITH INHERITED & EDITABLE CONVERSION PRICES (PROPOSAL 1) */}
                    {hasChildren && isExpanded && (
                      p.variants.map((variant: any) => {
                        const isInlineEditing = inlineEditingVariantId === variant.id;

                        return (
                          <tr key={variant.id} className="bg-slate-950/70 border-l-4 border-blue-500 hover:bg-slate-950/90 transition-colors">
                            <td></td>
                            <td className="p-3 pl-8">
                              <div className="font-bold text-slate-200 text-xs flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                <span>{variant.variantName}</span>
                              </div>
                            </td>
                            <td className="p-3 font-mono text-[11px]">
                              <div className="text-blue-300 font-bold">{variant.sku}</div>
                              <div className="text-amber-400 text-[10px]">{variant.barcode}</div>
                            </td>
                            <td className="p-3 text-slate-400 text-[11px]">{p.category}</td>

                            {/* Inherited Conversion Units Badges */}
                            <td className="p-3">
                              <div className="space-y-1">
                                <div className="font-bold text-emerald-400 text-xs font-mono">{p.unit}</div>
                                {convList.map((c: any) => (
                                  <div key={c.id || c.unitName} className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 text-[10px] flex items-center gap-1 w-max">
                                    <span>{c.unitName} (x{c.conversionFactor})</span>
                                  </div>
                                ))}
                              </div>
                            </td>

                            {/* Variant Prices Display & Inline Editor */}
                            <td className="p-3">
                              {isInlineEditing ? (
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-blue-300 w-12 font-semibold">Bán lẻ:</span>
                                    <input
                                      type="number"
                                      value={inlineVariantPrice}
                                      onChange={(e) => setInlineVariantPrice(Number(e.target.value))}
                                      className="w-24 px-2 py-0.5 rounded bg-slate-900 border border-blue-500 text-blue-400 font-bold text-xs focus:outline-none"
                                    />
                                  </div>

                                  {convList.map((c: any) => {
                                    const convPrice = inlineVariantConversions[c.unitName] !== undefined
                                      ? inlineVariantConversions[c.unitName]
                                      : inlineVariantPrice * c.conversionFactor;

                                    return (
                                      <div key={c.id} className="flex items-center gap-1">
                                        <span className="text-[10px] text-purple-300 w-12 font-semibold">{c.unitName}:</span>
                                        <input
                                          type="number"
                                          value={convPrice}
                                          onChange={(e) =>
                                            setInlineVariantConversions({
                                              ...inlineVariantConversions,
                                              [c.unitName]: Number(e.target.value),
                                            })
                                          }
                                          className="w-24 px-2 py-0.5 rounded bg-slate-900 border border-purple-500 text-purple-300 font-bold text-xs focus:outline-none"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="space-y-0.5 text-xs">
                                  <div className="font-bold text-blue-400">
                                    Bán lẻ ({p.unit}): {formatVND(variant.sellingPrice)}
                                  </div>
                                  {convList.map((c: any) => {
                                    const variantConvPrice = variant.variantConversions?.[c.unitName] !== undefined
                                      ? variant.variantConversions[c.unitName]
                                      : variant.sellingPrice * c.conversionFactor;

                                    return (
                                      <div key={c.id} className="font-bold text-purple-300 text-[11px]">
                                        Bán {c.unitName}: {formatVND(variantConvPrice)}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </td>

                            {/* Variant Stock */}
                            <td className="p-3">
                              {isInlineEditing ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={inlineVariantStock}
                                    onChange={(e) => setInlineVariantStock(Number(e.target.value))}
                                    className="w-20 px-2 py-1 rounded bg-slate-900 border border-emerald-500 text-emerald-400 font-bold text-xs focus:outline-none"
                                  />
                                  <span className="text-[11px] text-slate-400">{p.unit}</span>
                                </div>
                              ) : (
                                <div className="font-bold text-emerald-400 text-xs">
                                  {variant.stockQuantity} {p.unit}
                                </div>
                              )}
                            </td>

                            {/* Action Edit Variant */}
                            <td className="p-3 text-right">
                              {isInlineEditing ? (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleSaveInlineVariant(p, variant.id)}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[10px] flex items-center gap-1 shadow"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Lưu</span>
                                  </button>
                                  <button
                                    onClick={() => setInlineEditingVariantId(null)}
                                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold text-[10px]"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setInlineEditingVariantId(variant.id);
                                    setInlineVariantPrice(variant.sellingPrice);
                                    setInlineVariantStock(variant.stockQuantity);
                                    setInlineVariantConversions(variant.variantConversions || {});
                                  }}
                                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-700/80 text-[10px] font-bold flex items-center gap-1 ml-auto"
                                  title="Chỉnh sửa giá lẻ & giá quy đổi riêng cho biến thể này"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Sửa Giá Biến Thể</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT PRODUCT */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-blue-400">
                <Edit3 className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">Chỉnh Sửa Thông Tin Sản Phẩm & Biến Thể</h3>
              </div>
              <button onClick={() => { setIsEditModalOpen(false); setEditingProduct(null); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên sản phẩm (*)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-white text-sm"
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

              {/* Category, Brand & Location Selectors */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nhóm hàng</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-purple-300 font-bold mb-1">Thương hiệu</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-bold text-purple-300"
                  >
                    {brands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-amber-400 font-bold mb-1">📍 Vị trí kho</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-bold text-amber-300"
                  >
                    {locations.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION 1: MAIN SMALLEST UNIT & RETAIL PRICE */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Scale className="w-4 h-4" />
                    <span>1. Đơn Vị Tính Cơ Bản (Nhỏ Nhất) & Giá Bán Lẻ Mặc Định</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUnitModalOpen(true)}
                    className="text-[11px] text-emerald-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm / Quản lý ĐVT Hệ Thống</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Đơn vị nhỏ nhất (*)</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-bold text-emerald-400 text-xs"
                    >
                      {units.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Giá nhập / {unit} (VNĐ)</label>
                    <input
                      type="number"
                      value={costPrice}
                      onChange={(e) => setCostPrice(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Giá bán lẻ / {unit} (VNĐ)</label>
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-blue-400 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DYNAMIC MULTI-LEVEL UNIT CONVERSIONS BUILDER */}
              <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasConversion}
                      onChange={(e) => setHasConversion(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-bold text-purple-300 text-sm flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-purple-400" />
                      <span>2. Thiết lập Các Cấp Đơn Vị Quy Đổi Lớn (Lốc, Thùng, Két...)</span>
                    </span>
                  </label>

                  {hasConversion && (
                    <button
                      type="button"
                      onClick={handleAddConversionRow}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 shrink-0 shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm ĐVT Quy Đổi</span>
                    </button>
                  )}
                </div>

                {hasConversion && (
                  <div className="space-y-3 pt-2">
                    {conversions.map((conv, idx) => (
                      <div key={conv.id} className="p-3 rounded-xl bg-slate-900 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 font-bold text-purple-400 w-20 shrink-0">
                          <span>Cấp {idx + 1}:</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 flex-1">
                          <div>
                            <label className="block text-slate-400 text-[10px] mb-0.5">Tên ĐVT quy đổi</label>
                            <select
                              value={conv.unitName}
                              onChange={(e) => handleUpdateConversionRow(conv.id, 'unitName', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg glass-input bg-slate-950 font-bold text-purple-300 text-xs"
                            >
                              {units.filter((u) => u !== unit).map((u) => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[10px] mb-0.5">1 {conv.unitName} = ? {unit}</label>
                            <input
                              type="number"
                              value={conv.conversionFactor}
                              onChange={(e) => handleUpdateConversionRow(conv.id, 'conversionFactor', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded-lg glass-input font-bold text-amber-400 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-purple-300 text-[10px] font-bold mb-0.5">Giá bán / 1 {conv.unitName} (VNĐ)</label>
                            <input
                              type="number"
                              value={conv.sellingPrice}
                              onChange={(e) => handleUpdateConversionRow(conv.id, 'sellingPrice', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded-lg glass-input font-bold text-emerald-400 text-xs border-purple-500/50"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveConversionRow(conv.id)}
                          className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 shrink-0 self-end md:self-center"
                          title="Xóa đơn vị quy đổi này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 3: PRODUCT ATTRIBUTES & VARIANT MATRIX BUILDER */}
              {renderAttributesAndVariantsSection()}

              {!hasVariants && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Tổng tồn kho (Tính theo đơn vị nhỏ nhất `{unit}`) (*)
                    </label>
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-emerald-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Ngưỡng cảnh báo sắp hết hàng</label>
                    <input
                      type="number"
                      value={minStock}
                      onChange={(e) => setMinStock(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-red-400"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingProduct(null); }}
                  className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Hủy Thao Tác
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 text-xs flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Tất Cả Thay Đổi & Biến Thể</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Manage Storage Locations */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400">
                <MapPin className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">Quản Lý Vị Trí Lưu Kho (Kệ / Dãy / Kho)</h3>
              </div>
              <button onClick={() => setIsLocationModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLocation} className="flex gap-2">
              <input
                type="text"
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
                placeholder="Nhập tên vị trí..."
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Vị Trí</span>
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {locations.map((l) => (
                <div key={l} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{l}</span>
                  </span>
                  <button
                    onClick={() => handleDeleteLocation(l)}
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

      {/* Modal Manage Brands */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-purple-400">
                <Award className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">Quản Lý Thương Hiệu (Brand)</h3>
              </div>
              <button onClick={() => setIsBrandModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBrand} className="flex gap-2">
              <input
                type="text"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Nhập tên thương hiệu mới..."
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Brand</span>
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {brands.map((b) => (
                <div key={b} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <span className="font-semibold text-purple-300">{b}</span>
                  <button
                    onClick={() => handleDeleteBrand(b)}
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

      {/* Central Modal Manage Custom Units */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <Scale className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">Quản Lý Đơn Vị Tính Tự Tạo (Hệ Thống)</h3>
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
                placeholder="Nhập tên đơn vị tính mới..."
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs font-semibold text-emerald-300"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm ĐVT</span>
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {units.map((u) => (
                <div key={u} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{u}</span>
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

      {/* Modal Add Product Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-blue-400">
                <PackagePlus className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">Thêm Sản Phẩm Mới (Đồng Bộ Danh Mục ĐVT Hệ Thống)</h3>
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
                  placeholder="e.g. Nước Tăng Lực Red Bull"
                  className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-white text-sm"
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

              {/* Category, Brand & Location Selectors */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nhóm hàng</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-purple-300 font-bold mb-1">Thương hiệu</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-bold text-purple-300"
                  >
                    {brands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-amber-400 font-bold mb-1">📍 Vị trí kho</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-bold text-amber-300"
                  >
                    {locations.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION 1: MAIN SMALLEST UNIT & RETAIL PRICE */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Scale className="w-4 h-4" />
                    <span>1. Đơn Vị Tính Cơ Bản (Nhỏ Nhất) & Giá Bán Lẻ</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUnitModalOpen(true)}
                    className="text-[11px] text-emerald-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm / Quản lý ĐVT Hệ Thống</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Đơn vị nhỏ nhất (*)</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-bold text-emerald-400 text-xs"
                    >
                      {units.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Giá nhập / {unit} (VNĐ)</label>
                    <input
                      type="number"
                      value={costPrice}
                      onChange={(e) => setCostPrice(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Giá bán lẻ / {unit} (VNĐ)</label>
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-blue-400 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DYNAMIC MULTI-LEVEL UNIT CONVERSIONS BUILDER */}
              <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasConversion}
                      onChange={(e) => setHasConversion(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-bold text-purple-300 text-sm flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-purple-400" />
                      <span>2. Thiết lập Các Cấp Đơn Vị Quy Đổi Lớn (Chọn từ Danh Mục ĐVT Hệ Thống)</span>
                    </span>
                  </label>

                  {hasConversion && (
                    <button
                      type="button"
                      onClick={handleAddConversionRow}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 shrink-0 shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm ĐVT Quy Đổi</span>
                    </button>
                  )}
                </div>

                {hasConversion && (
                  <div className="space-y-3 pt-2">
                    {conversions.map((conv, idx) => (
                      <div key={conv.id} className="p-3 rounded-xl bg-slate-900 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 font-bold text-purple-400 w-20 shrink-0">
                          <span>Cấp {idx + 1}:</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 flex-1">
                          <div>
                            <label className="block text-slate-400 text-[10px] mb-0.5">Tên ĐVT quy đổi</label>
                            <select
                              value={conv.unitName}
                              onChange={(e) => handleUpdateConversionRow(conv.id, 'unitName', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg glass-input bg-slate-950 font-bold text-purple-300 text-xs"
                            >
                              {units.filter((u) => u !== unit).map((u) => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[10px] mb-0.5">1 {conv.unitName} = ? {unit}</label>
                            <input
                              type="number"
                              value={conv.conversionFactor}
                              onChange={(e) => handleUpdateConversionRow(conv.id, 'conversionFactor', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded-lg glass-input font-bold text-amber-400 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-purple-300 text-[10px] font-bold mb-0.5">Giá bán / 1 {conv.unitName} (VNĐ)</label>
                            <input
                              type="number"
                              value={conv.sellingPrice}
                              onChange={(e) => handleUpdateConversionRow(conv.id, 'sellingPrice', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded-lg glass-input font-bold text-emerald-400 text-xs border-purple-500/50"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveConversionRow(conv.id)}
                          className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 shrink-0 self-end md:self-center"
                          title="Xóa đơn vị quy đổi này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 3: PRODUCT ATTRIBUTES & VARIANT MATRIX BUILDER */}
              {renderAttributesAndVariantsSection()}

              {!hasVariants && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Tổng tồn kho (Tính theo đơn vị nhỏ nhất `{unit}`) (*)
                    </label>
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-emerald-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Ngưỡng cảnh báo sắp hết hàng</label>
                    <input
                      type="number"
                      value={minStock}
                      onChange={(e) => setMinStock(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-red-400"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 mt-2 text-sm flex items-center justify-center gap-2"
              >
                <PackagePlus className="w-4 h-4" />
                <span>Lưu Sản Phẩm & Khởi Tạo Đơn Vị Quy Đổi Đồng Bộ</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Import Excel / CSV Modal with Data Preview & Validation */}
      <ImportExcelModal
        isOpen={isImportExcelModalOpen}
        onClose={() => setIsImportExcelModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
};

export default ProductsPage;
