import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { 
  PackagePlus, 
  Search, 
  Tag, 
  Barcode, 
  Layers, 
  Edit2, 
  Trash2, 
  Plus, 
  X, 
  Download, 
  Upload, 
  ArrowRightLeft, 
  ShieldAlert, 
  Scale, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  MapPin, 
  Award, 
  Filter, 
  RefreshCw, 
  DollarSign, 
  RotateCcw, 
  Edit3, 
  Save, 
  Check, 
  Sparkles, 
  FileSpreadsheet, 
  FolderTree, 
  Eye, 
  Image as ImageIcon, 
  Building2,
  Copy,
  Printer,
  SlidersHorizontal,
  Store,
  CheckSquare,
  Square
} from 'lucide-react';
import { ImportExcelModal, downloadProductExcelTemplate } from '../components/products/ImportExcelModal';
import { BarcodePrintModal } from '../components/products/BarcodePrintModal';
import { CloneProductModal } from '../components/products/CloneProductModal';
import { getSmartProductIcon } from '../utils/productIconHelper';
import { useAuthStore } from '../store/authStore';
import { useBranchStore } from '../store/branchStore';

const PRESET_IMAGES = [
  { label: '🥤 Nước ngọt / Đồ uống', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80' },
  { label: '🥛 Sữa / Đồ tươi', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },
  { label: '🍜 Mì / Thực phẩm khô', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80' },
  { label: '🍪 Bánh kẹo / Snack', url: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=400&q=80' },
  { label: '🧂 Gia vị / Nước mắm', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80' },
  { label: '🧼 Hóa mỹ phẩm / Tạp hóa', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80' },
];

export const ProductsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { branches, selectedBranchId } = useBranchStore();
  const isCashier = user?.role === 'CASHIER' || user?.role === 'SALE';

  const [products, setProducts] = useState<any[]>([]);
  const [branchStocksForm, setBranchStocksForm] = useState<Record<string, number>>({
    'branch-01': 50,
    'branch-02': 50,
    'branch-03': 140,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedBrand, setSelectedBrand] = useState('Tất cả');
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');

  // MISA Multi-selection & Action Dropdown States
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [isUtilityDropdownOpen, setIsUtilityDropdownOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloningSourceProduct, setCloningSourceProduct] = useState<any | null>(null);

  // MISA Inline Column Filter States
  const [filterSku, setFilterSku] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [filterPosDisplay, setFilterPosDisplay] = useState<'ALL' | 'YES' | 'NO'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // MISA Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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

  // Inline Master Rename States
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [editCategoryVal, setEditCategoryVal] = useState('');

  const [editingBrandName, setEditingBrandName] = useState<string | null>(null);
  const [editBrandVal, setEditBrandVal] = useState('');

  const [editingLocationName, setEditingLocationName] = useState<string | null>(null);
  const [editLocationVal, setEditLocationVal] = useState('');

  const [editingUnitName, setEditingUnitName] = useState<string | null>(null);
  const [editUnitVal, setEditUnitVal] = useState('');

  // Helper getters for normalized entity items
  const getItemName = (item: any): string => (typeof item === 'string' ? item : item?.name || '');
  const getItemCount = (item: any): number => (typeof item === 'object' && item !== null ? item.productCount || 0 : 0);

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
      const fetchedProducts = res.data.products || [];
      setProducts(fetchedProducts);
      setCategories(res.data.categories || []);
      setBrands(res.data.brands || []);
      setLocations(res.data.locations || []);
      const fetchedUnits = res.data.units || [];
      setUnits(fetchedUnits);

      // Auto-expand all products that have variants so user sees all variants by default
      const variantProductIds = fetchedProducts
        .filter((p: any) => p.hasVariants && p.variants && p.variants.length > 0)
        .map((p: any) => p.id);
      setExpandedProductIds(variantProductIds);

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

  // MISA Filter Engine
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    if (q) {
      const matchesQ =
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q));
      if (!matchesQ) return false;
    }

    if (selectedCategory !== 'Tất cả' && p.category !== selectedCategory) return false;
    if (selectedBrand !== 'Tất cả' && p.brand !== selectedBrand) return false;
    if (selectedLocation !== 'Tất cả' && p.location !== selectedLocation) return false;

    if (filterSku && !p.sku?.toLowerCase().includes(filterSku.toLowerCase())) return false;
    if (filterName && !p.name?.toLowerCase().includes(filterName.toLowerCase())) return false;
    if (filterCategory && p.category !== filterCategory) return false;
    if (filterUnit && p.unit !== filterUnit) return false;
    if (filterPriceMax && Number(filterPriceMax) > 0 && p.sellingPrice > Number(filterPriceMax)) return false;
    if (filterPosDisplay === 'YES' && p.showOnPos === false) return false;
    if (filterPosDisplay === 'NO' && p.showOnPos !== false) return false;
    if (filterStatus === 'ACTIVE' && p.isActive === false) return false;
    if (filterStatus === 'INACTIVE' && p.isActive !== false) return false;

    return true;
  });

  // MISA Pagination Calculations
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startIndex = filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredProducts.length);

  // MISA Action Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProductIds(paginatedProducts.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleExpandAll = () => {
    const variantProductIds = products
      .filter((p: any) => p.hasVariants && p.variants && p.variants.length > 0)
      .map((p: any) => p.id);

    if (expandedProductIds.length >= variantProductIds.length) {
      setExpandedProductIds([]);
    } else {
      setExpandedProductIds(variantProductIds);
    }
  };

  const handleDuplicateSelectedProduct = (productToClone?: any) => {
    const target = productToClone || (selectedProductIds.length > 0 ? products.find((p) => p.id === selectedProductIds[0]) : null);
    if (!target) {
      alert('Vui lòng tích chọn 1 hàng hóa trên bảng để nhân bản!');
      return;
    }

    setCloningSourceProduct(target);
    setIsCloneModalOpen(true);
  };

  const handleCloneSuccess = (newProduct: any) => {
    fetchProducts();
    if (newProduct?.id) {
      setSelectedProductIds([newProduct.id]);
    }
  };

  const handleOpenFullAddModalFromDraft = (draft: any) => {
    setName(draft.name || '');
    setSku(draft.sku || '');
    setBarcode(draft.barcode || '');
    setCategory(draft.category || 'Nước Giải Khát & Đồ Uống');
    setBrand(draft.brand || 'Red Bull');
    setLocation(draft.location || 'Kệ Nước A1 - Dãy 1');
    setUnit(draft.unit || 'Lon');
    setConversions(draft.conversions || []);
    setHasConversion(!!(draft.conversions && draft.conversions.length > 0));
    setCostPrice(draft.costPrice || 0);
    setSellingPrice(draft.sellingPrice || 0);
    setStockQuantity(draft.stockQuantity || 0);
    setMinStock(draft.minStock || 10);
    setImage(draft.image || PRESET_IMAGES[0].url);
    setHasVariants(draft.hasVariants || false);
    setAttributes(draft.attributes || []);
    setVariantMatrix(draft.variants || []);
    setBranchStocksForm(draft.branchStocks || { 'branch-01': 50, 'branch-02': 50, 'branch-03': 140 });

    setIsAddModalOpen(true);
  };

  const handleDeleteSelectedProducts = async () => {
    if (selectedProductIds.length === 0) {
      alert('Vui lòng tích chọn các sản phẩm cần xóa!');
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedProductIds.length} sản phẩm đã chọn?`)) return;

    try {
      for (const id of selectedProductIds) {
        await api.delete(`/products/${id}`);
      }
      setSelectedProductIds([]);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  const handleBulkToggleActive = async (setActive: boolean) => {
    if (selectedProductIds.length === 0) {
      alert('Vui lòng tích chọn các sản phẩm cần đổi trạng thái!');
      return;
    }
    try {
      for (const id of selectedProductIds) {
        await api.put(`/products/${id}`, { isActive: setActive });
      }
      fetchProducts();
      alert(`Đã cập nhật trạng thái ${setActive ? 'Đang kinh doanh' : 'Ngừng kinh doanh'} cho ${selectedProductIds.length} sản phẩm!`);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleClearInlineFilters = () => {
    setFilterSku('');
    setFilterName('');
    setFilterCategory('');
    setFilterUnit('');
    setFilterPriceMax('');
    setFilterPosDisplay('ALL');
    setFilterStatus('ALL');
    setCurrentPage(1);
  };

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

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    handleGenerateBarcode();
    setName('');
    setImage('https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80');
    setCategory(getItemName(categories[0]) || 'Nước Giải Khát & Đồ Uống');
    setBrand(getItemName(brands[0]) || 'Red Bull');
    setLocation(getItemName(locations[0]) || 'Kệ Nước A1 - Dãy 1');
    setUnit(getItemName(units[0]) || 'Lon');
    setCostPrice(10000);
    setSellingPrice(15000);
    setStockQuantity(100);
    setMinStock(10);
    setBranchStocksForm({
      'branch-01': 40,
      'branch-02': 35,
      'branch-03': 25,
    });
    setHasConversion(false);
    setConversions([]);
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
    setCategory(p.category || getItemName(categories[0]) || 'Nước Giải Khát & Đồ Uống');
    setBrand(p.brand || getItemName(brands[0]) || 'Red Bull');
    setLocation(p.location || getItemName(locations[0]) || 'Kệ Nước A1 - Dãy 1');
    setUnit(p.unit || getItemName(units[0]) || 'Lon');
    setCostPrice(p.costPrice || 0);
    setSellingPrice(p.sellingPrice || 0);
    setStockQuantity(p.stockQuantity || 0);
    setMinStock(p.minStock || 10);
    setImage(p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80');

    if (p.branchStocks) {
      setBranchStocksForm({ ...p.branchStocks });
    } else {
      const b1 = Math.round((p.stockQuantity || 0) * 0.4);
      const b2 = Math.round((p.stockQuantity || 0) * 0.35);
      const b3 = Math.max(0, (p.stockQuantity || 0) - b1 - b2);
      setBranchStocksForm({
        'branch-01': b1,
        'branch-02': b2,
        'branch-03': b3,
      });
    }

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
        branchStocks: branchStocksForm,
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
    const availableUnits = units
      .map(getItemName)
      .filter((uName) => uName !== unit && !conversions.some((c) => c.unitName === uName));
    const nextUnit = availableUnits.length > 0 ? availableUnits[0] : (units.map(getItemName).find((uName) => uName !== unit) || 'Thùng');
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
        branchStocks: branchStocksForm,
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

  // Category Actions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.post('/products/categories', { name: newCatName });
      setNewCatName('');
      setCategory(newCatName.trim());
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi thêm nhóm hàng mới');
    }
  };

  const handleUpdateCategory = async (oldName: string) => {
    if (!editCategoryVal.trim() || editCategoryVal.trim() === oldName) {
      setEditingCategoryName(null);
      return;
    }
    try {
      await api.put(`/products/categories/${encodeURIComponent(oldName)}`, { newName: editCategoryVal.trim() });
      setEditingCategoryName(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật nhóm hàng');
    }
  };

  const handleDeleteCategory = async (catName: string, count: number) => {
    const msg = count > 0
      ? `CẢNH BÁO: Đang có ${count} sản phẩm thuộc nhóm "${catName}". Bạn có chắc chắn muốn xóa nhóm này không?`
      : `Bạn có chắc muốn xóa nhóm hàng "${catName}"?`;
    if (!confirm(msg)) return;
    try {
      await api.delete(`/products/categories/${encodeURIComponent(catName)}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa nhóm hàng');
    }
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

  const handleUpdateBrand = async (oldName: string) => {
    if (!editBrandVal.trim() || editBrandVal.trim() === oldName) {
      setEditingBrandName(null);
      return;
    }
    try {
      await api.put(`/products/brands/${encodeURIComponent(oldName)}`, { newName: editBrandVal.trim() });
      setEditingBrandName(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật thương hiệu');
    }
  };

  const handleDeleteBrand = async (bName: string, count: number) => {
    const msg = count > 0
      ? `CẢNH BÁO: Đang có ${count} sản phẩm thuộc thương hiệu "${bName}". Bạn có chắc chắn muốn xóa không?`
      : `Bạn có chắc muốn xóa thương hiệu "${bName}"?`;
    if (!confirm(msg)) return;
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

  const handleUpdateLocation = async (oldName: string) => {
    if (!editLocationVal.trim() || editLocationVal.trim() === oldName) {
      setEditingLocationName(null);
      return;
    }
    try {
      await api.put(`/products/locations/${encodeURIComponent(oldName)}`, { newName: editLocationVal.trim() });
      setEditingLocationName(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật vị trí kho');
    }
  };

  const handleDeleteLocation = async (lName: string, count: number) => {
    const msg = count > 0
      ? `CẢNH BÁO: Đang có ${count} sản phẩm lưu tại vị trí "${lName}". Bạn có chắc chắn muốn xóa không?`
      : `Bạn có chắc muốn xóa vị trí kho "${lName}"?`;
    if (!confirm(msg)) return;
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
      await api.post('/products/units', { name: newUnitName });
      setNewUnitName('');
      setUnit(newUnitName.trim());
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi thêm đơn vị tính mới');
    }
  };

  const handleUpdateUnit = async (oldName: string) => {
    if (!editUnitVal.trim() || editUnitVal.trim() === oldName) {
      setEditingUnitName(null);
      return;
    }
    try {
      await api.put(`/products/units/${encodeURIComponent(oldName)}`, { newName: editUnitVal.trim() });
      setEditingUnitName(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật đơn vị tính');
    }
  };

  const handleDeleteUnit = async (uName: string, count: number) => {
    const msg = count > 0
      ? `CẢNH BÁO: Đang có ${count} sản phẩm sử dụng đơn vị tính "${uName}". Bạn có chắc chắn muốn xóa không?`
      : `Bạn có chắc muốn xóa đơn vị tính "${uName}"?`;
    if (!confirm(msg)) return;
    try {
      await api.delete(`/products/units/${encodeURIComponent(uName)}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa đơn vị tính');
    }
  };

  // Inline Quick-Add Helpers for Product Add/Edit Form
  const handleQuickAddCategory = async () => {
    const val = prompt('Nhập tên Nhóm Hàng / Danh Mục mới:');
    if (val && val.trim()) {
      try {
        await api.post('/products/categories', { name: val.trim() });
        setCategory(val.trim());
        fetchProducts();
      } catch (err: any) {
        alert(err.message || 'Lỗi tạo nhóm hàng');
      }
    }
  };

  const handleQuickAddBrand = async () => {
    const val = prompt('Nhập tên Thương Hiệu mới:');
    if (val && val.trim()) {
      try {
        await api.post('/products/brands', { name: val.trim() });
        setBrand(val.trim());
        fetchProducts();
      } catch (err: any) {
        alert(err.message || 'Lỗi tạo thương hiệu');
      }
    }
  };

  const handleQuickAddLocation = async () => {
    const val = prompt('Nhập tên Vị Trí Lưu Kho mới (VD: Kệ A1 - Dãy 3, Kho Lạnh 02):');
    if (val && val.trim()) {
      try {
        await api.post('/products/locations', { name: val.trim() });
        setLocation(val.trim());
        fetchProducts();
      } catch (err: any) {
        alert(err.message || 'Lỗi tạo vị trí kho');
      }
    }
  };

  const handleQuickAddUnit = async () => {
    const val = prompt('Nhập tên Đơn Vị Tính mới (VD: Chai 500ml, Thùng 24, Gói):');
    if (val && val.trim()) {
      try {
        await api.post('/products/units', { name: val.trim() });
        setUnit(val.trim());
        fetchProducts();
      } catch (err: any) {
        alert(err.message || 'Lỗi tạo đơn vị tính');
      }
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

      {/* 1. MISA eShop Action Ribbon Toolbar */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Hàng hóa</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
              {filteredProducts.length} sản phẩm
            </span>
          </div>

          {/* Action Ribbon Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {/* + Thêm mới Dropdown */}
            {!isCashier && (
              <div className="relative">
                <button
                  onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm mới</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {isAddDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        setIsAddDropdownOpen(false);
                        handleOpenAddModal();
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-white hover:bg-blue-600/20 hover:text-blue-300 font-semibold flex items-center gap-2"
                    >
                      <PackagePlus className="w-4 h-4 text-blue-400" />
                      <span>Thêm mới hàng hóa</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsAddDropdownOpen(false);
                        handleOpenAddModal();
                        setName('Combo Tiết Kiệm');
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-white hover:bg-blue-600/20 hover:text-blue-300 font-semibold flex items-center gap-2 border-t border-slate-800"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Thêm mới combo</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Nhân bản */}
            {!isCashier && (
              <button
                onClick={handleDuplicateSelectedProduct}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                title="Nhân bản hàng hóa đã chọn để tạo sản phẩm tương tự"
              >
                <Copy className="w-3.5 h-3.5 text-blue-400" />
                <span>Nhân bản</span>
              </button>
            )}

            {/* Sửa */}
            {!isCashier && (
              <button
                onClick={() => {
                  if (selectedProductIds.length === 0) {
                    alert('Vui lòng tích chọn 1 sản phẩm trên bảng để sửa!');
                    return;
                  }
                  const target = products.find((p) => p.id === selectedProductIds[0]);
                  if (target) handleOpenEditModal(target);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                title="Sửa sản phẩm đã chọn"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Sửa</span>
              </button>
            )}

            {/* Xóa */}
            {!isCashier && (
              <button
                onClick={handleDeleteSelectedProducts}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white border border-slate-700 font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                title="Xóa các sản phẩm đã tích chọn"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa</span>
              </button>
            )}

            {/* Nạp */}
            <button
              onClick={fetchProducts}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
              title="Nạp lại danh sách"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Nạp</span>
            </button>

            {/* In tem mã */}
            <button
              onClick={() => setIsBarcodeModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
              title="In tem mã vạch sản phẩm"
            >
              <Barcode className="w-3.5 h-3.5 text-amber-400" />
              <span>In tem mã</span>
            </button>

            {/* Tiện ích */}
            {!isCashier && (
              <div className="relative">
                <button
                  onClick={() => setIsUtilityDropdownOpen(!isUtilityDropdownOpen)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Tiện ích</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {isUtilityDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-52 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1 z-30 text-xs">
                    <button
                      onClick={() => {
                        setIsUtilityDropdownOpen(false);
                        handleBulkToggleActive(true);
                      }}
                      className="w-full px-3.5 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Đang kinh doanh hàng loạt</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUtilityDropdownOpen(false);
                        handleBulkToggleActive(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 border-t border-slate-800"
                    >
                      <X className="w-3.5 h-3.5 text-red-400" />
                      <span>Ngừng kinh doanh hàng loạt</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUtilityDropdownOpen(false);
                        handleResetData();
                      }}
                      className="w-full px-3.5 py-2 text-left text-blue-400 hover:bg-slate-800 flex items-center gap-2 border-t border-slate-800"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Khởi tạo lại 300 SP theo Chi nhánh</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUtilityDropdownOpen(false);
                        handleClearAllData();
                      }}
                      className="w-full px-3.5 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa sạch toàn bộ sản phẩm</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Nhập khẩu */}
            {!isCashier && (
              <button
                onClick={() => setIsImportExcelModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                title="Nhập danh mục hàng hóa từ file Excel"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nhập khẩu</span>
              </button>
            )}

            {/* Xuất khẩu */}
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
              title="Xuất danh mục hàng hóa ra Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất khẩu</span>
            </button>
          </div>
        </div>

        {/* Master Catalog Quick Access Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition-all"
          >
            <FolderTree className="w-3 h-3" />
            <span>Nhóm Hàng ({categories.length})</span>
          </button>

          <button
            onClick={() => setIsBrandModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-400 border border-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition-all"
          >
            <Award className="w-3 h-3" />
            <span>Thương Hiệu ({brands.length})</span>
          </button>

          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition-all"
          >
            <MapPin className="w-3 h-3" />
            <span>Vị Trí Kho ({locations.length})</span>
          </button>

          <button
            onClick={() => setIsUnitModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition-all"
          >
            <Scale className="w-3 h-3" />
            <span>ĐVT ({units.length})</span>
          </button>

          <button
            onClick={handleToggleExpandAll}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
              expandedProductIds.length > 0
                ? 'bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border-blue-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
            title="Mở rộng hoặc thu gọn tất cả danh sách biến thể"
          >
            <Layers className="w-3 h-3 text-blue-400" />
            <span>{expandedProductIds.length > 0 ? 'Thu Gọn Biến Thể' : 'Mở Rộng Tất Cả Biến Thể'}</span>
          </button>
        </div>
      </div>

      {/* 2. DESKTOP PRODUCTS TABLE WITH INLINE COLUMN FILTERS (MISA eShop style) */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full min-w-[1050px] text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800 sticky top-0 z-20 select-none">
              {/* Row 1: Column Titles */}
              <tr className="border-b border-slate-800/80">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedProductIds.includes(p.id))}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-950 border-slate-700"
                  />
                </th>
                <th className="p-3 font-bold">Mã hàng hóa</th>
                <th className="p-3 font-bold min-w-[200px]">Tên hàng hóa</th>
                <th className="p-3 font-bold">Nhóm hàng hóa</th>
                <th className="p-3 font-bold">Đơn vị tính</th>
                <th className="p-3 font-bold text-right">Giá bán lẻ (VNĐ)</th>
                <th className="p-3 font-bold text-center">
                  {(() => {
                    const activeBranchObj = branches.find((b) => b.id === selectedBranchId) || branches[0];
                    return `Tồn kho (${activeBranchObj?.code || 'CN-01'})`;
                  })()}
                </th>
                <th className="p-3 font-bold text-center">Hiển thị POS</th>
                <th className="p-3 font-bold text-center">Trạng thái</th>
                {!isCashier && <th className="p-3 text-right">Thao Tác</th>}
              </tr>

              {/* Row 2: MISA Inline Filters */}
              <tr className="bg-slate-950/90 text-[11px] border-b border-slate-800 font-normal">
                <th className="p-2 text-center text-slate-500">*</th>
                
                {/* Filter Mã SKU */}
                <th className="p-1.5">
                  <input
                    type="text"
                    value={filterSku}
                    onChange={(e) => { setFilterSku(e.target.value); setCurrentPage(1); }}
                    placeholder="* Lọc mã..."
                    className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-blue-300 text-xs font-mono"
                  />
                </th>

                {/* Filter Tên hàng */}
                <th className="p-1.5">
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => { setFilterName(e.target.value); setCurrentPage(1); }}
                    placeholder="* Lọc tên sản phẩm..."
                    className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs font-medium"
                  />
                </th>

                {/* Filter Nhóm hàng */}
                <th className="p-1.5">
                  <select
                    value={filterCategory}
                    onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                    className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                  >
                    <option value="">* Tất cả nhóm</option>
                    {categories.map((c) => (
                      <option key={getItemName(c)} value={getItemName(c)}>
                        {getItemName(c)}
                      </option>
                    ))}
                  </select>
                </th>

                {/* Filter ĐVT */}
                <th className="p-1.5">
                  <select
                    value={filterUnit}
                    onChange={(e) => { setFilterUnit(e.target.value); setCurrentPage(1); }}
                    className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                  >
                    <option value="">* Tất cả ĐVT</option>
                    {units.map((u) => (
                      <option key={getItemName(u)} value={getItemName(u)}>
                        {getItemName(u)}
                      </option>
                    ))}
                  </select>
                </th>

                {/* Filter Giá */}
                <th className="p-1.5 text-right">
                  <input
                    type="number"
                    value={filterPriceMax}
                    onChange={(e) => { setFilterPriceMax(e.target.value); setCurrentPage(1); }}
                    placeholder="≤ Giá max..."
                    className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-emerald-400 text-xs text-right font-mono"
                  />
                </th>

                {/* Filter Tồn kho */}
                <th className="p-1.5 text-center">
                  <span className="text-[10px] text-slate-500 font-mono">*</span>
                </th>

                {/* Filter Hiển thị POS */}
                <th className="p-1.5 text-center">
                  <select
                    value={filterPosDisplay}
                    onChange={(e: any) => { setFilterPosDisplay(e.target.value); setCurrentPage(1); }}
                    className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 text-xs text-center"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="YES">Có</option>
                    <option value="NO">Không</option>
                  </select>
                </th>

                {/* Filter Trạng thái */}
                <th className="p-1.5 text-center">
                  <select
                    value={filterStatus}
                    onChange={(e: any) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 text-xs text-center"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="ACTIVE">Kinh doanh</option>
                    <option value="INACTIVE">Ngừng bán</option>
                  </select>
                </th>

                {/* Reset inline filter */}
                {!isCashier && (
                  <th className="p-1.5 text-right">
                    {(filterSku || filterName || filterCategory || filterUnit || filterPriceMax || filterPosDisplay !== 'ALL' || filterStatus !== 'ALL') && (
                      <button
                        onClick={handleClearInlineFilters}
                        className="text-[10px] text-blue-400 hover:text-white px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30"
                        title="Xóa bộ lọc cột"
                      >
                        Xóa lọc
                      </button>
                    )}
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 text-xs">
                    Không tìm thấy hàng hóa phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  const isExpanded = expandedProductIds.includes(p.id);
                  const hasChildren = p.hasVariants && p.variants && p.variants.length > 0;
                  const convList = p.conversions && p.conversions.length > 0
                    ? p.conversions
                    : (p.conversionUnit ? [{ id: 'c0', unitName: p.conversionUnit, conversionFactor: p.conversionFactor || 24, sellingPrice: p.conversionSellingPrice || p.sellingPrice * 24 }] : []);

                  return (
                    <React.Fragment key={p.id}>
                      {/* Parent Product Row */}
                      <tr
                        onClick={() => handleToggleSelectRow(p.id)}
                        onDoubleClick={!isCashier ? () => handleOpenEditModal(p) : undefined}
                        className={`transition-colors cursor-pointer group/row ${
                          isSelected ? 'bg-blue-600/15 border-l-4 border-l-blue-500' : 'hover:bg-slate-800/50'
                        } ${hasChildren ? 'font-semibold' : ''}`}
                      >
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(p.id)}
                            className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-950 border-slate-700"
                          />
                        </td>

                        <td className="p-3 font-mono text-[11px]">
                          <div className="text-blue-400 font-bold">{p.sku}</div>
                          {p.barcode && (
                            <div className="flex items-center gap-1 text-amber-400 text-[10px]">
                              <Barcode className="w-3 h-3" />
                              <span>{p.barcode}</span>
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="relative shrink-0">
                              <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover bg-slate-950 border border-slate-800" />
                              {hasChildren && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpandProduct(p.id);
                                  }}
                                  className={`absolute -bottom-1 -right-1 p-0.5 rounded-full border shadow text-[9px] transition-all ${
                                    isExpanded
                                      ? 'bg-blue-600 text-white border-blue-400'
                                      : 'bg-slate-900 text-blue-400 border-slate-700 hover:bg-blue-600 hover:text-white'
                                  }`}
                                  title={isExpanded ? 'Thu gọn danh sách biến thể' : 'Bấm để mở danh sách biến thể'}
                                >
                                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                </button>
                              )}
                            </div>

                            <div>
                              <div className="font-bold text-white text-xs flex flex-wrap items-center gap-1.5 group-hover/row:text-blue-400 transition-colors">
                                <span>{p.name}</span>
                                {hasChildren && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExpandProduct(p.id);
                                    }}
                                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] border flex items-center gap-1 transition-all ${
                                      isExpanded
                                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30'
                                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25 animate-pulse'
                                    }`}
                                    title="Bấm để xem hoặc ẩn danh sách các biến thể của sản phẩm này"
                                  >
                                    {isExpanded ? <ChevronDown className="w-3 h-3 text-blue-400" /> : <ChevronRight className="w-3 h-3 text-amber-400" />}
                                    <span>{p.variants.length} biến thể {isExpanded ? '(Đang mở)' : '(Bấm để xem)'}</span>
                                  </button>
                                )}
                              </div>
                              {p.brand && <span className="text-[10px] text-slate-500 font-mono">TH: {p.brand}</span>}
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700/60 text-[11px]">
                            {p.category}
                          </span>
                        </td>

                        <td className="p-3 font-medium text-slate-200">
                          <div>{p.unit}</div>
                          {convList.length > 0 && (
                            <div className="text-[10px] text-purple-300 font-mono mt-0.5">
                              (+{convList.map((c: any) => c.unitName).join(', ')})
                            </div>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <div className="font-bold text-blue-400 text-xs font-mono">{formatVND(p.sellingPrice)}</div>
                          {!isCashier && p.costPrice !== undefined && (
                            <div className="text-slate-500 text-[10px] font-mono">Vốn: {formatVND(p.costPrice)}</div>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          {(() => {
                            const activeBranchObj = branches.find((b) => b.id === selectedBranchId) || branches[0];
                            const currentBranchStock = p.branchStocks && p.branchStocks[selectedBranchId] !== undefined ? p.branchStocks[selectedBranchId] : p.stockQuantity;
                            return (
                              <div>
                                <div className="font-bold text-emerald-400 text-xs font-mono">
                                  {currentBranchStock} {p.unit}
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono">
                                  Chuỗi: {p.stockQuantity}
                                </div>
                              </div>
                            );
                          })()}
                        </td>

                        <td className="p-3 text-center">
                          {p.showOnPos !== false ? (
                            <span className="text-emerald-400 text-[11px] font-bold">Có</span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Không</span>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          {p.isActive !== false ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Kinh doanh
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-500">
                              Ngừng bán
                            </span>
                          )}
                        </td>

                        {!isCashier && (
                          <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleDuplicateSelectedProduct(p)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-blue-400 border border-slate-700/80 text-[11px] transition-all"
                                title="Nhân bản sản phẩm này"
                              >
                                <Copy className="w-3.5 h-3.5 text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 text-[11px] transition-all"
                                title="Sửa hàng hóa"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteProduct(p, e)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/80 transition-all"
                                title="Xóa hàng hóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>

                      {/* Variant Sub-rows */}
                      {hasChildren && isExpanded && (
                        p.variants.map((variant: any) => {
                          const isInlineEditing = inlineEditingVariantId === variant.id;

                          return (
                            <tr key={variant.id} className="bg-slate-950/70 border-l-4 border-blue-500 hover:bg-slate-950/90 text-xs">
                              <td></td>
                              <td className="p-2.5 font-mono text-[11px] text-blue-300 font-bold">{variant.sku}</td>
                              <td className="p-2.5 pl-6 font-bold text-slate-200">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                  <span>{variant.variantName}</span>
                                </div>
                              </td>

                              <td className="p-3 text-slate-400 font-medium">{p.category}</td>
                              <td className="p-3 text-slate-300">{p.unit}</td>

                              {/* Variant Prices Display & Inline Editor */}
                              <td className="p-3 text-right">
                                {isInlineEditing ? (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-end gap-1">
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
                                        <div key={c.id || c.unitName} className="flex items-center justify-end gap-1">
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
                                  <div className="space-y-0.5 text-xs font-mono">
                                    <div className="font-bold text-blue-400">
                                      {formatVND(variant.sellingPrice)}
                                    </div>
                                    {convList.map((c: any) => {
                                      const variantConvPrice = variant.variantConversions?.[c.unitName] !== undefined
                                        ? variant.variantConversions[c.unitName]
                                        : variant.sellingPrice * c.conversionFactor;

                                      return (
                                        <div key={c.id || c.unitName} className="font-bold text-purple-300 text-[10px]">
                                          {formatVND(variantConvPrice)} / {c.unitName}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </td>

                              {/* Variant Stock */}
                              <td className="p-3 text-center">
                                {isInlineEditing ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <input
                                      type="number"
                                      value={inlineVariantStock}
                                      onChange={(e) => setInlineVariantStock(Number(e.target.value))}
                                      className="w-16 px-2 py-1 rounded bg-slate-900 border border-emerald-500 text-emerald-400 font-bold text-xs focus:outline-none text-center"
                                    />
                                    <span className="text-[11px] text-slate-400">{p.unit}</span>
                                  </div>
                                ) : (
                                  <div className="font-bold text-emerald-400 text-xs font-mono">
                                    {variant.stockQuantity} {p.unit}
                                  </div>
                                )}
                              </td>

                              <td className="p-3 text-center text-emerald-400 text-[11px] font-bold">Có</td>
                              <td className="p-3 text-center">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400">
                                  Kinh doanh
                                </span>
                              </td>

                              {/* Action Edit Variant */}
                              {!isCashier && (
                                <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
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
                                      <span>Sửa Giá</span>
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </React.Fragment>
                  );
                })
              )}
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

              {/* Product Image & Thumbnail Section */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <label className="block text-slate-300 font-semibold text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <ImageIcon className="w-4 h-4" />
                    <span>Hình Ảnh Sản Phẩm</span>
                  </div>
                  <span className="text-slate-500 font-normal text-[11px]">(Link URL hoặc Tải ảnh từ máy)</span>
                </label>

                <div className="flex items-center gap-3">
                  <div className="relative group/img shrink-0">
                    <img
                      src={image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80'}
                      alt="Preview"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-900 border-2 border-slate-700 shadow-md"
                      onError={(e) => {
                        (e.target as any).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80';
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="Dán đường dẫn link ảnh (https://...) hoặc chọn ảnh mẫu bên dưới"
                        className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
                      />
                      <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 border border-slate-700">
                        <Upload className="w-3.5 h-3.5 text-blue-400" />
                        <span>Tải file</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFileSelect}
                        />
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">Gợi ý mẫu:</span>
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setImage(preset.url)}
                          className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-blue-600/20 text-slate-300 hover:text-blue-300 text-[10px] border border-slate-800 transition-all"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category, Brand & Location Selectors */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">Nhóm hàng</label>
                    <button
                      type="button"
                      onClick={handleQuickAddCategory}
                      className="text-blue-400 hover:text-blue-300 text-[11px] font-bold"
                      title="Thêm nhanh nhóm hàng mới"
                    >
                      + Thêm
                    </button>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-semibold text-slate-200"
                  >
                    {categories.map((c) => {
                      const name = getItemName(c);
                      return <option key={name} value={name}>{name}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-purple-300 font-bold">Thương hiệu</label>
                    <button
                      type="button"
                      onClick={handleQuickAddBrand}
                      className="text-purple-400 hover:text-purple-300 text-[11px] font-bold"
                      title="Thêm nhanh thương hiệu mới"
                    >
                      + Thêm
                    </button>
                  </div>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-bold text-purple-300"
                  >
                    {brands.map((b) => {
                      const name = getItemName(b);
                      return <option key={name} value={name}>{name}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-amber-400 font-bold">📍 Vị trí kho</label>
                    <button
                      type="button"
                      onClick={handleQuickAddLocation}
                      className="text-amber-400 hover:text-amber-300 text-[11px] font-bold"
                      title="Thêm nhanh vị trí kho mới"
                    >
                      + Thêm
                    </button>
                  </div>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-bold text-amber-300"
                  >
                    {locations.map((l) => {
                      const name = getItemName(l);
                      return <option key={name} value={name}>{name}</option>;
                    })}
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleQuickAddUnit}
                      className="text-[11px] text-emerald-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Thêm nhanh ĐVT</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUnitModalOpen(true)}
                      className="text-[11px] text-slate-400 hover:text-white hover:underline flex items-center gap-1"
                    >
                      <span>Quản lý ĐVT</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Đơn vị nhỏ nhất (*)</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-bold text-emerald-400 text-xs"
                    >
                      {units.map((u) => {
                        const name = getItemName(u);
                        return <option key={name} value={name}>{name}</option>;
                      })}
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
                              {units.filter((u) => getItemName(u) !== unit).map((u) => {
                                const uName = getItemName(u);
                                return (
                                  <option key={uName} value={uName}>
                                    {uName}
                                  </option>
                                );
                              })}
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
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-blue-500/30 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Phân Bổ Tồn Kho Theo Chi Nhánh (Chuỗi Bán Lẻ)</span>
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Tổng chuỗi: <strong className="text-emerald-400 font-mono text-xs">{stockQuantity} {unit}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      {branches.map((b) => (
                        <div key={b.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300 font-semibold truncate max-w-[120px]">{b.name}</span>
                            <span className="font-mono text-blue-400 text-[10px] bg-blue-500/10 px-1 rounded">{b.code}</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={branchStocksForm[b.id] ?? 0}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value));
                              const updated = { ...branchStocksForm, [b.id]: val };
                              setBranchStocksForm(updated);
                              setStockQuantity(Object.values(updated).reduce((sum, q) => sum + Number(q), 0));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs font-mono font-bold text-emerald-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Ngưỡng cảnh báo sắp hết hàng toàn chuỗi</label>
                    <input
                      type="number"
                      value={minStock}
                      onChange={(e) => setMinStock(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl glass-input font-bold text-red-400 text-xs"
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

      {/* Modal Manage Categories / Nhóm Hàng */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-blue-400">
                <FolderTree className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">Quản Lý Nhóm Hàng ({categories.length})</h3>
              </div>
              <button onClick={() => { setIsCategoryModalOpen(false); setEditingCategoryName(null); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isCashier ? (
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Nhập tên nhóm hàng mới..."
                  className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Nhóm</span>
                </button>
              </form>
            ) : (
              <div className="text-[11px] text-slate-400 italic py-1">Chế độ xem danh mục nhóm hàng (Thu ngân)</div>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
              {categories.map((c) => {
                const name = getItemName(c);
                const count = getItemCount(c);
                const isEditing = editingCategoryName === name;

                return (
                  <div key={name} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2">
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editCategoryVal}
                          onChange={(e) => setEditCategoryVal(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(name)}
                          className="flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-blue-500 text-white text-xs font-semibold focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateCategory(name)}
                          className="p-1 text-emerald-400 hover:bg-slate-700 rounded-md"
                          title="Lưu thay đổi"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCategoryName(null)}
                          className="p-1 text-slate-400 hover:bg-slate-700 rounded-md"
                          title="Hủy"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-blue-300 truncate">{name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold shrink-0">
                            {count} SP
                          </span>
                        </div>
                        {!isCashier && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryName(name);
                                setEditCategoryVal(name);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg"
                              title="Đổi tên nhóm hàng"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(name, count)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg"
                              title="Xóa nhóm hàng"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
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
                <h3 className="font-bold text-lg text-white">Quản Lý Vị Trí Kho ({locations.length})</h3>
              </div>
              <button onClick={() => { setIsLocationModalOpen(false); setEditingLocationName(null); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isCashier ? (
              <form onSubmit={handleAddLocation} className="flex gap-2">
                <input
                  type="text"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  placeholder="Nhập tên vị trí kho..."
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
            ) : (
              <div className="text-[11px] text-slate-400 italic py-1">Chế độ xem vị trí kho (Thu ngân)</div>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
              {locations.map((l) => {
                const name = getItemName(l);
                const count = getItemCount(l);
                const isEditing = editingLocationName === name;

                return (
                  <div key={name} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2">
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editLocationVal}
                          onChange={(e) => setEditLocationVal(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdateLocation(name)}
                          className="flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500 text-white text-xs font-semibold focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateLocation(name)}
                          className="p-1 text-emerald-400 hover:bg-slate-700 rounded-md"
                          title="Lưu thay đổi"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingLocationName(null)}
                          className="p-1 text-slate-400 hover:bg-slate-700 rounded-md"
                          title="Hủy"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-amber-300 flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{name}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold shrink-0">
                            {count} SP
                          </span>
                        </div>
                        {!isCashier && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingLocationName(name);
                                setEditLocationVal(name);
                              }}
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg"
                              title="Đổi tên vị trí kho"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLocation(name, count)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg"
                              title="Xóa vị trí kho"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
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
                <h3 className="font-bold text-lg text-white">Quản Lý Thương Hiệu ({brands.length})</h3>
              </div>
              <button onClick={() => { setIsBrandModalOpen(false); setEditingBrandName(null); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isCashier ? (
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
            ) : (
              <div className="text-[11px] text-slate-400 italic py-1">Chế độ xem thương hiệu (Thu ngân)</div>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
              {brands.map((b) => {
                const name = getItemName(b);
                const count = getItemCount(b);
                const isEditing = editingBrandName === name;

                return (
                  <div key={name} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2">
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editBrandVal}
                          onChange={(e) => setEditBrandVal(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdateBrand(name)}
                          className="flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-purple-500 text-white text-xs font-semibold focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateBrand(name)}
                          className="p-1 text-emerald-400 hover:bg-slate-700 rounded-md"
                          title="Lưu thay đổi"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBrandName(null)}
                          className="p-1 text-slate-400 hover:bg-slate-700 rounded-md"
                          title="Hủy"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-purple-300 truncate">{name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold shrink-0">
                            {count} SP
                          </span>
                        </div>
                        {!isCashier && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBrandName(name);
                                setEditBrandVal(name);
                              }}
                              className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-lg"
                              title="Đổi tên thương hiệu"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBrand(name, count)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg"
                              title="Xóa thương hiệu"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
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
                <h3 className="font-bold text-lg text-white">Quản Lý Đơn Vị Tính ({units.length})</h3>
              </div>
              <button onClick={() => { setIsUnitModalOpen(false); setEditingUnitName(null); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isCashier ? (
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
            ) : (
              <div className="text-[11px] text-slate-400 italic py-1">Chế độ xem đơn vị tính (Thu ngân)</div>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
              {units.map((u) => {
                const name = getItemName(u);
                const count = getItemCount(u);
                const isEditing = editingUnitName === name;

                return (
                  <div key={name} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2">
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editUnitVal}
                          onChange={(e) => setEditUnitVal(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdateUnit(name)}
                          className="flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-emerald-500 text-white text-xs font-semibold focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateUnit(name)}
                          className="p-1 text-emerald-400 hover:bg-slate-700 rounded-md"
                          title="Lưu thay đổi"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingUnitName(null)}
                          className="p-1 text-slate-400 hover:bg-slate-700 rounded-md"
                          title="Hủy"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-emerald-300 truncate">{name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold shrink-0">
                            {count} SP
                          </span>
                        </div>
                        {!isCashier && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUnitName(name);
                                setEditUnitVal(name);
                              }}
                              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg"
                              title="Đổi tên ĐVT"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUnit(name, count)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg"
                              title="Xóa ĐVT"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
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

              {/* Product Image & Thumbnail Section */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <label className="block text-slate-300 font-semibold text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <ImageIcon className="w-4 h-4" />
                    <span>Hình Ảnh Sản Phẩm</span>
                  </div>
                  <span className="text-slate-500 font-normal text-[11px]">(Link URL hoặc Tải ảnh từ máy)</span>
                </label>

                <div className="flex items-center gap-3">
                  <div className="relative group/img shrink-0">
                    <img
                      src={image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80'}
                      alt="Preview"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-900 border-2 border-slate-700 shadow-md"
                      onError={(e) => {
                        (e.target as any).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80';
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="Dán đường dẫn link ảnh (https://...) hoặc chọn ảnh mẫu bên dưới"
                        className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
                      />
                      <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 border border-slate-700">
                        <Upload className="w-3.5 h-3.5 text-blue-400" />
                        <span>Tải file</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFileSelect}
                        />
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">Gợi ý mẫu:</span>
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setImage(preset.url)}
                          className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-blue-600/20 text-slate-300 hover:text-blue-300 text-[10px] border border-slate-800 transition-all"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category, Brand & Location Selectors */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">Nhóm hàng</label>
                    <button
                      type="button"
                      onClick={handleQuickAddCategory}
                      className="text-blue-400 hover:text-blue-300 text-[11px] font-bold"
                      title="Thêm nhanh nhóm hàng mới"
                    >
                      + Thêm
                    </button>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-semibold text-slate-200"
                  >
                    {categories.map((c) => {
                      const name = getItemName(c);
                      return <option key={name} value={name}>{name}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-purple-300 font-bold">Thương hiệu</label>
                    <button
                      type="button"
                      onClick={handleQuickAddBrand}
                      className="text-purple-400 hover:text-purple-300 text-[11px] font-bold"
                      title="Thêm nhanh thương hiệu mới"
                    >
                      + Thêm
                    </button>
                  </div>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-bold text-purple-300"
                  >
                    {brands.map((b) => {
                      const name = getItemName(b);
                      return <option key={name} value={name}>{name}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-amber-400 font-bold">📍 Vị trí kho</label>
                    <button
                      type="button"
                      onClick={handleQuickAddLocation}
                      className="text-amber-400 hover:text-amber-300 text-[11px] font-bold"
                      title="Thêm nhanh vị trí kho mới"
                    >
                      + Thêm
                    </button>
                  </div>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-bold text-amber-300"
                  >
                    {locations.map((l) => {
                      const name = getItemName(l);
                      return <option key={name} value={name}>{name}</option>;
                    })}
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleQuickAddUnit}
                      className="text-[11px] text-emerald-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Thêm nhanh ĐVT</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUnitModalOpen(true)}
                      className="text-[11px] text-slate-400 hover:text-white hover:underline flex items-center gap-1"
                    >
                      <span>Quản lý ĐVT</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Đơn vị nhỏ nhất (*)</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-bold text-emerald-400 text-xs"
                    >
                      {units.map((u) => {
                        const name = getItemName(u);
                        return <option key={name} value={name}>{name}</option>;
                      })}
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
                              {units.filter((u) => getItemName(u) !== unit).map((u) => {
                                const uName = getItemName(u);
                                return <option key={uName} value={uName}>{uName}</option>;
                              })}
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
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-blue-500/30 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Phân Bổ Tồn Kho Theo Chi Nhánh (Chuỗi Bán Lẻ)</span>
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Tổng chuỗi: <strong className="text-emerald-400 font-mono text-xs">{stockQuantity} {unit}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      {branches.map((b) => (
                        <div key={b.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300 font-semibold truncate max-w-[120px]">{b.name}</span>
                            <span className="font-mono text-blue-400 text-[10px] bg-blue-500/10 px-1 rounded">{b.code}</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={branchStocksForm[b.id] ?? 0}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value));
                              const updated = { ...branchStocksForm, [b.id]: val };
                              setBranchStocksForm(updated);
                              setStockQuantity(Object.values(updated).reduce((sum, q) => sum + Number(q), 0));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs font-mono font-bold text-emerald-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Ngưỡng cảnh báo sắp hết hàng toàn chuỗi</label>
                    <input
                      type="number"
                      value={minStock}
                      onChange={(e) => setMinStock(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl glass-input font-bold text-red-400 text-xs"
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

      {/* Barcode / Price Label Print Modal (MISA Standard) */}
      <BarcodePrintModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        selectedProducts={products.filter((p) => selectedProductIds.includes(p.id))}
        allProducts={products}
        selectedBranchName={branches.find((b) => b.id === selectedBranchId)?.name}
        selectedBranchId={selectedBranchId}
        branches={branches}
      />

      {/* Clone Product Modal (MISA Standard) */}
      <CloneProductModal
        isOpen={isCloneModalOpen}
        onClose={() => {
          setIsCloneModalOpen(false);
          setCloningSourceProduct(null);
        }}
        product={cloningSourceProduct}
        onCloneSuccess={handleCloneSuccess}
        onOpenFullAddModal={handleOpenFullAddModalFromDraft}
        branches={branches}
      />
    </div>
  );
};

export default ProductsPage;
