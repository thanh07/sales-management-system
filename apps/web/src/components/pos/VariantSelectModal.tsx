import React, { useState } from 'react';
import { usePosStore } from '../../store/posStore';
import { Layers, X, Check } from 'lucide-react';

interface VariantSelectModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export const VariantSelectModal: React.FC<VariantSelectModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = usePosStore();
  const [selectedVariant, setSelectedVariant] = useState<any | null>(
    product?.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  if (!isOpen || !product || !product.variants) return null;

  const handleSelectVariantAndAdd = (variant: any) => {
    // Create custom product item with selected variant properties for POS cart
    const itemToAdd = {
      ...product,
      id: `${product.id}-${variant.id}`,
      sku: variant.sku,
      barcode: variant.barcode,
      name: variant.variantName,
      sellingPrice: variant.sellingPrice,
      costPrice: variant.costPrice,
      stockQuantity: variant.stockQuantity,
    };
    addToCart(itemToAdd);
    onClose();
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-blue-400">
            <Layers className="w-5 h-5" />
            <h3 className="font-bold text-lg text-white">Chọn Thuộc Tính Biến Thể</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h4 className="font-bold text-white text-base">{product.name}</h4>
          <p className="text-xs text-slate-400 mt-0.5">Sản phẩm này có {product.variants.length} biến thể thuộc tính</p>
        </div>

        {/* Variant Cards Selection */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {product.variants.map((v: any) => {
            const isSelected = selectedVariant?.id === v.id;
            return (
              <div
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold text-white text-sm">{v.variantName}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    SKU: {v.sku} | Barcode: {v.barcode}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-400 text-sm">{formatVND(v.sellingPrice)}</div>
                  <div className="text-[10px] text-emerald-400 font-medium">Tồn: {v.stockQuantity} {product.unit}</div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => selectedVariant && handleSelectVariantAndAdd(selectedVariant)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-xs"
        >
          <Check className="w-4 h-4" />
          <span>Thêm Biến Thể Vào Giỏ Hàng</span>
        </button>
      </div>
    </div>
  );
};
