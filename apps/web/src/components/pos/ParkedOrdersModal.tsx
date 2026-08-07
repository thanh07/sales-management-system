import React, { useEffect, useState } from 'react';
import { usePosStore } from '../../store/posStore';
import api from '../../services/api';
import { Clock, Play, Trash2, X } from 'lucide-react';

interface ParkedOrdersModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ParkedOrdersModal: React.FC<ParkedOrdersModalProps> = ({ isOpen, onClose }) => {
  const { isParkedModalOpen: storeOpen, setParkedModalOpen, addToCart, clearCart } = usePosStore();
  const [parkedOrders, setParkedOrders] = useState<any[]>([]);

  const isModalOpen = isOpen !== undefined ? isOpen : storeOpen;
  const handleClose = () => {
    if (onClose) onClose();
    else setParkedModalOpen(false);
  };

  const fetchParked = async () => {
    try {
      const res: any = await api.get('/pos/parked-orders');
      setParkedOrders(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchParked();
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const handleRestore = async (order: any) => {
    clearCart();
    order.cart.forEach((item: any) => {
      addToCart({
        id: item.productId,
        sku: item.sku,
        barcode: item.barcode,
        name: item.name,
        sellingPrice: item.unitPrice,
        image: item.image,
      });
    });
    await api.delete(`/pos/parked-orders/${order.id}`);
    setParkedModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/pos/parked-orders/${id}`);
    fetchParked();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-blue-400">
            <Clock className="w-5 h-5" />
            <h3 className="font-bold text-lg text-white">Danh sách Giỏ Hàng Tạm Giữ</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {parkedOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Không có đơn hàng nào đang tạm giữ.
            </div>
          ) : (
            parkedOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 font-semibold text-white text-sm">
                    <span>Đơn giữ lúc {order.time}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400">
                      {order.cart.length} món
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {order.cart.map((i: any) => `${i.name} (x${i.quantity})`).join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestore(order)}
                    className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 text-xs font-medium"
                  >
                    <Play className="w-4 h-4" />
                    <span>Mở lại</span>
                  </button>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
