import { create } from 'zustand';
import api from '../services/api';

export interface Branch {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  managerName?: string;
  isCentralWarehouse?: boolean;
  isActive: boolean;
  createdAt: string;
}

interface BranchState {
  branches: Branch[];
  selectedBranchId: string; // 'branch-01' or 'ALL'
  isLoading: boolean;
  fetchBranches: () => Promise<void>;
  setSelectedBranchId: (id: string) => void;
  getSelectedBranch: () => Branch | undefined;
}

export const useBranchStore = create<BranchState>((set, get) => ({
  branches: [
    {
      id: 'branch-01',
      code: 'CN-01',
      name: 'Chi nhánh Chợ Bến Thành (CN-01)',
      phone: '0973634595',
      address: 'Số 33 Đường Nguyễn Huệ, Phường Bến Nghé',
      city: 'Hồ Chí Minh',
      district: 'Quận 1',
      managerName: 'Trần Thu Trang',
      isCentralWarehouse: false,
      isActive: true,
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'branch-02',
      code: 'CN-02',
      name: 'Chi nhánh Quận 7 (CN-02)',
      phone: '0988112233',
      address: 'Số 105 Đường Nguyễn Thị Thập, Phường Tân Phú',
      city: 'Hồ Chí Minh',
      district: 'Quận 7',
      managerName: 'Nguyễn Văn Nam',
      isCentralWarehouse: false,
      isActive: true,
      createdAt: '2026-02-15T09:00:00Z',
    },
    {
      id: 'branch-03',
      code: 'KHO-01',
      name: 'Kho Tổng Trung Tâm TP.HCM (KHO-01)',
      phone: '0909123456',
      address: 'Số 450 Quốc Lộ 1A, Phường Bình Trị Đông B',
      city: 'Hồ Chí Minh',
      district: 'Bình Tân',
      managerName: 'Lê Huỳnh Công Trí',
      isCentralWarehouse: true,
      isActive: true,
      createdAt: '2026-01-01T08:00:00Z',
    },
  ],
  selectedBranchId: 'branch-01',
  isLoading: false,

  fetchBranches: async () => {
    set({ isLoading: true });
    try {
      const res: any = await api.get('/branches');
      if (res.data && Array.isArray(res.data)) {
        set({ branches: res.data });
      }
    } catch (err) {
      console.error('Fetch branches error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedBranchId: (id: string) => {
    set({ selectedBranchId: id });
  },

  getSelectedBranch: () => {
    const { branches, selectedBranchId } = get();
    return branches.find((b) => b.id === selectedBranchId) || branches[0];
  },
}));
