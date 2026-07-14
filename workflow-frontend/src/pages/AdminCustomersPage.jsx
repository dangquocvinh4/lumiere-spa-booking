import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/UI';
import { Users, Mail, Phone, Calendar, Plus, X, Edit2, Trash2, Shield } from 'lucide-react';

export default function AdminCustomersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    role: 'ROLE_CUSTOMER',
    password: ''
  });

  const fetchUsers = async () => {
    try {
      // Auto-trigger database schema fix for payment_status type compatibility
      try {
        await api.get('/admin/customers/fix-db');
      } catch (err) {
        console.warn('Auto-fix DB schema warning:', err);
      }

      const res = await api.get('/admin/customers/');
      setUsers(res.data.data);
    } catch {
      setError('Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      role: 'ROLE_CUSTOMER',
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || '',
      phone: user.phone || '',
      email: user.email || '',
      role: user.role || 'ROLE_CUSTOMER',
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingUser ? 'Đang cập nhật tài khoản...' : 'Đang thêm tài khoản...');
    try {
      if (editingUser) {
        await api.put(`/admin/customers/${editingUser.id}`, formData);
        toast.success('Cập nhật tài khoản thành công!', { id: loadingToast });
      } else {
        await api.post('/admin/customers/', formData);
        toast.success('Thêm tài khoản thành công!', { id: loadingToast });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra', { id: loadingToast });
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${name}"?`)) return;
    const loadingToast = toast.loading('Đang xóa tài khoản...');
    try {
      await api.delete(`/admin/customers/${id}`);
      toast.success('Đã xóa tài khoản thành công!', { id: loadingToast });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại', { id: loadingToast });
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'ROLE_MANAGER':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ROLE_RECEPTIONIST':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ROLE_THERAPIST':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Admin';
      case 'ROLE_MANAGER': return 'Quản lý';
      case 'ROLE_RECEPTIONIST': return 'Lễ tân';
      case 'ROLE_THERAPIST': return 'Kỹ thuật viên';
      default: return 'Khách hàng';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-black text-emerald-950 tracking-tight">Tài Khoản & Khách Hàng</h1>
          <p className="text-emerald-700/60 text-sm font-medium mt-1">Quản lý phân quyền và thông tin người dùng của Lumière Spa.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center space-x-2.5 bg-emerald-800/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-emerald-100/20 shadow-premium-sm">
            <Users className="w-5 h-5 text-emerald-800" />
            <span className="text-emerald-900 font-bold text-xs uppercase tracking-wider">{users.length} Tài khoản</span>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-premium-sm transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold text-xs uppercase tracking-wider">Thêm mới</span>
          </button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-premium-xl border border-emerald-100/20 overflow-hidden">
        {users.length === 0 ? (
          <EmptyState message="Chưa có tài khoản nào." />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-emerald-50/50 text-emerald-800 text-[10px] uppercase tracking-[0.2em] font-black border-b border-emerald-100/20">
                <tr>
                  <th className="px-8 py-6 rounded-tl-3xl">Người dùng</th>
                  <th className="px-8 py-6">Vai trò</th>
                  <th className="px-8 py-6">Liên Hệ</th>
                  <th className="px-8 py-6">Ngày Tham Gia</th>
                  <th className="px-8 py-6 rounded-tr-3xl text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50/10">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-emerald-50/20 transition-all duration-300 group">
                    <td className="px-8 py-7">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-emerald-100/70 text-emerald-800 rounded-2xl flex items-center justify-center font-serif font-black shadow-inner">
                          {user.fullName ? user.fullName.charAt(0) : '?'}
                        </div>
                        <div>
                          <p className="font-bold text-emerald-950 text-base leading-none group-hover:text-emerald-800 transition-colors">{user.fullName || 'Chưa cập nhật'}</p>
                          <p className="text-[10px] text-emerald-800/40 font-bold uppercase tracking-widest mt-2">ID: {user.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleBadge(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-8 py-7 space-y-2">
                      <div className="flex items-center space-x-2.5 text-emerald-900 text-xs">
                        <Mail className="w-4 h-4 text-emerald-800/40" />
                        <span className="font-medium">{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2.5 text-emerald-900/60 text-xs">
                        <Phone className="w-4 h-4 text-emerald-800/30" />
                        <span className="font-medium">{user.phone || 'Chưa cập nhật'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center space-x-2.5 text-emerald-950 font-bold text-xs uppercase tracking-tight">
                        <Calendar className="w-4 h-4 text-gold" />
                        <span>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleOpenEditModal(user)}
                          className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.fullName)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add/Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-emerald-50">
              <h2 className="text-xl font-serif font-bold text-emerald-950">
                {editingUser ? 'Cập Nhật Tài Khoản' : 'Thêm Tài Khoản Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-900/40 hover:text-emerald-900 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-900/60 uppercase tracking-wider mb-2">Họ và Tên *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-900/60 uppercase tracking-wider mb-2">Số Điện Thoại *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="0912345678"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-900/60 uppercase tracking-wider mb-2">Email (Tùy chọn)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="partner@lumiere.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-900/60 uppercase tracking-wider mb-2">Vai Trò / Phân Quyền *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="ROLE_CUSTOMER">Khách hàng (Customer)</option>
                    <option value="ROLE_THERAPIST">Kỹ thuật viên (Therapist)</option>
                    <option value="ROLE_RECEPTIONIST">Lễ tân (Receptionist)</option>
                    <option value="ROLE_MANAGER">Quản lý (Manager)</option>
                    <option value="ROLE_ADMIN">Quản trị viên (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-900/60 uppercase tracking-wider mb-2">
                    {editingUser ? 'Mật khẩu mới (Để trống nếu giữ nguyên)' : 'Mật khẩu (Mặc định: default123)'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder={editingUser ? '••••••••' : 'default123'}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-emerald-900 font-bold text-sm hover:bg-emerald-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-sm hover:bg-emerald-700 shadow-premium-sm transition-all"
                >
                  {editingUser ? 'Cập Nhật' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
