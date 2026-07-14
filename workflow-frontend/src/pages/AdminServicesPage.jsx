import { useState, useEffect } from 'react';
import api from '../api/axios';
import { LoadingSpinner, Modal, ConfirmModal, EmptyState } from '../components/UI';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Clock, Sparkles, DollarSign, Image as ImageIcon } from 'lucide-react';

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    durationMinutes: 30,
    category: '',
    imageUrl: '',
    active: true
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/services');
      setServices(res.data);
    } catch {
      toast.error('Lỗi khi tải danh sách dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Đang lưu...');
    try {
      if (editingService) {
        await api.put(`/admin/services/${editingService.id}`, formData);
        toast.success('Cập nhật thành công', { id: loadingToast });
      } else {
        await api.post('/admin/services', formData);
        toast.success('Thêm dịch vụ mới thành công', { id: loadingToast });
      }
      setShowModal(false);
      setEditingService(null);
      fetchServices();
    } catch {
      toast.error('Có lỗi xảy ra.', { id: loadingToast });
    }
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await api.delete(`/admin/services/${serviceToDelete.id}`);
      toast.success('Đã xóa dịch vụ');
      fetchServices();
    } catch {
      toast.error('Không thể xóa dịch vụ này.');
    } finally {
      setShowConfirm(false);
      setServiceToDelete(null);
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.patch(`/admin/services/${id}/restore`);
      toast.success('Đã khôi phục dịch vụ');
      fetchServices();
    } catch { toast.error('Khôi phục thất bại.'); }
  };

  if (loading && services.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-black text-emerald-950 tracking-tight">Danh mục dịch vụ</h1>
          <p className="text-emerald-700/60 text-sm font-medium mt-1">Quản lý các liệu trình và bảng giá dịch vụ spa.</p>
        </div>
        <button 
          onClick={() => { setEditingService(null); setFormData({ name: '', description: '', price: 0, durationMinutes: 60, category: 'Dịch vụ Spa', imageUrl: '', active: true }); setShowModal(true); }}
          className="flex items-center justify-center space-x-2 bg-emerald-800 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-premium-md hover:bg-emerald-950 transition-all duration-300 active:scale-95 cursor-pointer border-b-2 border-gold"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm liệu trình</span>
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-emerald-100/20 shadow-premium-md overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-emerald-50/40 text-emerald-800 text-[10px] font-black uppercase tracking-[0.2em] border-b border-emerald-100/30">
              <tr>
                <th className="px-8 py-6">Dịch vụ & Liệu trình</th>
                <th className="px-8 py-6">Phân loại</th>
                <th className="px-8 py-6">Thời lượng</th>
                <th className="px-8 py-6 text-right">Giá dịch vụ</th>
                <th className="px-8 py-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100/10">
              {services.length === 0 ? (
                <tr><td colSpan="5"><EmptyState message="Chưa có dịch vụ nào." /></td></tr>
              ) : (
                services.map(s => (
                  <tr key={s.id} className={`hover:bg-emerald-50/20 transition-all duration-300 ${!s.active ? 'opacity-40 grayscale' : ''}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-emerald-50 shadow-inner flex-shrink-0">
                          {s.imageUrl ? (
                            <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white relative">
                              <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
                              <Sparkles className="w-5 h-5 text-gold relative z-10 animate-pulse" />
                            </div>
                          )}
                        </div>
                        <div className="max-w-xs">
                          <p className="font-serif font-black text-emerald-950 text-base leading-tight">{s.name}</p>
                          <p className="text-[10px] text-emerald-800/50 font-bold truncate mt-1">{s.description || 'Chưa có mô tả chi tiết.'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50/60 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100/30 shadow-premium-sm">
                        {s.category || 'Spa'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-emerald-950/80 font-bold text-xs">
                        <Clock className="w-4 h-4 mr-2 text-emerald-600" />
                        {s.durationMinutes} phút
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-lg font-black text-emerald-950 tracking-tighter">{s.price?.toLocaleString()}đ</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {s.active ? (
                          <>
                            <button 
                              onClick={() => { setEditingService(s); setFormData(s); setShowModal(true); }} 
                              className="p-3 bg-white hover:bg-emerald-800 hover:text-white shadow-premium-sm text-emerald-800 rounded-xl transition-all duration-300 cursor-pointer"
                              title="Cập nhật liệu trình"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => { setServiceToDelete(s); setShowConfirm(true); }} 
                              className="p-3 bg-white hover:bg-rose-600 hover:text-white shadow-premium-sm text-rose-500 rounded-xl transition-all duration-300 cursor-pointer"
                              title="Xóa liệu trình"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleRestore(s.id)} 
                            className="text-[10px] font-bold text-emerald-800 hover:bg-emerald-800 hover:text-white px-4 py-2 rounded-xl transition-all duration-300 border border-emerald-200 cursor-pointer uppercase tracking-widest shadow-premium-sm"
                          >
                            Khôi phục
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editingService ? 'Cập nhật dịch vụ' : 'Thêm liệu trình mới'} wide>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="service-name" className="text-[10px] font-bold text-emerald-800/70 uppercase tracking-widest ml-1">Tên liệu trình</label>
                <input 
                  id="service-name"
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100/30 rounded-2xl focus:ring-2 focus:ring-emerald-700 focus:bg-white outline-none font-bold text-emerald-950 transition-all duration-300 shadow-inner"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="service-desc" className="text-[10px] font-bold text-emerald-800/70 uppercase tracking-widest ml-1">Mô tả dịch vụ</label>
                <textarea 
                  id="service-desc"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100/30 rounded-2xl focus:ring-2 focus:ring-emerald-700 focus:bg-white outline-none h-32 font-medium text-emerald-950 transition-all duration-300 shadow-inner"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="service-price" className="text-[10px] font-bold text-emerald-800/70 uppercase tracking-widest ml-1">Giá tiền (VND)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 w-4 h-4" />
                    <input 
                      id="service-price"
                      type="number" 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full pl-10 pr-6 py-4 bg-emerald-50/50 border border-emerald-100/30 rounded-2xl focus:ring-2 focus:ring-emerald-700 focus:bg-white outline-none font-bold text-emerald-950 transition-all duration-300 shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="service-duration" className="text-[10px] font-bold text-emerald-800/70 uppercase tracking-widest ml-1">Thời lượng (phút)</label>
                  <input 
                    id="service-duration"
                    type="number" 
                    value={formData.durationMinutes}
                    onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                    className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100/30 rounded-2xl focus:ring-2 focus:ring-emerald-700 focus:bg-white outline-none font-bold text-emerald-950 transition-all duration-300 shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="service-category" className="text-[10px] font-bold text-emerald-800/70 uppercase tracking-widest ml-1">Phân loại danh mục</label>
                <input 
                  id="service-category"
                  type="text" 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100/30 rounded-2xl focus:ring-2 focus:ring-emerald-700 focus:bg-white outline-none font-bold text-emerald-950 transition-all duration-300 shadow-inner"
                  placeholder="Ví dụ: Chăm sóc da mặt"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="service-image" className="text-[10px] font-bold text-emerald-800/70 uppercase tracking-widest ml-1">Link hình ảnh (URL)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 w-4 h-4" />
                  <input 
                    id="service-image"
                    type="text" 
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full pl-10 pr-6 py-4 bg-emerald-50/50 border border-emerald-100/30 rounded-2xl focus:ring-2 focus:ring-emerald-700 focus:bg-white outline-none font-bold text-emerald-950 transition-all duration-300 shadow-inner"
                  />
                </div>
              </div>
              <div className="mt-4 p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/20 flex items-center justify-center shadow-inner overflow-hidden max-h-40">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Preview" className="max-h-32 rounded-xl shadow-premium-md object-cover" />
                ) : (
                  <div className="text-emerald-800/40 flex flex-col items-center py-4">
                    <Sparkles className="w-8 h-8 mb-2 animate-pulse text-gold" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Xem trước hình ảnh</p>
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                className="w-full py-5 bg-emerald-800 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-premium-md hover:bg-emerald-950 transition-all duration-300 border-b-2 border-gold cursor-pointer"
              >
                {editingService ? 'CẬP NHẬT DỊCH VỤ' : 'LƯU DỊCH VỤ MỚI'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmModal 
        isOpen={showConfirm}
        title="Xác nhận xóa dịch vụ"
        message={`Bạn có chắc chắn muốn xóa liệu trình ${serviceToDelete?.name}? Dịch vụ sẽ được chuyển vào trạng thái tạm ngưng.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
