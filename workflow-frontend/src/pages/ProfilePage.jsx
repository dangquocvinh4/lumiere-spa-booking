import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, login } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/profile', formData);
      toast.success('Cập nhật hồ sơ thành công');
      login({ ...user, ...formData }, useAuthStore.getState().token);
    } catch {
      toast.error('Cập nhật thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-indigo-600 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <User className="w-12 h-12" />
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.fullName}</h1>
            <p className="text-gray-500">Quản lý thông tin cá nhân và bảo mật tài khoản.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-2" /> Họ và tên
                </label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <Phone className="w-4 h-4 mr-2" /> Số điện thoại
                </label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 flex items-center">
                  <Mail className="w-4 h-4 mr-2" /> Email (Không thể thay đổi)
                </label>
                <input 
                  type="email" 
                  value={user?.email}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <Shield className="w-4 h-4 mr-2" /> Vai trò
                </label>
                <div className="flex flex-wrap gap-2">
                  {user?.roles?.map(role => (
                    <span key={role} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {role.replace('ROLE_', '')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:bg-gray-400"
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
