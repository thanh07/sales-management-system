import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, UserPlus, Phone, Mail, Award, CreditCard, PieChart, Users, TrendingUp, X } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Tất cả');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAbcModalOpen, setIsAbcModalOpen] = useState(false);
  const [abcData, setAbcData] = useState<any>(null);

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

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const totalDebt = customers.reduce((sum, c) => sum + (c.debtAmount || 0), 0);
  const totalVIP = customers.filter((c) => c.group === 'VIP').length;

  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản lý Khách Hàng (CRM)</h1>
          <p className="text-slate-400 text-xs mt-1">Theo dõi hồ sơ, tích điểm thưởng, công nợ và phân loại nhóm Pareto ABC</p>
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
            <span>Thêm Khách Hàng</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Tổng Số Khách Hàng</span>
            <div className="text-2xl font-bold text-white mt-1">{customers.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Khách Hàng VIP</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{totalVIP}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Tổng Công Nợ Khách</span>
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
                <th className="p-4">Liên hệ</th>
                <th className="p-4">Nhóm</th>
                <th className="p-4">Điểm thưởng</th>
                <th className="p-4">Tổng chi tiêu</th>
                <th className="p-4">Công nợ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {customers.map((c) => (
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
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        c.group === 'VIP'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : c.group === 'WHOLESALE'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {c.group}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Award className="w-4 h-4" />
                      <span>{c.rewardPoints} điểm</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-emerald-400">{formatVND(c.totalSpent)}</td>
                  <td className="p-4 font-bold text-red-400">
                    {c.debtAmount > 0 ? formatVND(c.debtAmount) : 'Không nợ'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                  className="w-full px-3 py-2.5 rounded-xl glass-input"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. khachhang@gmail.com"
                  className="w-full px-3 py-2.5 rounded-xl glass-input"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nhóm Khách Hàng</label>
                <select
                  value={group}
                  onChange={(e: any) => setGroup(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900"
                >
                  <option value="RETAIL">Bán lẻ</option>
                  <option value="WHOLESALE">Bán sỉ</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-2 shadow-lg shadow-blue-600/30"
              >
                Lưu Khách Hàng
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pareto ABC Analysis */}
      {isAbcModalOpen && abcData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-blue-400">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">Phân Tích Khách Hàng Pareto ABC</h3>
              </div>
              <button onClick={() => setIsAbcModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-slate-400">
                Phân tích Pareto (Nguyên tắc 80/20) giúp nhận diện 20% nhóm khách hàng VIP đóng góp 80% tổng doanh thu cửa hàng.
              </p>
              {abcData.customers.map((c: any) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">{c.fullName}</div>
                    <span className="text-blue-400 font-semibold">{c.abcCategory}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-400">{formatVND(c.totalSpent)}</div>
                    <div className="text-[11px] text-slate-500">Đóng góp: {c.revenueShare}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
