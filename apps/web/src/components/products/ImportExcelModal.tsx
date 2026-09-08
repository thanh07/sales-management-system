import React, { useState, useRef, useEffect } from 'react';
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
  ArrowLeft,
  FileText,
  Settings2,
  Building2,
  RefreshCw,
  SlidersHorizontal,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { useBranchStore } from '../../store/branchStore';

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

export const downloadProductExcelTemplate = () => {
  const headers = [
    'Tên sản phẩm (*)',
    'Mã SKU',
    'Mã Barcode / Mã vạch',
    'Nhóm hàng / Danh mục',
    'Thương hiệu',
    'Vị trí lưu kho',
    'Đơn vị cơ bản (*)',
    'Giá nhập (Giá vốn)',
    'Giá bán lẻ (*)',
    'Tồn kho ban đầu',
    'Ngưỡng báo sắp hết',
    'Đơn vị quy đổi lớn',
    'Hệ số quy đổi',
    'Giá bán đơn vị lớn',
  ];

  const sampleRows = [
    [
      '"Nước Tăng Lực Red Bull 250ml"',
      'TAP-REDB-001',
      '893800100001',
      '"Nước Giải Khát & Đồ Uống"',
      '"Red Bull"',
      '"Kệ A1 - Dãy 1"',
      'Lon',
      '11000',
      '15800',
      '120',
      '12',
      'Thùng',
      '24',
      '360000',
    ],
    [
      '"Bia Heineken Silver Lon 330ml"',
      'TAP-HEIN-002',
      '893800100002',
      '"Nước Giải Khát & Đồ Uống"',
      '"Heineken"',
      '"Kệ A1 - Dãy 2"',
      'Lon',
      '16500',
      '20600',
      '96',
      '24',
      'Thùng',
      '24',
      '480000',
    ],
    [
      '"Mì Tôm Chua Cay Hảo Hảo 75g"',
      'TAP-ACEC-004',
      '893800100004',
      '"Mì, Phở & Thực Phẩm Khô"',
      '"Acecook"',
      '"Kệ C1 - Tầng 2"',
      'Gói',
      '3500',
      '4500',
      '300',
      '30',
      'Thùng',
      '30',
      '130000',
    ],
  ];

  const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mau_nhap_hang_hoa_chuan.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { branches, selectedBranchId } = useBranchStore();

  const [step, setStep] = useState<'UPLOAD' | 'CONFIG' | 'PREVIEW'>('UPLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // KiotViet-style Import Strategy Configuration States
  const [duplicateMode, setDuplicateMode] = useState<'UPDATE_EXISTING' | 'SKIP_EXISTING'>('UPDATE_EXISTING');
  const [stockMode, setStockMode] = useState<'OVERWRITE_STOCK' | 'ADDITIVE_STOCK' | 'KEEP_STOCK'>('OVERWRITE_STOCK');
  const [targetBranchId, setTargetBranchId] = useState<string>(selectedBranchId || 'branch-01');

  useEffect(() => {
    if (selectedBranchId) {
      setTargetBranchId(selectedBranchId);
    }
  }, [selectedBranchId]);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    downloadProductExcelTemplate();
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

        const nameIdx = findIndex(['tên sản phẩm', 'ten san pham', 'name', 'tên hàng', 'ten hang', 'tên sp', 'ten sp', 'sản phẩm', 'san pham', 'hàng hóa', 'hang hoa']);
        const skuIdx = findIndex(['mã sku', 'sku', 'mã hàng', 'ma hang', 'mã sp', 'ma sp', 'mã sản phẩm']);
        const barcodeIdx = findIndex(['barcode', 'mã vạch', 'ma vach', 'mã barcode']);
        const catIdx = findIndex(['nhóm hàng', 'nhom hang', 'danh mục', 'danh muc', 'category', 'loại hàng', 'loai hang']);
        const brandIdx = findIndex(['thương hiệu', 'thuong hieu', 'brand', 'nhãn hiệu', 'nhan hieu', 'hãng', 'hang']);
        const locIdx = findIndex(['vị trí', 'vi tri', 'location', 'kho']);
        const unitIdx = findIndex(['đơn vị cơ bản', 'đơn vị tính', 'don vi tinh', 'đvt', 'dvt', 'unit', 'đơn vị', 'don vi']);
        const costIdx = findIndex(['giá nhập', 'gia nhap', 'giá vốn', 'gia von', 'cost', 'giá mua', 'gia mua']);
        const sellIdx = findIndex(['giá bán lẻ', 'gia ban le', 'giá bán', 'gia ban', 'selling', 'giá lẻ', 'gia le', 'lẻ', 'le']);
        const wholesaleIdx = findIndex(['giá sỉ', 'gia si', 'giá buôn', 'gia buon', 'sỉ', 'si']);
        const stockIdx = findIndex(['tồn kho', 'ton kho', 'stock', 'số lượng', 'so luong', 'tồn', 'ton']);
        const minStockIdx = findIndex(['ngưỡng', 'nguong', 'cảnh báo', 'canh bao', 'min stock']);
        const convUnitIdx = findIndex(['đơn vị quy đổi', 'don vi quy doi', 'đơn vị lớn', 'don vi lon', 'conversion unit']);
        const convFactorIdx = findIndex(['hệ số', 'he so', 'conversion factor']);
        const convPriceIdx = findIndex(['giá chục', 'gia chuc', 'giá thùng', 'gia thung', 'giá bán đơn vị lớn', 'giá quy đổi', 'gia quy doi', 'conversion price']);

        const cleanNumber = (val?: string | number, defaultVal = 0): number => {
          if (val === undefined || val === null || val === '') return defaultVal;
          let num = 0;
          if (typeof val === 'number') {
            num = isNaN(val) ? defaultVal : val;
          } else {
            let str = String(val).trim().replace(/[^\d.,-]/g, '');
            if (!str) return defaultVal;
            if (/^\d{1,3}(\.\d{3})+$/.test(str)) {
              str = str.replace(/\./g, '');
            } else if (/^\d{1,3}(,\d{3})+$/.test(str)) {
              str = str.replace(/,/g, '');
            } else if (str.includes(',') && !str.includes('.')) {
              str = str.replace(',', '.');
            }
            num = Number(str);
            if (isNaN(num)) return defaultVal;
          }
          return num;
        };

        for (let i = 1; i < lines.length; i++) {
          const parts = parseCSVLine(lines[i]);
          if (parts.length === 0 || parts.every((p) => p === '')) continue;

          const name = (nameIdx >= 0 ? parts[nameIdx] : parts[0]) || '';
          const sku = (skuIdx >= 0 ? parts[skuIdx] : '') || '';
          const rawBarcode = (barcodeIdx >= 0 ? parts[barcodeIdx] : '') || '';
          const barcode = rawBarcode.trim().replace(/^\\t/, '').replace(/\s+/g, '');

          const category = (catIdx >= 0 ? parts[catIdx] : '') || 'Đồ Dùng Gia Đình & Tạp Hóa';
          const brand = (brandIdx >= 0 ? parts[brandIdx] : '') || 'Khác';
          const location = (locIdx >= 0 ? parts[locIdx] : '') || 'Kho Tổng G05';
          const unit = (unitIdx >= 0 ? parts[unitIdx] : '') || 'Cái';

          const costPrice = cleanNumber(costIdx >= 0 ? parts[costIdx] : undefined, 0);
          const sellingPrice = cleanNumber(sellIdx >= 0 ? parts[sellIdx] : undefined, 0);
          const stockQuantity = cleanNumber(stockIdx >= 0 ? parts[stockIdx] : undefined, 100);
          const minStock = cleanNumber(minStockIdx >= 0 ? parts[minStockIdx] : undefined, 10);

          let conversionUnit = convUnitIdx >= 0 ? parts[convUnitIdx] : undefined;
          let conversionFactor = cleanNumber(convFactorIdx >= 0 ? parts[convFactorIdx] : undefined, 0);
          let conversionSellingPrice = cleanNumber(convPriceIdx >= 0 ? parts[convPriceIdx] : undefined, 0);

          if (convPriceIdx >= 0 && conversionSellingPrice > 0 && !conversionUnit) {
            const rawHeader = headers[convPriceIdx] || '';
            if (rawHeader.includes('chục') || rawHeader.includes('chuc')) {
              conversionUnit = 'Chục';
              conversionFactor = 10;
            }
          }

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
            barcode,
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
        setStep('CONFIG'); // Move to Step 2: KiotViet Import Strategy Config
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
      const options = {
        duplicateMode,
        stockMode,
        targetBranchId,
      };

      const res: any = await api.post('/products/import-excel', { items: validItems, options });
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

  const activeBranchObj = branches.find((b) => b.id === targetBranchId) || branches[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* 1. Modal Header & Step Navigation Indicator */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Nhập Sản Phẩm Hàng Hóa Từ File Excel / CSV
              </h2>
              {/* KiotViet 3-Step Indicator Header */}
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className={`flex items-center gap-1 font-semibold ${step === 'UPLOAD' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
                  <span className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500/40 text-[10px] flex items-center justify-center">1</span>
                  <span>Chọn File</span>
                </span>
                <ArrowRight className="w-3 h-3 text-slate-600" />

                <span className={`flex items-center gap-1 font-semibold ${step === 'CONFIG' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
                  <span className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500/40 text-[10px] flex items-center justify-center">2</span>
                  <span>Phương Thức Nhập Khẩu</span>
                </span>
                <ArrowRight className="w-3 h-3 text-slate-600" />

                <span className={`flex items-center gap-1 font-semibold ${step === 'PREVIEW' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
                  <span className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500/40 text-[10px] flex items-center justify-center">3</span>
                  <span>Xem Trước & Nhập Dữ Liệu</span>
                </span>
              </div>
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
          {/* STEP 1: UPLOAD FILE AREA */}
          {step === 'UPLOAD' && (
            <div className="space-y-4">
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
                      • Các cột khác (Mã SKU, Barcode, Vị trí kho, Nhóm hàng, Giá nhập, Tồn kho...): Hệ thống sẽ tự động bổ sung nếu để trống.
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 shrink-0"
                  title="Tải file mẫu Excel chuẩn"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải File Mẫu Chuẩn (.csv)</span>
                </button>
              </div>

              {/* Upload Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
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
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-blue-400 shadow-inner">
                  <Upload className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <div className="text-base font-bold text-white">Kéo & thả file Excel / CSV vào đây hoặc bấm để chọn file</div>
                  <div className="text-xs text-slate-400 mt-1">Hỗ trợ định dạng .CSV, .TXT chuẩn UTF-8</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: KIOTVIET-STYLE IMPORT STRATEGY CONFIGURATION */}
          {step === 'CONFIG' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">{file?.name}</div>
                    <div className="text-[11px] text-slate-400">
                      Tổng số: <b className="text-white">{parsedRows.length}</b> dòng | Hợp lệ:{' '}
                      <b className="text-emerald-400">{validCount}</b> | Lỗi: <b className="text-red-400">{invalidCount}</b>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setParsedRows([]);
                    setFile(null);
                    setStep('UPLOAD');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                >
                  Chọn file khác
                </button>
              </div>

              {/* Configuration Section */}
              <div className="space-y-5 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-sm">
                  <Settings2 className="w-5 h-5 text-blue-400" />
                  <span>Chọn Phương Thức Nhập Khẩu Dữ Liệu</span>
                </div>

                {/* 1. Handling Existing Products */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider">
                    1. Xử lý khi sản phẩm đã tồn tại trong CSDL (Khớp Mã SKU / Barcode / Tên):
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Option A: Update Existing */}
                    <div
                      onClick={() => setDuplicateMode('UPDATE_EXISTING')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        duplicateMode === 'UPDATE_EXISTING'
                          ? 'bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-600/20'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="duplicateMode"
                        checked={duplicateMode === 'UPDATE_EXISTING'}
                        onChange={() => setDuplicateMode('UPDATE_EXISTING')}
                        className="mt-1 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-2">
                          <span>Cập nhật thông tin hàng hóa đã có</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Mặc định</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Tự động cập nhật Tên, Nhóm hàng, Thương hiệu, Giá bán lẻ, Giá vốn, Giá sỉ, Đơn vị quy đổi mới nhất từ file Excel vào các sản phẩm đã có.
                        </p>
                      </div>
                    </div>

                    {/* Option B: Skip Existing */}
                    <div
                      onClick={() => setDuplicateMode('SKIP_EXISTING')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        duplicateMode === 'SKIP_EXISTING'
                          ? 'bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-600/20'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="duplicateMode"
                        checked={duplicateMode === 'SKIP_EXISTING'}
                        onChange={() => setDuplicateMode('SKIP_EXISTING')}
                        className="mt-1 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-white text-xs">Bỏ qua hàng hóa đã tồn tại</div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Bỏ qua không chỉnh sửa dữ liệu hàng hóa cũ trong CSDL, chỉ lọc ra và thêm mới các sản phẩm chưa từng xuất hiện.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Handling Stock */}
                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider">
                    2. Xử lý số lượng Tồn Kho Chi Nhánh:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Overwrite */}
                    <div
                      onClick={() => setStockMode('OVERWRITE_STOCK')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        stockMode === 'OVERWRITE_STOCK'
                          ? 'bg-blue-600/15 border-blue-500 shadow-md'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="stockMode"
                        checked={stockMode === 'OVERWRITE_STOCK'}
                        onChange={() => setStockMode('OVERWRITE_STOCK')}
                        className="mt-1 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-white text-xs">Ghi đè tồn kho</div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Tồn kho chi nhánh = Số trong Excel</p>
                      </div>
                    </div>

                    {/* Additive */}
                    <div
                      onClick={() => setStockMode('ADDITIVE_STOCK')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        stockMode === 'ADDITIVE_STOCK'
                          ? 'bg-blue-600/15 border-blue-500 shadow-md'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="stockMode"
                        checked={stockMode === 'ADDITIVE_STOCK'}
                        onChange={() => setStockMode('ADDITIVE_STOCK')}
                        className="mt-1 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-white text-xs">Cộng dồn tồn kho</div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Tồn kho mới = Tồn cũ + Số trong Excel</p>
                      </div>
                    </div>

                    {/* Keep */}
                    <div
                      onClick={() => setStockMode('KEEP_STOCK')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        stockMode === 'KEEP_STOCK'
                          ? 'bg-blue-600/15 border-blue-500 shadow-md'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="stockMode"
                        checked={stockMode === 'KEEP_STOCK'}
                        onChange={() => setStockMode('KEEP_STOCK')}
                        className="mt-1 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-white text-xs">Không đổi tồn kho</div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Giữ nguyên số tồn kho hiện tại</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Target Branch */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider">
                    3. Chi nhánh nhận cập nhật tồn kho & trạng thái bán:
                  </label>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <select
                      value={targetBranchId}
                      onChange={(e) => setTargetBranchId(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-blue-500"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW DATA TABLE */}
          {step === 'PREVIEW' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-white">{file?.name}</div>
                    <div className="text-[11px] text-slate-400">
                      Tổng số: <b className="text-white">{parsedRows.length}</b> dòng | Hợp lệ:{' '}
                      <b className="text-emerald-400">{validCount}</b> | Lỗi:{' '}
                      <b className="text-red-400">{invalidCount}</b>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                    Chế độ: <b>{duplicateMode === 'UPDATE_EXISTING' ? 'Cập nhật hàng cũ' : 'Bỏ qua hàng cũ'}</b>
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                    Tồn kho: <b>{stockMode === 'OVERWRITE_STOCK' ? 'Ghi đè' : stockMode === 'ADDITIVE_STOCK' ? 'Cộng dồn' : 'Giữ nguyên'}</b> ({activeBranchObj?.name})
                  </span>
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

        {/* 3. Modal Footer & Dynamic Buttons for 3 Steps */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div>
            {step === 'CONFIG' && (
              <button
                onClick={() => setStep('UPLOAD')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại chọn file</span>
              </button>
            )}

            {step === 'PREVIEW' && (
              <button
                onClick={() => setStep('CONFIG')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Đổi phương thức nhập</span>
              </button>
            )}

            {step === 'UPLOAD' && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Đóng
              </button>
            )}
          </div>

          <div>
            {step === 'CONFIG' && parsedRows.length > 0 && (
              <button
                onClick={() => setStep('PREVIEW')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
              >
                <span>Tiếp tục xem trước dữ liệu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 'PREVIEW' && parsedRows.length > 0 && (
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
    </div>
  );
};
