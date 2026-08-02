import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { UserPlus, Shield, Mail, Phone, Building2, UserCheck, Lock, X } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'CASHIER' | 'WAREHOUSE' | 'SALE'>('CASHIER');

  const fetchUsers = async () => {
    try {
      const res: any = await api.get('/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', {
        username,
        email,
        fullName,
        phone,
        role,
        branchName: 'Chi nhánh Chợ Bến Thành (CN-01)',
      });

      setIsAddModalOpen(false);
      setUsername('');
      setEmail('');
      setFullName('');
      setPhone('');
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Lỗi thêm nhân viên mới');
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'ADMIN':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MANAGER':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'CASHIER':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'WAREHOUSE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto space-y-6">
      {/* Header & Quick Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản Lý Nhân Viên & Phân Quyền (RBAC)</h1>
          <p className="text-slate-400 text-xs mt-1">Danh sách nhân viên, gán vai trò quyền hạn và quản lý tài khoản truy cập hệ thống</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm Nhân Viên Mới</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Tổng Số Nhân Viên</span>
            <div className="text-2xl font-bold text-white mt-1">{users.length} nhân sự</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Quản Trị Viên (Admin)</span>
            <div className="text-2xl font-bold text-red-400 mt-1">
              {users.filter((u) => u.role === 'ADMIN').length} tài khoản
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Thu Ngân Quầy POS</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {users.filter((u) => u.role === 'CASHIER').length} nhân sự
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Họ và Tên / Username</th>
                <th className="p-4">Email / SĐT</th>
                <th className="p-4">Vai trò (Role)</th>
                <th className="p-4">Chi nhánh</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{u.fullName}</div>
                    <span className="text-[11px] text-slate-500 font-mono">@{u.username}</span>
                  </td>
                  <td className="p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <span>{u.email}</span>
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{u.phone}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border ${getRoleBadge(
                        u.role
                      )}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{u.branchName || 'Chi nhánh Bến Thành (CN-01)'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      Hoạt động
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create User Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-blue-400">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">Thêm Nhân Viên Mới</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Họ và Tên (*)</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Nguyễn Văn Nam"
                  className="w-full px-3 py-2.5 rounded-xl glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tên đăng nhập (*)</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="namnv"
                    className="w-full px-3 py-2.5 rounded-xl glass-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full px-3 py-2.5 rounded-xl glass-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email (*)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nam.nguyen@salesmanager.vn"
                  className="w-full px-3 py-2.5 rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vai trò & Phân quyền (Role)</label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input bg-slate-900 font-semibold"
                >
                  <option value="CASHIER">CASHIER - Thu Ngân (Bán quầy POS, Tạo đơn)</option>
                  <option value="WAREHOUSE">WAREHOUSE - Thủ Kho (Nhập xuất, Cảnh báo kho)</option>
                  <option value="SALE">SALE - Nhân viên Kinh doanh</option>
                  <option value="MANAGER">MANAGER - Quản Lý Cửa Hàng</option>
                  <option value="ADMIN">ADMIN - Quản Trị Viên Toàn Quyền (*)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 mt-2"
              >
                Lưu & Thêm Nhân Viên
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
