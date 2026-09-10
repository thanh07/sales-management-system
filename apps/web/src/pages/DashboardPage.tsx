import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  AlertTriangle,
  Trophy,
  Filter,
  Calendar,
  Building2,
  RefreshCw,
  PieChart as PieIcon,
  Award,
  Layers,
  UserCheck,
  Percent,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Tag,
  Truck,
  Monitor,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('THIS_WEEK');
  const [branchId, setBranchId] = useState<string>('ALL');

  const [summary, setSummary] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topType, setTopType] = useState<'products' | 'categories' | 'staff' | 'channels'>('products');
  const [topPerformance, setTopPerformance] = useState<any[]>([]);
  const [customerAnalytics, setCustomerAnalytics] = useState<any>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const params = { timeRange, branchId };
      const [sumRes, chartRes, topRes, custRes, lowRes]: any = await Promise.all([
        api.get('/reports/summary', { params }),
        api.get('/reports/revenue-chart', { params }),
        api.get('/reports/top-performance', { params: { ...params, type: topType } }),
        api.get('/reports/customer-analytics', { params }),
        api.get('/reports/low-stock'),
      ]);

      setSummary(sumRes.data);
      setChartData(chartRes.data || []);
      setTopPerformance(topRes.data || []);
      setCustomerAnalytics(custRes.data);
      setLowStock(lowRes.data || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, branchId, topType]);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  if (isLoading && !summary) {
    return (
      <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto space-y-6 bg-slate-950">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="glass-panel h-24 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="glass-panel h-80 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto space-y-6 bg-slate-950">
      {/* Top Bar Filters & Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Trung Tâm Phân Tích & Tổng Quan Kinh Doanh</h1>
          </div>
          <p className="text-slate-400 text-xs mt-1">Theo dõi các chỉ số tài chính, lợi nhuận gộp, hàng hóa và chân dung khách hàng (RFM)</p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-lg">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent font-bold text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="TODAY" className="bg-slate-900">Hôm nay</option>
              <option value="YESTERDAY" className="bg-slate-900">Hôm qua</option>
              <option value="THIS_WEEK" className="bg-slate-900">Tuần này</option>
              <option value="THIS_MONTH" className="bg-slate-900">Tháng này</option>
              <option value="THIS_QUARTER" className="bg-slate-900">Quý này</option>
            </select>
          </div>

          {/* Branch Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="bg-transparent font-bold text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-slate-900">Tất cả chi nhánh</option>
              <option value="branch-01" className="bg-slate-900">CN Chợ Bến Thành (CN-01)</option>
              <option value="branch-02" className="bg-slate-900">CN Tân Bình (CN-02)</option>
              <option value="branch-03" className="bg-slate-900">CN Q10 (CN-03)</option>
            </select>
          </div>

          {/* Refresh Action */}
          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 6 Core Business KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Doanh Thu Thuần */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Doanh Thu Thuần</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-blue-400 truncate">{formatVND(summary?.totalRevenue)}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-0.5">
              <ArrowUpRight className="w-3 h-3" />
              <span>{summary?.revenueGrowth} so với kỳ trước</span>
            </div>
          </div>
        </div>

        {/* Tổng Giá Vốn (COGS) */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tổng Giá Vốn (COGS)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-amber-400 truncate">{formatVND(summary?.totalCost)}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Chi phí hàng bán</div>
          </div>
        </div>

        {/* Lợi Nhuận Gộp */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Lợi Nhuận Gộp</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-emerald-400 truncate">{formatVND(summary?.grossProfit)}</div>
            <div className="flex items-center justify-between text-[11px] text-emerald-500 font-bold mt-0.5">
              <span>Biên LN: {summary?.profitMargin}%</span>
            </div>
          </div>
        </div>

        {/* Số Lượng Hóa Đơn */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Số Hóa Đơn</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-purple-400">{summary?.totalOrdersCount} đơn</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Trả hàng: {formatVND(summary?.returnsAmount)}</div>
          </div>
        </div>

        {/* Giá Trị TB / Đơn (AOV) */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Giá Trị TB/Đơn (AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-cyan-400 truncate">{formatVND(summary?.averageOrderValue)}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Sức mua trung bình</div>
          </div>
        </div>

        {/* Doanh Thu TB / Ngày */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Doanh Thu TB/Ngày</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-indigo-400 truncate">{formatVND(summary?.dailyAverageRevenue)}</div>
            <div className="text-[11px] text-indigo-400 font-semibold mt-0.5">Tốc độ tăng đều</div>
          </div>
        </div>
      </div>

      {/* Revenue & Profit Area Chart (Recharts) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-bold text-base text-white">Biểu Đồ Xu Hướng Doanh Thu, Giá Vốn & Lợi Nhuận</h2>
            <p className="text-xs text-slate-400">So sánh tương quan giữa Doanh thu thuần, Giá vốn hàng bán và Lợi nhuận gộp</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Doanh Thu</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>Giá Vốn</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Lợi Nhuận Gộp</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `${value / 1000000}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                formatter={(value: any, name: any) => [formatVND(Number(value)), name === 'revenue' ? 'Doanh thu' : name === 'cost' ? 'Giá vốn' : 'Lợi nhuận gộp']}
              />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="cost" name="cost" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCost)" />
              <Area type="monotone" dataKey="profit" name="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProf)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PHASE 4: CUSTOMER ANALYTICS & RFM SEGMENTATION MATRIX */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-purple-400">
              <UserCheck className="w-5 h-5" />
              <h2 className="font-bold text-base text-white">Phân Tích & Phân Loại Khách Hàng (Mô Hình RFM)</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Phân khúc chân dung khách hàng dựa trên Tần suất, Giá trị giao dịch & Nguy cơ rời bỏ</p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold">
              Tổng Khách Hàng: <strong>{customerAnalytics?.totalActiveCustomers || 82}</strong>
            </div>
            <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
              Vòng Đời TB: <strong>{formatVND(customerAnalytics?.averageCustomerLifetimeValue)}</strong>
            </div>
          </div>
        </div>

        {/* RFM Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {customerAnalytics?.rfmSegmentation?.map((seg: any) => {
            const isLoyal = seg.id === 'loyal';
            const isRegular = seg.id === 'regular';
            const isPotential = seg.id === 'potential';
            const isRisk = seg.id === 'at_risk';

            const borderColor = isLoyal
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : isRegular
              ? 'border-blue-500/40 bg-blue-500/5'
              : isPotential
              ? 'border-purple-500/40 bg-purple-500/5'
              : 'border-red-500/40 bg-red-500/5';

            const badgeColor = isLoyal
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : isRegular
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              : isPotential
              ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
              : 'bg-red-500/20 text-red-400 border-red-500/30';

            return (
              <div key={seg.id} className={`p-4 rounded-2xl border ${borderColor} flex flex-col justify-between space-y-3`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{seg.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}>
                      {seg.count} khách ({seg.percentage}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{seg.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Chi Tiêu Tích Lũy</span>
                    <span className="font-bold text-xs text-white">{formatVND(seg.totalSpent)}</span>
                  </div>
                  {isRisk ? (
                    <button className="px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition-all">
                      Chăm Sóc Ngay
                    </button>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Bottom: Top Performance Multi-Tab Widget & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performance Multi-Tab (Span 2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Trophy className="w-5 h-5" />
                <h2 className="font-bold text-base text-white">Xếp Hạng Top Performance</h2>
              </div>

              {/* Multi-Tab Selector */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setTopType('products')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    topType === 'products' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sản Phẩm
                </button>
                <button
                  onClick={() => setTopType('categories')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    topType === 'categories' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Nhóm Hàng
                </button>
                <button
                  onClick={() => setTopType('staff')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    topType === 'staff' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Nhân Viên
                </button>
                <button
                  onClick={() => setTopType('channels')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    topType === 'channels' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Kênh Bán
                </button>
              </div>
            </div>

            {/* List View according to tab */}
            <div className="space-y-2.5 text-xs">
              {topPerformance.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center shrink-0 ${
                      idx === 0 ? 'bg-amber-500 text-slate-950 font-black' : idx === 1 ? 'bg-slate-300 text-slate-950 font-bold' : idx === 2 ? 'bg-amber-700 text-white font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="truncate min-w-0">
                      <div className="font-bold text-white truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.category || item.role || item.type || 'Hàng hóa'}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-emerald-400">{formatVND(item.revenue)}</div>
                    <div className="text-[11px] text-slate-400">
                      {item.soldQty !== undefined ? `Đã bán: ${item.soldQty}` : item.ordersCount !== undefined ? `Số đơn: ${item.ordersCount}` : item.percentage ? `Tỷ trọng: ${item.percentage}%` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Warning Alerts (Span 1 col) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="font-bold text-base text-white">Cảnh Báo Tồn Kho Sắp Hết</h2>
            </div>

            <div className="space-y-3 text-xs">
              {lowStock.length === 0 ? (
                <div className="text-slate-500 text-center py-10">Tồn kho tất cả mặt hàng đều trong ngưỡng an toàn.</div>
              ) : (
                lowStock.map((prod) => (
                  <div key={prod.id} className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{prod.name}</div>
                      <span className="text-slate-400 text-[10px] font-mono">SKU: {prod.sku}</span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30 text-[11px]">
                        Còn {prod.stockQuantity} {prod.unit}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500">Hệ thống tự động cập nhật cảnh báo theo thời gian thực</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

