import React, { useState, useRef } from 'react';
import api from '../../services/api';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Info,
  Layers,
  ArrowRight,
  FileText,
} from 'lucide-react';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedProductRow {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  location: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStock: number;
  conversionUnit?: string;
  conversionFactor?: number;
  conversionSellingPrice?: number;
  isValid: boolean;
  errorMessages: string[];
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      const res = await api.get('/products/template-excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mau_nhap_hang_hoa_chuan.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Lỗi tải file mẫu');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  // Robust CSV Line Parser that handles quotes
  const parseCSVLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((c === ',' || c === ';') && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

        if (lines.length < 2) {
          alert('File không có dữ liệu hàng hóa (Cần ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu).');
          setIsLoading(false);
          return;
        }

        const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
        const rows: ParsedProductRow[] = [];

        // Dynamic Header Index Finder
        const findIndex = (keywords: string[]) => {
          return headers.findIndex((h) => keywords.some((k) => h.includes(k.toLowerCase())));
        };

        const nameIdx = findIndex(['tên sản phẩm', 'ten san pham', 'name', 'tên hàng']);
        const skuIdx = findIndex(['mã sku', 'sku', 'ma hang']);
        const barcodeIdx = findIndex(['barcode', 'mã vạch', 'ma vach']);
        const catIdx = findIndex(['nhóm hàng', 'danh mục', 'category', 'nhom hang']);
        const brandIdx = findIndex(['thương hiệu', 'brand', 'nhan hieu']);
        const locIdx = findIndex(['vị trí', 'location', 'kho']);
        const unitIdx = findIndex(['đơn vị cơ bản', 'đơn vị nhỏ nhất', 'đơn vị tính', 'unit', 'dvt']);
        const costIdx = findIndex(['giá nhập', 'giá vốn', 'cost']);
        const sellIdx = findIndex(['giá bán lẻ', 'giá bán', 'selling', 'gia ban']);
        const stockIdx = findIndex(['tồn kho', 'stock', 'so luong']);
        const minStockIdx = findIndex(['ngưỡng', 'cảnh báo', 'min stock']);
        const convUnitIdx = findIndex(['đơn vị quy đổi', 'đơn vị lớn', 'conversion unit']);
        const convFactorIdx = findIndex(['hệ số', 'conversion factor', 'he so']);
        const convPriceIdx = findIndex(['giá bán đơn vị lớn', 'giá quy đổi', 'conversion price']);

        for (let i = 1; i < lines.length; i++) {
          const parts = parseCSVLine(lines[i]);
          if (parts.length === 0 || parts.every((p) => p === '')) continue;

          const name = (nameIdx >= 0 ? parts[nameIdx] : parts[0]) || '';
          const sku = (skuIdx >= 0 ? parts[skuIdx] : parts[1]) || '';
          const barcode = (barcodeIdx >= 0 ? parts[barcodeIdx] : parts[2]) || '';
          const category = (catIdx >= 0 ? parts[catIdx] : parts[3]) || 'Đồ Dùng Gia Đình & Tạp Hóa';
          const brand = (brandIdx >= 0 ? parts[brandIdx] : parts[4]) || 'Khác';
          const location = (locIdx >= 0 ? parts[locIdx] : parts[5]) || 'Kho Tổng G05';
          const unit = (unitIdx >= 0 ? parts[unitIdx] : parts[6]) || 'Cái';

          const costPrice = Number((costIdx >= 0 ? parts[costIdx] : parts[7])?.replace(/[^0-9.-]/g, '')) || 0;
          const sellingPrice = Number((sellIdx >= 0 ? parts[sellIdx] : parts[8])?.replace(/[^0-9.-]/g, '')) || 0;
          const stockQuantity = Number((stockIdx >= 0 ? parts[stockIdx] : parts[9])?.replace(/[^0-9.-]/g, '')) || 0;
          const minStock = Number((minStockIdx >= 0 ? parts[minStockIdx] : parts[10])?.replace(/[^0-9.-]/g, '')) || 10;

          const conversionUnit = convUnitIdx >= 0 ? parts[convUnitIdx] : parts[11];
          const conversionFactor = Number((convFactorIdx >= 0 ? parts[convFactorIdx] : parts[12])?.replace(/[^0-9.-]/g, '')) || undefined;
          const conversionSellingPrice = Number((convPriceIdx >= 0 ? parts[convPriceIdx] : parts[13])?.replace(/[^0-9.-]/g, '')) || undefined;

          // Validation Rules
          const errorMessages: string[] = [];
          if (!name.trim()) {
            errorMessages.push('Thiếu Tên Sản Phẩm');
          }
          if (sellingPrice <= 0) {
            errorMessages.push('Giá bán lẻ phải > 0');
          }

          rows.push({
            id: `row-${i}`,
            name: name.trim(),
            sku: sku.trim(),
            barcode: barcode.trim(),
            category: category.trim(),
            brand: brand.trim(),
            location: location.trim(),
            unit: unit.trim() || 'Cái',
            costPrice,
            sellingPrice,
            stockQuantity,
            minStock,
            conversionUnit: conversionUnit?.trim() || undefined,
            conversionFactor: conversionFactor && conversionFactor > 1 ? conversionFactor : undefined,
            conversionSellingPrice: conversionSellingPrice && conversionSellingPrice > 0 ? conversionSellingPrice : undefined,
            isValid: errorMessages.length === 0,
            errorMessages,
          });
        }

        setParsedRows(rows);
      } catch (err: any) {
        alert('Lỗi khi đọc file CSV / Excel: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(selectedFile, 'UTF-8');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveRow = (id: string) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleConfirmImport = async () => {
    const validItems = parsedRows.filter((r) => r.isValid);
    if (validItems.length === 0) {
      alert('Không có dòng sản phẩm hợp lệ nào để nhập.');
      return;
    }

    setIsLoading(true);
    try {
      const res: any = await api.post('/products/import-excel', { items: validItems });
      alert(res.message || `Đã nhập thành công ${res.data?.count || validItems.length} sản phẩm vào hệ thống!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi nhập dữ liệu vào hệ thống');
    } finally {
      setIsLoading(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* 1. Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Nhập Sản Phẩm Hàng Hóa Từ File Excel / CSV
              </h2>
              <p className="text-xs text-slate-400">
                Tải file mẫu chuẩn, kiểm tra dữ liệu xem trước và nhập tự động hàng loạt vào CSDL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Action Bar: Download Template & Help */}
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-blue-300">Quy ước điền file mẫu Excel:</div>
                <div className="text-slate-400">
                  • Cột bắt buộc (<span className="text-red-400 font-bold">*</span>): <b className="text-slate-200">Tên sản phẩm</b>, <b className="text-slate-200">Đơn vị cơ bản</b>, <b className="text-slate-200">Giá bán lẻ</b>.
                </div>
                <div className="text-slate-400">
                  • Các cột khác (Mã SKU, Barcode, Vị trí kho, Nhóm hàng, Giá nhập, Tồn kho, Đơn vị quy đổi...): Hệ thống sẽ tự động điền giá trị mặc định nếu để trống.
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadTemplate}
              disabled={isDownloadingTemplate}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloadingTemplate ? 'Đang tạo file...' : 'Tải File Mẫu Chuẩn (.csv)'}</span>
            </button>
          </div>

          {/* Upload Area */}
          {parsedRows.length === 0 ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                dragOver
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .txt, .xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-blue-400 shadow-inner">
                <Upload className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Kéo & thả file Excel / CSV vào đây hoặc bấm để chọn file</div>
                <div className="text-xs text-slate-400 mt-1">Hỗ trợ định dạng .CSV, .TXT chuẩn UTF-8</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview Status & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{file?.name}</div>
                    <div className="text-[11px] text-slate-400">
                      Tổng số: <b className="text-white">{parsedRows.length}</b> dòng | Hợp lệ:{' '}
                      <b className="text-emerald-400">{validCount}</b> | Lỗi:{' '}
                      <b className="text-red-400">{invalidCount}</b>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setParsedRows([]);
                      setFile(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                  >
                    Chọn file khác
                  </button>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 max-h-80 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-[11px] text-slate-400 font-semibold uppercase sticky top-0 z-10 border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2.5">STT</th>
                      <th className="px-3 py-2.5">Trạng thái</th>
                      <th className="px-3 py-2.5">Tên sản phẩm</th>
                      <th className="px-3 py-2.5">Mã SKU / Barcode</th>
                      <th className="px-3 py-2.5">Nhóm hàng</th>
                      <th className="px-3 py-2.5">ĐVT</th>
                      <th className="px-3 py-2.5 text-right">Giá nhập</th>
                      <th className="px-3 py-2.5 text-right">Giá bán</th>
                      <th className="px-3 py-2.5 text-right">Tồn kho</th>
                      <th className="px-3 py-2.5">Quy đổi lớn</th>
                      <th className="px-2 py-2.5 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          !row.isValid ? 'bg-red-500/5' : ''
                        }`}
                      >
                        <td className="px-3 py-2.5 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="px-3 py-2.5">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Hợp lệ
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20"
                              title={row.errorMessages.join(', ')}
                            >
                              <AlertCircle className="w-3 h-3" /> {row.errorMessages[0]}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-white max-w-[200px] truncate" title={row.name}>
                          {row.name || <span className="text-red-400 italic">(Trống)</span>}
                        </td>
                        <td className="px-3 py-2.5 text-slate-400 font-mono text-[11px]">
                          <div>{row.sku || <span className="text-slate-600">(Tự tạo)</span>}</div>
                          <div className="text-slate-500">{row.barcode || <span className="text-slate-600">(Tự tạo)</span>}</div>
                        </td>
                        <td className="px-3 py-2.5 text-slate-400 max-w-[130px] truncate">{row.category}</td>
                        <td className="px-3 py-2.5 text-slate-300 font-bold">{row.unit}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-slate-400">{formatVND(row.costPrice)}</td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-400">
                          {formatVND(row.sellingPrice)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-white">{row.stockQuantity}</td>
                        <td className="px-3 py-2.5 text-slate-400 text-[11px]">
                          {row.conversionUnit ? (
                            <span>
                              {row.conversionUnit} (x{row.conversionFactor})
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <button
                            onClick={() => handleRemoveRow(row.id)}
                            className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded transition-all"
                            title="Xóa dòng này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 3. Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            Đóng
          </button>

          {parsedRows.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-400">
                Sẵn sàng nhập: <b className="text-emerald-400">{validCount}</b> sản phẩm hợp lệ
              </div>
              <button
                onClick={handleConfirmImport}
                disabled={isLoading || validCount === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isLoading ? 'Đang lưu CSDL...' : `Xác Nhận Nhập (${validCount} Sản Phẩm)`}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
