import React, { useEffect, useState } from 'react';
import { usePosStore } from '../../store/posStore';
import api from '../../services/api';
import { Tag, Check, X, Percent, DollarSign, Users } from 'lucide-react';

interface PriceListSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriceListSelectModal: React.FC<PriceListSelectModalProps> = ({ isOpen, onClose }) => {
  const { activePriceList, setActivePriceList, customer } = usePosStore();
  const [priceLists, setPriceLists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPriceLists = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/pricelists');
      setPriceLists(res.data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách bảng giá:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPriceLists();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPriceList = async (pl: any) => {
    try {
      // Fetch full details with product items overrides if available
      const res: any = await api.get(`/pricelists/${pl.id}`);
      setActivePriceList(res.data);
    } catch (err) {
      setActivePriceList(pl);
    }
    onClose();
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'STANDARD':
        return 'Bán Lẻ Niêm Yết';
      case 'WHOLESALE':
        return 'Bán Sỉ / Đại Lý';
      case 'CUSTOMER_GROUP':
        return 'Nhóm Khách Hàng';
      case 'PROMOTION':
        return 'Khuyến Mãi xả hàng';
      default:
        return type;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'STANDARD':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'WHOLESALE':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'CUSTOMER_GROUP':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'PROMOTION':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5 text-blue-400">
            <Tag className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-lg text-white">Chọn Bảng Giá Thanh Toán</h3>
              <p className="text-[11px] text-slate-400">Áp dụng đơn giá tự động cho tất cả sản phẩm trong giỏ hàng</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Context Hint */}
        {customer && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-300">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Khách đang chọn: <strong className="text-white">{customer.fullName || customer.name}</strong> ({customer.group || 'RETAIL'})</span>
            </div>
            <span className="text-[10px] text-blue-400 font-mono">Phân loại tự động</span>
          </div>
        )}

        {/* Price Lists List */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="text-slate-500 text-center py-8 text-xs">Đang tải danh sách bảng giá...</div>
          ) : priceLists.length === 0 ? (
            <div className="text-slate-500 text-center py-8 text-xs">Chưa có bảng giá nào được khởi tạo.</div>
          ) : (
            priceLists.map((pl) => {
              const isSelected = activePriceList?.id === pl.id || activePriceList?.code === pl.code;
              return (
                <div
                  key={pl.id}
                  onClick={() => handleSelectPriceList(pl)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10 font-semibold'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{pl.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTypeBadgeClass(pl.type)}`}
                      >
                        {getTypeName(pl.type)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span className="font-mono text-slate-400">Mã: {pl.code}</span>
                      {pl.calculationMethod === 'PERCENT_BASE' && (
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                          <Percent className="w-3 h-3" /> Chiết khấu {pl.value}% so với niêm yết
                        </span>
                      )}
                      {pl.calculationMethod === 'PERCENT_COST' && (
                        <span className="text-purple-400 font-bold flex items-center gap-0.5">
                          <DollarSign className="w-3 h-3" /> Giá vốn + {pl.value}% lợi nhuận
                        </span>
                      )}
                      {pl.calculationMethod === 'FIXED_OFFSET' && (
                        <span className="text-amber-400 font-bold">Giảm cố định {new Intl.NumberFormat('vi-VN').format(pl.value)}đ</span>
                      )}
                    </div>

                    {pl.notes && <p className="text-[11px] text-slate-400 italic line-clamp-1">{pl.notes}</p>}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isSelected ? (
                      <div className="flex items-center gap-1 text-blue-400 font-bold bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/30">
                        <Check className="w-4 h-4" />
                        <span>Đang chọn</span>
                      </div>
                    ) : (
                      <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700 text-xs">
                        Áp dụng
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
