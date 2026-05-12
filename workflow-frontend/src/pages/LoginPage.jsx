import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success) {
        login(user, token);
        
        // Redirect based on roles
        if (user.roles.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_MANAGER')) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(res.data.message || 'Đăng nhập thất bại.');
      }
    } catch {
      console.error('Login error:', err);
      setError(err.response?.data || 'Lỗi kết nối đến server.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-96 border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Đăng nhập</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Đăng nhập
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-4 text-center">Tài khoản test: admin@example.com / password</p>
      </div>
    </div>
  );
}
