export interface Customer {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  group: 'RETAIL' | 'WHOLESALE' | 'VIP';
  rewardPoints: number;
  totalSpent: number;
  debtAmount: number;
  createdAt: string;
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust-01',
    code: 'KH-0001',
    fullName: 'Nguyễn Văn Hùng',
    phone: '0908123456',
    email: 'hung.nguyen@gmail.com',
    address: '45 Nguyễn Thị Minh Khai, Q.1, TP.HCM',
    group: 'VIP',
    rewardPoints: 1250,
    totalSpent: 125000000,
    debtAmount: 0,
    createdAt: '2026-01-15T08:30:00Z',
  },
  {
    id: 'cust-02',
    code: 'KH-0002',
    fullName: 'Trần Thị Thu Hà',
    phone: '0912987654',
    email: 'ha.tran@yahoo.com',
    address: '128 Điện Biên Phủ, Q.3, TP.HCM',
    group: 'RETAIL',
    rewardPoints: 340,
    totalSpent: 34000000,
    debtAmount: 2500000, // Đang nợ
    createdAt: '2026-03-20T10:15:00Z',
  },
  {
    id: 'cust-03',
    code: 'KH-0003',
    fullName: 'Công ty TNHH Giải Pháp Công Nghệ Việt',
    phone: '02838229999',
    email: 'contact@viettech.vn',
    address: 'Tòa nhà Bitexco, Q.1, TP.HCM',
    group: 'WHOLESALE',
    rewardPoints: 3800,
    totalSpent: 380000000,
    debtAmount: 15000000,
    createdAt: '2026-02-01T14:00:00Z',
  },
  {
    id: 'cust-04',
    code: 'KH-0004',
    fullName: 'Lê Hoàng Nam',
    phone: '0988776655',
    email: 'nam.le@hotmail.com',
    address: '78 Cách Mạng Tháng 8, Q.10, TP.HCM',
    group: 'RETAIL',
    rewardPoints: 85,
    totalSpent: 8500000,
    debtAmount: 0,
    createdAt: '2026-06-10T11:45:00Z',
  },
];

export class CustomerService {
  static getCustomers(query?: string, group?: string) {
    let list = [...MOCK_CUSTOMERS];

    if (group && group !== 'Tất cả') {
      list = list.filter((c) => c.group === group);
    }

    if (query) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.code.toLowerCase().includes(q)
      );
    }

    return list;
  }

  static getCustomerById(id: string) {
    const cust = MOCK_CUSTOMERS.find((c) => c.id === id);
    if (!cust) throw new Error('Không tìm thấy khách hàng');
    return cust;
  }

  static addCustomer(data: Omit<Customer, 'id' | 'code' | 'rewardPoints' | 'totalSpent' | 'debtAmount' | 'createdAt'>) {
    const newCust: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      code: `KH-${Math.floor(1000 + Math.random() * 9000)}`,
      rewardPoints: 0,
      totalSpent: 0,
      debtAmount: 0,
      createdAt: new Date().toISOString(),
    };
    MOCK_CUSTOMERS.unshift(newCust);
    return newCust;
  }

  // Pareto ABC Analysis (Top 20% spenders = Category A)
  static getAbcAnalysis() {
    const sorted = [...MOCK_CUSTOMERS].sort((a, b) => b.totalSpent - a.totalSpent);
    const totalRevenue = sorted.reduce((sum, c) => sum + c.totalSpent, 0);

    let cumulativeRevenue = 0;
    const result = sorted.map((c) => {
      cumulativeRevenue += c.totalSpent;
      const percentage = (cumulativeRevenue / (totalRevenue || 1)) * 100;
      let category = 'C';
      if (percentage <= 70) category = 'A (Khách hàng Trọng điểm 70% doanh thu)';
      else if (percentage <= 90) category = 'B (Khách hàng Tiềm năng 20% doanh thu)';

      return {
        ...c,
        abcCategory: category,
        revenueShare: ((c.totalSpent / (totalRevenue || 1)) * 100).toFixed(2) + '%',
      };
    });

    return { totalRevenue, customers: result };
  }
}
