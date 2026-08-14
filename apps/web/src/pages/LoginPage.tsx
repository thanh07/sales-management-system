import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Store, Lock, User as UserIcon, ShieldAlert, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      // Error handled in store
    }
  };

  const handleQuickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative z-10 border border-slate-800">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 mb-3">
            <Store className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sales Manager Pro</h1>
          <p className="text-sm text-slate-400 mt-1">Hệ thống Quản lý Bán hàng & POS Đa Chi Nhánh</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Tài khoản đăng nhập (Mã NV / Username / Email / SĐT)
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập Mã NV (VD: NVA, ADMIN01), username..."
                className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Đăng nhập Hệ thống</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Accounts */}
        <div className="mt-7 pt-5 border-t border-slate-800/80">
          <p className="text-xs text-slate-400 mb-2.5 font-medium text-center">Tài khoản nhân sự mẫu (Click để điền nhanh):</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-xs text-slate-300 transition-colors text-left"
            >
              <div className="font-semibold text-blue-400">👑 Admin</div>
              <div className="text-[10px] text-slate-500 font-mono">admin / admin123</div>
            </button>
            <button
              onClick={() => handleQuickLogin('NVA', 'cashier123')}
              className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-xs text-slate-300 transition-colors text-left"
            >
              <div className="font-semibold text-emerald-400">🛒 Thu Ngân (Mã: NVA)</div>
              <div className="text-[10px] text-slate-500 font-mono">NVA / cashier123</div>
            </button>
            <button
              onClick={() => handleQuickLogin('NV02', 'warehouse123')}
              className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-xs text-slate-300 transition-colors text-left"
            >
              <div className="font-semibold text-amber-400">📦 Thủ Kho (Mã: NV02)</div>
              <div className="text-[10px] text-slate-500 font-mono">NV02 / warehouse123</div>
            </button>
            <button
              onClick={() => handleQuickLogin('quynhnhu', '123456')}
              className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-xs text-slate-300 transition-colors text-left"
            >
              <div className="font-semibold text-purple-400">👩‍💼 Sale (quynhnhu)</div>
              <div className="text-[10px] text-slate-500 font-mono">quynhnhu / 123456</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
