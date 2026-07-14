import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Sparkles, 
  Search, 
  Calendar, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWidget from '../components/ChatWidget';

export default function CustomerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dịch vụ', path: '/services', icon: Search },
    { name: 'Đặt lịch', path: '/booking', icon: Calendar },
    { name: 'Lịch của tôi', path: '/my-appointments', icon: Sparkles },
    { name: 'Hồ sơ', path: '/profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-bg-spa selection:bg-gold/20 selection:text-primary">
      {/* Elegant Floating Header */}
      <div className="w-full px-4 sm:px-8 lg:px-12 pt-6 fixed top-0 z-50 pointer-events-none">
        <header className="max-w-[1400px] mx-auto pointer-events-auto">
          <div className="glass rounded-full px-6 sm:px-8 py-4 flex justify-between items-center transition-all duration-300">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
              <Sparkles className="w-5 h-5 text-gold group-hover:rotate-12 transition-transform duration-500" />
              <span className="text-xl font-serif font-medium text-primary tracking-wide">
                Lumière <span className="italic font-light">Spa</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-10">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-xs uppercase tracking-[0.15em] font-medium transition-colors duration-300 cursor-pointer ${
                    isActive(item.path) 
                      ? 'text-primary' 
                      : 'text-primary/50 hover:text-primary'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="w-px h-4 bg-primary/10" />

              {user ? (
                <button 
                  onClick={handleLogout}
                  className="text-xs uppercase tracking-[0.15em] font-medium text-primary/50 hover:text-red-500 transition-colors duration-300 cursor-pointer"
                >
                  Đăng xuất
                </button>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-primary text-bg-spa px-6 py-2.5 rounded-full text-xs font-medium uppercase tracking-[0.15em] hover-premium active-press cursor-pointer flex items-center space-x-2"
                >
                  <span>Đăng nhập</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </nav>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-primary hover:bg-primary/5 rounded-full transition-colors cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Menu Overlay with Framer Motion */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 md:hidden bg-bg-spa/98 backdrop-blur-3xl pt-32 px-6 pb-8 flex flex-col"
          >
            <div className="space-y-2 flex-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-4 text-3xl font-serif font-medium py-4 border-b border-primary/5 transition-colors cursor-pointer ${
                      isActive(item.path) ? 'text-primary' : 'text-primary/40 hover:text-primary'
                    }`}
                  >
                    <span>{item.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8">
              {user ? (
                <button 
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="flex items-center space-x-4 text-xl font-serif font-medium py-4 text-red-500 w-full cursor-pointer"
                >
                  <span>Đăng xuất</span>
                </button>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full bg-primary text-bg-spa text-center py-5 rounded-2xl font-medium text-sm uppercase tracking-widest cursor-pointer"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full pt-20">
        <Outlet />
      </main>

      {/* Minimalist Footer */}
      <footer className="bg-primary text-bg-spa pt-24 pb-12 mt-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 mb-24">
            <div>
              <div className="flex items-center space-x-3 mb-8">
                <Sparkles className="w-6 h-6 text-gold" />
                <span className="text-3xl font-serif font-medium tracking-wide">
                  Lumière <span className="italic font-light text-gold">Spa</span>
                </span>
              </div>
              <p className="text-bg-spa/60 text-lg font-light max-w-sm leading-relaxed">
                Trải nghiệm chăm sóc sức khỏe và nhan sắc tĩnh tại, đánh thức vẻ đẹp nguyên bản của bạn.
              </p>
            </div>
            
            <div className="flex flex-col md:items-end justify-start space-y-4 text-sm font-medium uppercase tracking-widest text-bg-spa/60">
              <a href="#" className="hover:text-gold transition-colors cursor-pointer">Chính sách bảo mật</a>
              <a href="#" className="hover:text-gold transition-colors cursor-pointer">Điều khoản dịch vụ</a>
              <a href="#" className="hover:text-gold transition-colors cursor-pointer">Liên hệ hợp tác</a>
            </div>
          </div>
          
          <div className="border-t border-bg-spa/10 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center">
            <p className="text-bg-spa/40 text-xs font-light tracking-widest uppercase mb-4 md:mb-0">
              © 2026 Lumière Spa.
            </p>
            <p className="text-bg-spa/40 text-xs font-light tracking-widest uppercase">
              Designed with Taste
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
