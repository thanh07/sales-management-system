import React, { useState } from 'react';
import { X, Printer, Barcode, Check, Copy, Sliders, ShieldCheck, Zap, Package, Building2 } from 'lucide-react';
import { getSmartProductIcon } from '../../utils/productIconHelper';

interface BarcodePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: any[];
  allProducts: any[];
  selectedBranchName?: string;
  selectedBranchId?: string;
  branches?: any[];
}

export const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  allProducts,
  selectedBranchName = 'Chi nhánh Chợ Bến Thành (CN-01)',
  selectedBranchId = 'branch-01',
  branches = [],
}) => {
  const [printPaperSize, setPrintPaperSize] = useState<'3_TEM_105x22' | '2_TEM_72x22' | '1_TEM_50x30'>('3_TEM_105x22');
  const [printCounts, setPrintCounts] = useState<Record<string, number>>({});
  const [includePrice, setIncludePrice] = useState(true);
  const [includeStoreName, setIncludeStoreName] = useState(true);
  const [customStoreName, setCustomStoreName] = useState('SALES MANAGER PRO');
  const [activeBranchId, setActiveBranchId] = useState(selectedBranchId);

  if (!isOpen) return null;

  // If no specific product is selected, use all products
  const targetProducts = selectedProducts.length > 0 ? selectedProducts : allProducts;

  const getPrintCount = (pId: string) => printCounts[pId] ?? 2;

  const handleSetCount = (pId: string, count: number) => {
    setPrintCounts((prev) => ({ ...prev, [pId]: Math.max(0, count) }));
  };

  const handleBatchSetCount = (count: number) => {
    const updated: Record<string, number> = {};
    targetProducts.forEach((p) => {
      updated[p.id] = count;
    });
    setPrintCounts(updated);
  };

  const handleSetCountByStock = () => {
    const updated: Record<string, number> = {};
    targetProducts.forEach((p) => {
      const stock = p.branchStocks?.[activeBranchId] ?? p.stockQuantity ?? 1;
      updated[p.id] = Math.max(1, stock);
    });
    setPrintCounts(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(n || 0) + ' đ';

  const totalLabels = targetProducts.reduce((sum, p) => sum + getPrintCount(p.id), 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white">In Tem Mã Vạch & Bảng Giá Kệ Hàng (Barcode Studio)</h2>
              <p className="text-[11px] text-slate-400">Xuất bản in decal nhiệt cho {targetProducts.length} mặt hàng</p>
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
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Khổ giấy in decal nhiệt</label>
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

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Chi nhánh tính tồn kho tem</label>
            <select
              value={activeBranchId}
              onChange={(e) => setActiveBranchId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs"
            >
              {branches.length > 0 ? (
                branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    [{b.code}] {b.name}
                  </option>
                ))
              ) : (
                <option value="branch-01">{selectedBranchName}</option>
              )}
            </select>
          </div>

          <div className="flex flex-col justify-center space-y-1">
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

        {/* Quick Batch Quantity Setters Toolbar */}
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Gán nhanh số lượng:</span>
            </span>
            <button
              onClick={() => handleBatchSetCount(1)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
            >
              1 tem / SP
            </button>
            <button
              onClick={() => handleBatchSetCount(2)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 font-mono text-[11px] font-bold"
            >
              2 tem / SP
            </button>
            <button
              onClick={() => handleBatchSetCount(5)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
            >
              5 tem / SP
            </button>
            <button
              onClick={handleSetCountByStock}
              className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
            >
              <Package className="w-3 h-3" />
              <span>Theo Tồn Kho Thực Tế</span>
            </button>
          </div>

          <div className="font-mono text-xs">
            Tổng cộng: <strong className="text-amber-400 text-sm">{totalLabels}</strong> tem in
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Table of selected products */}
          <div className="rounded-xl border border-slate-800 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Sản phẩm</th>
                  <th className="p-2.5">Mã Barcode / SKU</th>
                  <th className="p-2.5">Đơn vị</th>
                  <th className="p-2.5">Giá bán</th>
                  <th className="p-2.5 text-center">Tồn chi nhánh</th>
                  <th className="p-2.5 text-center w-28">Số lượng tem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                {targetProducts.map((p) => {
                  const stock = p.branchStocks?.[activeBranchId] ?? p.stockQuantity ?? 0;
                  const theme = getSmartProductIcon(p.name, p.category);

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-white max-w-[220px] truncate flex items-center gap-2">
                        <span className="text-base">{theme.icon}</span>
                        <span className="truncate">{p.name}</span>
                      </td>
                      <td className="p-2.5 font-mono text-blue-400 font-bold">{p.barcode || p.sku}</td>
                      <td className="p-2.5 text-slate-300">{p.unit}</td>
                      <td className="p-2.5 text-emerald-400 font-bold font-mono">{formatVND(p.sellingPrice)}</td>
                      <td className="p-2.5 text-center font-mono text-slate-400">{stock}</td>
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max="999"
                          value={getPrintCount(p.id)}
                          onChange={(e) => handleSetCount(p.id, Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-center font-bold text-white text-xs font-mono"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Live Barcode Label Preview Studio */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Xem trước mẫu tem in nhiệt thực tế (Khổ {printPaperSize}):</span>
              </div>
              <span className="text-[11px] text-slate-400">Hiển thị mẫu 6 sản phẩm đầu tiên</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {targetProducts.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="bg-white text-black p-2 rounded-lg border border-slate-300 shadow-md flex flex-col items-center justify-between text-center select-none"
                  style={{ minHeight: '115px' }}
                >
                  {includeStoreName && (
                    <div className="text-[9px] font-black tracking-wider uppercase border-b border-black/20 w-full pb-0.5 mb-1 text-slate-800 truncate">
                      {customStoreName}
                    </div>
                  )}

                  <div className="font-bold text-[11px] leading-tight line-clamp-2 px-1 text-black">
                    {p.name}
                  </div>

                  {/* High Definition SVG Code128 Simulation */}
                  <div className="my-1 flex flex-col items-center w-full">
                    <div className="flex items-center justify-center gap-[1.2px] h-7 w-full overflow-hidden px-1">
                      {Array.from({ length: 38 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="bg-black h-full"
                          style={{
                            width: (idx % 4 === 0 ? '2.5px' : idx % 3 === 0 ? '1.8px' : idx % 2 === 0 ? '1.2px' : '0.8px'),
                            opacity: (idx % 9 === 0 ? 0.35 : 1),
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
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            Tương thích các dòng máy in nhiệt Xprinter, Bixolon, Godex, Zebra, HPRT.
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
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Ngay ({totalLabels} Tem)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
