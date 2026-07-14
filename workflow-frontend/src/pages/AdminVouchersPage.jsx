import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Plus, Tag, Trash2, Edit2, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: 10,
    maxDiscountAmount: 0,
    minOrderValue: 0,
    usageLimit: 100,
    active: true
  });

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vouchers');
      setVouchers(res.data);
    } catch (error) {
      toast.error('Không thể tải danh sách voucher');
      setVouchers([
        // Mock data if backend doesn't have the endpoint yet
        { id: '1', code: 'LUMI10', discountPercent: 10, maxDiscountAmount: 50000, usageLimit: 100, active: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.post('/vouchers', formData);
      toast.success('Thêm voucher thành công');
      setIsModalOpen(false);
      fetchVouchers();
    } catch (error) {
      toast.error('Thêm voucher thất bại, có thể mã đã tồn tại');
      // Mock UI update if API fails
      setVouchers(prev => [...prev, { ...formData, id: Date.now().toString() }]);
      setIsModalOpen(false);
      toast.success('Đã thêm voucher (Mock)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2rem] shadow-premium-sm border border-emerald-50">
        <div>
          <h1 className="text-3xl font-serif font-black text-emerald-950 tracking-tighter">Quản lý Voucher</h1>
          <p className="text-emerald-600/70 mt-2 font-medium tracking-wide text-sm">Tạo và quản lý các mã khuyến mãi</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchVouchers}
            className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-6 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              setFormData({ code: '', discountPercent: 10, maxDiscountAmount: 0, minOrderValue: 0, usageLimit: 100, active: true });
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-700 active:scale-95 transition-all shadow-premium-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Voucher</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-premium-sm border border-emerald-50 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-emerald-600">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-950 text-emerald-50">
                  <th className="p-6 text-xs font-black uppercase tracking-[0.2em]">Mã Voucher</th>
                  <th className="p-6 text-xs font-black uppercase tracking-[0.2em]">Giảm (%)</th>
                  <th className="p-6 text-xs font-black uppercase tracking-[0.2em]">Giảm Tối Đa</th>
                  <th className="p-6 text-xs font-black uppercase tracking-[0.2em]">Đơn Tối Thiểu</th>
                  <th className="p-6 text-xs font-black uppercase tracking-[0.2em]">Số lần dùng</th>
                  <th className="p-6 text-xs font-black uppercase tracking-[0.2em]">Trạng thái</th>
                  <th className="p-6 text-xs font-black uppercase tracking-[0.2em] text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-emerald-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                          <Tag className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-emerald-950">{voucher.code}</span>
                      </div>
                    </td>
                    <td className="p-6 font-bold text-emerald-900">
                      {voucher.discountPercent}%
                    </td>
                    <td className="p-6 font-bold text-emerald-900">
                      {voucher.maxDiscountAmount ? voucher.maxDiscountAmount.toLocaleString() + 'đ' : 'Không giới hạn'}
                    </td>
                    <td className="p-6 font-medium text-emerald-700/70">
                      {voucher.minOrderValue ? voucher.minOrderValue.toLocaleString() + 'đ' : '0đ'}
                    </td>
                    <td className="p-6 font-medium text-emerald-700/70">
                      {voucher.usageCount || 0} / {voucher.usageLimit} lần
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center ${voucher.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {voucher.active ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {vouchers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-emerald-600/50">
                      <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-bold uppercase tracking-widest text-sm">Chưa có voucher nào</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-premium-2xl"
            >
              <h2 className="text-2xl font-serif font-black text-emerald-950 mb-6">Thêm Voucher</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Mã Voucher</label>
                  <input
                    required
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-emerald-950 font-medium focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all uppercase"
                    placeholder="VD: SUMMER2026"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Giảm giá (%)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({...formData, discountPercent: Number(e.target.value)})}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-emerald-950 font-medium focus:outline-none focus:border-gold transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Giảm tối đa (VND - 0 là không giới hạn)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({...formData, maxDiscountAmount: Number(e.target.value)})}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-emerald-950 font-medium focus:outline-none focus:border-gold transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Đơn tối thiểu (VND)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({...formData, minOrderValue: Number(e.target.value)})}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-emerald-950 font-medium focus:outline-none focus:border-gold transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Giới hạn số lần dùng (Tất cả KH)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: Number(e.target.value)})}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-emerald-950 font-medium focus:outline-none focus:border-gold transition-all"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs text-emerald-950 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-500 hover:to-gold shadow-premium-sm transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu Voucher'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
