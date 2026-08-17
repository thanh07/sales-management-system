import React, { useEffect, useState } from 'react';
import { usePosStore } from '../../store/posStore';
import api from '../../services/api';
import {
  History,
  Search,
  Printer,
  RotateCcw,
  X,
  User,
  Calendar,
  DollarSign,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Minus,
  Check,
  CreditCard,
  Building2,
  FileText
} from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose }) => {
  const { setLastOrder, setInvoiceModalOpen } = usePosStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'ALL'>('TODAY');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected Order for Return Flow
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<any | null>(null);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [returnReason, setReturnReason] = useState<string>('Khách đổi ý');
  const [returnNotes, setReturnNotes] = useState<string>('');
  const [refundMethod, setRefundMethod] = useState<'CASH' | 'BANK_TRANSFER'>('CASH');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState<boolean>(false);
  const [returnSuccessMessage, setReturnSuccessMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const params: any = {};
      if (dateFilter === 'TODAY') params.date = todayStr;
      if (searchQuery.trim()) params.query = searchQuery.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res: any = await api.get('/pos/orders', { params });
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    } else {
      setSelectedOrderForReturn(null);
      setReturnSuccessMessage(null);
    }
  }, [isOpen, dateFilter, statusFilter, searchQuery]);

  if (!isOpen) return null;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Open Thermal Invoice Modal to Reprint
  const handleReprint = (order: any) => {
    const formattedForInvoice = {
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customer: order.customer || (order.customerName ? { fullName: order.customerName, phone: order.customerPhone } : null),
      items: order.items,
      subTotal: order.subTotal,
      discount: order.discount,
      totalAmount: order.totalAmount,
      paidAmount: order.paidAmount,
      changeAmount: order.changeAmount,
      paymentMethod: order.paymentMethod === 'CASH' ? 'Tiền mặt' : order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản (VietQR)' : order.paymentMethod === 'CREDIT_CARD' ? 'Thẻ POS' : 'Tách tiền mặt/CK',
    };
    setLastOrder(formattedForInvoice);
    setInvoiceModalOpen(true);
  };

  // Initialize Return Form for an Order
  const handleStartReturn = (order: any) => {
    setSelectedOrderForReturn(order);
    setReturnSuccessMessage(null);
    setReturnNotes('');
    setReturnReason('Khách đổi ý');
    setRefundMethod('CASH');

    // Default 0 for all items
    const initQty: Record<string, number> = {};
    order.items.forEach((item: any) => {
      const key = `${item.productId}-${item.selectedUnit || 'default'}`;
      initQty[key] = 0;
    });
    setReturnQuantities(initQty);
  };

  // Calculate return total
  const calculateReturnTotal = () => {
    if (!selectedOrderForReturn) return 0;
    let total = 0;
    selectedOrderForReturn.items.forEach((item: any) => {
      const key = `${item.productId}-${item.selectedUnit || 'default'}`;
      const qty = returnQuantities[key] || 0;
      total += qty * item.unitPrice;
    });
    return total;
  };

  // Handle Return Submit
  const handleConfirmReturn = async () => {
    if (!selectedOrderForReturn) return;

    const returnItems: any[] = [];
    selectedOrderForReturn.items.forEach((item: any) => {
      const key = `${item.productId}-${item.selectedUnit || 'default'}`;
      const qty = returnQuantities[key] || 0;
      if (qty > 0) {
        returnItems.push({
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          selectedUnit: item.selectedUnit,
          conversionFactor: item.conversionFactor,
          quantity: qty,
          unitPrice: item.unitPrice,
          returnReason,
        });
      }
    });

    if (returnItems.length === 0) {
      alert('Vui lòng chọn số lượng sản phẩm cần trả (lớn hơn 0)');
      return;
    }

    const refundTotal = calculateReturnTotal();

    setIsSubmittingReturn(true);
    try {
      const res: any = await api.post(`/pos/orders/${selectedOrderForReturn.id}/return`, {
        items: returnItems,
        refundAmount: refundTotal,
        refundMethod,
        notes: returnNotes,
      });

      setReturnSuccessMessage(`Tạo phiếu trả hàng thành công! Đã hoàn trả ${formatVND(refundTotal)} và cộng lại ${returnItems.reduce((s, i) => s + i.quantity, 0)} sản phẩm vào kho.`);
      await fetchOrders();

      // Reset form after short delay
      setTimeout(() => {
        setSelectedOrderForReturn(null);
        setReturnSuccessMessage(null);
      }, 2500);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xử lý trả hàng');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // Summary stats
  const totalRevenue = orders.reduce(
    (sum, o) =>
      sum +
      (o.status === 'COMPLETED'
        ? o.totalAmount
        : o.status === 'PARTIALLY_RETURNED'
        ? Math.max(0, o.totalAmount - (o.refundAmount || 0))
        : (o.paidAmount || 0)),
    0
  );
  const totalRefunded = orders.reduce((sum, o) => sum + (o.refundAmount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            {selectedOrderForReturn ? (
              <button
                onClick={() => setSelectedOrderForReturn(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {selectedOrderForReturn ? `Tạo Phiếu Trả Hàng: ${selectedOrderForReturn.orderNumber}` : 'Lịch Sử Hóa Đơn & Đổi Trả Hàng (F7)'}
              </h2>
              <span className="text-xs text-slate-400">
                {selectedOrderForReturn ? 'Chọn sản phẩm, số lượng và lý do hoàn tiền cho khách' : `Danh sách hóa đơn bán hàng • Tự động hoàn tồn kho khi đổi trả`}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===================== VIEW 1: DANH SÁCH HÓA ĐƠN ===================== */}
        {!selectedOrderForReturn && (
          <>
            {/* Overview Metric Cards */}
            <div className="p-4 sm:p-6 bg-slate-950/40 border-b border-slate-800 grid grid-cols-3 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Số Đơn Hàng</span>
                  <span className="text-lg font-bold text-white">{orders.length} đơn</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Doanh Thu Thu Được</span>
                  <span className="text-lg font-bold text-emerald-400">{formatVND(totalRevenue)}</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Đã Hoàn Tiền Trả Hàng</span>
                  <span className="text-lg font-bold text-amber-400">{formatVND(totalRefunded)}</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo mã HD, SĐT hoặc tên khách hàng..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
                  <button
                    onClick={() => setDateFilter('TODAY')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      dateFilter === 'TODAY' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hôm nay
                  </button>
                  <button
                    onClick={() => setDateFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      dateFilter === 'ALL' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tất cả
                  </button>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-semibold focus:outline-none"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="COMPLETED">✅ Hoàn thành</option>
                  <option value="DELIVERING">🚚 Đang Giao Hàng (Chờ COD)</option>
                  <option value="PARTIALLY_RETURNED">⚠️ Trả 1 phần</option>
                  <option value="RETURNED">❌ Đã trả toàn bộ</option>
                  <option value="CANCELLED">🔴 Đã hủy / Hoàn kho</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {isLoading ? (
                <div className="text-center py-12 text-slate-500 text-xs animate-pulse">Đang tải lịch sử hóa đơn...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                  <History className="w-10 h-10 stroke-[1.5] mx-auto text-slate-600" />
                  <p>Không tìm thấy hóa đơn nào phù hợp.</p>
                </div>
              ) : (
                orders.map((order) => {
                  const isCompleted = order.status === 'COMPLETED';
                  const isDelivering = order.status === 'DELIVERING';
                  const isPartiallyReturned = order.status === 'PARTIALLY_RETURNED';
                  const isReturned = order.status === 'RETURNED';
                  const isCancelled = order.status === 'CANCELLED';

                  const timeString = new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  const dateString = new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

                  const totalItemsCount = (order.items || []).reduce((s: number, i: any) => s + i.quantity, 0);

                  return (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md"
                    >
                      {/* Row 1: Header + Status + Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-blue-400 text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{timeString} • {dateString}</span>
                          </span>

                          {/* Status Badge */}
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                              ✅ Hoàn thành
                            </span>
                          )}
                          {isDelivering && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-bold text-[10px] border border-amber-500/20 animate-pulse">
                              🚚 Đang Giao Hàng (Chờ COD: {formatVND((order.totalAmount || 0) - (order.paidAmount || 0))})
                            </span>
                          )}
                          {isPartiallyReturned && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px] border border-amber-500/20">
                              ⚠️ Trả 1 phần (-{formatVND(order.refundAmount || 0)})
                            </span>
                          )}
                          {isReturned && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-bold text-[10px] border border-red-500/20">
                              ❌ Đã trả toàn bộ
                            </span>
                          )}
                          {isCancelled && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-bold text-[10px] border border-red-500/20">
                              🔴 Chuyển Hoàn / Đã Hủy
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => handleReprint(order)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                            title="In lại hóa đơn nhiệt"
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-400" />
                            <span>In lại Bill (F12)</span>
                          </button>

                          {!isReturned && (
                            <button
                              onClick={() => handleStartReturn(order)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                              title="Tạo phiếu đổi trả hàng hoàn tiền & hoàn tồn kho"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Trả Hàng / Đổi Hàng</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Customer & Payment Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs py-2 border-y border-slate-900">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>Khách: <strong className="text-white">{order.customerName || (order.customer?.fullName || order.customer?.name) || 'Khách lẻ'}</strong></span>
                          {order.customerPhone && <span className="text-slate-500 font-mono">({order.customerPhone})</span>}
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-300">
                          <CreditCard className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>Thanh toán: <strong className="text-white">{order.paymentMethod === 'CASH' ? 'Tiền mặt' : order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản QR' : order.paymentMethod === 'CREDIT_CARD' ? 'Thẻ' : 'Tách tiền mặt/CK'}</strong></span>
                        </div>

                        <div className="text-right sm:text-right">
                          <span className="text-slate-400">Tổng tiền: </span>
                          <strong className="text-emerald-400 text-sm font-extrabold">{formatVND(order.totalAmount)}</strong>
                        </div>
                      </div>

                      {/* Row 3: Items Pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {(order.items || []).map((item: any, idx: number) => {
                          const returnedQty = (order.returnedItems || [])
                            .filter((r: any) => r.productId === item.productId && r.selectedUnit === item.selectedUnit)
                            .reduce((sum: number, r: any) => sum + r.quantity, 0);

                          return (
                            <span
                              key={idx}
                              className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border ${
                                returnedQty > 0
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-300'
                              }`}
                            >
                              <span>{item.name}</span>
                              <strong className="text-blue-400">x{item.quantity} {item.selectedUnit || ''}</strong>
                              <span className="text-slate-500">({formatVND(item.unitPrice)})</span>
                              {returnedQty > 0 && (
                                <span className="text-red-400 text-[10px] font-bold">
                                  (Đã trả {returnedQty})
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ===================== VIEW 2: FORM TẠO PHIẾU TRẢ HÀNG ===================== */}
        {selectedOrderForReturn && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {returnSuccessMessage ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-base text-emerald-400">Hoàn Tất Trả Hàng</h3>
                <p className="text-xs text-slate-300">{returnSuccessMessage}</p>
              </div>
            ) : (
              <>
                {/* Order Information Banner */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-400 text-sm">{selectedOrderForReturn.orderNumber}</span>
                      <span className="text-slate-400">Mua lúc: {new Date(selectedOrderForReturn.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="text-slate-300">
                      Khách hàng: <strong>{selectedOrderForReturn.customerName || (selectedOrderForReturn.customer?.fullName || selectedOrderForReturn.customer?.name) || 'Khách lẻ'}</strong>
                      {selectedOrderForReturn.customerPhone && ` • ${selectedOrderForReturn.customerPhone}`}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block">Tổng hóa đơn gốc:</span>
                    <span className="text-base font-extrabold text-white">{formatVND(selectedOrderForReturn.totalAmount)}</span>
                  </div>
                </div>

                {/* Items Return Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                    <span>Chọn sản phẩm & số lượng khách trả:</span>
                    <span className="text-[11px] text-slate-500">Tồn kho sẽ tự động cộng lại vào hệ thống</span>
                  </div>

                  <div className="border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80 bg-slate-950/60">
                    {selectedOrderForReturn.items.map((item: any) => {
                      const key = `${item.productId}-${item.selectedUnit || 'default'}`;
                      const currentQty = returnQuantities[key] || 0;

                      const alreadyReturned = (selectedOrderForReturn.returnedItems || [])
                        .filter((r: any) => r.productId === item.productId && r.selectedUnit === item.selectedUnit)
                        .reduce((s: number, r: any) => s + r.quantity, 0);

                      const maxReturnable = Math.max(0, item.quantity - alreadyReturned);

                      return (
                        <div key={key} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-white">{item.name}</h4>
                            <div className="text-slate-400 text-[11px]">
                              Đơn vị: <strong className="text-purple-300">{item.selectedUnit || 'Mặc định'}</strong> • Đơn giá: <strong className="text-blue-400">{formatVND(item.unitPrice)}</strong>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Đã mua: {item.quantity} | Đã trả: {alreadyReturned} | <span className="text-emerald-400 font-semibold">Có thể trả: {maxReturnable}</span>
                            </div>
                          </div>

                          {maxReturnable === 0 ? (
                            <span className="text-xs text-slate-500 font-semibold italic">Đã trả hết</span>
                          ) : (
                            <div className="flex items-center gap-3">
                              {/* Quantity Stepper */}
                              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReturnQuantities({
                                      ...returnQuantities,
                                      [key]: Math.max(0, currentQty - 1),
                                    });
                                  }}
                                  disabled={currentQty <= 0}
                                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 flex items-center justify-center"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-9 text-center font-bold text-white font-mono">{currentQty}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReturnQuantities({
                                      ...returnQuantities,
                                      [key]: Math.min(maxReturnable, currentQty + 1),
                                    });
                                  }}
                                  disabled={currentQty >= maxReturnable}
                                  className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 flex items-center justify-center"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setReturnQuantities({
                                    ...returnQuantities,
                                    [key]: currentQty === maxReturnable ? 0 : maxReturnable,
                                  });
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px]"
                              >
                                {currentQty === maxReturnable ? 'Bỏ chọn' : 'Trả hết'}
                              </button>

                              <span className="font-bold text-emerald-400 font-mono w-24 text-right">
                                {formatVND(currentQty * item.unitPrice)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Return Options: Reason & Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Lý do trả hàng (*)</label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-950 font-medium text-slate-200"
                    >
                      <option value="Khách đổi ý">Khách đổi ý không muốn lấy</option>
                      <option value="Hàng lỗi / hư hỏng">Hàng bị lỗi / móp / vỡ khi nhận</option>
                      <option value="Hết hạn sử dụng">Hàng cận hoặc hết hạn sử dụng</option>
                      <option value="Nhầm phân loại / sản phẩm">Nhầm loại / size / vị</option>
                      <option value="Lý do khác">Lý do khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Hình thức hoàn tiền cho khách</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRefundMethod('CASH')}
                        className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                          refundMethod === 'CASH'
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Tiền mặt</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRefundMethod('BANK_TRANSFER')}
                        className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                          refundMethod === 'BANK_TRANSFER'
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Chuyển khoản</span>
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1.5">Ghi chú phiếu trả (tùy chọn)</label>
                    <input
                      type="text"
                      value={returnNotes}
                      onChange={(e) => setReturnNotes(e.target.value)}
                      placeholder="Nhập ghi chú thêm nếu cần..."
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>

                {/* Refund Total Summary Bar */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs">TỔNG SỐ TIỀN CẦN HOÀN TRẢ LẠI KHÁCH</h4>
                      <span className="text-[11px] text-amber-200/80">Tồn kho các mặt hàng tương ứng sẽ được khôi phục ngay lập tức</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-amber-400">{formatVND(calculateReturnTotal())}</span>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForReturn(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmReturn}
                    disabled={isSubmittingReturn || calculateReturnTotal() <= 0}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-orange-500/20 disabled:opacity-40 flex items-center gap-2 transition-all active:scale-[0.99]"
                  >
                    {isSubmittingReturn ? (
                      <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Xác Nhận Trả Hàng & Hoàn Tồn Kho ({formatVND(calculateReturnTotal())})</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Bấm <strong className="text-blue-400 font-mono">F7</strong> để mở/đóng nhanh màn hình này</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
          >
            Đóng (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
