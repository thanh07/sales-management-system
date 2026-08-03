import React, { useState } from 'react';
import { usePosStore } from '../../store/posStore';
import api from '../../services/api';
import { Trash2, Plus, Minus, CreditCard, User, Layers, Tag, Printer, Sparkles, Scale } from 'lucide-react';
import { CustomerSelectModal } from './CustomerSelectModal';
import { ParkedOrdersModal } from './ParkedOrdersModal';
import { ThermalInvoiceModal } from './ThermalInvoiceModal';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    customer,
    setCustomer,
    activePriceList,
    updateQuantity,
    updateItemUnit,
    removeFromCart,
    clearCart,
    calculateTotal,
    parkCurrentOrder,
    parkedOrders,
  } = usePosStore();

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isParkedModalOpen, setIsParkedModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  const { subtotal, total } = calculateTotal();

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const payload = {
        customerId: customer?.id || null,
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          selectedUnit: item.selectedUnit,
          conversionFactor: item.selectedConversionFactor,
          unitPrice: item.selectedPrice,
        })),
        paymentMethod: 'CASH',
      };

      const res: any = await api.post('/pos/checkout', payload);
      setCompletedOrder(res.data.order);
      clearCart();
    } catch (err: any) {
      alert(err.message || 'Lỗi thanh toán đơn hàng');
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 shadow-2xl">
      {/* Header Customer Banner */}
      <div className="p-4 border-b border-slate-800 space-y-2 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all"
          >
            <User className="w-4 h-4 text-blue-400" />
            <span className="truncate max-w-[150px]">{customer ? customer.name : 'Chọn Khách (F4)'}</span>
          </button>

          {parkedOrders.length > 0 && (
            <button
              onClick={() => setIsParkedModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-[11px] border border-amber-500/30 hover:bg-amber-500/30 flex items-center gap-1"
            >
              <span>Tạm giữ ({parkedOrders.length})</span>
            </button>
          )}
        </div>

        {/* Active Price List Badge */}
        {activePriceList && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px]">
            <Tag className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Bảng giá:</span>
            <span className="font-bold text-blue-400 truncate">{activePriceList.name}</span>
          </div>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Layers className="w-12 h-12 stroke-[1.5]" />
            <p className="text-xs font-medium">Giỏ hàng trống. Click chọn sản phẩm bên trái!</p>
          </div>
        ) : (
          cart.map((item) => {
            const prod = item.product;
            // Build all available units for this product (Smallest unit + All conversion units)
            const convList = prod.conversions && prod.conversions.length > 0
              ? prod.conversions
              : (prod.conversionUnit ? [{ id: 'c0', unitName: prod.conversionUnit, conversionFactor: prod.conversionFactor || 24, sellingPrice: prod.conversionSellingPrice || prod.sellingPrice * 24 }] : []);

            const availableUnits = [prod.unit, ...convList.map((c: any) => c.unitName)];

            return (
              <div
                key={`${prod.id}-${item.selectedUnit}`}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white line-clamp-1">{prod.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</span>
                  </div>
                  <button
                    onClick={() => removeFromCart(prod.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {/* Select Unit Selector Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <select
                      value={item.selectedUnit}
                      onChange={(e) => updateItemUnit(prod.id, e.target.value)}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-purple-300 font-bold text-[11px] focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {availableUnits.map((u) => (
                        <option key={u} value={u}>
                          {u} {u !== prod.unit ? `(x${convList.find((c: any) => c.unitName === u)?.conversionFactor || 24})` : '(Lẻ)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Display */}
                  <div className="font-bold text-blue-400 text-xs">
                    {formatVND(item.selectedPrice)}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => updateQuantity(prod.id, item.quantity - 1)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-white text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(prod.id, item.quantity + 1)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="font-bold text-emerald-400 text-xs">
                    = {formatVND(item.selectedPrice * item.quantity)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Checkout Actions */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/80">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Tạm tính:</span>
            <span className="font-semibold text-slate-200">{formatVND(subtotal)}</span>
          </div>
          <div className="flex justify-between text-white font-bold text-base pt-1 border-t border-slate-800">
            <span>TỔNG THÀNH TIỀN:</span>
            <span className="text-emerald-400">{formatVND(total)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={parkCurrentOrder}
            disabled={cart.length === 0}
            className="py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-1"
          >
            <span>Tạm Giữ Đơn (F8)</span>
          </button>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-1"
          >
            <CreditCard className="w-4 h-4" />
            <span>Thanh Toán (F9)</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {isCustomerModalOpen && (
        <CustomerSelectModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          onSelectCustomer={(c) => {
            setCustomer(c);
            setIsCustomerModalOpen(false);
          }}
        />
      )}

      {isParkedModalOpen && (
        <ParkedOrdersModal
          isOpen={isParkedModalOpen}
          onClose={() => setIsParkedModalOpen(false)}
        />
      )}

      {completedOrder && (
        <ThermalInvoiceModal
          order={completedOrder}
          isOpen={!!completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}
    </div>
  );
};
