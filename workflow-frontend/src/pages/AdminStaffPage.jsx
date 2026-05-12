import { useState, useEffect } from 'react';
import api from '../api/axios';
import { LoadingSpinner, EmptyState } from '../components/UI';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, User, Mail, MapPin } from 'lucide-react';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    branchId: '',
    active: true
  });

  const fetchData = async () => {
    try {
      const [staffRes, branchesRes] = await Promise.all([
        api.get('/admin/staff'),
        api.get('/branches')
      ]);
      setStaff(staffRes.data);
      setBranches(branchesRes.data);
    } catch {
      toast.error('Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await api.put(`/admin/staff/${editingStaff.id}`, formData);
        toast.success('Cập nhật thành công');
      }
      setShowModal(false);
      setEditingStaff(null);
      fetchData();
    } catch {
      toast.error('Lưu thất bại.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nhân viên</h1>
          <p className="text-gray-500 text-sm">Quản lý đội ngũ nhân viên và phân bổ chi nhánh.</p>
        </div>
        {/* Note: Thêm nhân viên mới cần quy trình chọn User -> Staff, tạm thời focus vào Edit */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.length === 0 ? (
          <div className="md:col-span-3">
            <EmptyState message="Chưa có nhân viên nào." />
          </div>
        ) : (
          staff.map(member => (
            <div key={member.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 hover:border-indigo-100 transition relative">
              <div className="absolute top-4 right-4 flex space-x-1">
                <button 
                  onClick={() => { setEditingStaff(member); setFormData(member); setShowModal(true); }}
                  className="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                  <User className="w-8 h-8" />
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
                <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block ${member.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {member.active ? 'Đang làm việc' : 'Đã nghỉ'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Cập nhật nhân viên</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chức danh</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh</label>
                <select 
                  value={formData.branchId || ''}
                  onChange={e => setFormData({...formData, branchId: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">Chọn chi nhánh</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiểu sử</label>
                <textarea 
                  value={formData.bio || ''}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={formData.active}
                  onChange={e => setFormData({...formData, active: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">Đang làm việc</label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-xl hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                >
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
