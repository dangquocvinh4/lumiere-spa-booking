import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { User, Mail, Phone, Shield, Sparkles, Camera, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setLoyaltyPoints(res.data?.loyaltyPoints || 0);
    }).catch(() => {});
  }, []);

  const getServerUrl = () => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    return base.replace(/\/api$/, '');
  };

  const resolveAvatarUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${getServerUrl()}${url}`;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa cho phép là 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const uploadRes = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedUrl = uploadRes.data.data.url;

      await api.put('/auth/me', {
        fullName: user.fullName,
        phone: user.phone || '',
        avatarUrl: uploadedUrl
      });

      updateUser({ ...user, avatarUrl: uploadedUrl });
      toast.success('Đã cập nhật ảnh đại diện thành công!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Tải ảnh lên thất bại.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      await api.put('/auth/me', data);
      updateUser({ ...user, fullName: data.fullName, phone: data.phone });
      toast.success('Đã cập nhật hồ sơ cá nhân!');
    } catch (error) {
      toast.error('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      if (data.newPassword !== data.confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp!');
        return;
      }
      
      await api.put('/auth/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
      toast.success('Đã thay đổi mật khẩu thành công!');
      e.target.reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <div className="relative inline-block group">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            accept="image/jpeg,image/png,image/webp" 
            className="hidden" 
          />
          {uploading ? (
            <div className="w-32 h-32 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-600 shadow-2xl shadow-emerald-200 border-2 border-dashed border-emerald-300 animate-pulse">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
          ) : user?.avatarUrl ? (
            <img 
              src={resolveAvatarUrl(user.avatarUrl)} 
              alt={user.fullName} 
              className="w-32 h-32 rounded-[2.5rem] object-cover shadow-2xl shadow-emerald-900/10 border-2 border-gold/70 group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-32 h-32 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-200">
              <User className="w-16 h-16" />
            </div>
          )}
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-3 bg-white rounded-2xl shadow-xl text-emerald-600 border border-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:scale-110 active:scale-95 duration-200"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{user?.fullName}</h1>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
              Thành viên hạng thẻ • Điểm tích lũy: {loyaltyPoints}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-emerald-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600" />
        
        <form onSubmit={handleUpdate} className="space-y-8 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Họ và Tên</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 w-4 h-4" />
                <input 
                  type="text" 
                  name="fullName"
                  defaultValue={user?.fullName}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900 shadow-inner"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 w-4 h-4" />
                <input 
                  type="tel" 
                  name="phone"
                  defaultValue={user?.phone}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900 shadow-inner"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Địa chỉ Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 w-4 h-4" />
              <input 
                type="email" 
                value={user?.email}
                disabled
                className="w-full pl-12 pr-6 py-4 bg-emerald-50/50 border-none rounded-2xl font-bold text-emerald-900 shadow-inner cursor-not-allowed"
              />
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-2xl flex items-start space-x-4">
            <Shield className="w-6 h-6 text-emerald-600 mt-1" />
            <div>
              <p className="text-xs font-black text-emerald-900 uppercase tracking-widest">Bảo mật tài khoản</p>
              <p className="text-[10px] text-emerald-600 font-bold leading-relaxed mt-1">Thông tin cá nhân của bạn được bảo mật theo tiêu chuẩn quốc tế và chỉ sử dụng cho mục đích cá nhân hóa trải nghiệm Spa.</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-emerald-100 hover:bg-emerald-700 transition transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'LƯU THAY ĐỔI HỒ SƠ'}
          </button>
        </form>

        <hr className="my-10 border-gray-100" />

        <form onSubmit={handleChangePassword} className="space-y-8 mt-4">
          <h2 className="text-xl font-black text-gray-900 uppercase">Đổi Mật Khẩu</h2>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Mật khẩu hiện tại</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 w-4 h-4" />
              <input 
                type="password" 
                name="oldPassword"
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900 shadow-inner"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 w-4 h-4" />
                <input 
                  type="password" 
                  name="newPassword"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900 shadow-inner"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 w-4 h-4" />
                <input 
                  type="password" 
                  name="confirmPassword"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900 shadow-inner"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={passwordLoading}
            className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-gray-200 hover:bg-gray-800 transition transform active:scale-95 disabled:opacity-50"
          >
            {passwordLoading ? 'Đang xử lý...' : 'ĐỔI MẬT KHẨU'}
          </button>
        </form>
      </div>
    </div>
  );
}
