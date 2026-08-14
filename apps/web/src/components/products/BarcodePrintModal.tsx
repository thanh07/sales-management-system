import React, { useState } from 'react';
import { X, Printer, Barcode, Check, Copy, Sliders, ShieldCheck } from 'lucide-react';

interface BarcodePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: any[];
  allProducts: any[];
  selectedBranchName?: string;
}

export const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  allProducts,
  selectedBranchName = 'Chi nhánh Chợ Bến Thành',
}) => {
  const [printPaperSize, setPrintPaperSize] = useState<'3_TEM_105x22' | '2_TEM_72x22' | '1_TEM_50x30'>('3_TEM_105x22');
  const [printCounts, setPrintCounts] = useState<Record<string, number>>({});
  const [includePrice, setIncludePrice] = useState(true);
  const [includeStoreName, setIncludeStoreName] = useState(true);
  const [customStoreName, setCustomStoreName] = useState('SALES MANAGER');

  if (!isOpen) return null;

  // If no specific product is selected, use first 10 products from allProducts as default
  const targetProducts = selectedProducts.length > 0 ? selectedProducts : allProducts.slice(0, 10);

  const getPrintCount = (pId: string) => printCounts[pId] ?? 2;

  const handleSetCount = (pId: string, count: number) => {
    setPrintCounts((prev) => ({ ...prev, [pId]: Math.max(1, count) }));
  };

  const handlePrint = () => {
    window.print();
  };

  const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(n || 0) + ' đ';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white">In Tem Mã Vạch & Bảng Giá (Barcode Printing)</h2>
              <p className="text-[11px] text-slate-400">Xem trước và xuất bản in nhiệt cho {targetProducts.length} sản phẩm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Khổ giấy in tem mã vạch</label>
            <select
              value={printPaperSize}
              onChange={(e: any) => setPrintPaperSize(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs"
            >
              <option value="3_TEM_105x22">Cuộn 3 Tem (105 x 22 mm) - Siêu thị / Tạp hóa</option>
              <option value="2_TEM_72x22">Cuộn 2 Tem (72 x 22 mm) - Chuẩn Xprinter</option>
              <option value="1_TEM_50x30">Tem Đơn (50 x 30 mm) - Tem kệ hàng / Trà sữa</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tên cửa hàng in trên đầu tem</label>
            <input
              type="text"
              value={customStoreName}
              onChange={(e) => setCustomStoreName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-blue-400"
            />
          </div>

          <div className="flex flex-col justify-end space-y-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={includePrice}
                onChange={(e) => setIncludePrice(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
              />
              <span className="font-semibold">In kèm Giá bán lẻ</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={includeStoreName}
                onChange={(e) => setIncludeStoreName(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
              />
              <span className="font-semibold">In kèm Tên cửa hàng</span>
            </label>
          </div>
        </div>

        {/* Modal Body: Products Table & Live Thermal Label Preview */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Danh sách sản phẩm in tem ({targetProducts.length} mặt hàng)</span>
            <span className="text-blue-400 text-[11px] font-normal">
              Tổng số tem sẽ in: {targetProducts.reduce((sum, p) => sum + getPrintCount(p.id), 0)} tem
            </span>
          </div>

          {/* Table of selected products */}
          <div className="rounded-xl border border-slate-800 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Sản phẩm</th>
                  <th className="p-2.5">Mã Barcode / SKU</th>
                  <th className="p-2.5">Đơn vị</th>
                  <th className="p-2.5">Giá bán</th>
                  <th className="p-2.5 text-center w-28">Số lượng tem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                {targetProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold text-white max-w-[200px] truncate">{p.name}</td>
                    <td className="p-2.5 font-mono text-blue-400 font-bold">{p.barcode || p.sku}</td>
                    <td className="p-2.5 text-slate-300">{p.unit}</td>
                    <td className="p-2.5 text-emerald-400 font-bold">{formatVND(p.sellingPrice)}</td>
                    <td className="p-2.5 text-center">
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={getPrintCount(p.id)}
                        onChange={(e) => handleSetCount(p.id, Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-center font-bold text-white text-xs font-mono"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Live Barcode Label Preview */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Xem trước mẫu tem in nhiệt thực tế (Khổ {printPaperSize}):</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {targetProducts.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="bg-white text-black p-2.5 rounded-lg border border-slate-300 shadow-md flex flex-col items-center justify-between text-center select-none"
                  style={{ minHeight: '110px' }}
                >
                  {includeStoreName && (
                    <div className="text-[10px] font-black tracking-wider uppercase border-b border-black/20 w-full pb-0.5 mb-1 text-slate-800 truncate">
                      {customStoreName}
                    </div>
                  )}

                  <div className="font-bold text-[11px] leading-tight line-clamp-2 px-1 text-black">
                    {p.name}
                  </div>

                  {/* Simulated SVG Barcode Code128 */}
                  <div className="my-1 flex flex-col items-center w-full">
                    <div className="flex items-center justify-center gap-[1.5px] h-7 w-full overflow-hidden px-2">
                      {Array.from({ length: 32 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="bg-black h-full"
                          style={{
                            width: (idx % 3 === 0 ? '2.5px' : idx % 2 === 0 ? '1.5px' : '1px'),
                            opacity: (idx % 7 === 0 ? 0.3 : 1),
                          }}
                        />
                      ))}
                    </div>
                    <div className="font-mono text-[9px] tracking-widest font-bold mt-0.5 text-black">
                      {p.barcode || p.sku}
                    </div>
                  </div>

                  {includePrice && (
                    <div className="text-xs font-black text-black pt-0.5 border-t border-black/20 w-full">
                      Giá: {formatVND(p.sellingPrice)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Tương thích tất cả các dòng máy in mã vạch (Xprinter, Bixolon, Godex, Zebra).
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
            >
              Đóng
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>In Ngay ({targetProducts.reduce((sum, p) => sum + getPrintCount(p.id), 0)} Tem)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
