import React from 'react';
import { usePosStore } from '../../store/posStore';
import { Clock, Play, Trash2, X, ShoppingBag, User, AlertCircle, ArrowRight } from 'lucide-react';

interface ParkedOrdersModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ParkedOrdersModal: React.FC<ParkedOrdersModalProps> = ({ isOpen, onClose }) => {
  const {
    isParkedModalOpen: storeOpen,
    setParkedModalOpen,
    parkedOrders,
    restoreParkedOrder,
    deleteParkedOrder,
    activeTabId,
    tabs,
  } = usePosStore();

  const isModalOpen = isOpen !== undefined ? isOpen : storeOpen;

  const handleClose = () => {
    if (onClose) onClose();
    else setParkedModalOpen(false);
  };

  if (!isModalOpen) return null;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const handleRestore = (orderId: string) => {
    restoreParkedOrder(orderId);
    handleClose();
  };

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5 text-amber-400">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Danh sách Đơn Hàng Tạm Giữ</h3>
              <span className="text-xs text-slate-400">Đang lưu {parkedOrders.length} đơn tạm chờ thanh toán</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {parkedOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-500 mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-slate-300">Không có đơn hàng nào đang tạm giữ</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Khi khách hàng cần chọn thêm đồ, bấm phím <strong className="text-amber-400 font-mono">F8</strong> hoặc nút <strong>Tạm Giữ Đơn</strong> để lưu đơn và tiếp tục bán cho khách khác.
              </p>
            </div>
          ) : (
            parkedOrders.map((order) => {
              const totalItems = (order.items || []).reduce((sum, i) => sum + i.quantity, 0);
              const totalAmount = (order.items || []).reduce((sum, i) => sum + (i.selectedPrice || 0) * i.quantity, 0);
              const timeString = new Date(order.parkedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {order.code}
                        </span>
                        <span className="text-xs text-slate-400">Giữ lúc {timeString}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>Khách: <strong>{order.customer ? (order.customer.fullName || order.customer.name) : 'Khách lẻ'}</strong></span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-emerald-400 text-sm">{formatVND(totalAmount)}</span>
                      <div className="text-[11px] text-slate-400 font-medium">{totalItems} món hàng</div>
                    </div>
                  </div>

                  {/* Items Preview Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(order.items || []).map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                      >
                        {item.product?.name || (item as any).name || 'Sản phẩm'} <strong className="text-blue-400">x{item.quantity}</strong>
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa vĩnh viễn đơn tạm ${order.code}?`)) {
                          deleteParkedOrder(order.id);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa đơn này</span>
                    </button>

                    <button
                      onClick={() => handleRestore(order.id)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Mở lại đơn ({activeTab?.name || 'Hóa đơn hiện tại'})</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            Đóng (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
