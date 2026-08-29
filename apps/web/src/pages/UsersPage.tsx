import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useBranchStore } from '../store/branchStore';
import { 
  UserPlus, 
  Shield, 
  Mail, 
  Phone, 
  Building2, 
  UserCheck, 
  Lock, 
  Key, 
  X, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  Eye, 
  EyeOff, 
  Upload, 
  HelpCircle, 
  ShieldAlert, 
  RotateCcw, 
  Calendar, 
  CreditCard, 
  Users,
  Copy,
  RefreshCw,
  Sparkles,
  Store
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
];

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const { branches, fetchBranches } = useBranchStore();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'BASIC' | 'ROLE' | 'DETAIL'>('BASIC');
  const [detailTab, setDetailTab] = useState<'ROLE' | 'INFO' | 'BRANCH'>('ROLE');

  // Reset Password Modal State
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<any | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('123456');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Form Fields
  const [employeeCode, setEmployeeCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'CASHIER' | 'WAREHOUSE' | 'SALE'>('CASHIER');
  const [workStatus, setWorkStatus] = useState<'CHINH_THUC' | 'THU_VIEC' | 'NGHI_VIEC' | 'TAM_NGHI'>('CHINH_THUC');
  const [allowSoftwareAccess, setAllowSoftwareAccess] = useState(true);
  const [password, setPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [idCardNumber, setIdCardNumber] = useState('');
  const [idCardIssueDate, setIdCardIssueDate] = useState('');
  const [idCardIssuePlace, setIdCardIssuePlace] = useState('Cục CSQLHC về TTXH');
  const [birthday, setBirthday] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<'DOC_THAN' | 'DA_KET_HON'>('DOC_THAN');
  const [gender, setGender] = useState<'NAM' | 'NU'>('NAM');
  const [branchId, setBranchId] = useState('');
  const [branchName, setBranchName] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchUsers = async () => {
    try {
      const res: any = await api.get('/users');
      const staffList = res.data || [];
      setUsers(staffList);
      if (staffList.length > 0 && !selectedUser) {
        setSelectedUser(staffList[0]);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  const resetForm = () => {
    const nextCode = `NV${String(users.length + 1).padStart(3, '0')}`;
    setEmployeeCode(nextCode);
    setFullName('');
    setEmail('');
    setPhone('');
    setAvatar(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)]);
    setRole('CASHIER');
    setWorkStatus('CHINH_THUC');
    setAllowSoftwareAccess(true);
    setPassword('123456');
    setConfirmPassword('123456');
    setShowPassword(false);
    setIdCardNumber('');
    setIdCardIssueDate('');
    setIdCardIssuePlace('Cục CSQLHC về TTXH');
    setBirthday('1998-01-01');
    setMaritalStatus('DOC_THAN');
    setGender('NAM');
    const firstBranch = branches[0];
    setBranchId(firstBranch?.id || '');
    setBranchName(firstBranch ? firstBranch.name : '');
    setEditingUserId(null);
    setModalTab('BASIC');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: any) => {
    setEditingUserId(u.id);
    setEmployeeCode(u.employeeCode || u.username || '');
    setFullName(u.fullName || '');
    setEmail(u.email || '');
    setPhone(u.phone || '');
    setAvatar(u.avatar || PRESET_AVATARS[0]);
    setRole(u.role || 'CASHIER');
    setWorkStatus(u.workStatus || 'CHINH_THUC');
    setAllowSoftwareAccess(u.allowSoftwareAccess !== false);
    setPassword('');
    setConfirmPassword('');
    setIdCardNumber(u.idCardNumber || '');
    setIdCardIssueDate(u.idCardIssueDate || '');
    setIdCardIssuePlace(u.idCardIssuePlace || 'Cục CSQLHC về TTXH');
    setBirthday(u.birthday || '');
    setMaritalStatus(u.maritalStatus || 'DOC_THAN');
    setGender(u.gender || 'NAM');
    const matchedBranch = branches.find((b) => b.id === u.branchId || b.name === u.branchName || (u.branchName && u.branchName.includes(b.name)));
    setBranchId(matchedBranch ? matchedBranch.id : (u.branchId || branches[0]?.id || ''));
    setBranchName(u.branchName || (matchedBranch ? matchedBranch.name : (branches[0]?.name || '')));
    setModalTab('BASIC');
    setIsModalOpen(true);
  };

  const handleOpenResetPassModal = (u: any) => {
    setResetTargetUser(u);
    setNewResetPassword('123456');
    setShowResetPassword(false);
    setIsResetPassModalOpen(true);
  };

  const handleSaveResetPassword = async () => {
    if (!resetTargetUser) return;
    if (!newResetPassword || newResetPassword.trim().length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await api.post(`/users/${resetTargetUser.id}/reset-password`, {
        password: newResetPassword.trim(),
      });
      showToast(`Đã đổi mật khẩu thành công cho nhân viên "${resetTargetUser.fullName}"!`);
      setIsResetPassModalOpen(false);
      setResetTargetUser(null);
    } catch (err: any) {
      alert(err.message || 'Lỗi đặt lại mật khẩu');
    }
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Dung lượng ảnh phải nhỏ hơn 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUser = async (keepOpen: boolean = false) => {
    if (!fullName.trim()) {
      alert('Vui lòng nhập Tên nhân viên');
      return;
    }
    if (!employeeCode.trim()) {
      alert('Vui lòng nhập Mã nhân viên');
      return;
    }
    if (allowSoftwareAccess && password && password !== confirmPassword) {
      alert('Mật khẩu và xác nhận mật khẩu không khớp!');
      return;
    }

    const payload: any = {
      employeeCode: employeeCode.trim(),
      username: employeeCode.trim().toLowerCase(),
      password: password ? password.trim() : undefined,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatar,
      role,
      workStatus,
      allowSoftwareAccess,
      idCardNumber,
      idCardIssueDate,
      idCardIssuePlace,
      birthday,
      maritalStatus,
      gender,
      branchId: branchId || branches[0]?.id,
      branchName: branchName || branches[0]?.name || 'Chi nhánh mặc định',
    };

    try {
      if (editingUserId) {
        await api.put(`/users/${editingUserId}`, payload);
        showToast('Cập nhật thông tin nhân viên thành công!');
      } else {
        await api.post('/users', payload);
        showToast('Thêm mới nhân viên và cấp tài khoản thành công!');
      }

      fetchUsers();

      if (keepOpen) {
        resetForm();
      } else {
        setIsModalOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu nhân viên');
    }
  };

  const handleDeleteUser = async (u: any) => {
    if (u.role === 'ADMIN' && users.filter((x) => x.role === 'ADMIN').length <= 1) {
      alert('Không thể xóa tài khoản Quản trị viên duy nhất của hệ thống!');
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa nhân viên "${u.fullName}" (${u.employeeCode || u.username})?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      showToast('Đã xóa nhân viên!');
      if (selectedUser?.id === u.id) setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa nhân viên');
    }
  };

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'ADMIN':
        return { label: 'Quản trị viên', badge: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'MANAGER':
        return { label: 'Quản lý cửa hàng', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 'CASHIER':
        return { label: 'Thu ngân', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'WAREHOUSE':
        return { label: 'Quản lý kho', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'SALE':
        return { label: 'Nhân viên bán hàng', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      default:
        return { label: r, badge: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const getBranchBadge = (branchNameStr?: string, branchIdStr?: string) => {
    const found = branches.find((b) => b.id === branchIdStr || b.name === branchNameStr || (branchNameStr && branchNameStr.includes(b.name)));
    const displayName = found ? `${found.name}` : (branchNameStr || 'Chi nhánh mặc định');
    const isWarehouse = found?.isCentralWarehouse || displayName.includes('Kho') || displayName.includes('KHO');

    if (isWarehouse) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 text-xs">
          <Store className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{displayName}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 font-bold border border-blue-500/30 text-xs">
        <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span>{displayName}</span>
      </span>
    );
  };

  const getStatusLabel = (st: string) => {
    switch (st) {
      case 'CHINH_THUC':
        return <span className="text-emerald-400 font-semibold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Chính thức</span>;
      case 'THU_VIEC':
        return <span className="text-amber-400 font-semibold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Thử việc</span>;
      case 'TAM_NGHI':
        return <span className="text-slate-400 font-semibold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Tạm nghỉ</span>;
      case 'NGHI_VIEC':
        return <span className="text-red-400 font-semibold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>Nghỉ việc</span>;
      default:
        return <span className="text-slate-300">Chính thức</span>;
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = 
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.employeeCode && u.employeeCode.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q));

    const matchesBranch = 
      branchFilter === 'ALL' ||
      u.branchId === branchFilter ||
      u.branchName === branchFilter ||
      (u.branchName && branches.find(b => b.id === branchFilter)?.name && u.branchName.includes(branches.find(b => b.id === branchFilter)!.name));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || (u.workStatus || 'CHINH_THUC') === statusFilter;

    return matchesQuery && matchesBranch && matchesRole && matchesStatus;
  });

  return (
    <div className="p-3 sm:p-6 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col space-y-4 max-w-7xl mx-auto w-full">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300 font-bold text-xs">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Toolbar (MISA style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span>Quản Lý Nhân Viên</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Quản lý hồ sơ nhân viên, phân bổ chi nhánh, cấp tài khoản & mật khẩu đăng nhập hệ thống
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Thêm mới</span>
            </button>

            <button
              onClick={() => {
                if (selectedUser) handleOpenEditModal(selectedUser);
                else alert('Vui lòng chọn 1 nhân viên trên bảng để sửa');
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Sửa</span>
            </button>

            <button
              onClick={() => {
                if (selectedUser) handleOpenResetPassModal(selectedUser);
                else alert('Vui lòng chọn 1 nhân viên trên bảng để đổi mật khẩu');
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-amber-600 text-amber-300 hover:text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all"
              title="Đặt lại mật khẩu cho nhân viên"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Đổi Mật Khẩu</span>
            </button>

            <button
              onClick={() => {
                if (selectedUser) handleDeleteUser(selectedUser);
                else alert('Vui lòng chọn 1 nhân viên để xóa');
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa</span>
            </button>

            <button
              onClick={fetchUsers}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700"
              title="Nạp lại danh sách"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Nạp</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Mã NV, Tên đăng nhập, Họ tên, SĐT, Email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Dropdown Lọc Theo Chi Nhánh */}
        <div className="sm:col-span-3">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-blue-400"
          >
            <option value="ALL">🏬 Tất cả chi nhánh (Toàn chuỗi)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.isCentralWarehouse ? '📦' : '🏬'} {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Lọc Theo Vai Trò */}
        <div className="sm:col-span-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên (Admin)</option>
            <option value="MANAGER">Quản lý cửa hàng</option>
            <option value="CASHIER">Thu ngân</option>
            <option value="WAREHOUSE">Quản lý kho</option>
            <option value="SALE">Tư vấn bán hàng</option>
          </select>
        </div>

        {/* Dropdown Lọc Theo Trạng Thái */}
        <div className="sm:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="CHINH_THUC">Chính thức</option>
            <option value="THU_VIEC">Thử việc</option>
            <option value="TAM_NGHI">Tạm nghỉ</option>
            <option value="NGHI_VIEC">Nghỉ việc</option>
          </select>
        </div>
      </div>

      {/* Main Employee Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden flex-1 flex flex-col shadow-xl">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="p-3 w-10 text-center"></th>
                <th className="p-3">Mã NV / Đăng nhập</th>
                <th className="p-3">Tên nhân viên</th>
                <th className="p-3">Chi nhánh trực thuộc</th>
                <th className="p-3">Số điện thoại</th>
                <th className="p-3">Vai trò</th>
                <th className="p-3">Trạng thái làm việc</th>
                <th className="p-3 text-center">Quyền Đăng Nhập</th>
                {isAdmin && <th className="p-3 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                const roleInfo = getRoleLabel(u.role);
                return (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-600/15 border-l-4 border-l-blue-500' : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="radio"
                        name="selectedStaff"
                        checked={isSelected}
                        onChange={() => setSelectedUser(u)}
                        className="w-3.5 h-3.5 text-blue-600 bg-slate-900 border-slate-700"
                      />
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-400">
                      <div>{u.employeeCode || u.username}</div>
                      <div className="text-[10px] text-slate-500 font-normal">user: {u.username}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar || PRESET_AVATARS[0]}
                          alt={u.fullName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
                          onError={(e) => {
                            (e.target as any).src = PRESET_AVATARS[0];
                          }}
                        />
                        <span className="font-bold text-white text-sm whitespace-nowrap">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {getBranchBadge(u.branchName, u.branchId)}
                    </td>
                    <td className="p-3 text-slate-300 font-mono font-semibold">{u.phone || '---'}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${roleInfo.badge}`}>
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">{getStatusLabel(u.workStatus || 'CHINH_THUC')}</td>
                    <td className="p-3 text-center whitespace-nowrap">
                      {u.allowSoftwareAccess !== false ? (
                        <span className="text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          ✓ Đang mở
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium text-[11px] bg-slate-800 px-2 py-0.5 rounded">
                          ✕ Khóa
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenResetPassModal(u)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 text-amber-300 hover:text-white transition-all"
                            title="Đặt lại mật khẩu cho nhân viên"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-all"
                            title="Sửa nhân viên"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition-all"
                            title="Xóa nhân viên"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Detail View Drawer */}
        {selectedUser && (
          <div className="border-t border-slate-800 bg-slate-900/90 p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold">
              <button
                onClick={() => setDetailTab('ROLE')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  detailTab === 'ROLE' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tài khoản & Vai trò
              </button>
              <button
                onClick={() => setDetailTab('INFO')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  detailTab === 'INFO' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Thông tin liên hệ & CCCD / Ngày sinh
              </button>
              <button
                onClick={() => setDetailTab('BRANCH')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  detailTab === 'BRANCH' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Chi nhánh & Hệ thống
              </button>
            </div>

            {detailTab === 'ROLE' && (
              <div className="text-xs space-y-2">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <span className="text-slate-400">Tên đăng nhập hệ thống:</span>{' '}
                    <span className="font-mono font-bold text-blue-400">{selectedUser.username}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Mã nhân viên:</span>{' '}
                    <span className="font-mono font-bold text-amber-400">{selectedUser.employeeCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Tên vai trò:</span>{' '}
                    <span className="font-bold text-white">{getRoleLabel(selectedUser.role).label}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Chi nhánh:</span>{' '}
                    <span className="font-bold text-emerald-400">{selectedUser.branchName || branches[0]?.name || 'Chi nhánh mặc định'}</span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenResetPassModal(selectedUser)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Cấp lại mật khẩu</span>
                    </button>
                  )}
                </div>
                <div className="text-slate-400">
                  Mô tả quyền hạn: {
                    selectedUser.role === 'ADMIN' ? 'Toàn quyền cấu hình hệ thống, quản lý tài chính, giá nhập và phân quyền nhân sự.' :
                    selectedUser.role === 'MANAGER' ? 'Quản lý kho, phê duyệt giảm giá bán lẻ, theo dõi doanh thu chi nhánh.' :
                    selectedUser.role === 'CASHIER' ? 'Tư vấn bán hàng, thu tiền tại quầy POS, quản lý quỹ tiền và in hóa đơn (Ẩn giá vốn).' :
                    'Quản lý nhập kho, kiểm kê hàng hóa và xuất chuyển kho nội bộ.'
                  }
                </div>
              </div>
            )}

            {detailTab === 'INFO' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Ngày sinh:</span>
                  <span className="font-mono font-bold text-slate-200">{selectedUser.birthday || 'Chưa cập nhật'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Số CMND/CCCD:</span>
                  <span className="font-mono font-bold text-slate-200">{selectedUser.idCardNumber || 'Chưa cập nhật'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ngày cấp / Nơi cấp:</span>
                  <span className="text-slate-200">{selectedUser.idCardIssueDate || '--'} ({selectedUser.idCardIssuePlace || '--'})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Giới tính / Hôn nhân:</span>
                  <span className="text-slate-200">{selectedUser.gender === 'NAM' ? 'Nam' : 'Nữ'} / {selectedUser.maritalStatus === 'DA_KET_HON' ? 'Đã kết hôn' : 'Độc thân'}</span>
                </div>
              </div>
            )}

            {detailTab === 'BRANCH' && (
              <div className="text-xs flex items-center gap-6">
                <div>
                  <span className="text-slate-500 block">Chi nhánh trực thuộc:</span>
                  <span className="font-bold text-emerald-400">{selectedUser.branchName || branches[0]?.name || 'Chi nhánh mặc định'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ngày tạo hồ sơ:</span>
                  <span className="font-mono text-slate-300">{new Date(selectedUser.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL THÊM / SỬA NHÂN VIÊN (MISA eShop) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h2 className="font-bold text-base sm:text-lg text-white">
                {editingUserId ? 'Chỉnh sửa Thông tin Nhân viên' : 'Thêm mới Nhân viên & Cấp Tài Khoản'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setModalTab('BASIC')}
                className={`px-4 py-2 border-b-2 transition-all whitespace-nowrap ${
                  modalTab === 'BASIC'
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Thông tin cơ bản & Chi nhánh
              </button>
              <button
                onClick={() => setModalTab('ROLE')}
                className={`px-4 py-2 border-b-2 transition-all whitespace-nowrap ${
                  modalTab === 'ROLE'
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Vai trò & Quyền hạn
              </button>
              <button
                onClick={() => setModalTab('DETAIL')}
                className={`px-4 py-2 border-b-2 transition-all whitespace-nowrap ${
                  modalTab === 'DETAIL'
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                3. CMND / CCCD & Nhân thân
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* TAB 1: THÔNG TIN CƠ BẢN & CHI NHÁNH */}
              {modalTab === 'BASIC' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Form Fields */}
                  <div className="lg:col-span-8 space-y-3.5">
                    {/* Row: Mã nhân viên */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <label className="sm:col-span-4 text-slate-300 font-semibold">
                        Mã nhân viên / Login <span className="text-red-400">*</span>
                      </label>
                      <div className="sm:col-span-8">
                        <input
                          type="text"
                          required
                          value={employeeCode}
                          onChange={(e) => setEmployeeCode(e.target.value)}
                          placeholder="VD: NVA, NV001..."
                          className="w-full px-3 py-2 rounded-xl glass-input font-bold font-mono text-white text-xs"
                        />
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Dùng mã nhân viên, username hoặc SĐT để đăng nhập vào hệ thống
                        </p>
                      </div>
                    </div>

                    {/* Row: Tên nhân viên */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <label className="sm:col-span-4 text-slate-300 font-semibold">
                        Tên nhân viên <span className="text-red-400">*</span>
                      </label>
                      <div className="sm:col-span-8">
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="VD: Nguyễn Văn A"
                          className="w-full px-3 py-2 rounded-xl glass-input font-bold text-white text-sm"
                        />
                      </div>
                    </div>

                    {/* Row: Chi nhánh làm việc (MỚI ĐƯA LÊN TAB 1) */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <label className="sm:col-span-4 text-slate-300 font-semibold flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Chi nhánh làm việc <span className="text-red-400">*</span></span>
                      </label>
                      <div className="sm:col-span-8">
                        <select
                          value={branchId || branches.find((b) => b.name === branchName)?.id || branches[0]?.id || ''}
                          onChange={(e) => {
                            const bId = e.target.value;
                            setBranchId(bId);
                            const found = branches.find((b) => b.id === bId);
                            if (found) {
                              setBranchName(found.name);
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-blue-500/40 text-blue-300 text-xs font-bold"
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.isCentralWarehouse ? '📦' : '🏬'} {b.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Row: Email & SĐT */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@cuahang.vn"
                          className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Số ĐT di động</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0564313451"
                          className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Row: Trạng thái làm việc */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <label className="sm:col-span-4 text-slate-300 font-semibold">Trạng thái làm việc</label>
                      <div className="sm:col-span-8">
                        <select
                          value={workStatus}
                          onChange={(e) => setWorkStatus(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                        >
                          <option value="CHINH_THUC">Chính thức</option>
                          <option value="THU_VIEC">Thử việc</option>
                          <option value="TAM_NGHI">Tạm nghỉ</option>
                          <option value="NGHI_VIEC">Nghỉ việc</option>
                        </select>
                      </div>
                    </div>

                    {/* Row: Cho phép làm việc với phần mềm */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowSoftwareAccess}
                          onChange={(e) => setAllowSoftwareAccess(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                        />
                        <span className="font-bold text-blue-300 text-xs">Cho phép đăng nhập làm việc với phần mềm</span>
                      </label>
                    </div>

                    {/* Software Password Inputs (when enabled) */}
                    {allowSoftwareAccess && (
                      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-blue-500/30 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-blue-300 flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-blue-400" />
                            <span>Mật khẩu Đăng Nhập Hệ Thống</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {editingUserId ? '(Để trống nếu giữ nguyên)' : '(Mặc định: 123456)'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-300 font-semibold mb-1">
                              Mật khẩu {!editingUserId && <span className="text-red-400">*</span>}
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={editingUserId ? 'Để trống nếu không đổi' : 'Nhập mật khẩu...'}
                                className="w-full pr-8 pl-3 py-2 rounded-xl glass-input text-xs font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                              >
                                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            {password && (
                              <div className="mt-1 flex items-center gap-1.5">
                                <span className={`text-[10px] font-bold ${password.length < 6 ? 'text-red-400' : password.length < 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                  {password.length < 6 ? 'Bảo mật yếu' : password.length < 10 ? 'Bảo mật trung bình' : 'Bảo mật an toàn'}
                                </span>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-slate-300 font-semibold mb-1">
                              Xác nhận MK {!editingUserId && <span className="text-red-400">*</span>}
                            </label>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder={editingUserId ? 'Để trống nếu không đổi' : 'Nhập lại mật khẩu...'}
                              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Avatar Upload Box */}
                  <div className="lg:col-span-4 space-y-3">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="text-slate-300 font-semibold text-xs">Ảnh nhân viên</div>
                      
                      <div className="relative group/avatar">
                        <img
                          src={avatar || PRESET_AVATARS[0]}
                          alt="Avatar Preview"
                          className="w-32 h-32 rounded-2xl object-cover border-2 border-dashed border-slate-600 shadow-md bg-slate-900"
                          onError={(e) => {
                            (e.target as any).src = PRESET_AVATARS[0];
                          }}
                        />
                        <label className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity">
                          <Upload className="w-6 h-6 mb-1" />
                          <span className="text-[10px] font-bold">Đổi ảnh</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarFileSelect}
                          />
                        </label>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-tight">
                        Định dạng ảnh (.jpg, .jpeg, .png, .gif) và dung lượng &lt; 5MB
                      </p>

                      {/* Preset Avatar Selection */}
                      <div className="w-full pt-2 border-t border-slate-800">
                        <div className="text-[10px] text-slate-400 font-medium mb-1.5">Ảnh gợi ý:</div>
                        <div className="flex justify-center gap-1.5">
                          {PRESET_AVATARS.map((preset, idx) => (
                            <img
                              key={idx}
                              src={preset}
                              alt="preset"
                              onClick={() => setAvatar(preset)}
                              className={`w-7 h-7 rounded-full object-cover cursor-pointer transition-all ${
                                avatar === preset ? 'ring-2 ring-blue-500 scale-110' : 'opacity-70 hover:opacity-100'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VAI TRÒ & PHÂN QUYỀN */}
              {modalTab === 'ROLE' && (
                <div className="space-y-3">
                  <div className="text-slate-300 font-semibold mb-2">Chọn vai trò quyền hạn cho nhân viên:</div>

                  {[
                    {
                      id: 'ADMIN',
                      name: 'Quản trị viên (Admin)',
                      desc: 'Toàn quyền tối cao: Quản lý thiết lập hệ thống, xem giá vốn, phân quyền, cấu hình cửa hàng.',
                      color: 'border-red-500/50 bg-red-500/10 text-red-400',
                    },
                    {
                      id: 'MANAGER',
                      name: 'Quản lý cửa hàng (Manager)',
                      desc: 'Quản lý danh mục hàng hóa, duyệt chiết khấu bán lẻ, xem báo cáo doanh thu chi nhánh.',
                      color: 'border-purple-500/50 bg-purple-500/10 text-purple-400',
                    },
                    {
                      id: 'CASHIER',
                      name: 'Thu ngân (Cashier)',
                      desc: 'Chuyên bán hàng tại quầy POS, in bill, thu tiền khách. Ẩn hoàn toàn giá nhập/lợi nhuận, không thể sửa danh mục.',
                      color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
                    },
                    {
                      id: 'WAREHOUSE',
                      name: 'Quản lý kho (Warehouse)',
                      desc: 'Quản lý nhập xuất tồn, kiểm kê, điều chuyển kho. Không có quyền bán hàng tại POS.',
                      color: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
                    },
                    {
                      id: 'SALE',
                      name: 'Nhân viên bán hàng (Sale)',
                      desc: 'Tư vấn sản phẩm, tạo đơn hàng đặt trước cho khách.',
                      color: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
                    },
                  ].map((r) => (
                    <label
                      key={r.id}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        role === r.id ? `${r.color} shadow-md` : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900'
                      }`}
                    >
                      <input
                        type="radio"
                        name="staffRole"
                        checked={role === r.id}
                        onChange={() => setRole(r.id as any)}
                        className="mt-0.5 w-4 h-4 text-blue-600 bg-slate-900 border-slate-700"
                      />
                      <div>
                        <div className="font-bold text-white text-sm">{r.name}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{r.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* TAB 3: CMND / CCCD & NHÂN THÂN */}
              {modalTab === 'DETAIL' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Số CMND / CCCD</label>
                      <input
                        type="text"
                        value={idCardNumber}
                        onChange={(e) => setIdCardNumber(e.target.value)}
                        placeholder="07909..."
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Ngày cấp</label>
                      <input
                        type="date"
                        value={idCardIssueDate}
                        onChange={(e) => setIdCardIssueDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Nơi cấp CMND</label>
                      <input
                        type="text"
                        value={idCardIssuePlace}
                        onChange={(e) => setIdCardIssuePlace(e.target.value)}
                        placeholder="Cục CSQLHC về TTXH"
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Ngày sinh</label>
                      <input
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Tình trạng hôn nhân</label>
                      <div className="flex items-center gap-4 pt-1">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="marital"
                            checked={maritalStatus === 'DOC_THAN'}
                            onChange={() => setMaritalStatus('DOC_THAN')}
                            className="text-blue-600 bg-slate-900 border-slate-700"
                          />
                          <span className="text-slate-300 text-xs">Độc thân</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="marital"
                            checked={maritalStatus === 'DA_KET_HON'}
                            onChange={() => setMaritalStatus('DA_KET_HON')}
                            className="text-blue-600 bg-slate-900 border-slate-700"
                          />
                          <span className="text-slate-300 text-xs">Đã kết hôn</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Giới tính</label>
                      <div className="flex items-center gap-4 pt-1">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            checked={gender === 'NAM'}
                            onChange={() => setGender('NAM')}
                            className="text-blue-600 bg-slate-900 border-slate-700"
                          />
                          <span className="text-slate-300 text-xs">Nam</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            checked={gender === 'NU'}
                            onChange={() => setGender('NU')}
                            className="text-blue-600 bg-slate-900 border-slate-700"
                          />
                          <span className="text-slate-300 text-xs">Nữ</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <HelpCircle className="w-4 h-4" />
                <span>Trợ giúp</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveUser(false)}
                  className="px-5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-700/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu</span>
                </button>

                {!editingUserId && (
                  <button
                    type="button"
                    onClick={() => handleSaveUser(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
                  >
                    <span>+ Lưu và thêm mới</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Hủy bỏ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ĐẶT LẠI MẬT KHẨU (RESET PASSWORD MODAL) --- */}
      {isResetPassModalOpen && resetTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Cấp Lại Mật Khẩu Đăng Nhập</h3>
              </div>
              <button
                onClick={() => setIsResetPassModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Employee Summary Card */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <img
                  src={resetTargetUser.avatar || PRESET_AVATARS[0]}
                  alt={resetTargetUser.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <div className="font-bold text-white text-sm">{resetTargetUser.fullName}</div>
                  <div className="text-slate-400 text-[11px] font-mono">
                    Mã NV: <span className="text-blue-400 font-bold">{resetTargetUser.employeeCode}</span> • Username: <span className="text-amber-400 font-bold">{resetTargetUser.username}</span>
                  </div>
                  <div className="text-emerald-400 text-[10px] mt-0.5">
                    {resetTargetUser.branchName || branches[0]?.name || 'Chi nhánh mặc định'}
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold">
                  Mật khẩu mới <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl glass-input text-xs font-mono font-bold text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Gợi ý mật khẩu nhanh:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewResetPassword('123456')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] border border-slate-700"
                  >
                    ⚡ 123456
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewResetPassword(`Pass@${Math.floor(1000 + Math.random() * 9000)}`)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 font-mono text-[11px] border border-slate-700 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Tạo ngẫu nhiên</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
                Sau khi đổi mật khẩu, nhân viên có thể sử dụng <strong>Mã NV ({resetTargetUser.employeeCode})</strong> hoặc <strong>Username ({resetTargetUser.username})</strong> kèm mật khẩu mới này để đăng nhập.
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsResetPassModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveResetPassword}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Xác Nhận Đổi Mật Khẩu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
