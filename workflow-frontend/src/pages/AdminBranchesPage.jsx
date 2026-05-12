import { useState, useEffect } from 'react';
import api from '../api/axios';
import { LoadingSpinner, ErrorMessage } from '../components/UI';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, MapPin, Clock } from 'lucide-react';

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({ name: '', openingTime: '08:00', closingTime: '20:00' });

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data);
    } catch {
      toast.error('Không thể tải danh sách chi nhánh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await api.put(`/branches/${editingBranch.id}`, formData);
        toast.success('Cập nhật thành công');
      } else {
        await api.post('/branches', formData);
        toast.success('Thêm mới thành công');
      }
      setShowModal(false);
      setEditingBranch(null);
      setFormData({ name: '', openingTime: '08:00', closingTime: '20:00' });
      fetchBranches();
    } catch {
      toast.error('Lưu thất bại.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa chi nhánh này?')) return;
    try {
      await api.delete(`/branches/${id}`);
      toast.success('Đã xóa chi nhánh');
      fetchBranches();
    } catch {
      toast.error('Xóa thất bại.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý chi nhánh</h1>
          <p className="text-gray-500 text-sm">Quản lý địa điểm và thời gian hoạt động của Spa.</p>
        </div>
        <button 
          onClick={() => { setEditingBranch(null); setShowModal(true); }}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm chi nhánh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map(branch => (
          <div key={branch.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 hover:border-indigo-100 transition">
            <div className="flex justify-between items-start">
              <div className="bg-indigo-50 p-3 rounded-xl">
                <MapPin className="text-indigo-600 w-6 h-6" />
              </div>
              <div className="flex space-x-2">
                <button onClick={() => { setEditingBranch(branch); setFormData(branch); setShowModal(true); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(branch.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-900">{branch.name}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Clock className="w-4 h-4 mr-2" />
                <span>{branch.openingTime} - {branch.closingTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">{editingBranch ? 'Cập nhật' : 'Thêm mới'} chi nhánh</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên chi nhánh</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ mở cửa</label>
                  <input 
                    type="time" 
                    value={formData.openingTime}
                    onChange={e => setFormData({...formData, openingTime: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ đóng cửa</label>
                  <input 
                    type="time" 
                    value={formData.closingTime}
                    onChange={e => setFormData({...formData, closingTime: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
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
