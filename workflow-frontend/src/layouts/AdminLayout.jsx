import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Settings, 
  Users, 
  MapPin, 
  LogOut,
  Sparkles
} from 'lucide-react';

export default function AdminLayout() {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/appointments', icon: CalendarCheck, label: 'Lịch hẹn' },
    { path: '/admin/services', icon: Settings, label: 'Dịch vụ' },
    { path: '/admin/staff', icon: Users, label: 'Nhân viên' },
    { path: '/admin/branches', icon: MapPin, label: 'Chi nhánh' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 flex items-center space-x-2 border-b border-slate-800">
          <Sparkles className="text-indigo-400 w-8 h-8" />
          <span className="text-xl font-bold text-white">Spa Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => 
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition font-medium ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 hover:text-red-500 transition font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
