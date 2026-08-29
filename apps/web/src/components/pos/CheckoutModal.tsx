import React, { useState, useEffect } from 'react';
import { usePosStore } from '../../store/posStore';
import api from '../../services/api';
import { X, CheckCircle2, DollarSign, QrCode, CreditCard, Layers, Copy, Check, Printer, AlertCircle, Truck, MapPin } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, customer, calculateTotal, checkout, tabs, activeTabId, setDiscount } = usePosStore();
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const deliveryInfo = activeTab?.cart?.length > 0 ? activeTab.deliveryInfo : null;

  const { subtotal, discount, shippingFee, total } = calculateTotal();

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'SPLIT'>('CASH');
  const [receivedAmount, setReceivedAmount] = useState<number>(total);
  const [isDefaultAmount, setIsDefaultAmount] = useState<boolean>(true);
  const [splitCashAmount, setSplitCashAmount] = useState<number>(0);
  const [splitBankAmount, setSplitBankAmount] = useState<number>(total);
  const [selectedBank, setSelectedBank] = useState({
    bin: 'MB',
    shortName: 'MB',
    accountNo: '999988886666',
    accountName: 'NGUYEN VAN THANH',
  });
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync settings for dynamic VietQR
  useEffect(() => {
    if (isOpen) {
      api.get('/settings').then((res: any) => {
        if (res.data && res.data.bankAccountNo) {
          setSelectedBank({
            bin: res.data.bankCode || 'MB',
            shortName: res.data.bankCode || 'MB',
            accountNo: res.data.bankAccountNo,
            accountName: res.data.bankAccountName || 'CHỦ TÀI KHOẢN',
          });
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  // Sync received amount when total changes
  useEffect(() => {
    setReceivedAmount(total);
    setIsDefaultAmount(true);
    setSplitBankAmount(total);
    setSplitCashAmount(0);
  }, [total, isOpen]);

  if (!isOpen) return null;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const orderCode = `HD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(1000 + Math.random() * 9000)}`;

  // Dynamic VietQR generator URL (Pure High-Resolution QR)
  const qrTransferAmount = paymentMethod === 'SPLIT' ? splitBankAmount : total;
  const qrUrl = `https://img.vietqr.io/image/${selectedBank.shortName}-${selectedBank.accountNo}-qr_only.png?amount=${qrTransferAmount}&addInfo=${orderCode}&accountName=${encodeURIComponent(selectedBank.accountName)}`;

  const changeAmount = paymentMethod === 'CASH' ? Math.max(0, receivedAmount - total) : 0;
  const isSufficient = paymentMethod === 'CASH' ? receivedAmount >= total : true;

  // Smart Cash Denomination Handler (Overwrite on 1st tap, stack on 2nd+)
  const handleQuickCash = (amount: number) => {
    if (isDefaultAmount || receivedAmount === total) {
      setReceivedAmount(amount);
      setIsDefaultAmount(false);
    } else {
      setReceivedAmount((prev) => prev + amount);
    }
  };

  // Helper to generate smart cash denomination chips based on total
  const getSmartCashSuggestions = (totalAmt: number) => {
    const list: { label: string; amount: number; isSmart?: boolean }[] = [];

    // Exact amount
    list.push({ label: 'Đủ tiền', amount: totalAmt, isSmart: true });

    // Round to nearest 10k
    const next10k = Math.ceil(totalAmt / 10000) * 10000;
    if (next10k > totalAmt) {
      list.push({ label: `${(next10k / 1000).toLocaleString('vi-VN')}k`, amount: next10k, isSmart: true });
    }

    // Round to nearest 50k
    const next50k = Math.ceil(totalAmt / 50000) * 50000;
    if (next50k > totalAmt && next50k !== next10k) {
      list.push({ label: `${(next50k / 1000).toLocaleString('vi-VN')}k`, amount: next50k, isSmart: true });
    }

    // Round to nearest 100k / 500k
    const next100k = Math.ceil(totalAmt / 100000) * 100000;
    if (next100k > totalAmt && next100k !== next50k && next100k !== next10k) {
      list.push({ label: `${(next100k / 1000).toLocaleString('vi-VN')}k`, amount: next100k, isSmart: true });
    }

    // Polymer bills
    [50000, 100000, 200000, 500000].forEach((bill) => {
      if (!list.some((s) => s.amount === bill)) {
        list.push({ label: `${bill / 1000}k`, amount: bill });
      }
    });

    return list;
  };

  // Helper to calculate exact bill breakdown for returning change
  const getChangeBreakdown = (change: number) => {
    if (change <= 0) return [];
    const bills = [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000];
    const breakdown: { bill: number; count: number }[] = [];
    let rem = change;

    bills.forEach((b) => {
      if (rem >= b) {
        const count = Math.floor(rem / b);
        rem %= b;
        breakdown.push({ bill: b, count });
      }
    });

    return breakdown;
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(selectedBank.accountNo);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConfirmCheckout = async (printReceipt: boolean = true) => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      await checkout({
        method: paymentMethod,
        paidAmount: paymentMethod === 'CASH' ? receivedAmount : total,
        cashAmount: paymentMethod === 'SPLIT' ? splitCashAmount : undefined,
        bankAmount: paymentMethod === 'SPLIT' ? splitBankAmount : undefined,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Lỗi thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <span>Thanh toán hóa đơn: {activeTab?.name || 'Hóa đơn'}</span>
            </h2>
            <span className="text-xs text-slate-400">
              Khách hàng: <strong className="text-blue-300">{customer ? customer.fullName || customer.name : 'Khách lẻ'}</strong> | {cart.length} mặt hàng
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Total Amount Banner */}
          <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Khách cần thanh toán</span>
              <div className="text-2xl font-black text-emerald-400 mt-0.5 tracking-tight">{formatVND(total)}</div>
            </div>
            <div className="text-right text-xs space-y-0.5">
              <span className="text-slate-400">Tạm tính: {formatVND(subtotal)}</span>
              {shippingFee > 0 && <div className="text-amber-400 font-bold">Phí ship: +{formatVND(shippingFee)}</div>}
              {discount > 0 && <div className="text-amber-400 font-bold">Giảm giá: -{formatVND(discount)}</div>}
            </div>
          </div>

          {/* Delivery Summary Banner */}
          {deliveryInfo && (
            <div className="bg-blue-500/10 border border-blue-500/30 p-3.5 rounded-2xl space-y-1 text-xs text-blue-200">
              <div className="flex items-center justify-between font-bold text-blue-300">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span>ĐƠN GIAO HÀNG ({deliveryInfo.partnerName})</span>
                </div>
                {deliveryInfo.codAmount > 0 ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[11px]">
                    GIAO THU COD: {formatVND(deliveryInfo.codAmount)}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono text-[11px]">
                    KHÁCH ĐÃ TRẢ ĐỦ 100%
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-300">
                Người nhận: <strong>{deliveryInfo.recipientName}</strong> ({deliveryInfo.recipientPhone})
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="truncate">{deliveryInfo.recipientAddress}</span>
              </div>
            </div>
          )}

          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'CASH', label: 'Tiền mặt', icon: DollarSign, color: 'text-emerald-400' },
              { id: 'BANK_TRANSFER', label: 'VietQR Chuyển khoản', icon: QrCode, color: 'text-blue-400' },
              { id: 'CREDIT_CARD', label: 'Thẻ / POS', icon: CreditCard, color: 'text-purple-400' },
              { id: 'SPLIT', label: 'Tách tiền mặt + CK', icon: Layers, color: 'text-amber-400' },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : m.color}`} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Tiền mặt (Cash) */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-300 font-bold">Tiền khách đưa (VNĐ)</label>
                    {!isDefaultAmount && (
                      <span className="text-[10px] text-amber-400 font-medium">⚡ Đã nhập thủ công</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setReceivedAmount(total);
                        setIsDefaultAmount(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-bold text-xs border border-blue-500/40 transition-all shadow-sm shrink-0"
                    >
                      Đủ tiền
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReceivedAmount(0);
                        setIsDefaultAmount(false);
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-red-600/20 text-slate-300 hover:text-red-400 font-bold text-xs border border-slate-700 transition-all shadow-sm shrink-0"
                      title="Xóa trắng để nhập lại"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={receivedAmount || ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      setReceivedAmount(Number(e.target.value) || 0);
                      setIsDefaultAmount(false);
                    }}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xl outline-none focus:border-blue-500 font-mono tracking-wide [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Smart Cash Suggestion Chips */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                  <span>💡 Chọn nhanh mệnh giá tiền:</span>
                  <span className="text-[10px] text-slate-500">(Bấm 1 lần = Thay thế | Bấm tiếp = Cộng dồn)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getSmartCashSuggestions(total).map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickCash(item.amount)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        item.amount === receivedAmount
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
                          : item.isSmart
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {item.isSmart ? `[ ${item.label} ]` : `+${item.label}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Calculation & Bill Breakdown */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-bold">Tiền thừa trả khách:</span>
                  <span className={`text-xl font-black ${changeAmount > 0 ? 'text-amber-400 tracking-tight' : 'text-slate-500'}`}>
                    {formatVND(changeAmount)}
                  </span>
                </div>

                {/* Change Breakdown Suggestion */}
                {changeAmount > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1 text-[11px]">
                      <span>💡 Gợi ý thối tiền mặt cho khách:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[11px] font-bold">
                      {getChangeBreakdown(changeAmount).map((b, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-amber-500/40 text-amber-200">
                          {b.count}x {(b.bill / 1000).toLocaleString('vi-VN')}k
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Chuyển khoản VietQR Động */}
          {paymentMethod === 'BANK_TRANSFER' && (
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
              {/* Dynamic QR Code */}
              <div className="bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center shrink-0 border border-slate-200">
                <img
                  src={qrUrl}
                  alt="VietQR Chuyển khoản"
                  className="w-44 h-44 object-contain"
                />
                <span className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-wider">Quét mã VietQR</span>
              </div>

              {/* Bank & Transfer Instructions */}
              <div className="flex-1 min-w-0 space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Ngân hàng nhận:</span>
                  <div className="font-bold text-white text-sm">{selectedBank.shortName} (Ngân hàng Quân Đội)</div>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px]">Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-400 text-sm">{selectedBank.accountNo}</span>
                    <button
                      onClick={handleCopyAccount}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Sao chép số tài khoản"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px]">Chủ tài khoản:</span>
                  <div className="font-bold text-slate-200">{selectedBank.accountName}</div>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px]">Số tiền & Nội dung:</span>
                  <div className="font-bold text-emerald-400 text-sm">{formatVND(total)} ({orderCode})</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Thẻ / POS */}
          {paymentMethod === 'CREDIT_CARD' && (
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <CreditCard className="w-4 h-4 text-purple-400" />
                <span>Quẹt thẻ ATM / Visa / Mastercard trên máy POS cầm tay</span>
              </div>
              <input
                type="text"
                placeholder="Nhập mã chuẩn chi / mã tham chiếu giao dịch (không bắt buộc)..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-purple-500"
              />
            </div>
          )}

          {/* Tab 4: Tách tiền mặt + Chuyển khoản */}
          {paymentMethod === 'SPLIT' && (
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">1. Tiền mặt (VNĐ):</label>
                  <input
                    type="number"
                    value={splitCashAmount}
                    onChange={(e) => {
                      const cash = Number(e.target.value) || 0;
                      setSplitCashAmount(cash);
                      setSplitBankAmount(Math.max(0, total - cash));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">2. Chuyển khoản QR (VNĐ):</label>
                  <input
                    type="number"
                    value={splitBankAmount}
                    onChange={(e) => {
                      const bank = Number(e.target.value) || 0;
                      setSplitBankAmount(bank);
                      setSplitCashAmount(Math.max(0, total - bank));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  />
                </div>
              </div>

              {splitBankAmount > 0 && (
                <div className="pt-2 flex items-center gap-3">
                  <img src={qrUrl} alt="VietQR" className="w-16 h-16 rounded-xl bg-white p-1" />
                  <div className="text-[11px] text-slate-300">
                    <div>Mã QR phần chuyển khoản: <strong className="text-blue-400">{formatVND(splitBankAmount)}</strong></div>
                    <span className="text-slate-500">Khách quét mã bên trái để thanh toán phần tiền còn lại</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            Quay lại (Esc)
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleConfirmCheckout(false)}
              disabled={isProcessing || !isSufficient}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 disabled:opacity-40 transition-all"
            >
              Chỉ hoàn tất
            </button>

            <button
              onClick={() => handleConfirmCheckout(true)}
              disabled={isProcessing || !isSufficient}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-40 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Thanh toán & In HD (F9)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
