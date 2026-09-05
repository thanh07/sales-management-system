import React, { useEffect, useState, useRef } from 'react';
import { usePosStore, calculateProductPrice } from '../../store/posStore';
import { useBranchStore } from '../../store/branchStore';
import api from '../../services/api';
import {
  Search,
  Tag,
  Barcode,
  Layers,
  Package,
  History,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Grid,
  LayoutGrid,
  List,
  ArrowUp,
  ArrowDown,
  Truck,
  Plus,
  X
} from 'lucide-react';
import { VariantSelectModal } from './VariantSelectModal';
import { OrderTabBar } from './OrderTabBar';
import { getSmartProductIcon } from '../../utils/productIconHelper';

export const ProductGrid: React.FC = () => {
  const { selectedBranchId, branches } = useBranchStore();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ name: string; icon?: string; showOnPos?: boolean }[]>([]);
  const { addToCart, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, activePriceList } = usePosStore();

  const [activeVariantProduct, setActiveVariantProduct] = useState<any | null>(null);

  // Density & Scroll Controls State
  const [gridDensity, setGridDensity] = useState<'COMPACT' | 'STANDARD' | 'LIST'>('COMPACT');
  const categoryContainerRef = useRef<HTMLDivElement>(null);
  const productGridRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async () => {
    try {
      const res: any = await api.get('/products', {
        params: { query: searchQuery, category: selectedCategory },
      });
      setProducts(res.data.products || []);
      const rawCats = res.data.categories || [];
      const normalized = rawCats.map((c: any) =>
        typeof c === 'string'
          ? { name: c, icon: '🏷️', showOnPos: true }
          : { name: c.name, icon: c.icon || '🏷️', showOnPos: c.showOnPos !== false }
      );
      setCategories(normalized.filter((c: any) => c.showOnPos !== false));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();

    const handleStockUpdate = (e: any) => {
      const { items, branchId } = e.detail || {};
      if (items && Array.isArray(items)) {
        setProducts((prevProducts) =>
          prevProducts.map((p) => {
            const matchedItem = items.find(
              (it: any) => it.productId === p.id || it.sku === p.sku || it.barcode === p.barcode
            );
            if (matchedItem) {
              const qtyDeducted = Number(matchedItem.quantity || 1) * Number(matchedItem.conversionFactor || 1);
              const targetBranch = branchId || 'branch-01';
              const newBranchStocks = { ...(p.branchStocks || {}) };
              const currentStock = newBranchStocks[targetBranch] !== undefined ? newBranchStocks[targetBranch] : (p.stockQuantity || 0);
              const updatedStock = Math.max(0, currentStock - qtyDeducted);

              // Update all branch key aliases
              const isB1 = targetBranch === 'b1' || targetBranch === 'branch-01' || targetBranch === 'CN-01';
              const isB2 = targetBranch === 'b2' || targetBranch === 'branch-02' || targetBranch === 'CN-02';
              const isB3 = targetBranch === 'b3' || targetBranch === 'branch-03' || targetBranch === 'CN-03';
              const aliases = isB1 ? ['b1', 'branch-01', 'CN-01'] : isB2 ? ['b2', 'branch-02', 'CN-02'] : isB3 ? ['b3', 'branch-03', 'CN-03'] : [targetBranch];

              aliases.forEach((a) => {
                newBranchStocks[a] = updatedStock;
              });

              return {
                ...p,
                branchStocks: newBranchStocks,
                stockQuantity: Math.max(0, (p.stockQuantity || 0) - qtyDeducted),
              };
            }
            return p;
          })
        );
      }
      // Also sync fresh data from server
      fetchProducts();
    };

    window.addEventListener('pos:stock-updated', handleStockUpdate);
    return () => {
      window.removeEventListener('pos:stock-updated', handleStockUpdate);
    };
  }, [searchQuery, selectedCategory]);

  const handleProductClick = (product: any) => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      setActiveVariantProduct(product);
    } else {
      addToCart(product);
    }
  };

  const scrollCategory = (direction: 'left' | 'right') => {
    if (categoryContainerRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      categoryContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollProductGrid = (direction: 'up' | 'down') => {
    if (productGridRef.current) {
      const scrollAmount = direction === 'up' ? -350 : 350;
      productGridRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Multi-Tab Order Bar */}
      <OrderTabBar />

      <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-hidden space-y-3 relative">
        {/* Search & Action Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên, SKU, Barcode... (F1)"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl glass-input text-xs font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all flex items-center justify-center border border-red-500/30 shadow-sm active:scale-95"
                title="Xóa nhanh từ khóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5 text-red-400 stroke-[3]" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              const barcode = prompt('Quét hoặc nhập mã Barcode độc nhất:');
              if (barcode) {
                api
                  .get(`/products/barcode/${barcode}`)
                  .then((res: any) => handleProductClick(res.data))
                  .catch((err) => alert(err.message || 'Không tìm thấy sản phẩm'));
              }
            }}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-blue-400 font-semibold rounded-xl border border-slate-800 text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-sm"
          >
            <Barcode className="w-4 h-4" />
            <span className="hidden sm:inline">Quét Barcode</span>
          </button>

          <button
            onClick={() => usePosStore.getState().setDeliveryLogModalOpen(true)}
            className="px-3.5 py-2.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-bold rounded-xl border border-blue-500/40 text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-md"
            title="Sổ Giao Hàng & Theo Dõi Vận Chuyển MISA eShop"
          >
            <Truck className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Sổ Giao Hàng</span>
          </button>

          {/* Density Mode Switcher Buttons */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setGridDensity('COMPACT')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                gridDensity === 'COMPACT'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Hiển thị Siêu Gọn (5-6 cột) - Xem nhiều hàng hơn"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden md:inline">Gọn</span>
            </button>
            <button
              onClick={() => setGridDensity('STANDARD')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                gridDensity === 'STANDARD'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Hiển thị Vừa (4 cột tiêu chuẩn)"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden md:inline">Vừa</span>
            </button>
            <button
              onClick={() => setGridDensity('LIST')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                gridDensity === 'LIST'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Hiển thị dạng Danh Sách Dòng"
            >
              <List className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden md:inline">Dòng</span>
            </button>
          </div>
        </div>

        {/* Category Tabs with Scroll Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/90 py-1">
          {/* Scroll Left Button */}
          <button
            onClick={() => scrollCategory('left')}
            className="p-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-slate-400 hover:text-white border border-slate-800 transition-all shrink-0 shadow"
            title="Cuộn danh mục sang trái"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Category Scroll Container */}
          <div
            ref={categoryContainerRef}
            className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[{ name: 'Tất cả', icon: '⚡' }, ...categories].map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span className="text-xs">{cat.icon || '🏷️'}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scrollCategory('right')}
            className="p-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-slate-400 hover:text-white border border-slate-800 transition-all shrink-0 shadow"
            title="Cuộn danh mục sang phải"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Product List Scroll Up / Down Controls */}
        <div className="absolute right-7 bottom-8 z-30 flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={() => scrollProductGrid('up')}
            className="p-3 rounded-2xl bg-slate-900/90 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700/80 shadow-2xl backdrop-blur-md transition-all active:scale-95"
            title="Cuộn danh sách sản phẩm LÊN TRÊN (Page Up)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollProductGrid('down')}
            className="p-3 rounded-2xl bg-slate-900/90 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700/80 shadow-2xl backdrop-blur-md transition-all active:scale-95"
            title="Cuộn danh sách sản phẩm XUỐNG DƯỚI (Page Down)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Main Product Display Area */}
        <div ref={productGridRef} className="flex-1 overflow-y-auto pr-1 scroll-smooth">
          {(() => {
            const displayedProducts = products.filter(
              (p) => !p.branchActiveStatus || p.branchActiveStatus[selectedBranchId] !== false
            );

            if (displayedProducts.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-xs">
                  <Package className="w-10 h-10 mb-2 text-slate-600" />
                  <span>Không tìm thấy mặt hàng đang kinh doanh tại chi nhánh này.</span>
                </div>
              );
            }

            return gridDensity === 'LIST' ? (
              /* LIST VIEW MODE */
              <div className="divide-y divide-slate-800/80 bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                {displayedProducts.map((p) => {
                  const currBranchStock =
                    p.branchStocks && p.branchStocks[selectedBranchId] !== undefined
                      ? p.branchStocks[selectedBranchId]
                      : p.stockQuantity;
                  const branchMin =
                    p.branchMinStocks && p.branchMinStocks[selectedBranchId] !== undefined
                      ? p.branchMinStocks[selectedBranchId]
                      : (p.minStock || 10);
                  const isLowStock = currBranchStock <= branchMin;
                  const { price: displayPrice } = calculateProductPrice(p, p.unit, activePriceList);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleProductClick(p)}
                      className="p-3 hover:bg-slate-800/60 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">{getSmartProductIcon(p.name, p.category).icon}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {p.hasVariants && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[9px] font-mono">
                                {p.variants?.length} biến thể
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">SKU: {p.sku}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isLowStock ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300'}`}>
                          {isLowStock ? `⚠️ Tồn: ${currBranchStock}` : `Tồn: ${currBranchStock}`} {p.unit}
                        </span>
                        <div className="font-bold text-blue-400 text-sm font-mono">{formatVND(displayPrice)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* COMPACT & STANDARD GRID MODE */
              <div
                className={`grid gap-3 ${
                  gridDensity === 'COMPACT'
                    ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                }`}
              >
                {displayedProducts.map((p) => {
                  const currBranchStock =
                    p.branchStocks && p.branchStocks[selectedBranchId] !== undefined
                      ? p.branchStocks[selectedBranchId]
                      : p.stockQuantity;
                  const branchMin =
                    p.branchMinStocks && p.branchMinStocks[selectedBranchId] !== undefined
                      ? p.branchMinStocks[selectedBranchId]
                      : (p.minStock || 10);
                  const isLowStock = currBranchStock <= branchMin;
                  const theme = getSmartProductIcon(p.name, p.category);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleProductClick(p)}
                      className={`group glass-panel rounded-2xl border border-slate-800/80 hover:border-blue-500/60 hover:bg-slate-900/90 cursor-pointer transition-all duration-200 flex flex-col justify-between relative overflow-hidden active:scale-[0.98] ${
                        gridDensity === 'COMPACT' ? 'p-2' : 'p-3'
                      }`}
                    >
                      {/* Variant Indicator Badge */}
                      {p.hasVariants && (
                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 font-bold text-[9px] border border-blue-500/40 z-10 flex items-center gap-0.5">
                          <Layers className="w-2.5 h-2.5" />
                          <span>{p.variants?.length} BT</span>
                        </span>
                      )}

                      <div>
                        <div
                          className={`relative w-full rounded-xl overflow-hidden mb-2 bg-gradient-to-br ${
                            theme.gradientBg
                          } flex items-center justify-center border border-slate-800/60 ${
                            gridDensity === 'COMPACT' ? 'h-20 sm:h-24' : 'h-32'
                          }`}
                        >
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className={`${gridDensity === 'COMPACT' ? 'text-2xl' : 'text-4xl'} select-none`}>
                              {theme.icon}
                            </span>
                          )}

                          <span
                            className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded font-bold text-[9px] backdrop-blur-md flex items-center gap-1 ${
                              isLowStock
                                ? 'bg-amber-500/90 text-slate-950 font-black'
                                : 'bg-slate-900/85 text-emerald-400 border border-slate-700/50'
                            }`}
                          >
                            <span>{isLowStock ? `⚠️ Tồn: ${currBranchStock}` : `Tồn: ${currBranchStock}`}</span>
                          </span>
                        </div>

                        <h3
                          className={`font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors ${
                            gridDensity === 'COMPACT' ? 'text-[11px] leading-tight' : 'text-xs'
                          }`}
                        >
                          {p.name}
                        </h3>
                      </div>

                      <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
                        {(() => {
                          const { price: displayPrice } = calculateProductPrice(p, p.unit, activePriceList);
                          const isPriceDiscounted = displayPrice !== p.sellingPrice;
                          return (
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-blue-400 text-xs font-mono">{formatVND(displayPrice)}</span>
                              {isPriceDiscounted && (
                                <span className="text-[9px] text-slate-500 line-through">{formatVND(p.sellingPrice)}</span>
                              )}
                            </div>
                          );
                        })()}
                        <span className="text-[9px] text-slate-500 font-mono truncate max-w-[50px]">{p.sku}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Variant Selection Modal */}
        {activeVariantProduct && (
          <VariantSelectModal
            product={activeVariantProduct}
            isOpen={!!activeVariantProduct}
            onClose={() => setActiveVariantProduct(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
