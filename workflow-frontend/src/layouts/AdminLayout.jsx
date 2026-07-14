import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  Users, 
  MapPin, 
  LogOut,
  Sparkles,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getServerUrl = () => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    return base.replace(/\/api$/, '');
  };

  const resolveAvatarUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${getServerUrl()}${url}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isReceptionist = user?.roles?.includes('ROLE_RECEPTIONIST');
  const isAdminOrManager = user?.roles?.some(r => ['ROLE_ADMIN', 'ROLE_MANAGER'].includes(r));

  const menuItems = [
    { name: 'Tổng quan', path: '/admin', icon: LayoutDashboard, show: isAdminOrManager },
    { name: 'Lịch hẹn', path: '/admin/appointments', icon: Calendar, show: true },
    { name: 'Tạo lịch hẹn', path: '/admin/booking', icon: Sparkles, show: true },
    { name: 'Dịch vụ', path: '/admin/services', icon: Settings, show: isAdminOrManager },
    { name: 'Khách hàng', path: '/admin/customers', icon: Users, show: true },
    { name: 'Khuyến mãi', path: '/admin/vouchers', icon: Sparkles, show: isAdminOrManager },
    { name: 'Nhân viên', path: '/admin/staff', icon: Users, show: isAdminOrManager },
    { name: 'Chi nhánh', path: '/admin/branches', icon: MapPin, show: isAdminOrManager },
  ].filter(item => item.show);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-[#F0F7F4] overflow-hidden text-emerald-950 font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 flex-col bg-emerald-950 text-white shadow-premium-2xl z-20 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="p-8 relative z-10">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-gold to-yellow-600 p-2.5 rounded-2xl shadow-premium-md group-hover:rotate-12 transition-all duration-500">
              <Sparkles className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <span className="text-2xl font-serif font-black tracking-tight text-white group-hover:text-gold transition-colors">
                Lumière
              </span>
              <span className="text-gold/80 font-sans font-bold text-[10px] tracking-[0.3em] uppercase block -mt-1">Quản Trị</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 relative z-10">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group cursor-pointer ${
                isActive(item.path) 
                ? 'bg-emerald-900 shadow-inner border-l-4 border-gold' 
                : 'text-emerald-100/60 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-xl transition-colors duration-300 ${isActive(item.path) ? 'bg-gold/20 text-gold' : 'bg-transparent text-emerald-100/60 group-hover:text-gold group-hover:bg-emerald-800/50'}`}>
                  <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="font-bold text-xs uppercase tracking-[0.15em]">{item.name}</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-all duration-300 group-hover:translate-x-1 ${isActive(item.path) ? 'opacity-100 text-gold' : 'opacity-0 text-emerald-600'}`} />
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-emerald-900/50 relative z-10 bg-emerald-950/80 backdrop-blur-md">
          <div className="bg-emerald-900/40 p-4 rounded-2xl flex items-center space-x-4 mb-4 border border-emerald-800/50 hover:border-gold/30 transition-colors cursor-pointer group">
            {user?.avatarUrl ? (
              <img 
                src={resolveAvatarUrl(user.avatarUrl)} 
                alt={user.fullName} 
                className="w-11 h-11 rounded-xl object-cover border-2 border-gold/50 shadow-premium-sm group-hover:scale-105 transition-transform duration-300" 
              />
            ) : (
              <div className="w-11 h-11 bg-gradient-to-br from-gold to-yellow-600 text-emerald-950 rounded-xl flex items-center justify-center font-serif font-black shadow-premium-sm group-hover:scale-105 transition-transform duration-300">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate uppercase tracking-widest">{user?.fullName}</p>
              <p className="text-[9px] font-bold text-gold/80 uppercase tracking-[0.2em] mt-0.5">{isReceptionist ? 'Lễ Tân' : 'Administrator'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 p-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-300 font-bold text-xs uppercase tracking-widest cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-emerald-950/90 backdrop-blur-xl border-b border-emerald-900/50 p-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-gold to-yellow-600 p-2 rounded-xl">
            <Sparkles className="w-4 h-4 text-emerald-950 animate-pulse" />
          </div>
          <span className="font-serif font-black text-white uppercase tracking-[0.2em] text-xs">Lumière <span className="text-gold">Admin</span></span>
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-2 text-gold hover:bg-emerald-900 rounded-xl transition-colors cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsSidebarOpen(false)} />
          <aside className="absolute top-0 left-0 bottom-0 w-80 glass-emerald p-8 flex flex-col shadow-premium-xl border-r border-emerald-100/30 animate-in slide-in-from-left duration-300">
            <div className="flex justify-between items-center mb-10">
              <span className="font-serif font-black text-emerald-950 uppercase tracking-widest">Menu Quản trị</span>
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="p-2 hover:bg-emerald-100/50 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-emerald-800" />
              </button>
            </div>
            <nav className="flex-1 space-y-3">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-4 p-5 rounded-2xl transition-all duration-300 cursor-pointer ${
                    isActive(item.path) 
                    ? 'bg-emerald-800 text-white shadow-premium-lg border-l-4 border-gold' 
                    : 'text-emerald-800/70 hover:bg-emerald-100/50'
                  }`}
                >
                  <item.icon className={`w-6 h-6 ${isActive(item.path) ? 'text-gold' : 'text-emerald-700/60'}`} />
                  <span className="font-black text-base uppercase tracking-widest">{item.name}</span>
                </Link>
              ))}
            </nav>
            <button 
              onClick={handleLogout}
              className="mt-6 flex items-center space-x-4 p-5 rounded-2xl text-rose-600 hover:bg-rose-50 transition-colors font-black text-base uppercase tracking-widest cursor-pointer"
            >
              <LogOut className="w-6 h-6" />
              <span>Đăng xuất</span>
            </button>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto pt-20 lg:pt-0">
        <div className="max-w-7xl mx-auto p-6 md:p-10 lg:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
