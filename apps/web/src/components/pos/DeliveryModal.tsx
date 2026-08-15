import React, { useState, useEffect } from 'react';
import { usePosStore } from '../../store/posStore';
import { X, Truck, User, Phone, MapPin, DollarSign, Check, ShieldCheck, AlertCircle, FileText, ChevronRight } from 'lucide-react';

export const SHIPPING_PARTNERS = [
  { id: 'INTERNAL_SHIPPER', name: 'Shipper Nội Bộ Cửa Hàng', icon: '🛵', color: 'border-blue-500/50 bg-blue-500/10 text-blue-300' },
  { id: 'GHN', name: 'Giao Hàng Nhanh (GHN)', icon: '🚚', color: 'border-orange-500/50 bg-orange-500/10 text-orange-300' },
  { id: 'GHTK', name: 'Giao Hàng Tiết Kiệm (GHTK)', icon: '📦', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
  { id: 'VIETTEL_POST', name: 'Viettel Post', icon: '📮', color: 'border-red-500/50 bg-red-500/10 text-red-300' },
  { id: 'AHAMOVE', name: 'Ahamove 2H', icon: '⚡', color: 'border-amber-500/50 bg-amber-500/10 text-amber-300' },
  { id: 'GRAB', name: 'GrabExpress Siêu Tốc', icon: '🚗', color: 'border-green-500/50 bg-green-500/10 text-green-300' },
];

export const DeliveryModal: React.FC = () => {
  const {
    isDeliveryModalOpen,
    setDeliveryModalOpen,
    setDeliveryLogModalOpen,
    setInvoiceModalOpen,
    deliveryInfo,
    setDeliveryInfo,
    customer,
    cart,
    calculateTotal,
    checkout,
  } = usePosStore();

  const totals = calculateTotal();

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [shippingFee, setShippingFee] = useState<number>(30000);
  const [partnerType, setPartnerType] = useState<'INTERNAL_SHIPPER' | 'GHN' | 'GHTK' | 'VIETTEL_POST' | 'AHAMOVE' | 'GRAB'>('INTERNAL_SHIPPER');
  const [isCod, setIsCod] = useState<boolean>(true);
  const [codAmount, setCodAmount] = useState<number>(totals.total);
  const [depositAmount, setDepositAmount] = useState<number>(0);

  useEffect(() => {
    if (isDeliveryModalOpen && cart.length === 0) {
      alert('Vui lòng chọn sản phẩm vào giỏ hàng trước khi khai báo giao hàng!');
      setDeliveryModalOpen(false);
      return;
    }

    if (deliveryInfo) {
      setRecipientName(deliveryInfo.recipientName || '');
      setRecipientPhone(deliveryInfo.recipientPhone || '');
      setRecipientAddress(deliveryInfo.recipientAddress || '');
      setDeliveryNotes(deliveryInfo.deliveryNotes || '');
      setShippingFee(deliveryInfo.shippingFee || 30000);
      setPartnerType(deliveryInfo.partnerType || 'INTERNAL_SHIPPER');
      setIsCod(deliveryInfo.codAmount > 0);
      setCodAmount(deliveryInfo.codAmount || totals.total);
      setDepositAmount(deliveryInfo.depositAmount || 0);
    } else if (customer) {
      setRecipientName(customer.fullName || customer.name || '');
      setRecipientPhone(customer.phone || '');
      setRecipientAddress(customer.address || '');
      setCodAmount(totals.total);
    } else {
      setCodAmount(totals.total);
    }
  }, [deliveryInfo, customer, totals.total, isDeliveryModalOpen, cart.length]);

  if (!isDeliveryModalOpen) return null;

  const handleCopyCustomerInfo = () => {
    if (customer) {
      setRecipientName(customer.fullName || customer.name || '');
      setRecipientPhone(customer.phone || '');
      setRecipientAddress(customer.address || '');
    } else {
      alert('Vui lòng chọn khách hàng trên màn hình POS trước');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone.trim()) {
      alert('Vui lòng nhập số điện thoại người nhận');
      return;
    }
    if (!recipientAddress.trim()) {
      alert('Vui lòng nhập địa chỉ nhận hàng chi tiết');
      return;
    }

    const partnerObj = SHIPPING_PARTNERS.find((p) => p.id === partnerType);

    const info = {
      isDelivery: true,
      recipientName: recipientName.trim() || 'Khách nhận hàng',
      recipientPhone: recipientPhone.trim(),
      recipientAddress: recipientAddress.trim(),
      deliveryNotes: deliveryNotes.trim(),
      shippingFee: Number(shippingFee || 0),
      codAmount: isCod ? Number(codAmount || 0) : 0,
      depositAmount: Number(depositAmount || 0),
      partnerType,
      partnerName: partnerObj?.name || 'Shipper Nội Bộ',
      deliveryStatus: 'PENDING',
      codStatus: 'PENDING',
    };

    setDeliveryInfo(info);

    try {
      // Execute Checkout & Save Delivery Order into Database / Sổ Giao Hàng!
      await checkout({
        method: 'CASH',
        paidAmount: isCod ? Number(depositAmount || 0) : totals.total,
        notes: deliveryNotes.trim() ? `[GIAO HÀNG COD - ${partnerObj?.name}] ${deliveryNotes.trim()}` : `[GIAO HÀNG COD - ${partnerObj?.name}]`,
      });

      setDeliveryModalOpen(false);
      setInvoiceModalOpen(false); // Close POS invoice modal, open Sổ Giao Hàng directly
      setDeliveryLogModalOpen(true); // Open Sổ Giao Hàng immediately so cashier sees order in list
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu đơn giao hàng');
    }
  };

  const handleClearDelivery = () => {
    setDeliveryInfo(null);
    setDeliveryModalOpen(false);
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Lập Đơn Giao Hàng (MISA eShop Delivery)</h3>
              <p className="text-xs text-slate-400">Khai báo người nhận, đơn vị vận chuyển & đối soát tiền thu hộ COD</p>
            </div>
          </div>
          <button
            onClick={() => setDeliveryModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Section 1: Recipient Information */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-blue-400 text-xs flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-400" />
                <span>1. Thông Tin Người Nhận Hàng</span>
              </div>
              {customer && (
                <button
                  type="button"
                  onClick={handleCopyCustomerInfo}
                  className="text-[11px] text-blue-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Lấy từ hồ sơ: {customer.fullName || customer.name}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Tên người nhận (*)</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Nguyễn Văn A"
                  className="w-full px-3 py-2.5 rounded-xl glass-input font-bold text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Số điện thoại nhận (*)</label>
                <input
                  type="text"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="e.g. 0901234567"
                  className="w-full px-3 py-2.5 rounded-xl glass-input font-mono text-emerald-400 font-bold text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Địa chỉ giao hàng chi tiết (*)</label>
              <input
                type="text"
                required
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành..."
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Ghi chú giao hàng (cho Shipper)</label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Giao giờ hành chính, gọi trước 15 phút, cho xem hàng..."
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          {/* Section 2: Partner Selection */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>2. Chọn Đối Tác Vận Chuyển / Shipper</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SHIPPING_PARTNERS.map((p) => {
                const isSelected = partnerType === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPartnerType(p.id as any)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? `${p.color} ring-2 ring-blue-500 shadow-md font-bold`
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-base shrink-0">{p.icon}</span>
                    <span className="text-[11px] leading-tight truncate">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: COD & Shipping Fee Settlement */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/30 space-y-3">
            <div className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <span>3. Phí Giao Hàng & Tiền Thu Hộ COD</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Phí ship báo khách (VNĐ)</label>
                <input
                  type="number"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl glass-input font-mono font-bold text-amber-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Tiền khách đặt cọc trước (VNĐ)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => {
                    const dep = Number(e.target.value);
                    setDepositAmount(dep);
                    if (isCod) {
                      setCodAmount(Math.max(0, totals.total - dep));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl glass-input font-mono font-bold text-cyan-400 text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 text-[11px] font-semibold">Tiền thu hộ COD (VNĐ)</label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCod}
                      onChange={(e) => {
                        setIsCod(e.target.checked);
                        if (e.target.checked) setCodAmount(Math.max(0, totals.total - depositAmount));
                      }}
                      className="w-3.5 h-3.5 rounded text-blue-600"
                    />
                    <span className="text-[10px] text-blue-400 font-bold">Thu COD</span>
                  </label>
                </div>
                <input
                  type="number"
                  disabled={!isCod}
                  value={codAmount}
                  onChange={(e) => setCodAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl glass-input font-mono font-bold text-emerald-400 text-xs disabled:opacity-40"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] flex items-center justify-between text-slate-300">
              <span>Tổng đơn tiền hàng: <strong className="text-white font-mono">{formatVND(totals.total)}</strong></span>
              <span>Cần thu của khách (COD + Ship): <strong className="text-emerald-400 font-mono">{formatVND((isCod ? codAmount : 0) + shippingFee)}</strong></span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            {deliveryInfo ? (
              <button
                type="button"
                onClick={handleClearDelivery}
                className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-bold text-xs transition-all border border-red-500/30"
              >
                Hủy Đơn Giao Hàng
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeliveryModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Lưu Đơn Giao Hàng (F10)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryModal;
