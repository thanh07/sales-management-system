import React, { useEffect, useState } from 'react';
import { usePosStore, calculateProductPrice } from '../../store/posStore';
import api from '../../services/api';
import { Search, Plus, QrCode, User, Tag, SlidersHorizontal, Store, FileText, ShoppingCart, Minus, Check, X, ChevronRight, Layers, Menu } from 'lucide-react';
import { VariantSelectModal } from './VariantSelectModal';
import { CategorySelectDrawer } from './CategorySelectDrawer';
import { OrderTabBar } from './OrderTabBar';

interface MobilePOSViewProps {
  onOpenMobileMenu?: () => void;
}

export const MobilePOSView: React.FC<MobilePOSViewProps> = ({ onOpenMobileMenu }) => {
  const {
    cart,
    customer,
    activePriceList,
    parkedOrders,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    calculateTotal,
    setCustomerModalOpen,
    setPriceListModalOpen,
    setParkedModalOpen,
    setInvoiceModalOpen,
    setCheckoutModalOpen,
    checkout,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = usePosStore();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [activeVariantProduct, setActiveVariantProduct] = useState<any | null>(null);
  const [isMobileCartDrawerOpen, setIsMobileCartDrawerOpen] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/products', {
        params: { query: searchQuery, category: selectedCategory },
      });
      setProducts(res.data.products || []);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory]);

  const handleProductClick = (product: any) => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      setActiveVariantProduct(product);
    } else {
      addToCart(product);
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const { subtotal, total } = calculateTotal();

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden relative pb-16">
      {/* 1. Mobile Header Bar */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              title="Menu ứng dụng"
            >
              <Menu className="w-5 h-5 text-blue-400" />
            </button>
          )}
          <h1 className="text-xl font-bold text-white tracking-tight">Bán hàng</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Parked Orders Icon */}
          <button
            onClick={() => setParkedModalOpen(true)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white relative"
            title="Đơn tạm giữ"
          >
            <FileText className="w-5 h-5 text-slate-300" />
            {parkedOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 flex items-center justify-center">
                {parkedOrders.length}
              </span>
            )}
          </button>

          {/* Cart Counter Icon */}
          <button
            onClick={() => setIsMobileCartDrawerOpen(true)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white relative"
            title="Xem giỏ hàng"
          >
            <ShoppingCart className="w-5 h-5 text-slate-300" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Multi-Tab Invoices Strip */}
      <OrderTabBar />

      {/* 2. Search & Scan Bar */}
      <div className="px-4 pt-3 pb-2 space-y-2.5 bg-slate-950 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tên, mã hàng, mã vạch, l..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl glass-input text-xs bg-slate-900 border-slate-800"
            />
          </div>

          {/* Quick Add Custom Item Button */}
          <button
            onClick={() => {
              const name = prompt('Nhập tên món / dịch vụ thêm nhanh:');
              if (name) {
                const priceStr = prompt('Nhập đơn giá (VNĐ):', '50000');
                const price = parseInt(priceStr || '0', 10);
                if (price > 0) {
                  addToCart({
                    id: `custom-${Date.now()}`,
                    sku: 'CUSTOM',
                    name,
                    sellingPrice: price,
                    unit: 'Món',
                    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150',
                  });
                }
              }
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0"
            title="Thêm món nhanh"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Barcode Scanner Button */}
          <button
            onClick={() => {
              const barcode = prompt('Quét hoặc nhập mã Barcode:');
              if (barcode) {
                api.get(`/products/barcode/${barcode}`)
                  .then((res: any) => handleProductClick(res.data))
                  .catch((err) => alert(err.message || 'Không tìm thấy sản phẩm'));
              }
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 shrink-0"
            title="Quét Barcode"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>

        {/* 3. Customer & Price List Quick Selection Pills */}
        <div className="flex items-center gap-2 text-xs">
          {/* Customer Selection Pill */}
          <button
            onClick={() => setCustomerModalOpen(true)}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center gap-1.5 truncate"
          >
            <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{customer ? (customer.fullName || customer.name) : 'Khách lẻ'}</span>
          </button>

          {/* Price List Selection Pill */}
          <button
            onClick={() => setPriceListModalOpen(true)}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center gap-1.5 truncate"
          >
            <Tag className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">{activePriceList ? activePriceList.name : 'Bảng giá chung'}</span>
          </button>

          {/* Category Filter Drawer Toggle */}
          <button
            onClick={() => setIsCategoryDrawerOpen(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 shrink-0"
            title="Lọc theo danh mục"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* 4. Warehouse Selector Banner */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>Kho bán hàng</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-slate-200">
            <span>Chi nhánh 1 (Kho Trung Tâm)</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* 5. Mobile Product List (ListView matching attached UI screenshot) */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {isLoading ? (
          <div className="text-slate-500 text-center py-12 text-xs">Đang tải danh sách sản phẩm...</div>
        ) : products.length === 0 ? (
          <div className="text-slate-500 text-center py-12 text-xs">Không tìm thấy sản phẩm phù hợp.</div>
        ) : (
          products.map((p) => {
            const cartItem = cart.find((item) => item.product.id === p.id);
            const { price: displayPrice } = calculateProductPrice(p, p.unit, activePriceList);
            const isLowStock = p.stockQuantity <= p.minStock;

            return (
              <div
                key={p.id}
                onClick={() => handleProductClick(p)}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                  cartItem
                    ? 'bg-slate-900 border-blue-500/50 shadow-md'
                    : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900'
                }`}
              >
                {/* Product Image Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 shrink-0 relative border border-slate-800">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  {p.hasVariants && (
                    <span className="absolute bottom-0 inset-x-0 bg-blue-600/90 text-white text-[9px] font-bold text-center py-0.5">
                      {p.variants?.length} biến thể
                    </span>
                  )}
                </div>

                {/* Product Main Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-bold text-white text-xs line-clamp-1 flex items-center gap-1">
                    <span>{p.name}</span>
                    {p.variantName && <span className="text-amber-400 font-semibold">({p.variantName})</span>}
                  </h3>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-mono text-slate-400">{p.sku}</span>
                    <span className={`px-1.5 py-0.5 rounded font-bold ${isLowStock ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'}`}>
                      {p.stockQuantity}
                    </span>
                    <span className="text-slate-400">KH đặt: 0</span>
                  </div>

                  <div className="font-bold text-blue-400 text-sm">
                    {formatVND(displayPrice)}
                  </div>
                </div>

                {/* Inline Stepper Control when Item is in Cart */}
                {cartItem ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0"
                  >
                    <button
                      onClick={() => updateQuantity(p.id, cartItem.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-6 text-center font-bold text-white text-xs">{cartItem.quantity}</span>

                    <button
                      onClick={() => updateQuantity(p.id, cartItem.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(p);
                    }}
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center shrink-0 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 6. Sticky Floating Bottom Bar (Matching attached UI screenshot) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 flex items-center gap-3">
        {/* Bỏ chọn Button */}
        <button
          onClick={clearCart}
          disabled={cart.length === 0}
          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          Bỏ chọn
        </button>

        {/* Xong [ N ] Primary Action Button */}
        <button
          onClick={() => {
            if (cart.length === 0) return;
            setIsMobileCartDrawerOpen(true);
          }}
          disabled={cart.length === 0}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
        >
          <span>Xong</span>
          {totalCartCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-blue-600 font-extrabold text-[11px] flex items-center justify-center shadow-inner">
              {totalCartCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Cart / Checkout Drawer */}
      {isMobileCartDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">Giỏ hàng thanh toán ({totalCartCount} món)</h3>
              <button
                onClick={() => setIsMobileCartDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.selectedUnit}`} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">{item.product.name}</h4>
                    <span className="text-slate-400">{item.quantity} {item.selectedUnit} x {formatVND(item.selectedPrice)}</span>
                  </div>
                  <span className="font-bold text-emerald-400">{formatVND(item.selectedPrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tạm tính:</span>
                <span className="font-semibold text-white">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-base pt-1">
                <span>TỔNG THÀNH TIỀN:</span>
                <span className="text-emerald-400">{formatVND(total)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setIsMobileCartDrawerOpen(false);
                  setCheckoutModalOpen(true);
                }}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30"
              >
                Thanh toán ({formatVND(total)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Selection Drawer */}
      <CategorySelectDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setIsCategoryDrawerOpen(false);
        }}
      />

      {/* Variant Select Modal */}
      {activeVariantProduct && (
        <VariantSelectModal
          product={activeVariantProduct}
          isOpen={!!activeVariantProduct}
          onClose={() => setActiveVariantProduct(null)}
        />
      )}
    </div>
  );
};
