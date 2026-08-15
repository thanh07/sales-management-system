import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, UserPlus, Phone, Mail, Award, CreditCard, PieChart, Users, TrendingUp, X, DollarSign, CheckCircle2, ShieldCheck, Crown } from 'lucide-react';

export interface CustomerTier {
  name: string;
  badgeBg: string;
  icon: string;
  discountPercent: number;
}

export function getCustomerMemberTier(totalSpent: number = 0): CustomerTier {
  if (totalSpent >= 100000000) {
    return { name: 'Kim Cương', badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', icon: '💎', discountPercent: 8 };
  }
  if (totalSpent >= 50000000) {
    return { name: 'Bạch Kim', badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: '🥈', discountPercent: 5 };
  }
  if (totalSpent >= 20000000) {
    return { name: 'Hạng Vàng', badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '🥇', discountPercent: 2 };
  }
  return { name: 'Hạng Bạc', badgeBg: 'bg-slate-800 text-slate-300 border-slate-700', icon: '🥉', discountPercent: 0 };
}

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Tất cả');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAbcModalOpen, setIsAbcModalOpen] = useState(false);
  const [abcData, setAbcData] = useState<any>(null);

  // Pay Debt Modal State
  const [isPayDebtModalOpen, setIsPayDebtModalOpen] = useState(false);
  const [selectedCustomerForDebt, setSelectedCustomerForDebt] = useState<any | null>(null);
  const [payAmountInput, setPayAmountInput] = useState<number>(0);
  const [isSubmittingDebt, setIsSubmittingDebt] = useState(false);

  // New Customer Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [group, setGroup] = useState<'RETAIL' | 'WHOLESALE' | 'VIP'>('RETAIL');

  const fetchCustomers = async () => {
    try {
      const res: any = await api.get('/customers', {
        params: { query, group: selectedGroup },
      });
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAbc = async () => {
    try {
      const res: any = await api.get('/customers/abc-analysis');
      setAbcData(res.data);
      setIsAbcModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [query, selectedGroup]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', { fullName, phone, email, address, group });
      setIsAddModalOpen(false);
      setFullName('');
      setPhone('');
      setEmail('');
      setAddress('');
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Lỗi thêm khách hàng');
    }
  };

  const handleOpenPayDebtModal = (customer: any) => {
    setSelectedCustomerForDebt(customer);
    setPayAmountInput(customer.debtAmount || 0);
    setIsPayDebtModalOpen(true);
  };

  const handleSubmitPayDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForDebt) return;
    setIsSubmittingDebt(true);
    try {
      await api.post(`/customers/${selectedCustomerForDebt.id}/pay-debt`, {
        amount: payAmountInput,
      });
      setIsPayDebtModalOpen(false);
      setSelectedCustomerForDebt(null);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thu nợ');
    } finally {
      setIsSubmittingDebt(false);
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  const totalDebt = customers.reduce((sum, c) => sum + (c.debtAmount || 0), 0);
  const totalVIP = customers.filter((c) => c.group === 'VIP' || c.totalSpent >= 20000000).length;

  return (
    <div className="p-6 min-h-screen space-y-6 text-slate-200">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản Lý Khách Hàng & Thẻ Thành Viên (CRM & Loyalty)</h1>
          <p className="text-slate-400 text-xs mt-1">Phân hạng thẻ thành viên, tích điểm thưởng, quản lý sổ nợ và phân tích Pareto ABC</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAbc}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 font-medium text-xs rounded-xl flex items-center gap-2 border border-slate-700/80 transition-all shadow-md"
          >
            <PieChart className="w-4 h-4" />
            <span>Phân tích Pareto ABC</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Khách Hàng Mới</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Tổng Số Khách Hàng Hồ Sơ</span>
            <div className="text-2xl font-bold text-white mt-1">{customers.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Khách Hàng Thân Thiết (VIP)</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{totalVIP}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Tổng Công Nợ Cần Thu</span>
            <div className="text-2xl font-bold text-red-400 mt-1">{formatVND(totalDebt)}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, SĐT, mã KH..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['Tất cả', 'VIP', 'RETAIL', 'WHOLESALE'].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedGroup === g
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/50'
              }`}
            >
              {g === 'RETAIL' ? 'Bán lẻ' : g === 'WHOLESALE' ? 'Bán sỉ' : g}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Mã KH / Họ tên</th>
                <th className="p-4">Liên hệ & Địa chỉ</th>
                <th className="p-4">Hạng Thẻ & Nhóm</th>
                <th className="p-4">Tích điểm thưởng</th>
                <th className="p-4">Tổng chi tiêu</th>
                <th className="p-4">Công nợ</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {customers.map((c) => {
                const tier = getCustomerMemberTier(c.totalSpent);

                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{c.fullName}</div>
                      <span className="text-[11px] text-slate-500 font-mono">{c.code}</span>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                        <span>{c.phone}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border flex items-center gap-1 ${tier.badgeBg}`}>
                          <span>{tier.icon}</span>
                          <span>{tier.name} {tier.discountPercent > 0 ? `(-${tier.discountPercent}%)` : ''}</span>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold ${
                            c.group === 'VIP'
                              ? 'bg-amber-500/10 text-amber-400'
                              : c.group === 'WHOLESALE'
                              ? 'bg-purple-500/10 text-purple-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {c.group}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                        <Award className="w-4 h-4" />
                        <span>{c.rewardPoints} điểm</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-emerald-400 font-mono">{formatVND(c.totalSpent)}</td>
                    <td className="p-4 font-bold font-mono">
                      {c.debtAmount > 0 ? (
                        <span className="text-red-400">{formatVND(c.debtAmount)}</span>
                      ) : (
                        <span className="text-slate-500 font-normal">Không nợ</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {c.debtAmount > 0 ? (
                        <button
                          onClick={() => handleOpenPayDebtModal(c)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/40 text-[11px] font-bold transition-all shadow"
                        >
                          💵 Thu Nợ
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[11px] italic">Đã sạch nợ</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pay Debt */}
      {isPayDebtModalOpen && selectedCustomerForDebt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Thu Nợ Khách Hàng</h3>
              <button onClick={() => setIsPayDebtModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div className="font-bold text-white text-sm">{selectedCustomerForDebt.fullName}</div>
              <div className="text-slate-400 font-mono">SĐT: {selectedCustomerForDebt.phone}</div>
              <div className="text-red-400 font-bold font-mono">Số nợ hiện tại: {formatVND(selectedCustomerForDebt.debtAmount)}</div>
            </div>

            <form onSubmit={handleSubmitPayDebt} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Số tiền khách thanh toán nợ (VNĐ)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  max={selectedCustomerForDebt.debtAmount}
                  value={payAmountInput}
                  onChange={(e) => setPayAmountInput(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl glass-input font-mono text-emerald-400 font-bold text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPayDebtModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDebt}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                >
                  {isSubmittingDebt ? 'Đang lưu...' : 'Xác Nhận Thu Nợ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Customer */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-lg text-white">Thêm Khách Hàng Mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Họ và Tên (*)</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Nguyễn Văn A"
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
                  placeholder="e.g. 0901234567"
                  className="w-full px-3 py-2.5 rounded-xl glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. email@example.com"
                  className="w-full px-3 py-2.5 rounded-xl glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 123 Đường ABC, Quận 1"
                  className="w-full px-3 py-2.5 rounded-xl glass-input"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nhóm khách hàng</label>
                <select
                  value={group}
                  onChange={(e: any) => setGroup(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                >
                  <option value="RETAIL">Bán lẻ (RETAIL)</option>
                  <option value="WHOLESALE">Bán sỉ (WHOLESALE)</option>
                  <option value="VIP">Khách VIP</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30"
                >
                  Lưu Khách Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pareto ABC Analysis */}
      {isAbcModalOpen && abcData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">Phân Tích Khách Hàng Pareto ABC</h3>
                <p className="text-xs text-slate-400">Phân hạng nhóm khách hàng đóng góp doanh thu trọng điểm cho chuỗi</p>
              </div>
              <button onClick={() => setIsAbcModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-300">
                <strong>Tổng doanh thu đóng góp:</strong> {formatVND(abcData.totalRevenue)}
              </div>

              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Khách hàng</th>
                      <th className="p-3">Doanh thu đóng góp</th>
                      <th className="p-3">Tỷ trọng %</th>
                      <th className="p-3">Nhóm Pareto ABC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {abcData.customers?.map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-white">{c.fullName} ({c.code})</td>
                        <td className="p-3 font-bold text-emerald-400 font-mono">{formatVND(c.totalSpent)}</td>
                        <td className="p-3 font-mono text-purple-300 font-bold">{c.revenueShare}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.abcCategory.startsWith('A') ? 'bg-emerald-500/20 text-emerald-300' : c.abcCategory.startsWith('B') ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                            {c.abcCategory}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
