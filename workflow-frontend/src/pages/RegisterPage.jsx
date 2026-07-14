import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Sparkles, Mail, Lock, User, Phone, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      toast.success('Đăng ký thành công! Hãy đăng nhập nhé.');
      navigate('/login');
    } catch {
      toast.error('Đăng ký thất bại. Email có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-emerald-50/20">
      <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-primary rounded-[2rem] shadow-premium-lg border border-primary/10">
            <Sparkles className="w-10 h-10 text-white animate-spin-slow" />
          </div>
          <h1 className="text-4xl font-serif font-black text-gray-900 tracking-tight uppercase">Tham gia Lumière</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.25em]">Khởi đầu hành trình làm đẹp</p>
        </div>

        <div className="glass p-10 rounded-[3rem] shadow-premium-md border border-primary/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="reg-name" className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 block">Họ và Tên</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none font-bold text-gray-900 shadow-inner focus:border-primary/20 transition-all cursor-text"
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-phone" className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 block">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none font-bold text-gray-900 shadow-inner focus:border-primary/20 transition-all cursor-text"
                  placeholder="09xx xxx xxx"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-email" className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none font-bold text-gray-900 shadow-inner focus:border-primary/20 transition-all cursor-text"
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-password" className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 block">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                <input
                  id="reg-password"
                  type="password"
                  required
                  className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none font-bold text-gray-900 shadow-inner focus:border-primary/20 transition-all cursor-text"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-premium-md hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <span>Tạo tài khoản</span>
                  <ChevronRight className="w-5 h-5 text-gold" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Đã có tài khoản?</p>
            <Link to="/login" className="inline-block text-primary font-black text-xs uppercase tracking-widest hover:text-primary-hover transition cursor-pointer">
              Đăng nhập ngay
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="text-gray-300 text-[10px] font-black uppercase tracking-widest hover:text-primary transition cursor-pointer">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
