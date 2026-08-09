import React, { useEffect, useState } from 'react';
import { usePosStore, calculateProductPrice } from '../../store/posStore';
import api from '../../services/api';
import { Search, Tag, Barcode, Layers, Package } from 'lucide-react';
import { VariantSelectModal } from './VariantSelectModal';
import { OrderTabBar } from './OrderTabBar';

export const ProductGrid: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const { addToCart, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, activePriceList } = usePosStore();

  const [activeVariantProduct, setActiveVariantProduct] = useState<any | null>(null);

  const fetchProducts = async () => {
    try {
      const res: any = await api.get('/products', {
        params: { query: searchQuery, category: selectedCategory },
      });
      setProducts(res.data.products || []);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
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

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Multi-Tab Order Bar */}
      <OrderTabBar />

      <div className="flex-1 flex flex-col p-5 overflow-hidden space-y-3">
        {/* Search & Barcode Scan Input */}
        <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên sản phẩm, mã SKU, mã Barcode... (Bấm F1 để tìm nhanh)"
            className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs"
          />
        </div>
        <button
          onClick={() => {
            const barcode = prompt('Quét hoặc nhập mã Barcode độc nhất:');
            if (barcode) {
              api.get(`/products/barcode/${barcode}`)
                .then((res: any) => handleProductClick(res.data))
                .catch((err) => alert(err.message || 'Không tìm thấy sản phẩm'));
            }
          }}
          className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold rounded-xl border border-slate-700 text-xs flex items-center gap-2 shrink-0 transition-all"
        >
          <Barcode className="w-4 h-4" />
          <span>Quét Barcode</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        {['Tất cả', ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => {
            const isLowStock = p.stockQuantity <= p.minStock;
            return (
              <div
                key={p.id}
                onClick={() => handleProductClick(p)}
                className="group glass-panel rounded-2xl p-3 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-900/80 cursor-pointer transition-all duration-200 flex flex-col justify-between relative overflow-hidden active:scale-[0.98]"
              >
                {/* Variant Indicator Badge */}
                {p.hasVariants && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-500/30 z-10 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>{p.variants?.length} biến thể</span>
                  </span>
                )}

                <div>
                  <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 bg-slate-950">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span
                      className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md font-bold text-[10px] backdrop-blur-md ${
                        isLowStock ? 'bg-red-500/80 text-white' : 'bg-slate-900/80 text-emerald-400'
                      }`}
                    >
                      Tồn: {p.stockQuantity} {p.unit}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-xs line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {p.name}
                  </h3>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  {(() => {
                    const { price: displayPrice } = calculateProductPrice(p, p.unit, activePriceList);
                    const isPriceDiscounted = displayPrice !== p.sellingPrice;
                    return (
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-blue-400 text-xs">{formatVND(displayPrice)}</span>
                        {isPriceDiscounted && (
                          <span className="text-[10px] text-slate-500 line-through">{formatVND(p.sellingPrice)}</span>
                        )}
                      </div>
                    );
                  })()}
                  <span className="text-[10px] text-slate-500 font-mono">{p.sku}</span>
                </div>
              </div>
            );
          })}
        </div>
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
