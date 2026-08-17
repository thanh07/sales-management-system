import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from './store/authStore';
import { useBranchStore } from './store/branchStore';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { POSPage } from './pages/POSPage';
import { CustomersPage } from './pages/CustomersPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { UsersPage } from './pages/UsersPage';
import { PriceListsPage } from './pages/PriceListsPage';
import { SettingsPage } from './pages/SettingsPage';
import { BranchesPage } from './pages/BranchesPage';
import {
  LogOut,
  Store,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  ShieldCheck,
  Tag,
  Settings,
  Building2,
  ChevronDown,
  Check,
  ExternalLink,
  Lock
} from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated, user, logout, initAuth } = useAuthStore();
  const { branches, selectedBranchId, setSelectedBranchId, getSelectedBranch, fetchBranches } = useBranchStore();

  const [activeTab, setActiveTab] = useState<
    'POS' | 'DASHBOARD' | 'PRODUCTS' | 'CRM' | 'REPORTS' | 'USERS' | 'PRICELISTS' | 'SETTINGS' | 'BRANCHES'
  >('POS');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const branchDropdownRef = useRef<HTMLDivElement>(null);

  const role = user?.role || 'SALE';
  const isAdmin = role === 'ADMIN';
  const isManager = role === 'MANAGER';
  const isWarehouse = role === 'WAREHOUSE';
  const isSale = role === 'SALE' || role === 'CASHIER';

  const canAccessDashboard = isAdmin || isManager;
  const canAccessBranches = isAdmin || isManager || isWarehouse;
  const canAccessPricelists = isAdmin || isManager;
  const canAccessCRM = isAdmin || isManager || isSale;
  const canAccessUsers = isAdmin || isManager;
  const canAccessReports = isAdmin || isManager || isWarehouse;
  const canAccessSettings = isAdmin;

  const activeBranch = getSelectedBranch();

  useEffect(() => {
    initAuth();
    fetchBranches();
  }, [initAuth, fetchBranches]);

  // Sync active working branch with assigned user.branchId for non-admin staff (e.g. Sale, Cashier, Warehouse, Manager)
  useEffect(() => {
    if (user && user.branchId && !isAdmin) {
      setSelectedBranchId(user.branchId);
    }
  }, [user, isAdmin, setSelectedBranchId]);

  // Close branch dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 overflow-x-hidden">
        {/* Top Navbar */}
        <header
          className={`${
            activeTab === 'POS' ? 'hidden md:flex' : 'flex'
          } h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 md:px-6 items-center justify-between sticky top-0 z-30`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <Store className="w-5 h-5 text-blue-400" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 hidden sm:flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-wide text-sm sm:text-base leading-none">Sales Manager Pro</h1>

              {/* Global Branch Switcher Dropdown */}
              <div className="relative mt-1" ref={branchDropdownRef}>
                <button
                  onClick={isAdmin ? () => setIsBranchDropdownOpen(!isBranchDropdownOpen) : undefined}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-xs font-semibold transition-all group ${
                    isAdmin
                      ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20 cursor-pointer'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700/60 cursor-not-allowed'
                  }`}
                  title={isAdmin ? 'Bấm để đổi chi nhánh làm việc' : 'Chi nhánh làm việc được khóa cố định theo tài khoản của bạn'}
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span className="max-w-[180px] sm:max-w-[240px] truncate">{activeBranch?.name || 'Chi nhánh mặc định'}</span>
                  {isAdmin ? (
                    <ChevronDown className="w-3.5 h-3.5 text-blue-400 group-hover:translate-y-0.5 transition-transform" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {isBranchDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                      <span>Chọn Chi Nhánh Làm Việc</span>
                      <span className="text-blue-400">{branches.length} địa điểm</span>
                    </div>

                    <div className="py-1 space-y-0.5 max-h-60 overflow-y-auto">
                      {branches.map((b) => {
                        const isSelected = b.id === selectedBranchId;
                        return (
                          <button
                            key={b.id}
                            onClick={() => {
                              setSelectedBranchId(b.id);
                              setIsBranchDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white font-bold shadow'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  b.isCentralWarehouse ? 'bg-purple-400' : 'bg-emerald-400'
                                }`}
                              />
                              <div>
                                <div className="font-semibold text-xs leading-tight">{b.name}</div>
                                <div className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                                  {b.code} • {b.district || b.city}
                                </div>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {isAdmin && (
                      <div className="pt-1.5 mt-1 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setActiveTab('BRANCHES');
                            setIsBranchDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 rounded-xl text-xs font-bold text-blue-400 hover:bg-blue-600/15 flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Quản Lý Danh Sách Chi Nhánh</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Keyboard Shortcuts Legend */}
          <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 font-mono font-bold">F1</span> Tìm kiếm
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-bold ml-2">F4</span> Chọn khách
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 font-mono font-bold ml-2">F6</span> Giao hàng
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-400 font-mono font-bold ml-2">F7</span> Lịch sử
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono font-bold ml-2">F8</span> Giữ đơn
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono font-bold ml-2">F9</span> Thanh toán
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-red-400 font-mono font-bold ml-2">F10</span> Xóa giỏ
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 font-mono font-bold ml-2">F12</span> In HD
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs sm:text-sm font-semibold text-white">{user?.fullName}</div>
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                {user?.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-all"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        {/* Main Application Workspace */}
        <div className="flex-1 flex overflow-hidden w-full relative">
          {/* Left Sidebar Nav */}
          <aside className="hidden md:flex w-56 border-r border-slate-800 bg-slate-900/50 p-3 flex-col gap-1 shrink-0 overflow-y-auto">
            <button
              onClick={() => setActiveTab('POS')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'POS'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-blue-400" />
              <span>Bán quầy (POS)</span>
            </button>

            {canAccessDashboard && (
              <button
                onClick={() => setActiveTab('DASHBOARD')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                  activeTab === 'DASHBOARD'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Tổng quan</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('PRODUCTS')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'PRODUCTS'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Sản phẩm & Kho</span>
            </button>

            {canAccessBranches && (
              <button
                onClick={() => setActiveTab('BRANCHES')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                  activeTab === 'BRANCHES'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Chi nhánh ({branches.length})</span>
              </button>
            )}

            {canAccessPricelists && (
              <button
                onClick={() => setActiveTab('PRICELISTS')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                  activeTab === 'PRICELISTS'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Thiết lập Bảng giá</span>
              </button>
            )}

            {canAccessCRM && (
              <button
                onClick={() => setActiveTab('CRM')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                  activeTab === 'CRM'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Khách hàng (CRM)</span>
              </button>
            )}

            {canAccessUsers && (
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
            )}

            {canAccessReports && (
              <button
                onClick={() => setActiveTab('REPORTS')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                  activeTab === 'REPORTS'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Báo cáo doanh thu</span>
              </button>
            )}

            {canAccessSettings && (
              <button
                onClick={() => setActiveTab('SETTINGS')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                  activeTab === 'SETTINGS'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Settings className="w-4 h-4 text-purple-400" />
                <span>Thiết lập chung</span>
              </button>
            )}
          </aside>

          {/* Main View */}
          <main className="flex-1 overflow-hidden w-full">
            {activeTab === 'POS' && <POSPage onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />}
            {activeTab === 'CRM' && <CustomersPage />}
            {activeTab === 'PRODUCTS' && <ProductsPage />}
            {activeTab === 'BRANCHES' && <BranchesPage />}
            {activeTab === 'PRICELISTS' && <PriceListsPage />}
            {activeTab === 'USERS' && <UsersPage />}
            {activeTab === 'SETTINGS' && <SettingsPage />}
            {(activeTab === 'DASHBOARD' || activeTab === 'REPORTS') && <DashboardPage />}
          </main>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex md:hidden">
            <div className="w-72 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between h-full animate-in slide-in-from-left duration-200 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Store className="w-5 h-5 text-blue-400" />
                    <span>Sales Manager Pro</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <div className="space-y-1">
                  {[
                    { id: 'POS', label: 'Bán quầy (POS)', icon: ShoppingCart },
                    { id: 'DASHBOARD', label: 'Tổng quan', icon: LayoutDashboard },
                    { id: 'PRODUCTS', label: 'Sản phẩm & Kho', icon: Package },
                    { id: 'BRANCHES', label: 'Chi nhánh', icon: Building2 },
                    { id: 'PRICELISTS', label: 'Thiết lập Bảng giá', icon: Tag },
                    { id: 'CRM', label: 'Khách hàng (CRM)', icon: Users },
                    { id: 'USERS', label: 'Quản lý Nhân viên', icon: ShieldCheck },
                    { id: 'REPORTS', label: 'Báo cáo doanh thu', icon: BarChart3 },
                    { id: 'SETTINGS', label: 'Thiết lập chung', icon: Settings },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{user?.fullName}</div>
                  <div className="text-[10px] text-slate-400">{user?.role}</div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold text-xs"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)}></div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default App;
