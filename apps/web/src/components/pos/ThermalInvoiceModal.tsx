import React, { useRef, useState } from 'react';
import { usePosStore } from '../../store/posStore';
import api from '../../services/api';
import { Printer, CheckCircle, X, Share2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

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
  const [isCapturing, setIsCapturing] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

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

  const generateReceiptCanvas = async () => {
    if (!receiptRef.current) return null;
    return await html2canvas(receiptRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    } as any);
  };

  const handleShareImage = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      const canvas = await generateReceiptCanvas();
      if (!canvas) {
        setIsCapturing(false);
        return;
      }

      canvas.toBlob(async (blob: Blob | null) => {
        if (!blob) {
          setIsCapturing(false);
          return;
        }

        const fileName = `HoaDon_${currentOrder.orderNumber || 'POS'}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `Hóa đơn ${currentOrder.orderNumber}`,
              text: `Hóa đơn bán hàng ${currentOrder.orderNumber}`,
              files: [file],
            });
            setIsCapturing(false);
            return;
          } catch (shareErr) {
            console.log('Share cancelled:', shareErr);
          }
        }

        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            alert('Đã sao chép ảnh hóa đơn vào bộ nhớ đệm!\nBạn có thể mở Zalo / Messenger và dán (Ctrl + V) để gửi cho khách.');
          } else {
            handleDownloadImage();
          }
        } catch (copyErr) {
          handleDownloadImage();
        }
        setIsCapturing(false);
      }, 'image/png');
    } catch (err) {
      console.error(err);
      alert('Không thể tạo ảnh hóa đơn, vui lòng thử lại!');
      setIsCapturing(false);
    }
  };

  const handleDownloadImage = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      const canvas = await generateReceiptCanvas();
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `HoaDon_${currentOrder.orderNumber || 'POS'}.png`;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCapturing(false);
    }
  };

  const storeName = storeSettings?.storeName || 'CỬA HÀNG RETAIL PRO';
  const storeAddress = storeSettings?.address || '123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM';
  const storePhone = storeSettings?.phone || '1900 6868';
  const storeTax = storeSettings?.taxCode;
  const receiptFooter = storeSettings?.receiptFooter || 'Cảm ơn Quý khách & Hẹn gặp lại!';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg flex flex-col max-h-[92vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header (Fixed Top) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <h3 className="font-bold text-base sm:text-lg text-white">Thanh toán Thành công!</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body (flex-1 overflow-y-auto) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex justify-center bg-slate-950/50">
          <div ref={receiptRef} className="p-4 sm:p-6 bg-white text-slate-900 font-mono text-sm space-y-4 rounded-2xl shadow-lg w-full max-w-[360px] my-auto print:p-0 print:bg-white print:text-black print:max-w-none print:shadow-none">
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
              <div className="col-span-4">Tên sản phẩm</div>
              <div className="col-span-2 text-center">SL / ĐV</div>
              <div className="col-span-3 text-right">Đơn giá</div>
              <div className="col-span-3 text-right">Thành tiền</div>
            </div>
            {currentOrder.items.map((item: any, idx: number) => {
              const unitPrice = item.unitPrice !== undefined ? item.unitPrice : (item.selectedPrice !== undefined ? item.selectedPrice : 0);
              return (
                <div key={idx} className="grid grid-cols-12 py-0.5 items-center">
                  <div className="col-span-4 font-sans font-medium line-clamp-1">
                    {item.name || item.productId}
                  </div>
                  <div className="col-span-2 text-center font-bold">
                    {item.quantity} {item.selectedUnit || ''}
                  </div>
                  <div className="col-span-3 text-right text-slate-600">
                    {formatVND(unitPrice)}
                  </div>
                  <div className="col-span-3 text-right font-semibold">
                    {formatVND(unitPrice * item.quantity)}
                  </div>
                </div>
              );
            })}
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
        </div>

        {/* Sticky Modal Actions Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 flex items-center gap-2 bg-slate-900 shrink-0 z-10 shadow-lg">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all text-xs sm:text-sm active:scale-95"
          >
            <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>In Hóa Đơn (F12)</span>
          </button>

          {/* Icon-Only Share Button (Zalo / Messenger / Mobile Share Sheet / PC Clipboard) */}
          <button
            onClick={handleShareImage}
            disabled={isCapturing}
            className="p-2.5 sm:p-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-bold rounded-xl transition-all border border-slate-700 disabled:opacity-50 shrink-0 active:scale-95"
            title="Chia sẻ ảnh Hóa đơn qua Zalo / Messenger / Mạng xã hội"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Icon-Only Download Image Button */}
          <button
            onClick={handleDownloadImage}
            disabled={isCapturing}
            className="p-2.5 sm:p-3 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-bold rounded-xl transition-all border border-slate-700 disabled:opacity-50 shrink-0 active:scale-95"
            title="Tải ảnh Hóa đơn (.png)"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={handleClose}
            className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs sm:text-sm shrink-0 active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
