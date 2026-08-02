import React from 'react';
import { usePosStore } from '../../store/posStore';
import { Printer, CheckCircle, X } from 'lucide-react';

export const ThermalInvoiceModal: React.FC = () => {
  const { isInvoiceModalOpen, setInvoiceModalOpen, lastOrder } = usePosStore();

  if (!isInvoiceModalOpen || !lastOrder) return null;

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle className="w-6 h-6" />
            <h3 className="font-bold text-lg text-white">Thanh toán Thành công!</h3>
          </div>
          <button
            onClick={() => setInvoiceModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt (K80 Standard) */}
        <div className="p-6 bg-white text-slate-900 font-mono text-sm space-y-4 print:p-0 print:bg-white print:text-black">
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <h2 className="font-bold text-base uppercase tracking-wider">CỬA HÀNG RETAIL PRO</h2>
            <p className="text-xs text-slate-600">Đ/c: 123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM</p>
            <p className="text-xs text-slate-600">Hotline: 1900 6868</p>
            <h3 className="font-bold text-sm uppercase mt-2">HÓA ĐƠN BÁN HÀNG</h3>
            <p className="text-[11px] text-slate-500">Mã HD: {lastOrder.orderNumber}</p>
            <p className="text-[11px] text-slate-500">Ngày: {new Date(lastOrder.createdAt).toLocaleString('vi-VN')}</p>
          </div>

          {/* Items Table */}
          <div className="space-y-2 text-xs border-b border-dashed border-slate-300 pb-3">
            <div className="grid grid-cols-12 font-bold text-slate-700 pb-1 border-b border-slate-200">
              <div className="col-span-6">Tên sản phẩm</div>
              <div className="col-span-2 text-center">SL / ĐV</div>
              <div className="col-span-4 text-right">Thành tiền</div>
            </div>
            {lastOrder.items.map((item: any, idx: number) => (
              <div key={idx} className="grid grid-cols-12 py-0.5">
                <div className="col-span-6 font-sans font-medium line-clamp-1">
                  {item.name || item.productId}
                </div>
                <div className="col-span-2 text-center font-bold">
                  {item.quantity} {item.selectedUnit || ''}
                </div>
                <div className="col-span-4 text-right">{formatVND(item.unitPrice * item.quantity)}</div>
              </div>
            ))}
          </div>

          {/* Pricing Details */}
          <div className="space-y-1 text-xs pt-1">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{formatVND(lastOrder.subTotal)}</span>
            </div>
            {lastOrder.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Chiết khấu:</span>
                <span>-{formatVND(lastOrder.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-300">
              <span>TỔNG CỘNG:</span>
              <span className="text-blue-600">{formatVND(lastOrder.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1">
              <span>Khách đưa ({lastOrder.paymentMethod}):</span>
              <span>{formatVND(lastOrder.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Tiền thừa trả khách:</span>
              <span>{formatVND(lastOrder.changeAmount)}</span>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-500 border-t border-dashed border-slate-300 pt-3">
            <p>Cảm ơn Quý khách & Hẹn gặp lại!</p>
            <p className="text-[9px] mt-0.5">Powered by Sales Manager Pro</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-800 flex gap-3 bg-slate-900">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            <Printer className="w-5 h-5" />
            <span>In Hóa Đơn (F12)</span>
          </button>
          <button
            onClick={() => setInvoiceModalOpen(false)}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
