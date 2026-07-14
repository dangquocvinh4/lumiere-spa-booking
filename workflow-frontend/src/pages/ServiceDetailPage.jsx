import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { LoadingSpinner, ErrorMessage } from '../components/UI';
import { Clock, DollarSign, Calendar, ChevronLeft, ShieldCheck, Sparkles } from 'lucide-react';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [serviceRes, reviewsRes] = await Promise.all([
          api.get(`/services/${id}`),
          api.get(`/reviews/service/${id}`)
        ]);
        setService(serviceRes.data);
        setReviews(reviewsRes.data.data);
      } catch {
        // Error handled by UI
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!service) return <div className="pt-32"><ErrorMessage message="Không tìm thấy dịch vụ." /></div>;

  return (
    <div className="pb-32">
      {/* Back button */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-xs font-medium text-primary/60 hover:text-primary transition duration-300 cursor-pointer group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          <span className="uppercase tracking-[0.15em]">Trở lại</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Visual Side */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative aspect-[3/4] overflow-hidden bg-primary/5"
          >
            {service.imageUrl ? (
              <img 
                src={service.imageUrl} 
                className="absolute inset-0 w-full h-full object-cover"
                alt={service.name} 
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary to-primary-hover text-bg-spa">
                <Sparkles className="w-12 h-12 text-gold mb-6 opacity-80" />
                <span className="text-sm font-medium uppercase tracking-[0.2em] opacity-80 text-center">Lumière <br/>Signature</span>
              </div>
            )}
            <div className="absolute top-6 left-6">
              <span className="bg-bg-spa/90 backdrop-blur-md text-primary px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em]">
                {service.category || 'Luxury Spa'}
              </span>
            </div>
          </motion.div>

          {/* Content Side */}
          <div className="lg:col-span-6 flex flex-col pt-8 lg:pt-16 sticky top-24">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6 mb-12"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium text-primary tracking-tight leading-none">
                {service.name}
              </h1>
              <p className="text-primary/70 font-light text-lg leading-relaxed max-w-[45ch]">
                {service.description}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-2 gap-8 py-8 border-y border-primary/10 mb-12"
            >
              <div>
                <p className="text-[10px] font-medium text-primary/50 uppercase tracking-[0.15em] mb-2">Thời lượng</p>
                <p className="text-3xl font-serif text-primary">{service.durationMinutes} Phút</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-primary/50 uppercase tracking-[0.15em] mb-2">Chi phí</p>
                <p className="text-3xl font-serif text-primary">{(service.price || 0).toLocaleString()}đ</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <button 
                onClick={() => navigate('/booking', { state: { serviceId: service.id } })}
                className="w-full sm:w-auto bg-primary text-bg-spa px-12 py-5 text-xs font-medium uppercase tracking-[0.2em] hover-premium active-press flex items-center justify-center space-x-3 cursor-pointer"
              >
                <span>Đặt lịch hẹn</span>
                <Calendar className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-3 mt-6 text-primary/60">
                <ShieldCheck className="w-4 h-4 text-gold" />
                <p className="text-[10px] uppercase tracking-[0.1em]">Cam kết tiêu chuẩn 5 sao</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 mt-32">
        <div className="border-t border-primary/10 pt-16">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-5xl font-serif font-medium text-primary tracking-tight">
              Đánh giá từ <br/><span className="italic font-light">khách hàng</span>
            </h2>
          </div>
          
          {reviews.length === 0 ? (
            <p className="text-primary/50 font-light italic">Chưa có đánh giá nào cho liệu trình này.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  key={review.id} 
                  className="p-8 border border-primary/10 hover-premium bg-white/50"
                >
                  <div className="flex text-gold mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-primary/10'}`} />
                    ))}
                  </div>
                  <p className="text-primary/80 font-serif italic text-lg leading-relaxed mb-8">"{review.comment}"</p>
                  
                  <div className="flex items-center justify-between border-t border-primary/10 pt-6">
                    <div>
                      <p className="font-medium text-primary text-sm">{review.customerName}</p>
                      {review.staffName && (
                        <p className="text-[10px] text-primary/50 uppercase tracking-[0.1em] mt-1">
                          Phục vụ bởi: {review.staffName}
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] text-primary/40 uppercase tracking-widest">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
