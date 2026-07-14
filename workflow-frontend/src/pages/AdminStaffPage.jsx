import { useState, useEffect } from 'react';
import api from '../api/axios';
import { LoadingSpinner, EmptyState } from '../components/UI';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, User, Mail, MapPin, X } from 'lucide-react';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [availableTherapistUsers, setAvailableTherapistUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  
  const [addMode, setAddMode] = useState('existing'); // 'existing' or 'new'
  const [formData, setFormData] = useState({
    userId: '',
    fullName: '',
    phone: '',
    email: '',
    title: '',
    bio: '',
    branchId: '',
    active: true
  });

  const fetchData = async () => {
    try {
      const [staffRes, branchesRes, usersRes] = await Promise.all([
        api.get('/admin/staff'),
        api.get('/branches'),
        api.get('/admin/customers/?role=ROLE_THERAPIST')
      ]);
      setStaff(staffRes.data);
      setBranches(branchesRes.data);
      
      // Filter out users who already have staff profiles
      const activeStaffUserIds = staffRes.data.map(s => s.user?.id);
      const filteredUsers = usersRes.data.data.filter(u => !activeStaffUserIds.includes(u.id));
      setAvailableTherapistUsers(filteredUsers);
    } catch {
      toast.error('Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setFormData({
      userId: '',
      fullName: '',
      phone: '',
      email: '',
      title: '',
      bio: '',
      branchId: '',
      active: true
    });
    setAddMode('existing');
    setShowModal(true);
  };

  const handleOpenEditModal = (member) => {
    setEditingStaff(member);
    setFormData({
      userId: member.user?.id || '',
      fullName: member.user?.fullName || '',
      phone: member.user?.phone || '',
      email: member.user?.email || '',
      title: member.title || '',
      bio: member.bio || '',
      branchId: member.branchId || '',
      active: member.active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingStaff ? 'Đang cập nhật chuyên viên...' : 'Đang tạo chuyên viên...');
    try {
      if (editingStaff) {
        // Update staff profile
        await api.put(`/admin/staff/${editingStaff.id}`, {
          fullName: formData.fullName,
          title: formData.title,
          bio: formData.bio,
          branchId: formData.branchId,
          active: formData.active
        });
        toast.success('Cập nhật chuyên viên thành công!', { id: loadingToast });
      } else {
        let finalUserId = formData.userId;
        
        // If creating a brand new therapist user
        if (addMode === 'new') {
          const userRes = await api.post('/admin/customers/', {
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            role: 'ROLE_THERAPIST'
          });
          finalUserId = userRes.data.data.id;
        }

        if (!finalUserId) {
          toast.error('Vui lòng chọn tài khoản hoặc tạo mới', { id: loadingToast });
          return;
        }

        // Create staff profile
        await api.post('/admin/staff', {
          userId: finalUserId,
          branchId: formData.branchId,
          title: formData.title,
          bio: formData.bio
        });
        toast.success('Đã thêm chuyên viên thành công!', { id: loadingToast });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lưu thất bại.', { id: loadingToast });
    }
  };

  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa chuyên viên "${name}" khỏi đội ngũ?`)) return;
    const loadingToast = toast.loading('Đang xóa chuyên viên...');
    try {
      await api.delete(`/admin/staff/${id}`);
      toast.success('Đã xóa chuyên viên!', { id: loadingToast });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa chuyên viên thất bại', { id: loadingToast });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nhân viên</h1>
          <p className="text-gray-500 text-sm">Quản lý đội ngũ nhân viên và phân bổ chi nhánh.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm chuyên viên</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.length === 0 ? (
          <div className="md:col-span-3">
            <EmptyState message="Chưa có nhân viên nào." />
          </div>
        ) : (
          staff.map(member => (
            <div key={member.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 hover:border-indigo-100 transition relative group">
              <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => handleOpenEditModal(member)}
                  className="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg transition"
                  title="Sửa chuyên viên"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteStaff(member.id, member.user?.fullName)}
                  className="p-2 hover:bg-rose-55 text-rose-500 hover:text-rose-700 rounded-lg transition"
                  title="Xóa chuyên viên"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xl">
                  {member.user?.fullName ? member.user.fullName.charAt(0) : '?'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{member.user?.fullName || 'Nhân viên mới'}</h3>
                  <p className="text-sm text-indigo-600 font-medium">{member.title || 'Chưa có chức danh'}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-50 pt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{member.user?.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{branches.find(b => b.id === member.branchId)?.name || 'Chưa gán chi nhánh'}</span>
                </div>
                <div className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block ${member.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {member.active ? 'Đang làm việc' : 'Đã nghỉ'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold mb-6">
              {editingStaff ? 'Cập nhật nhân viên' : 'Thêm chuyên viên mới'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingStaff && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Tài khoản KTV</label>
                  <div className="flex border rounded-xl overflow-hidden text-xs">
                    <button 
                      type="button"
                      onClick={() => setAddMode('existing')}
                      className={`flex-1 py-2 font-bold ${addMode === 'existing' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      Chọn tài khoản có sẵn
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAddMode('new')}
                      className={`flex-1 py-2 font-bold ${addMode === 'new' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      Tạo tài khoản mới
                    </button>
                  </div>
                </div>
              )}

              {/* Mode selected or editing mode */}
              {!editingStaff && addMode === 'existing' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chọn tài khoản KTV *</label>
                  <select
                    value={formData.userId}
                    onChange={e => setFormData({...formData, userId: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    required
                  >
                    <option value="">-- Chọn một KTV trong danh sách --</option>
                    {availableTherapistUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.fullName} ({u.phone})</option>
                    ))}
                  </select>
                  {availableTherapistUsers.length === 0 && (
                    <p className="text-xs text-rose-500 mt-1">Không có tài khoản KTV trống nào. Vui lòng chuyển sang "Tạo tài khoản mới".</p>
                  )}
                </div>
              ) : null}

              {/* Mode new or editing mode */}
              {editingStaff || addMode === 'new' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên KTV *</label>
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                      placeholder="VD: Nguyễn Văn B"
                    />
                  </div>
                  {!editingStaff && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                        <input 
                          type="tel" 
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                          placeholder="VD: 0987654321"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email (Tùy chọn)</label>
                        <input 
                          type="email" 
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="partner@lumiere.com"
                        />
                      </div>
                    </>
                  )}
                </>
              ) : null}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chức danh KTV *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                  placeholder="VD: Chuyên gia Massage trị liệu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh *</label>
                <select 
                  value={formData.branchId || ''}
                  onChange={e => setFormData({...formData, branchId: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  required
                >
                  <option value="">Chọn chi nhánh</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiểu sử ngắn</label>
                <textarea 
                  value={formData.bio || ''}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                  placeholder="Mô tả kinh nghiệm của KTV..."
                />
              </div>

              {editingStaff ? (
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={formData.active}
                    onChange={e => setFormData({...formData, active: e.target.checked})}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">Đang làm việc</label>
                </div>
              ) : (
                addMode === 'new' && (
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <p className="text-[11px] text-emerald-800/80 italic">Mật khẩu đăng nhập mặc định của tài khoản KTV này sẽ là: <strong>default123</strong></p>
                  </div>
                )
              )}
              
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border rounded-xl hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                >
                  {editingStaff ? 'Lưu lại' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
