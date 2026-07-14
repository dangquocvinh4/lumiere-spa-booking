import { useState, useEffect } from 'react';
import api from '../api/axios';
import { LoadingSpinner, Modal, ConfirmModal, EmptyState } from '../components/UI';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, MapPin, Clock } from 'lucide-react';

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    openingTime: '08:00:00',
    closingTime: '20:00:00',
    active: true
  });

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/branches');
      setBranches(res.data);
    } catch {
      toast.error('Lỗi khi tải danh sách chi nhánh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Đang xử lý...');
    try {
      if (editingBranch) {
        await api.put(`/admin/branches/${editingBranch.id}`, formData);
        toast.success('Cập nhật thành công', { id: loadingToast });
      } else {
        await api.post('/admin/branches', formData);
        toast.success('Thêm chi nhánh mới thành công', { id: loadingToast });
      }
      setShowModal(false);
      setEditingBranch(null);
      fetchBranches();
    } catch {
      toast.error('Có lỗi xảy ra khi lưu thông tin.', { id: loadingToast });
    }
  };

  const handleDelete = async () => {
    if (!branchToDelete) return;
    try {
      await api.delete(`/admin/branches/${branchToDelete.id}`);
      toast.success('Đã xóa chi nhánh');
      fetchBranches();
    } catch {
      toast.error('Không thể xóa chi nhánh đang hoạt động.');
    } finally {
      setShowConfirm(false);
      setBranchToDelete(null);
    }
  };

  const openEditModal = (branch) => {
    setEditingBranch(branch);
    setFormData(branch);
    setShowModal(true);
  };

  if (loading && branches.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-black text-emerald-950 tracking-tight">Hệ thống chi nhánh</h1>
          <p className="text-emerald-700/60 text-sm font-medium mt-1">Quản lý mạng lưới Lumière Spa trên toàn quốc.</p>
        </div>
        <button 
          onClick={() => { setEditingBranch(null); setFormData({ name: '', address: '', phone: '', openingTime: '08:00:00', closingTime: '20:00:00', active: true }); setShowModal(true); }}
          className="flex items-center justify-center space-x-2 bg-emerald-800 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-premium-md hover:bg-emerald-950 transition-all duration-300 active:scale-95 cursor-pointer border-b-2 border-gold"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm chi nhánh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {branches.length === 0 ? (
          <div className="col-span-full">
            <EmptyState message="Chưa có chi nhánh nào trong hệ thống." />
          </div>
        ) : (
          branches.map(branch => (
            <div key={branch.id} className="group bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-premium-md border border-emerald-100/20 space-y-6 hover-premium relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-800 shadow-inner">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex space-x-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    onClick={() => openEditModal(branch)} 
                    className="p-3 bg-white hover:bg-emerald-800 hover:text-white shadow-premium-sm text-emerald-800 rounded-xl transition-all duration-300 cursor-pointer"
                    title="Chỉnh sửa chi nhánh"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { setBranchToDelete(branch); setShowConfirm(true); }} 
                    className="p-3 bg-white hover:bg-rose-600 hover:text-white shadow-premium-sm text-rose-500 rounded-xl transition-all duration-300 cursor-pointer"
                    title="Xóa chi nhánh"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-serif font-black text-xl text-emerald-950 tracking-tight leading-tight">{branch.name}</h3>
                <p className="text-emerald-700/60 text-sm font-medium mt-2 leading-relaxed">{branch.address}</p>
              </div>

              <div className="pt-4 border-t border-emerald-100/10 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-emerald-800/40 uppercase tracking-widest flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-emerald-700/50" /> Mở cửa</p>
                  <p className="font-black text-emerald-950 text-sm">{branch.openingTime.substring(0, 5)}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold text-gold uppercase tracking-widest flex items-center justify-end"><Clock className="w-3.5 h-3.5 mr-1 text-gold/60" /> Đóng cửa</p>
                  <p className="font-black text-emerald-950 text-sm">{branch.closingTime.substring(0, 5)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editingBranch ? 'Cập nhật chi nhánh' : 'Thêm chi nhánh mới'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="branch-name" className="text-[10px] font-bold text-emerald-800/70 uppercase tracking-widest ml-1">Tên chi nhánh</label>
              <input 
                id="branch-name"
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100/30 rounded-2xl focus:ring-2 focus:ring-emerald-700 focus:bg-white outline-none font-bold text-emerald-950 transition-all duration-300 shadow-inner"
                required
                placeholder="Ví dụ: Lumière Spa Quận 1"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="branch-address" className="text-[10px] font-bold text-emerald-800/70 uppercase tracking-widest ml-1">Địa chỉ cụ thể</label>
              <input 
                id="branch-address"
                type="text" 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100/30 rounded-2xl focus:ring-2 focus:ring-emerald-700 focus:bg-white outline-none font-bold text-emerald-950 transition-all duration-300 shadow-inner"
                required
                placeholder="Số nhà, Tên đường, Quận/Huyện"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="branch-opening" className="text-[10px] font-bold text-emerald-800/70 uppercase tracking-widest ml-1">Giờ mở cửa</label>
                <input 
                  id="branch-opening"
                  type="time" 
                  value={formData.openingTime}
                  onChange={e => setFormData({...formData, openingTime: e.target.value + ':00'})}
                  className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100/30 rounded-2xl focus:ring-2 focus:ring-emerald-700 focus:bg-white outline-none font-bold text-emerald-950 transition-all duration-300 shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="branch-closing" className="text-[10px] font-bold text-emerald-800/70 uppercase tracking-widest ml-1">Giờ đóng cửa</label>
                <input 
                  id="branch-closing"
                  type="time" 
                  value={formData.closingTime}
                  onChange={e => setFormData({...formData, closingTime: e.target.value + ':00'})}
                  className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100/30 rounded-2xl focus:ring-2 focus:ring-emerald-700 focus:bg-white outline-none font-bold text-emerald-950 transition-all duration-300 shadow-inner"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full py-5 bg-emerald-800 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-premium-md hover:bg-emerald-950 transition-all duration-300 border-b-2 border-gold cursor-pointer"
            >
              {editingBranch ? 'CẬP NHẬT CHI NHÁNH' : 'THÊM CHI NHÁNH MỚI'}
            </button>
          </form>
        </Modal>
      )}

      <ConfirmModal 
        isOpen={showConfirm}
        title="Xác nhận xóa chi nhánh"
        message={`Bạn có chắc chắn muốn xóa chi nhánh ${branchToDelete?.name}? Thao tác này sẽ gỡ bỏ toàn bộ lịch làm việc liên quan.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
