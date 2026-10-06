import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import {
  Database,
  Cloud,
  CheckCircle2,
  Clock,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  HardDrive,
  Sparkles,
  FileJson,
  Layers,
  ArrowUpRight,
  Server
} from 'lucide-react';

export interface BackupMeta {
  filename: string;
  version: string;
  exportedAt: string;
  triggerType: 'MANUAL' | 'SCHEDULED' | 'IMPORT';
  sizeBytes: number;
  sizeFormatted: string;
  summary: {
    totalProducts: number;
    totalBranches: number;
    totalCustomers: number;
    totalPriceLists: number;
    storeName: string;
  };
}

export interface BackupConfig {
  autoBackupEnabled: boolean;
  intervalHours: number;
  retentionDays: number;
  cloudSyncEnabled: boolean;
  cloudSyncProvider: 'GOOGLE_DRIVE' | 'TELEGRAM_BOT' | 'SIMULATED';
  cloudSyncDestination?: string;
  lastBackupAt?: string;
}

export const BackupSettingsTab: React.FC = () => {
  const [backups, setBackups] = useState<BackupMeta[]>([]);
  const [config, setConfig] = useState<BackupConfig>({
    autoBackupEnabled: true,
    intervalHours: 24,
    retentionDays: 30,
    cloudSyncEnabled: true,
    cloudSyncProvider: 'TELEGRAM_BOT',
    cloudSyncDestination: 'Telegram Bot (Báo cáo tự động)',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Restore Modal State
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<BackupMeta | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ type, message });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchBackupData = async () => {
    try {
      setIsLoading(true);
      const [configRes, listRes]: any[] = await Promise.all([
        api.get('/backups/config'),
        api.get('/backups/list'),
      ]);
      if (configRes.data) setConfig(configRes.data);
      if (listRes.data) setBackups(listRes.data || []);
    } catch (err: any) {
      console.error('Fetch backup data error:', err);
      showToast('Không thể tải danh sách bản sao lưu: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupData();
  }, []);

  const handleUpdateConfig = async (newConfig: Partial<BackupConfig>) => {
    try {
      const updatedConfig = { ...config, ...newConfig };
      setConfig(updatedConfig);
      await api.put('/backups/config', updatedConfig);
      showToast('Đã lưu cấu hình tự động sao lưu!');
    } catch (err: any) {
      showToast('Lỗi cập nhật cấu hình: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsCreating(true);
      const res: any = await api.post('/backups/create');
      showToast(res.message || 'Đã tạo bản sao lưu mới thành công!');
      fetchBackupData();
    } catch (err: any) {
      showToast('Lỗi khi tạo bản sao lưu: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownloadBackup = async (filename: string) => {
    try {
      const response = await api.get(`/backups/download/${filename}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast(`Đã tải về bản sao lưu ${filename}`);
    } catch (err: any) {
      showToast('Lỗi tải file sao lưu: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleConfirmRestore = async () => {
    if (!selectedBackupForRestore) return;
    try {
      setIsRestoring(true);
      const res: any = await api.post(`/backups/restore/${selectedBackupForRestore.filename}`);
      showToast(res.message || 'Đã khôi phục toàn bộ dữ liệu thành công!');
      setSelectedBackupForRestore(null);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      showToast('Lỗi khi khôi phục dữ liệu: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bản sao lưu "${filename}" không?`)) return;
    try {
      const res: any = await api.delete(`/backups/${filename}`);
      showToast(res.message || 'Đã xóa bản sao lưu');
      setBackups((prev) => prev.filter((b) => b.filename !== filename));
    } catch (err: any) {
      showToast('Lỗi khi xóa bản sao lưu: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!confirm(`XÁC NHẬN KHÔI PHỤC DỮ LIỆU TỪ FILE "${file.name}"?\n\nDữ liệu sản phẩm, danh mục và cấu hình hiện tại sẽ được cập nhật lại theo file này.`)) {
          return;
        }
        setIsRestoring(true);
        const res: any = await api.post('/backups/upload-restore', json);
        showToast(res.message || 'Khôi phục thành công từ file!');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err: any) {
        showToast('File JSON không hợp lệ hoặc lỗi khôi phục: ' + (err.response?.data?.message || err.message), 'error');
      } finally {
        setIsRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const latestBackup = backups[0];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 animate-in fade-in duration-200 ${
            toastMsg.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/20 border-red-500/40 text-red-300'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{toastMsg.message}</span>
        </div>
      )}

      {/* Top 3 Control Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Auto Backup Setting */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Sao Lưu Tự Động</h4>
                <p className="text-xs text-slate-400">Tự động ngầm theo lịch</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoBackupEnabled}
                onChange={(e) => handleUpdateConfig({ autoBackupEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Tần suất sao lưu:</span>
              <select
                value={config.intervalHours}
                onChange={(e) => handleUpdateConfig({ intervalHours: Number(e.target.value) })}
                className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 text-blue-300 font-bold text-xs"
              >
                <option value={24}>24 Giờ / Lần (00:00 hàng đêm)</option>
                <option value={12}>12 Giờ / Lần</option>
                <option value={6}>6 Giờ / Lần</option>
              </select>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Thời gian lưu trữ:</span>
              <span className="font-mono text-emerald-400 font-bold">Giữ 30 bản mới nhất</span>
            </div>
          </div>
        </div>

        {/* Card 2: Cloud Sync Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Đồng Bộ Đám Mây</h4>
                <p className="text-xs text-slate-400">Chống mất mát khi sập VPS</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
              ĐÃ BẬT
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Kênh lưu trữ Cloud:</span>
              <select
                value={config.cloudSyncProvider}
                onChange={(e) => handleUpdateConfig({ cloudSyncProvider: e.target.value as any })}
                className="px-2 py-1 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold text-xs"
              >
                <option value="TELEGRAM_BOT">Telegram Admin Bot</option>
                <option value="GOOGLE_DRIVE">Google Drive Cloud</option>
                <option value="SIMULATED">Bộ nhớ VPS An toàn</option>
              </select>
            </div>
            <div className="flex justify-between items-center text-slate-400 truncate">
              <span>Đích đến:</span>
              <span className="font-semibold text-white truncate max-w-[140px]" title={config.cloudSyncDestination}>
                {config.cloudSyncDestination || 'Telegram Bot'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Latest Backup Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Bản Gần Nhất</h4>
                <p className="text-xs text-slate-400">Trạng thái an toàn hệ thống</p>
              </div>
            </div>
            <button
              onClick={fetchBackupData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Tải lại danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
            {latestBackup ? (
              <>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Thời gian:</span>
                  <span className="font-mono text-white font-bold">
                    {new Date(latestBackup.exportedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Dung lượng / Số SP:</span>
                  <span className="font-semibold text-emerald-400">
                    {latestBackup.sizeFormatted} ({latestBackup.summary.totalProducts} sản phẩm)
                  </span>
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-center py-2">Chưa có bản sao lưu nào</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            <span>Trung Tâm Thao Tác Sao Lưu & Khôi Phục</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tạo bản sao lưu tức thì hoặc nạp file backup từ máy tính để khôi phục toàn bộ sản phẩm & cấu hình.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isRestoring}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Nạp File Từ Máy Tính (Restore)</span>
          </button>

          <button
            onClick={handleCreateBackup}
            disabled={isCreating}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {isCreating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Tạo Bản Sao Lưu Tức Thì</span>
          </button>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Lịch Sử Các Bản Sao Lưu Trên Server ({backups.length})</h3>
          </div>
          <span className="text-xs text-slate-400">Tự động giữ lại 30 bản sao lưu mới nhất</span>
        </div>

        {backups.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <HardDrive className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold">Chưa tìm thấy bản sao lưu nào trên hệ thống.</p>
            <p className="text-xs text-slate-500">Hãy bấm nút "Tạo Bản Sao Lưu Tức Thì" ở trên để khởi tạo bản sao lưu đầu tiên.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-semibold">
                  <th className="p-4">Tên Bản Sao Lưu (Filename)</th>
                  <th className="p-4">Thời Gian Khởi Tạo</th>
                  <th className="p-4">Loại Sao Lưu</th>
                  <th className="p-4">Dữ Liệu Thống Kê</th>
                  <th className="p-4">Dung Lượng</th>
                  <th className="p-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {backups.map((item) => {
                  const isScheduled = item.triggerType === 'SCHEDULED';
                  const isImport = item.triggerType === 'IMPORT';

                  return (
                    <tr key={item.filename} className="hover:bg-slate-850/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-white flex items-center gap-2">
                        <FileJson className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="truncate max-w-xs" title={item.filename}>
                          {item.filename}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 font-mono">
                        {new Date(item.exportedAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-4">
                        {isScheduled ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
                            ⏰ Tự động ngầm
                          </span>
                        ) : isImport ? (
                          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[11px] font-semibold">
                            📥 File nạp lên
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-semibold">
                            🖐️ Thủ công
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-300">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-300 font-bold">
                            {item.summary.totalProducts} SP
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-semibold">
                            {item.summary.totalBranches} Chi nhánh
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold">
                            {item.summary.totalCustomers} Khách
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-emerald-400 font-bold">
                        {item.sizeFormatted}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDownloadBackup(item.filename)}
                            className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-semibold flex items-center gap-1 border border-blue-500/30 transition-all"
                            title="Tải file về máy tính"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải về</span>
                          </button>

                          <button
                            onClick={() => setSelectedBackupForRestore(item)}
                            className="p-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 font-semibold flex items-center gap-1 border border-amber-500/30 transition-all"
                            title="Khôi phục lại phiên bản này"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Khôi phục</span>
                          </button>

                          <button
                            onClick={() => handleDeleteBackup(item.filename)}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold flex items-center gap-1 border border-red-500/20 transition-all"
                            title="Xóa bản sao lưu này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restore Confirmation Modal */}
      {selectedBackupForRestore && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-400 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Xác Nhận Khôi Phục Dữ Liệu</h3>
                <p className="text-xs text-slate-400">Cảnh báo ghi đè trạng thái hệ thống</p>
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>File bản sao lưu:</span>
                <span className="font-mono font-bold text-white">{selectedBackupForRestore.filename}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Thời gian tạo:</span>
                <span className="font-mono text-slate-300">
                  {new Date(selectedBackupForRestore.exportedAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Sản phẩm khôi phục:</span>
                <span className="font-bold text-blue-400">{selectedBackupForRestore.summary.totalProducts} sản phẩm</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Chi nhánh:</span>
                <span className="font-semibold text-emerald-400">{selectedBackupForRestore.summary.totalBranches} chi nhánh</span>
              </div>
            </div>

            <p className="text-xs text-amber-300/90 leading-relaxed bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              ⚠️ Khi xác nhận, toàn bộ dữ liệu sản phẩm, giá bán, danh mục và cài đặt cửa hàng hiện tại sẽ được thay thế hoàn toàn theo bản sao lưu này. Trang web sẽ tự động tải lại sau khi hoàn tất.
            </p>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedBackupForRestore(null)}
                disabled={isRestoring}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/30 disabled:opacity-50"
              >
                {isRestoring ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Xác Nhận Khôi Phục Tức Thì</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
