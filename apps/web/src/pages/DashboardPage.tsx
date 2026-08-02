import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingBag, DollarSign, Users, AlertTriangle, Trophy } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topSelling, setTopSelling] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, chartRes, topRes, lowRes]: any = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/revenue-chart'),
        api.get('/reports/top-selling'),
        api.get('/reports/low-stock'),
      ]);

      setSummary(sumRes.data);
      setChartData(chartRes.data || []);
      setTopSelling(topRes.data || []);
      setLowStock(lowRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  if (isLoading) {
    return (
      <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="glass-panel h-28 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="glass-panel h-80 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Báo Cáo Doanh Thu</h1>
        <p className="text-slate-400 text-xs mt-1">Theo dõi các chỉ số bán hàng, lợi nhuận và biến động kho theo thời gian thực</p>
      </div>

      {/* Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Doanh Thu Hôm Nay</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">{formatVND(summary?.todayRevenue || 0)}</div>
            <span className="text-[11px] text-emerald-500 font-semibold">{summary?.revenueGrowth} so với tuần trước</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Số Đơn Hàng Hôm Nay</span>
            <div className="text-xl font-bold text-blue-400 mt-1">{summary?.todayOrdersCount} đơn</div>
            <span className="text-[11px] text-blue-400 font-semibold">Tăng trưởng ổn định</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Lợi Nhuận Gộp Tạm Tính</span>
            <div className="text-xl font-bold text-amber-400 mt-1">{formatVND(summary?.todayProfit || 0)}</div>
            <span className="text-[11px] text-amber-400 font-semibold">Biên lợi nhuận 22%</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Khách Hàng Mới</span>
            <div className="text-xl font-bold text-purple-400 mt-1">+{summary?.newCustomersToday} khách</div>
            <span className="text-[11px] text-purple-400 font-semibold">Tích điểm chủ động</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Revenue & Profit Area Chart (Recharts) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-base text-white">Biểu Đồ Doanh Thu & Lợi Nhuận Tuần Này</h2>
            <p className="text-xs text-slate-400">So sánh biến động tổng doanh thu và lợi nhuận thuần</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
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
                formatter={(value: any) => [formatVND(Number(value)), '']}
              />
              <Area type="monotone" dataKey="revenue" name="Doanh Thu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="profit" name="Lợi Nhuận" stroke="#10b981" fillOpacity={1} fill="url(#colorProf)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid: Top Selling Products & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 mb-4 text-amber-400">
            <Trophy className="w-5 h-5" />
            <h2 className="font-bold text-base text-white">Top 5 Sản Phẩm Bán Chạy Nhất</h2>
          </div>
          <div className="space-y-3 text-xs">
            {topSelling.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate font-medium text-white">{item.name}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-emerald-400">{formatVND(item.revenue)}</div>
                  <div className="text-[11px] text-slate-400">Đã bán: {item.soldQty} cái</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 mb-4 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-bold text-base text-white">Cảnh Báo Sản Phẩm Sắp Hết Hàng</h2>
          </div>
          <div className="space-y-3 text-xs">
            {lowStock.length === 0 ? (
              <div className="text-slate-500 text-center py-6">Tồn kho các mặt hàng đều an toàn.</div>
            ) : (
              lowStock.map((prod) => (
                <div key={prod.id} className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{prod.name}</div>
                    <span className="text-slate-400 text-[11px] font-mono">SKU: {prod.sku}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30 text-[11px]">
                      Còn {prod.stockQuantity} {prod.unit}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
