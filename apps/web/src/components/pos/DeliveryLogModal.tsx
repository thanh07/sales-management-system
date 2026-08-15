import React, { useEffect, useState } from 'react';
import { usePosStore } from '../../store/posStore';
import api from '../../services/api';
import {
  X,
  Truck,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  DollarSign,
  Phone,
  MapPin,
  Calendar,
  Check,
  RefreshCw,
  PackageCheck,
  PackageX
} from 'lucide-react';
import { SHIPPING_PARTNERS } from './DeliveryModal';

import { useBranchStore } from '../../store/branchStore';

export const DeliveryLogModal: React.FC = () => {
  const { isDeliveryLogModalOpen, setDeliveryLogModalOpen } = usePosStore();
  const { selectedBranchId } = useBranchStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchDeliveryOrders = async () => {
    try {
      setIsLoading(true);
      const res: any = await api.get('/pos/orders', { params: { branchId: selectedBranchId } });
      const allOrders: any[] = res.data || [];
      // Filter orders that have deliveryInfo and match branchId
      const deliveryOrders = allOrders.filter((o) => o.deliveryInfo && o.deliveryInfo.isDelivery && (o.branchId ? o.branchId === selectedBranchId : true));
      setOrders(deliveryOrders);
    } catch (err) {
      console.error('Fetch delivery orders error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isDeliveryLogModalOpen) {
      fetchDeliveryOrders();
    }
  }, [isDeliveryLogModalOpen, selectedBranchId]);

  if (!isDeliveryLogModalOpen) return null;

  const handleUpdateStatus = async (orderId: string, newStatus: string, reason?: string) => {
    try {
      await api.put(`/pos/orders/${orderId}/delivery-status`, {
        status: newStatus,
        failureReason: reason,
      });
      alert(`Đã cập nhật trạng thái đơn giao hàng thành ${newStatus}!`);
      fetchDeliveryOrders();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái giao hàng');
    }
  };

  const handleCollectCod = async (orderId: string) => {
    try {
      await api.post(`/pos/orders/${orderId}/collect-cod`);
      alert('Đã xác nhận thu tiền COD thành công!');
      fetchDeliveryOrders();
    } catch (err: any) {
      alert(err.message || 'Lỗi thu tiền COD');
    }
  };

  const handleMarkFailed = (orderId: string) => {
    const reason = prompt('Nhập lý do giao hàng thất bại (e.g. Khách không nghe máy, Khách đổi ý không lấy...):');
    if (reason !== null) {
      handleUpdateStatus(orderId, 'FAILED', reason);
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  const filteredOrders = orders.filter((o) => {
    const status = o.deliveryInfo?.deliveryStatus || 'PENDING';
    if (activeTab !== 'ALL' && status !== activeTab) {
      if (activeTab === 'FAILED' && (status === 'FAILED' || status === 'RETURNED')) {
        // match
      } else {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const num = o.orderNumber?.toLowerCase() || '';
      const name = o.deliveryInfo?.recipientName?.toLowerCase() || '';
      const phone = o.deliveryInfo?.recipientPhone || '';
      return num.includes(q) || name.includes(q) || phone.includes(q);
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Sổ Giao Hàng & Theo Dõi Vận Chuyển (Delivery Tracking Studio)</h3>
              <p className="text-xs text-slate-400">Bàn giao shipper, theo dõi trạng thái giao, thu tiền COD & chuyển hoàn kho</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDeliveryOrders}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
              title="Tải lại danh sách đơn"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setDeliveryLogModalOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Mã HD, Tên người nhận, SĐT..."
              className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { key: 'ALL', label: 'Tất cả', count: orders.length },
              { key: 'PENDING', label: '⏳ Chờ giao', count: orders.filter((o) => o.deliveryInfo?.deliveryStatus === 'PENDING').length },
              { key: 'SHIPPING', label: '🚚 Đang giao', count: orders.filter((o) => o.deliveryInfo?.deliveryStatus === 'SHIPPING').length },
              { key: 'DELIVERED', label: '🟢 Thành công', count: orders.filter((o) => o.deliveryInfo?.deliveryStatus === 'DELIVERED').length },
              { key: 'FAILED', label: '🔴 Thất bại & Hoàn kho', count: orders.filter((o) => o.deliveryInfo?.deliveryStatus === 'FAILED' || o.deliveryInfo?.deliveryStatus === 'RETURNED').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-950/60 text-[10px] font-mono">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
              <Truck className="w-12 h-12 text-slate-700" />
              <span>Chưa có đơn giao hàng nào trong danh sách</span>
            </div>
          ) : (
            filteredOrders.map((o) => {
              const info = o.deliveryInfo || {};
              const partner = SHIPPING_PARTNERS.find((p) => p.id === info.partnerType) || SHIPPING_PARTNERS[0];
              const status = info.deliveryStatus || 'PENDING';
              const isCodCollected = info.codStatus === 'COLLECTED';

              return (
                <div
                  key={o.id}
                  className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                >
                  {/* Left info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm font-mono">{o.orderNumber}</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border flex items-center gap-1 ${
                        status === 'PENDING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        status === 'SHIPPING' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                        status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        {status === 'PENDING' ? '⏳ Chờ Bàn Giao Shipper' :
                         status === 'SHIPPING' ? '🚚 Đang Giao Hàng' :
                         status === 'DELIVERED' ? '🟢 Giao Thành Công' :
                         status === 'RETURNED' ? '↩️ Đã Chuyển Hoàn Kho' : '🔴 Giao Thất Bại'}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                        <span>{partner.icon}</span>
                        <span>{partner.name}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-300">
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          <span>{info.recipientName}</span>
                          <span className="text-blue-400 font-mono font-normal">({info.recipientPhone})</span>
                        </div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span className="truncate">{info.recipientAddress}</span>
                        </div>
                      </div>

                      <div className="space-y-0.5 font-mono text-[11px]">
                        <div>Tổng đơn: <strong className="text-white">{formatVND(o.totalAmount)}</strong></div>
                        <div>Tiền thu COD: <strong className="text-emerald-400">{formatVND(info.codAmount)}</strong> {isCodCollected && <span className="text-emerald-400 font-bold">(Đã Thu)</span>}</div>
                        <div>Phí Ship: <strong className="text-amber-400">{formatVND(info.shippingFee)}</strong></div>
                      </div>
                    </div>

                    {info.failureReason && (
                      <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Lý do thất bại: <strong>{info.failureReason}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                    {status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'SHIPPING')}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>🚚 Bàn Giao Shipper</span>
                      </button>
                    )}

                    {status === 'SHIPPING' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'DELIVERED')}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>🟢 Hoàn Thành Giao</span>
                        </button>
                        <button
                          onClick={() => handleMarkFailed(o.id)}
                          className="px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 font-bold text-xs flex items-center gap-1"
                        >
                          <PackageX className="w-3.5 h-3.5" />
                          <span>🔴 Báo Thất Bại</span>
                        </button>
                      </>
                    )}

                    {status === 'DELIVERED' && info.codAmount > 0 && !isCodCollected && (
                      <button
                        onClick={() => handleCollectCod(o.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>💵 Thu Tiền COD</span>
                      </button>
                    )}

                    {status === 'FAILED' && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'RETURNED')}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                        title="Tự động hoàn trả số lượng hàng về kho chi nhánh"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>↩️ Chuyển Hoàn Kho</span>
                      </button>
                    )}

                    {status === 'RETURNED' && (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-500 font-bold text-[11px] italic">
                        Đã nhập trả kho
                      </span>
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

export default DeliveryLogModal;
