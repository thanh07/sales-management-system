import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useBranchStore, Branch } from '../store/branchStore';
import { useAuthStore } from '../store/authStore';
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  Phone,
  MapPin,
  User,
  Package,
  CheckCircle2,
  XCircle,
  X,
  Check,
  RefreshCw,
  Search,
  Store,
  Layers,
  Sparkles
} from 'lucide-react';

const VIETNAM_PROVINCES_34 = [
  'Đồng Tháp',
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Dương',
  'Bình Thuận',
  'Cà Mau',
  'Đắk Lắk',
  'Đồng Nai',
  'Gia Lai',
  'Hải Dương',
  'Khánh Hòa',
  'Kiên Giang',
  'Lâm Đồng',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Phú Thọ',
  'Quảng Nam',
  'Quảng Ninh',
  'Sóc Trăng',
  'Tây Ninh',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
];

const VIETNAM_DISTRICTS_DATA: Record<string, string[]> = {
  'Đồng Tháp': ['TP. Cao Lãnh', 'TP. Sa Đéc', 'TP. Hồng Ngự', 'Huyện Tháp Mười', 'Huyện Lấp Vò', 'Huyện Cao Lãnh', 'Huyện Châu Thành', 'Huyện Lai Vung', 'Huyện Thanh Bình', 'Huyện Tân Hồng', 'Huyện Tam Nông'],
  'TP. Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12', 'TP. Thủ Đức', 'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Tân Bình', 'Quận Tân Phú', 'Quận Phú Nhuận', 'Huyện Bình Chánh', 'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Nhà Bè'],
  'Hà Nội': ['Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Tây Hồ', 'Quận Long Biên', 'Quận Cầu Giấy', 'Quận Đống Đa', 'Quận Hai Bà Trưng', 'Quận Hoàng Mai', 'Quận Thanh Xuân', 'Quận Hà Đông', 'Quận Nam Từ Liêm', 'Quận Bắc Từ Liêm', 'Thị xã Sơn Tây', 'Huyện Đông Anh', 'Huyện Gia Lâm', 'Huyện Hoài Đức', 'Huyện Thanh Trì'],
  'Đà Nẵng': ['Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn', 'Quận Liên Chiểu', 'Quận Cẩm Lệ', 'Huyện Hòa Vàng'],
  'Hải Phòng': ['Quận Hồng Bàng', 'Quận Ngô Quyền', 'Quận Lê Chân', 'Quận Hải An', 'Quận Kiến An', 'Quận Đồ Sơn', 'Quận Dương Kinh', 'TP. Thủy Nguyên'],
  'Cần Thơ': ['Quận Ninh Kiều', 'Quận Bình Thủy', 'Quận Cái Răng', 'Quận Ô Môn', 'Quận Thốt Nốt', 'Huyện Phong Điền'],
  'An Giang': ['TP. Long Xuyên', 'TP. Châu Đốc', 'Thị xã Tân Châu', 'Huyện Thoại Sơn', 'Huyện Chợ Mới'],
  'Bình Dương': ['TP. Thủ Dầu Một', 'TP. Dĩ An', 'TP. Thuận An', 'TP. Tân Uyên', 'TP. Bến Cát', 'Huyện Bàu Bàng'],
  'Đồng Nai': ['TP. Biên Hòa', 'TP. Long Khánh', 'Huyện Nhơn Trạch', 'Huyện Trảng Bom', 'Huyện Vĩnh Cửu'],
  'Lâm Đồng': ['TP. Đà Lạt', 'TP. Bảo Lộc', 'Huyện Đức Trọng', 'Huyện Đơn Dương', 'Huyện Lạc Dương'],
};

const VIETNAM_WARDS_DATA: Record<string, string[]> = {
  'TP. Cao Lãnh': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 6', 'Phường 11', 'Phường Hòa Thuận', 'Phường Mỹ Phú', 'Phường Tân Quy Đông'],
  'TP. Sa Đéc': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường An Hòa', 'Phường Tân Quy Đông'],
  'TP. Hồng Ngự': ['Phường An Bình A', 'Phường An Bình B', 'Phường An Lạc', 'Phường An Lộc', 'Phường An Thạnh'],
  'Huyện Tháp Mười': ['Phường Mỹ An', 'Phường Đốc Binh Kiều', 'Phường Trường Xuân'],
  'Huyện Lấp Vò': ['Phường Lấp Vò', 'Phường Bình Thành', 'Phường Định Yên', 'Phường Tân Mỹ'],
  'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Cô Giang', 'Phường Đa Kao', 'Phường Tân Định', 'Phường Nguyễn Cư Trinh'],
  'Quận 7': ['Phường Tân Phong', 'Phường Tân Phú', 'Phường Tân Quy', 'Phường Tân Kiểng', 'Phường Bình Thuận', 'Phường Phú Mỹ', 'Phường Phú Thuận'],
  'TP. Thủ Đức': ['Phường Thảo Điền', 'Phường An Phú', 'Phường Bình Trưng Tây', 'Phường Hiệp Phú', 'Phường Linh Trung', 'Phường Tam Bình'],
  'Quận Ba Đình': ['Phường Điện Biên', 'Phường Đội Cấn', 'Phường Giảng Võ', 'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Ngọc Hà'],
  'Quận Hoàn Kiếm': ['Phường Cửa Đông', 'Phường Cửa Nam', 'Phường Hàng Bạc', 'Phường Hàng Bồ', 'Phường Tràng Tiền', 'Phường Hàng Đào'],
  'Quận Hải Châu': ['Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Thạch Thang', 'Phường Thanh Bình', 'Phường Thuận Phước', 'Phường Hòa Cường Bắc'],
  'Quận Ninh Kiều': ['Phường Tân An', 'Phường An Cư', 'Phường An Nghiệp', 'Phường An Hòa', 'Phường Cái Khế', 'Phường Hưng Lợi', 'Phường Xuân Khánh'],
  'TP. Long Xuyên': ['Phường Mỹ Bình', 'Phường Mỹ Long', 'Phường Mỹ Phước', 'Phường Mỹ Quý', 'Phường Mỹ Thới', 'Phường Bình Khánh'],
  'TP. Đà Lạt': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10'],
};

export const BranchesPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'ADMIN';

  const { branches, fetchBranches } = useBranchStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Đồng Tháp');
  const [district, setDistrict] = useState('TP. Cao Lãnh');
  const [ward, setWard] = useState('Phường 1');
  const [managerName, setManagerName] = useState('');
  const [isCentralWarehouse, setIsCentralWarehouse] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const districts = VIETNAM_DISTRICTS_DATA[newCity] || ['TP. Trung Tâm'];
    const defaultDistrict = districts[0];
    setDistrict(defaultDistrict);

    const wards = VIETNAM_WARDS_DATA[defaultDistrict] || ['Phường 1', 'Phường 2', 'Phường Trung Tâm'];
    setWard(wards[0]);
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const wards = VIETNAM_WARDS_DATA[newDistrict] || ['Phường 1', 'Phường 2', 'Phường Trung Tâm'];
    setWard(wards[0]);
  };

  const handleOpenAddModal = () => {
    setEditingBranch(null);
    setCode(`CN-0${branches.length + 1}`);
    setName('');
    setPhone('');
    setAddress('');
    setCity('Đồng Tháp');
    setDistrict('TP. Cao Lãnh');
    setWard('Phường 1');
    setManagerName('');
    setIsCentralWarehouse(false);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: Branch) => {
    setEditingBranch(b);
    setCode(b.code);
    setName(b.name);
    setPhone(b.phone);
    setAddress(b.address);

    const validCity = VIETNAM_PROVINCES_34.includes(b.city) ? b.city : 'Đồng Tháp';
    setCity(validCity);

    const districts = VIETNAM_DISTRICTS_DATA[validCity] || ['TP. Cao Lãnh'];
    const validDistrict = districts.includes(b.district) ? b.district : districts[0];
    setDistrict(validDistrict);

    const wards = VIETNAM_WARDS_DATA[validDistrict] || ['Phường 1', 'Phường 2'];
    setWard(wards[0]);

    setManagerName(b.managerName || '');
    setIsCentralWarehouse(!!b.isCentralWarehouse);
    setIsActive(b.isActive);
    setIsModalOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên chi nhánh');
      return;
    }
    if (!code.trim()) {
      alert('Vui lòng nhập mã chi nhánh');
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city,
      district: district.trim(),
      managerName: managerName.trim(),
      isCentralWarehouse,
      isActive,
    };

    try {
      if (editingBranch) {
        await api.put(`/branches/${editingBranch.id}`, payload);
        showToast('Cập nhật thông tin chi nhánh thành công!');
      } else {
        await api.post('/branches', payload);
        showToast('Tạo mới chi nhánh thành công!');
      }
      setIsModalOpen(false);
      fetchBranches();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu chi nhánh');
    }
  };

  const handleDeleteBranch = async (b: Branch) => {
    if (b.id === 'branch-01') {
      alert('Không thể xóa chi nhánh mặc định của chuỗi');
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa chi nhánh "${b.name}" (${b.code})?`)) return;

    try {
      await api.delete(`/branches/${b.id}`);
      showToast('Đã xóa chi nhánh thành công!');
      fetchBranches();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa chi nhánh');
    }
  };

  const filteredBranches = branches.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q) ||
      (b.managerName && b.managerName.toLowerCase().includes(q));

    const matchesType =
      filterType === 'ALL' ||
      (filterType === 'STORE' && !b.isCentralWarehouse) ||
      (filterType === 'WAREHOUSE' && b.isCentralWarehouse);

    return matchesSearch && matchesType;
  });

  return (
    <div className="p-4 sm:p-6 h-[calc(100vh-4rem)] overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300 font-bold text-xs">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-400" />
            <span>Quản Lý Danh Sách Chi Nhánh (Chuỗi Bán Lẻ)</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Thiết lập danh sách các chi nhánh cửa hàng, kho trung tâm, gán người quản lý và quản trị phân bổ tồn kho
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Chi Nhánh Mới</span>
            </button>
            <button
              onClick={fetchBranches}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
              title="Tải lại dữ liệu"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Tổng Số Chi Nhánh</span>
            <div className="text-2xl font-bold text-white mt-1">{branches.length} địa điểm</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Cửa Hàng Bán Lẻ Đang Hoạt Động</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {branches.filter((b) => !b.isCentralWarehouse && b.isActive).length} điểm bán
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Kho Trung Tâm / Kho Tổng</span>
            <div className="text-2xl font-bold text-purple-400 mt-1">
              {branches.filter((b) => b.isCentralWarehouse).length} kho tổng
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã chi nhánh, tên chi nhánh, địa chỉ, người quản lý..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200"
        >
          <option value="ALL">Tất cả loại hình</option>
          <option value="STORE">Cửa hàng bán lẻ</option>
          <option value="WAREHOUSE">Kho trung tâm</option>
        </select>
      </div>

      {/* Branch Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBranches.map((b) => (
          <div
            key={b.id}
            className={`glass-panel p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
              b.isCentralWarehouse
                ? 'border-purple-500/40 bg-purple-950/10'
                : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      b.isCentralWarehouse
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                        : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {b.isCentralWarehouse ? <Package className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      {b.code}
                    </span>
                    <h3 className="font-bold text-white text-sm mt-0.5">{b.name}</h3>
                  </div>
                </div>

                {b.isActive ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Hoạt động
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    Tạm dừng
                  </span>
                )}
              </div>

              {/* Info Rows */}
              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span className="text-slate-300 leading-tight">
                    {b.address}{b.district ? `, ${b.district}` : ''}{b.city ? `, ${b.city}` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-mono text-slate-300 font-semibold">{b.phone || 'Chưa có hotline'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-slate-400">
                    Quản lý: <span className="text-white font-semibold">{b.managerName || 'Chưa gán'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {isAdmin && (
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => handleOpenEditModal(b)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa</span>
                </button>
                {b.id !== 'branch-01' && (
                  <button
                    onClick={() => handleDeleteBranch(b)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition-all"
                    title="Xóa chi nhánh"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL THÊM / SỬA CHI NHÁNH */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span>{editingBranch ? 'Chỉnh Sửa Chi Nhánh' : 'Thêm Mới Chi Nhánh Cửa Hàng'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Mã chi nhánh <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="VD: CN-01, KHO-01..."
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono font-bold text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Số điện thoại Hotline <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0973634595"
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tên chi nhánh <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Chi nhánh Chợ Bến Thành (CN-01)"
                  className="w-full px-3 py-2 rounded-xl glass-input font-bold text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Địa chỉ chi tiết (Số nhà, tên đường, phường) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số 33 Đường Nguyễn Huệ, Phường Bến Nghé"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tỉnh / Thành phố <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                  >
                    {VIETNAM_PROVINCES_34.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Quận / Huyện / Thành Phố <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                  >
                    {(VIETNAM_DISTRICTS_DATA[city] || [district || 'TP. Trung Tâm']).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Phường <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                  >
                    {(VIETNAM_WARDS_DATA[district] || [ward || 'Phường 1', 'Phường 2', 'Phường Trung Tâm']).map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Địa chỉ chi tiết (Số nhà, tên đường) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="VD: Số 8 Đường Nguyễn Huệ, Khóm 1"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              {/* Live Address Preview Card */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Địa chỉ hiển thị trên hóa đơn in K80:</span>
                  <strong>{address || 'Số nhà, tên đường'}, {ward}, {district}, {city}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Họ tên Người quản lý chi nhánh</label>
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="VD: Trần Thu Trang"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              {/* Tùy chọn Kho tổng & Hoạt động */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCentralWarehouse}
                    onChange={(e) => setIsCentralWarehouse(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded bg-slate-900 border-slate-700"
                  />
                  <span className="font-semibold text-purple-300 text-xs">
                    Đặt làm Kho Tổng Trung Tâm (Trung tâm nhập hàng & phân phối chuỗi)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700"
                  />
                  <span className="font-semibold text-slate-300 text-xs">Đang hoạt động</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingBranch ? 'Lưu Cập Nhật' : 'Tạo Chi Nhánh'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchesPage;
