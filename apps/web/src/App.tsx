import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { POSPage } from './pages/POSPage';
import { CustomersPage } from './pages/CustomersPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { UsersPage } from './pages/UsersPage';
import { PriceListsPage } from './pages/PriceListsPage';
import { LogOut, Store, LayoutDashboard, ShoppingCart, Package, Users, BarChart3, ShieldCheck, Tag } from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated, user, logout, initAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'POS' | 'DASHBOARD' | 'PRODUCTS' | 'CRM' | 'REPORTS' | 'USERS' | 'PRICELISTS'>('POS');

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-wide text-base leading-none">Sales Manager Pro</h1>
              <span className="text-xs text-blue-400 font-medium">Chi nhánh Chợ Bến Thành (CN-01)</span>
            </div>
          </div>

          {/* Quick Keyboard Shortcuts Legend */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 font-mono font-bold">F1</span> Tìm kiếm
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-bold ml-2">F4</span> Chọn khách
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 font-mono font-bold ml-2">F8</span> Giữ đơn
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono font-bold ml-2">F9</span> Thanh toán
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-red-400 font-mono font-bold ml-2">F10</span> Xóa giỏ
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-400 font-mono font-bold ml-2">F12</span> In HD
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-white">{user?.fullName}</div>
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                {user?.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-all"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Application Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar Nav */}
          <aside className="w-56 border-r border-slate-800 bg-slate-900/50 p-3 flex flex-col gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('POS')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'POS'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Bán quầy (POS)</span>
            </button>
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'DASHBOARD'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tổng quan</span>
            </button>
            <button
              onClick={() => setActiveTab('PRODUCTS')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'PRODUCTS'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Sản phẩm & Kho</span>
            </button>
            <button
              onClick={() => setActiveTab('PRICELISTS')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'PRICELISTS'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>Thiết lập Bảng giá</span>
            </button>
            <button
              onClick={() => setActiveTab('CRM')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'CRM'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Khách hàng (CRM)</span>
            </button>
            <button
              onClick={() => setActiveTab('USERS')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'USERS'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Quản lý Nhân viên</span>
            </button>
            <button
              onClick={() => setActiveTab('REPORTS')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'REPORTS'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Báo cáo doanh thu</span>
            </button>
          </aside>

          {/* Main View */}
          <main className="flex-1 overflow-hidden">
            {activeTab === 'POS' && <POSPage />}
            {activeTab === 'CRM' && <CustomersPage />}
            {activeTab === 'PRODUCTS' && <ProductsPage />}
            {activeTab === 'PRICELISTS' && <PriceListsPage />}
            {activeTab === 'USERS' && <UsersPage />}
            {(activeTab === 'DASHBOARD' || activeTab === 'REPORTS') && <DashboardPage />}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default App;
