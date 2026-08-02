import { PosService } from './pos.service';
import { ProductService } from './product.service';

export class ReportService {
  static getSummary() {
    const orders = PosService.getOrders();
    const todayStr = new Date().toISOString().slice(0, 10);

    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const todayProfit = todayRevenue * 0.22; // Est. 22% gross margin

    return {
      todayRevenue: todayRevenue || 48500000, // Demo baseline
      todayOrdersCount: todayOrders.length || 34,
      newCustomersToday: 8,
      todayProfit: todayProfit || 10670000,
      revenueGrowth: '+18.5%',
    };
  }

  static getRevenueChartData() {
    return [
      { date: 'Thứ 2', revenue: 24500000, profit: 5400000 },
      { date: 'Thứ 3', revenue: 31200000, profit: 6800000 },
      { date: 'Thứ 4', revenue: 28900000, profit: 6300000 },
      { date: 'Thứ 5', revenue: 42000000, profit: 9200000 },
      { date: 'Thứ 6', revenue: 51500000, profit: 11300000 },
      { date: 'Thứ 7', revenue: 68000000, profit: 14900000 },
      { date: 'Chủ Nhật', revenue: 48500000, profit: 10670000 },
    ];
  }

  static getTopSellingProducts() {
    return [
      { name: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên', soldQty: 14, revenue: 447860000 },
      { name: 'Tai nghe Bluetooth Apple AirPods Pro 2', soldQty: 28, revenue: 153720000 },
      { name: 'MacBook Air 15 inch M3 16GB', soldQty: 8, revenue: 295920000 },
      { name: 'Chuột không dây Logitech MX Master 3S', soldQty: 22, revenue: 54780000 },
      { name: 'Samsung Galaxy S24 Ultra 512GB', soldQty: 6, revenue: 179940000 },
    ];
  }

  static getLowStockAlerts() {
    const products = ProductService.getAllProducts();
    return products.filter((p) => p.stockQuantity <= p.minStock);
  }
}
