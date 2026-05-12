import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Calendar, User, LogOut, LogIn } from 'lucide-react';

export default function CustomerLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:rotate-12 transition duration-300">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Spa Harmony
            </span>
          </Link>

          <div className="flex items-center space-x-1 md:space-x-6">
            <Link to="/" className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 transition">
              Dịch vụ
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/my-appointments" className="hidden md:flex items-center text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 transition">
                  <Calendar className="w-4 h-4 mr-2" />
                  Lịch của tôi
                </Link>
                <Link to="/profile" className="flex items-center text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 transition">
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{user?.fullName?.split(' ').pop()}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="Đăng xuất"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
          &copy; 2026 Spa Harmony. Mang lại sự thư giãn tuyệt đối.
        </div>
      </footer>
    </div>
  );
}
