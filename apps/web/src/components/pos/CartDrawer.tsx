import React from 'react';
import { usePosStore } from '../../store/posStore';
import { Trash2, Plus, Minus, CreditCard, Banknote, QrCode, Wallet, UserCheck, Pause, CheckCircle2, Award, X, ArrowRightLeft } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    updateItemUnit,
    clearCart,
    paymentMethod,
    setPaymentMethod,
    paidAmount,
    setPaidAmount,
    discountPercent,
    setDiscountPercent,
    checkout,
    parkCurrentOrder,
    setParkedModalOpen,
    parkedOrdersCount,
    selectedCustomer,
    setCustomer,
    setCustomerModalOpen,
  } = usePosStore();

  const subTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = (subTotal * discountPercent) / 100;
  const totalAmount = Math.max(0, subTotal - discountAmount);
  const changeAmount = Math.max(0, (paidAmount || totalAmount) - totalAmount);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const handleCheckout = async () => {
    try {
      await checkout();
    } catch (err: any) {
      alert(err.message || 'Lỗi thanh toán');
    }
  };

  return (
    <div className="w-96 border-l border-slate-800 bg-slate-900/90 flex flex-col h-full shrink-0">
      {/* Header Cart Title & Park Order Actions */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white text-base">Giỏ Hàng Quầy</h2>
          <span className="text-xs text-slate-400">{cart.length} mặt hàng</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setParkedModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-blue-400 flex items-center gap-1 border border-slate-700 relative"
            title="Danh sách đơn giữ"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Giữ ({parkedOrdersCount})</span>
          </button>
          <button
            onClick={parkCurrentOrder}
            disabled={cart.length === 0}
            className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-xs text-blue-300 font-medium disabled:opacity-50"
          >
            Tạm Giữ (F8)
          </button>
          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-30"
            title="Xóa giỏ hàng (F10)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Customer Select Banner */}
      <div
        onClick={() => setCustomerModalOpen(true)}
        className="px-4 py-3 bg-slate-950/80 hover:bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs cursor-pointer transition-colors group"
      >
        {selectedCustomer ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-white">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold flex items-center gap-1.5">
                  <span>{selectedCustomer.fullName}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-400 font-bold">
                    {selectedCustomer.group}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>{selectedCustomer.phone}</span>
                  <span className="text-amber-400 flex items-center gap-0.5 font-bold">
                    <Award className="w-3 h-3" />
                    {selectedCustomer.rewardPoints || 0}đ
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCustomer(null);
              }}
              className="p-1 text-slate-500 hover:text-red-400 rounded-lg"
              title="Đổi về Khách vãng lai"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-slate-300">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">Khách Vãng Lai (Tích điểm 1%)</span>
            </div>
            <span className="text-[11px] text-blue-400 group-hover:text-blue-300 font-semibold underline underline-offset-2">
              Chọn Khách (F4)
            </span>
          </div>
        )}
      </div>

      {/* Cart Items List with Unit Conversion Selector */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
            <span>Giỏ hàng trống. Click sản phẩm bên trái để chọn.</span>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.productId} className="p-3 rounded-xl glass-panel border border-slate-800 text-xs flex gap-3">
              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-slate-950 shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white truncate">{item.name}</h4>
                <div className="text-slate-400 mt-0.5 font-bold text-blue-400">
                  {formatVND(item.unitPrice)} / <span className="text-white underline">{item.selectedUnit}</span>
                </div>

                {/* Unit Conversion Selector & Quantity Controls */}
                <div className="flex items-center justify-between mt-2.5 gap-2">
                  {/* Unit Selector Dropdown */}
                  {item.conversionUnit ? (
                    <div className="relative">
                      <select
                        value={item.selectedUnit}
                        onChange={(e) => updateItemUnit(item.productId, e.target.value)}
                        className="px-2 py-1 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/40 text-[11px] font-bold cursor-pointer hover:bg-blue-600/30 transition-colors pr-5 appearance-none"
                      >
                        <option value={item.unit} className="bg-slate-900 text-white font-medium">
                          {item.unit} (Mặc định)
                        </option>
                        <option value={item.conversionUnit} className="bg-slate-900 text-white font-medium">
                          {item.conversionUnit} (x{item.conversionFactor || 1})
                        </option>
                      </select>
                      <ArrowRightLeft className="w-3 h-3 text-blue-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">
                      {item.unit}
                    </span>
                  )}

                  {/* Quantity Buttons */}
                  <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-white text-xs px-1">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-bold text-emerald-400">{formatVND(item.totalPrice)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Summary Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
        {/* Discount Input & Subtotal */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Tạm tính:</span>
            <span className="font-semibold text-white">{formatVND(subTotal)}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">Giảm giá (%):</span>
            <input
              type="number"
              min="0"
              max="100"
              value={discountPercent || ''}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              placeholder="0%"
              className="w-20 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-right font-bold text-blue-400 text-xs"
            />
          </div>

          <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-slate-800">
            <span className="text-white">Tổng Thanh Toán:</span>
            <span className="text-base text-blue-400">{formatVND(totalAmount)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Phương thức thanh toán
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => setPaymentMethod('CASH')}
              className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                paymentMethod === 'CASH'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span className="text-[10px]">Tiền mặt</span>
            </button>
            <button
              onClick={() => setPaymentMethod('BANK_TRANSFER')}
              className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                paymentMethod === 'BANK_TRANSFER'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span className="text-[10px]">Mã QR</span>
            </button>
            <button
              onClick={() => setPaymentMethod('CREDIT_CARD')}
              className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                paymentMethod === 'CREDIT_CARD'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="text-[10px]">Thẻ</span>
            </button>
            <button
              onClick={() => setPaymentMethod('E_WALLET')}
              className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                paymentMethod === 'E_WALLET'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span className="text-[10px]">Ví điện tử</span>
            </button>
          </div>
        </div>

        {/* Paid Amount Input & Change Amount */}
        {paymentMethod === 'CASH' && (
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Tiền khách đưa:</span>
              <input
                type="number"
                value={paidAmount || ''}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                placeholder={formatVND(totalAmount)}
                className="w-32 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-right font-bold text-white text-xs"
              />
            </div>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Tiền thừa trả khách:</span>
              <span>{formatVND(changeAmount)}</span>
            </div>
          </div>
        )}

        {/* Checkout Action Button */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 text-sm"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>THANH TOÁN HÓA ĐƠN (F9)</span>
        </button>
      </div>
    </div>
  );
};
