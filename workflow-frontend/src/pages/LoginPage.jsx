import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Mail, Lock, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Chào mừng trở lại, ${user.fullName}!`);
      if (user.roles?.includes('ROLE_ADMIN') || user.roles?.includes('ROLE_MANAGER')) {
        navigate('/admin');
      } else if (user.roles?.includes('ROLE_THERAPIST') || user.roles?.includes('ROLE_STAFF')) {
        navigate('/staff');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error('Email hoặc mật khẩu không chính xác.');
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
          <h1 className="text-4xl font-serif font-black text-gray-900 tracking-tight uppercase">Lumière Spa</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.25em]">Đăng nhập hệ thống</p>
        </div>

        <div className="glass p-10 rounded-[3rem] shadow-premium-md border border-primary/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 block">Địa chỉ Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                <input
                  id="login-email"
                  type="email"
                  required
                  className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-3xl outline-none font-bold text-gray-900 shadow-inner focus:border-primary/20 transition-all cursor-text"
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 block">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                <input
                  id="login-password"
                  type="password"
                  required
                  className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-3xl outline-none font-bold text-gray-900 shadow-inner focus:border-primary/20 transition-all cursor-text"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-premium-md hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <span>Xác nhận đăng nhập</span>
                  <ChevronRight className="w-5 h-5 text-gold" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center space-y-4">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Bạn chưa có tài khoản?</p>
            <Link to="/register" className="inline-block text-primary font-black text-xs uppercase tracking-widest hover:text-primary-hover transition cursor-pointer">
              Đăng ký ngay tại đây
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
