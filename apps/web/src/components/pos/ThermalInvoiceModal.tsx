import React from 'react';
import { usePosStore } from '../../store/posStore';
import api from '../../services/api';
import { Printer, CheckCircle, X } from 'lucide-react';

interface ThermalInvoiceModalProps {
  order?: any;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ThermalInvoiceModal: React.FC<ThermalInvoiceModalProps> = ({
  order: propOrder,
  isOpen: propIsOpen,
  onClose,
}) => {
  const { isInvoiceModalOpen, setInvoiceModalOpen, lastOrder } = usePosStore();
  const [storeSettings, setStoreSettings] = React.useState<any>(null);

  React.useEffect(() => {
    api.get('/settings').then((res: any) => {
      if (res.data) setStoreSettings(res.data);
    }).catch(() => {});
  }, []);

  const isModalOpen = propIsOpen !== undefined ? propIsOpen : isInvoiceModalOpen;
  const currentOrder = propOrder || lastOrder;

  const handleClose = () => {
    if (onClose) onClose();
    else setInvoiceModalOpen(false);
  };

  if (!isModalOpen || !currentOrder) return null;

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const storeName = storeSettings?.storeName || 'CỬA HÀNG RETAIL PRO';
  const storeAddress = storeSettings?.address || '123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM';
  const storePhone = storeSettings?.phone || '1900 6868';
  const storeTax = storeSettings?.taxCode;
  const receiptFooter = storeSettings?.receiptFooter || 'Cảm ơn Quý khách & Hẹn gặp lại!';

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
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt (K80 Standard) */}
        <div className="p-6 bg-white text-slate-900 font-mono text-sm space-y-4 print:p-0 print:bg-white print:text-black">
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <h2 className="font-bold text-base uppercase tracking-wider">{storeName}</h2>
            <p className="text-xs text-slate-600">Đ/c: {storeAddress}</p>
            <p className="text-xs text-slate-600">Hotline: {storePhone}</p>
            {storeTax && <p className="text-[11px] text-slate-500">MST: {storeTax}</p>}
            <h3 className="font-bold text-sm uppercase mt-2">HÓA ĐƠN BÁN HÀNG</h3>
            <p className="text-[11px] text-slate-500">Mã HD: {currentOrder.orderNumber}</p>
            <p className="text-[11px] text-slate-500">Ngày: {new Date(currentOrder.createdAt).toLocaleString('vi-VN')}</p>
          </div>

          {/* Items Table */}
          <div className="space-y-2 text-xs border-b border-dashed border-slate-300 pb-3">
            <div className="grid grid-cols-12 font-bold text-slate-700 pb-1 border-b border-slate-200">
              <div className="col-span-6">Tên sản phẩm</div>
              <div className="col-span-2 text-center">SL / ĐV</div>
              <div className="col-span-4 text-right">Thành tiền</div>
            </div>
            {currentOrder.items.map((item: any, idx: number) => (
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
              <span>{formatVND(currentOrder.subTotal)}</span>
            </div>
            {currentOrder.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Chiết khấu:</span>
                <span>-{formatVND(currentOrder.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-300">
              <span>TỔNG CỘNG:</span>
              <span className="text-blue-600">{formatVND(currentOrder.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1">
              <span>Khách đưa ({currentOrder.paymentMethod}):</span>
              <span>{formatVND(currentOrder.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Tiền thừa trả khách:</span>
              <span>{formatVND(currentOrder.changeAmount)}</span>
            </div>
          </div>

          {/* Dedicated Delivery Voucher / Shipping Label Block */}
          {currentOrder.deliveryInfo && (
            <div className="border-t-2 border-dashed border-slate-400 pt-3 mt-3 text-xs space-y-1 bg-blue-50 p-2.5 rounded-lg text-slate-900 font-mono">
              <div className="text-center font-bold text-sm uppercase text-blue-900 border-b border-blue-200 pb-1 mb-1.5">
                🚚 PHIẾU GIAO HÀNG (VẬN ĐƠN)
              </div>
              <div className="flex justify-between font-bold">
                <span>Đơn vị giao:</span>
                <span className="text-blue-700">{currentOrder.deliveryInfo.partnerName}</span>
              </div>
              <div>Người nhận: <strong className="font-bold text-slate-900">{currentOrder.deliveryInfo.recipientName}</strong></div>
              <div>Số điện thoại: <strong className="font-bold text-blue-800">{currentOrder.deliveryInfo.recipientPhone}</strong></div>
              <div className="leading-tight">Địa chỉ: <strong>{currentOrder.deliveryInfo.recipientAddress}</strong></div>
              {currentOrder.deliveryInfo.deliveryNotes && (
                <div className="italic text-[11px] text-slate-600">Ghi chú: {currentOrder.deliveryInfo.deliveryNotes}</div>
              )}
              <div className="border-t border-blue-200 pt-1 mt-1 flex justify-between font-extrabold text-sm">
                <span>TIỀN THU HỘ (COD):</span>
                <span className="text-emerald-700">{formatVND(currentOrder.deliveryInfo.codAmount || 0)}</span>
              </div>
            </div>
          )}

          {/* Dynamic VietQR Payment Code for Customer Scan (Large & Clean) */}
          {storeSettings?.printVietQRReceipt !== false && storeSettings?.bankAccountNo && (
            <div className="border-t-2 border-dashed border-slate-400 pt-3 text-center space-y-2 bg-slate-50 p-3 rounded-xl print:bg-white print:border-black print:p-1">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                📱 Quét mã VietQR chuyển khoản
              </div>
              <div className="flex justify-center my-1">
                <img
                  src={`https://img.vietqr.io/image/${storeSettings.bankCode || 'MB'}-${storeSettings.bankAccountNo}-qr_only.png?amount=${currentOrder.totalAmount || 0}&addInfo=${encodeURIComponent(currentOrder.orderNumber || 'HD')}&accountName=${encodeURIComponent(storeSettings.bankAccountName || '')}`}
                  alt="VietQR Payment Code"
                  className="w-48 h-48 object-contain rounded-lg border border-slate-300 bg-white p-1 print:w-44 print:h-44 print:border-black shadow-sm"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="text-xs text-slate-800 leading-snug font-medium space-y-0.5">
                <div>Ngân hàng: <strong className="font-bold">{storeSettings.bankName || storeSettings.bankCode}</strong></div>
                <div>STK: <strong className="font-mono font-bold text-blue-700">{storeSettings.bankAccountNo}</strong> - <span className="font-bold uppercase">{storeSettings.bankAccountName}</span></div>
                <div>Nội dung CK: <strong className="font-mono font-bold text-slate-900">{currentOrder.orderNumber}</strong></div>
              </div>
            </div>
          )}

          <div className="text-center text-[11px] text-slate-500 border-t border-dashed border-slate-300 pt-3">
            <p className="font-semibold">{receiptFooter}</p>
            <p className="text-[9px] mt-0.5">Hệ thống quản trị bán lẻ Sales Manager Pro</p>
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
            onClick={handleClose}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
