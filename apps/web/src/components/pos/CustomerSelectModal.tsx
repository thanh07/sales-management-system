import React, { useEffect, useState } from 'react';
import { usePosStore } from '../../store/posStore';
import api from '../../services/api';
import { Search, UserCheck, X, Award, Phone, UserPlus, Check } from 'lucide-react';

interface CustomerSelectModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectCustomer?: (customer: any) => void;
}

export const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
}) => {
  const { selectedCustomer, setCustomer, setActivePriceList } = usePosStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New Customer Form inside Modal
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [group, setGroup] = useState<'RETAIL' | 'WHOLESALE' | 'VIP'>('RETAIL');

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/customers', {
        params: { query: searchQuery },
      });
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen, searchQuery]);

  if (!isOpen) return null;

  const resolvePriceListForCustomer = async (custGroup?: string) => {
    try {
      const res: any = await api.get('/pricelists/resolve', {
        params: { group: custGroup || 'RETAIL' },
      });
      if (res.data) {
        // Fetch full items details for price list
        const detailsRes: any = await api.get(`/pricelists/${res.data.id}`);
        setActivePriceList(detailsRes.data || res.data);
      }
    } catch (err) {
      console.error('Error resolving price list:', err);
    }
  };

  const handleSelect = async (cust: any) => {
    setCustomer(cust);
    await resolvePriceListForCustomer(cust.group);
    if (onSelectCustomer) onSelectCustomer(cust);
    if (onClose) onClose();
  };

  const handleClearSelection = async () => {
    setCustomer(null);
    await resolvePriceListForCustomer('RETAIL');
    if (onClose) onClose();
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await api.post('/customers', {
        fullName,
        phone,
        group,
      });
      setCustomer(res.data);
      setIsAddingNew(false);
      if (onClose) onClose();
    } catch (err: any) {
      alert(err.message || 'Lỗi thêm khách hàng mới');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5 text-blue-400">
            <UserCheck className="w-5 h-5" />
            <h3 className="font-bold text-lg text-white">
              {isAddingNew ? 'Thêm Khách Hàng Mới' : 'Chọn Khách Hàng Cho Hóa Đơn'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAddingNew ? (
          <div className="p-5 space-y-4">
            {/* Search Bar & Action */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập tên khách hàng, SĐT hoặc mã KH... (F4)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
              <button
                onClick={() => setIsAddingNew(true)}
                className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-md shadow-blue-600/30"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm Mới</span>
              </button>
            </div>

            {/* Quick Option: Khách Vãng Lai */}
            <div
              onClick={handleClearSelection}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                !selectedCustomer
                  ? 'bg-blue-600/20 border-blue-500/50 text-white font-semibold'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Khách Vãng Lai (Không cần lưu hồ sơ)</span>
              </div>
              {!selectedCustomer && <Check className="w-4 h-4 text-blue-400" />}
            </div>

            {/* Customers List */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {isLoading ? (
                <div className="text-slate-500 text-center py-8 text-xs">Đang tải danh sách khách hàng...</div>
              ) : customers.length === 0 ? (
                <div className="text-slate-500 text-center py-8 text-xs">Không tìm thấy khách hàng phù hợp.</div>
              ) : (
                customers.map((cust) => {
                  const isSelected = selectedCustomer?.id === cust.id;
                  return (
                    <div
                      key={cust.id}
                      onClick={() => handleSelect(cust)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white font-semibold shadow-md'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{cust.fullName}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cust.group === 'VIP'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {cust.group}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-blue-400" />
                            {cust.phone}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">{cust.code}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Award className="w-3.5 h-3.5" />
                          <span>{cust.rewardPoints || 0} điểm</span>
                        </div>
                        {cust.debtAmount > 0 && (
                          <div className="text-[10px] text-red-400 font-bold mt-0.5">
                            Nợ: {new Intl.NumberFormat('vi-VN').format(cust.debtAmount)}đ
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Add New Customer Form inside Modal */
          <form onSubmit={handleCreateCustomer} className="p-5 space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Họ và Tên (*)</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Nguyễn Văn An"
                className="w-full px-3 py-2.5 rounded-xl glass-input"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Số điện thoại (*)</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0909123456"
                className="w-full px-3 py-2.5 rounded-xl glass-input font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nhóm Khách Hàng</label>
              <select
                value={group}
                onChange={(e: any) => setGroup(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-semibold"
              >
                <option value="RETAIL">Bán lẻ (Tích 1% điểm)</option>
                <option value="WHOLESALE">Bán sỉ (Chiết khấu sỉ)</option>
                <option value="VIP">VIP (Ưu đãi đặc quyền)</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700"
              >
                Quay lại
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-600/30"
              >
                Lưu & Chọn Khách
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
