import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, XCircle, Home, ArrowRight, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, failed
  const [message, setMessage] = useState('Đang xác thực thông tin thanh toán...');
  const navigate = useNavigate();
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    // Collect all search params
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    if (Object.keys(params).length === 0) {
      setStatus('failed');
      setMessage('Không có thông tin thanh toán hợp lệ.');
      return;
    }

    // Call API exactly once
    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;

    const verifyPayment = async () => {
      try {
        const res = await api.get('/payment/verify-vnpay', { params });
        if (res.data && res.data.status === 'success') {
          setStatus('success');
          setMessage(res.data.message || 'Thanh toán thành công!');
        } else {
          setStatus('failed');
          setMessage(res.data?.message || 'Xác thực thanh toán thất bại.');
        }
      } catch (err) {
        setStatus('failed');
        setMessage(err.response?.data?.message || 'Đã xảy ra lỗi khi xác thực với máy chủ.');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-bg-spa p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-primary rounded-[2.5rem] p-10 text-center shadow-premium-xl relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/10 rounded-tr-full -z-10" />

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <Loader className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-medium text-primary mb-2 tracking-wide">Đang xử lý</h2>
              <p className="text-primary/60 text-sm">{message}</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center space-y-6"
          >
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner mb-2">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-medium text-primary mb-2">Giao dịch thành công</h2>
              <p className="text-primary/70 text-sm mb-8 leading-relaxed">Cảm ơn bạn đã sử dụng dịch vụ của Lumière Spa. Lịch hẹn của bạn đã được thanh toán và xác nhận.</p>
            </div>
            
            <div className="flex flex-col w-full space-y-3">
              <Link 
                to="/my-appointments" 
                className="w-full py-4 bg-primary text-bg-spa rounded-xl font-medium uppercase tracking-[0.15em] text-xs hover-premium transition-all shadow-md flex items-center justify-center"
              >
                Xem lịch hẹn <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link 
                to="/" 
                className="w-full py-4 bg-transparent border border-primary/20 text-primary rounded-xl font-medium uppercase tracking-[0.15em] text-xs hover:bg-primary/5 transition-all flex items-center justify-center"
              >
                <Home className="w-4 h-4 ml-2" /> Về trang chủ
              </Link>
            </div>
          </motion.div>
        )}

        {status === 'failed' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center space-y-6"
          >
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center shadow-inner mb-2">
              <XCircle className="w-12 h-12 text-rose-600" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-medium text-primary mb-2">Giao dịch thất bại</h2>
              <p className="text-rose-600/80 text-sm mb-8">{message}</p>
            </div>
            
            <div className="flex flex-col w-full space-y-3">
              <button 
                onClick={() => navigate('/my-appointments')}
                className="w-full py-4 bg-primary text-bg-spa rounded-xl font-medium uppercase tracking-[0.15em] text-xs hover-premium transition-all shadow-md"
              >
                Thử lại sau
              </button>
              <Link 
                to="/" 
                className="w-full py-4 bg-transparent border border-primary/20 text-primary rounded-xl font-medium uppercase tracking-[0.15em] text-xs hover:bg-primary/5 transition-all flex items-center justify-center"
              >
                <Home className="w-4 h-4 ml-2" /> Về trang chủ
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
