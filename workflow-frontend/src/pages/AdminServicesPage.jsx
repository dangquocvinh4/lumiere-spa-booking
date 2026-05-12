import { useState, useEffect } from 'react';
import api from '../api/axios';
import { LoadingSpinner, EmptyState } from '../components/UI';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search, Clock, Tag, DollarSign } from 'lucide-react';

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    durationMinutes: 60,
    category: '',
    imageUrl: ''
  });

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch {
      toast.error('Không thể tải danh sách dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.put(`/admin/services/${editingService.id}`, formData);
        toast.success('Cập nhật thành công');
      } else {
        await api.post('/admin/services', formData);
        toast.success('Thêm mới thành công');
      }
      setShowModal(false);
      setEditingService(null);
      setFormData({ name: '', description: '', price: 0, durationMinutes: 60, category: '', imageUrl: '' });
      fetchServices();
    } catch {
      toast.error('Lưu thất bại.');
    }
  };

  const handleToggleActive = async (id) => {
    if (!window.confirm('Xác nhận vô hiệu hóa dịch vụ này?')) return;
    try {
      await api.delete(`/admin/services/${id}`);
      toast.success('Đã vô hiệu hóa dịch vụ');
      fetchAppointments(); // Wait, fetchServices
      fetchServices();
    } catch {
      toast.error('Thao tác thất bại.');
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý dịch vụ</h1>
          <p className="text-gray-500 text-sm">Thiết lập danh mục và bảng giá dịch vụ Spa.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm dịch vụ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm w-64"
            />
          </div>
          <button 
            onClick={() => { setEditingService(null); setShowModal(true); setFormData({ name: '', description: '', price: 0, durationMinutes: 60, category: '', imageUrl: '' }); }}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm dịch vụ</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredServices.length === 0 ? (
          <div className="xl:col-span-2">
            <EmptyState message="Không có dịch vụ nào." />
          </div>
        ) : (
          filteredServices.map(service => (
            <div key={service.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-5 hover:border-indigo-100 transition group">
              <div className="w-24 h-24 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-200 font-bold text-2xl">
                {service.name.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition">{service.name}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mt-1">
                      <Tag className="w-3 h-3 mr-1" />
                      {service.category || 'Dịch vụ chung'}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => { setEditingService(service); setFormData(service); setShowModal(true); }}
                      className="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleToggleActive(service.id)}
                      className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-6 text-sm">
                  <div className="flex items-center text-gray-500">
                    <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                    <span className="font-bold text-gray-900">{service.price.toLocaleString()}đ</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1 text-indigo-500" />
                    <span>{service.durationMinutes} phút</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6">{editingService ? 'Cập nhật' : 'Thêm mới'} dịch vụ</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (Phút)</label>
                  <input 
                    type="number" 
                    value={formData.durationMinutes}
                    onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="VD: Massage, Chăm sóc da..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24"
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
