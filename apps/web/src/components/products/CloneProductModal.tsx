import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Sparkles, Layers, Scale, Building2, PackagePlus, AlertCircle, ArrowRight } from 'lucide-react';
import { getSmartProductIcon } from '../../utils/productIconHelper';
import api from '../../services/api';

interface CloneProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
  onCloneSuccess: (clonedProduct: any) => void;
  onOpenFullAddModal: (clonedProductDraft: any) => void;
  branches: any[];
}

export const CloneProductModal: React.FC<CloneProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onCloneSuccess,
  onOpenFullAddModal,
  branches,
}) => {
  const [cloneName, setCloneName] = useState('');
  const [cloneSku, setCloneSku] = useState('');
  const [cloneBarcode, setCloneBarcode] = useState('');
  const [cloneSellingPrice, setCloneSellingPrice] = useState<number>(0);
  const [copyConversions, setCopyConversions] = useState(true);
  const [copyVariants, setCopyVariants] = useState(true);
  const [copyStock, setCopyStock] = useState(true);
  const [showOnPos, setShowOnPos] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setCloneName(`[Bản sao] ${product.name}`);
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      setCloneSku(`SKU${randomCode}`);
      setCloneBarcode(`893${Math.floor(1000000000 + Math.random() * 9000000000)}`);
      setCloneSellingPrice(product.sellingPrice || 0);
      setCopyConversions(!!(product.conversions && product.conversions.length > 0));
      setCopyVariants(!!(product.hasVariants && product.variants && product.variants.length > 0));
      setShowOnPos(product.showOnPos !== false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const theme = getSmartProductIcon(product.name, product.category);
  const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(n || 0) + ' đ';

  const prepareClonedDraft = () => {
    const conversionsCloned = copyConversions && product.conversions ? JSON.parse(JSON.stringify(product.conversions)) : [];
    const hasVariantsCloned = copyVariants && product.hasVariants;
    const attributesCloned = copyVariants && product.attributes ? JSON.parse(JSON.stringify(product.attributes)) : [];
    
    // Generate new unique SKUs for cloned variants
    let variantsCloned: any[] = [];
    if (hasVariantsCloned && product.variants) {
      variantsCloned = product.variants.map((v: any, idx: number) => ({
        ...v,
        id: `var-clone-${Date.now()}-${idx}`,
        sku: `${cloneSku}-${idx + 1}`,
        barcode: `893${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        stockQuantity: copyStock ? v.stockQuantity : 0,
      }));
    }

    const branchStocksCloned: Record<string, number> = {};
    branches.forEach((b) => {
      branchStocksCloned[b.id] = copyStock && product.branchStocks?.[b.id] !== undefined ? product.branchStocks[b.id] : 0;
    });

    const totalStock = Object.values(branchStocksCloned).reduce((sum, q) => sum + Number(q), 0);

    return {
      name: cloneName,
      sku: cloneSku,
      barcode: cloneBarcode,
      category: product.category,
      brand: product.brand,
      location: product.location,
      unit: product.unit,
      costPrice: product.costPrice || 0,
      sellingPrice: cloneSellingPrice,
      stockQuantity: totalStock,
      minStock: product.minStock || 10,
      image: product.image,
      hasVariants: hasVariantsCloned,
      attributes: attributesCloned,
      variants: variantsCloned,
      conversions: conversionsCloned,
      branchStocks: branchStocksCloned,
      showOnPos,
      isActive: true,
    };
  };

  const handleQuickCloneSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const draft = prepareClonedDraft();
      const res: any = await api.post('/products', draft);
      onCloneSuccess(res.data);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi nhân bản sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenFullCustomization = () => {
    const draft = prepareClonedDraft();
    onClose();
    onOpenFullAddModal(draft);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white">Nhân Bản Hàng Hóa (Clone Product)</h2>
              <p className="text-[11px] text-slate-400">Tạo nhanh mặt hàng tương tự từ sản phẩm mẫu có sẵn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Product Preview Card */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Sản phẩm gốc được sao chép:</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-700" />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-white text-xs truncate">{product.name}</h3>
              <div className="flex items-center gap-2 text-[11px] mt-0.5">
                <span className="font-mono text-blue-400 font-bold">{product.sku}</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400 font-bold">{formatVND(product.sellingPrice)} / {product.unit}</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
              {product.category}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleQuickCloneSave} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tên sản phẩm mới (*)</label>
            <input
              type="text"
              required
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-white text-sm"
              placeholder="Nhập tên sản phẩm mới..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-blue-400 font-semibold mb-1">Mã SKU mới (*)</label>
              <input
                type="text"
                required
                value={cloneSku}
                onChange={(e) => setCloneSku(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input font-mono text-blue-300 font-bold"
              />
            </div>

            <div>
              <label className="block text-amber-400 font-semibold mb-1">Mã Vạch Barcode (*)</label>
              <input
                type="text"
                required
                value={cloneBarcode}
                onChange={(e) => setCloneBarcode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input font-mono text-amber-400 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-emerald-400 font-semibold mb-1">Giá bán lẻ mới ({product.unit})</label>
            <input
              type="number"
              min="0"
              required
              value={cloneSellingPrice}
              onChange={(e) => setCloneSellingPrice(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl glass-input font-mono text-emerald-400 font-bold text-sm"
            />
          </div>

          {/* Clone Options */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <span className="font-bold text-slate-300 block text-xs">Tùy chọn sao chép dữ liệu cấu hình:</span>

            {product.conversions && product.conversions.length > 0 && (
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={copyConversions}
                  onChange={(e) => setCopyConversions(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                />
                <span>Sao chép {product.conversions.length} cấp ĐVT quy đổi ({product.conversions.map((c: any) => c.unitName).join(', ')})</span>
              </label>
            )}

            {product.hasVariants && product.variants && product.variants.length > 0 && (
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={copyVariants}
                  onChange={(e) => setCopyVariants(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                />
                <span>Sao chép ma trận {product.variants.length} biến thể (Màu sắc, Size, Hương vị)</span>
              </label>
            )}

            <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={copyStock}
                onChange={(e) => setCopyStock(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
              />
              <span>Sao chép số lượng tồn kho sang sản phẩm mới (Bỏ tích để đặt tồn kho ban đầu = 0)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showOnPos}
                onChange={(e) => setShowOnPos(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
              />
              <span>Hiển thị trên màn hình Bán hàng (POS)</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-end border-t border-slate-800">
            <button
              type="button"
              onClick={handleOpenFullCustomization}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Mở Form Đầy Đủ Tùy Chỉnh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <PackagePlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang tạo...' : 'Nhân Bản & Lưu Ngay (1-Click)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
