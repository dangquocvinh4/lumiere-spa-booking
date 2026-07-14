import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Heart, Shield, ArrowRight, Star, Award, CheckCircle, Users, Quote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { LoadingSpinner } from '../components/UI';

export default function HomePage() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        setServices(res.data.slice(0, 3)); 
      } catch (error) {
        console.error(error);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="space-y-32 pb-20">
      {/* 1. HERO SECTION - Left Aligned, Asymmetric, No padding bloat */}
      <section className="relative min-h-[100dvh] flex items-center px-4 sm:px-8 lg:px-12 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full max-w-[1400px] mx-auto items-center">
          
          {/* Content (Left) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-10 pt-12 lg:pt-0">
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-serif font-medium tracking-tighter text-primary mb-6 leading-none">
                Nơi thời gian <br/>
                <span className="italic font-light">ngừng trôi</span>
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-lg md:text-xl text-primary/70 max-w-[45ch] font-light leading-relaxed mb-12"
            >
              Trải nghiệm không gian nghỉ dưỡng tĩnh tại giữa lòng thành phố. Phục hồi sinh lực, đánh thức vẻ đẹp nguyên bản ẩn sâu bên trong bạn.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-5 mb-16 w-full sm:w-auto"
            >
              <Link 
                to="/booking" 
                className="group px-10 py-5 bg-primary text-white font-medium uppercase tracking-[0.15em] text-xs hover-premium active-press flex items-center justify-center space-x-4 cursor-pointer"
              >
                <span>Đặt lịch ngay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex items-center space-x-6 pt-8 border-t border-primary/10 w-full"
            >
              <div className="flex -space-x-4">
                {["https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100"].map((src, idx) => (
                  <img key={idx} src={src} alt="Avatar khách hàng" className="w-12 h-12 rounded-full border-2 border-bg-spa object-cover shadow-sm" />
                ))}
              </div>
              <p className="text-xs text-primary/60 font-medium">Hơn 5,000+ khách hàng<br/>đã tin tưởng lựa chọn</p>
            </motion.div>
          </div>

          {/* Hero Visual (Right) - Offset Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 h-[600px] lg:h-[800px] relative hidden md:block"
          >
            <img 
              src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=1200&h=1600" 
              alt="Lumiere Spa"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 border border-primary/10 m-4 pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT (Asymmetric Bento Grid instead of 3 equal columns) */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="mb-16">
          <h2 className="text-4xl md:text-6xl font-serif font-medium text-primary tracking-tight">Triết lý <br/><span className="italic font-light">Lumière</span></h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">
          {/* Card 1: Large Image Focus */}
          <div className="md:col-span-8 relative bg-primary/5 hover-premium overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1200&h=800" 
              alt="Chăm sóc tận tâm" 
              className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-multiply opacity-50 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 p-10 flex flex-col justify-end bg-gradient-to-t from-primary/90 to-transparent">
              <h3 className="text-2xl font-serif font-medium text-bg-spa mb-3">Chăm sóc tận tâm</h3>
              <p className="text-bg-spa/80 font-light max-w-md">Kỹ thuật viên giàu kinh nghiệm, lắng nghe và thấu hiểu nhu cầu để thiết kế liệu trình phù hợp nhất.</p>
            </div>
          </div>
          
          {/* Card 2: Simple text */}
          <div className="md:col-span-4 bg-primary text-bg-spa p-10 flex flex-col justify-between hover-premium">
            <Sparkles className="w-8 h-8 text-gold" />
            <div>
              <h3 className="text-2xl font-serif font-medium mb-3">Sản phẩm hữu cơ</h3>
              <p className="text-bg-spa/70 font-light">Sử dụng tinh chất thảo dược hữu cơ nhập khẩu, an toàn tuyệt đối và hiệu quả vượt trội.</p>
            </div>
          </div>
          
          {/* Card 3: Metrics/Text */}
          <div className="md:col-span-4 glass p-10 flex flex-col justify-center hover-premium">
            <span className="text-6xl font-serif text-primary mb-2">100%</span>
            <span className="text-sm font-medium tracking-widest uppercase text-primary/60">Không gian riêng tư</span>
          </div>

          {/* Card 4: Small image */}
          <div className="md:col-span-8 relative hover-premium overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=1200&h=800" 
              alt="An toàn" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 p-10 flex flex-col justify-start">
              <h3 className="text-2xl font-serif font-medium text-primary">Tiêu chuẩn Y tế</h3>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TOP SERVICES (Minimalist Cards) */}
      <section className="bg-primary text-bg-spa py-32 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
            <h2 className="text-5xl lg:text-7xl font-serif font-medium tracking-tight">Dịch vụ <br/><span className="italic font-light text-gold">đặc quyền</span></h2>
            <Link to="/services" className="group flex items-center space-x-4 border-b border-gold/30 pb-2 hover:border-gold transition-colors">
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-gold">Xem toàn bộ</span>
              <ArrowRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {services.map((service) => (
              <Link 
                to={`/services/${service.id}`} 
                key={service.id} 
                className="group block hover-premium"
              >
                <div className="aspect-[3/4] relative overflow-hidden mb-6 bg-primary-hover">
                  {service.imageUrl && (
                    <img 
                      src={service.imageUrl} 
                      alt={service.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-medium mb-2">{service.name}</h3>
                  <div className="flex justify-between text-sm font-light text-bg-spa/60">
                    <span>{service.durationMinutes} phút</span>
                    <span>{(service.price || 0).toLocaleString()}đ</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TESTIMONIALS (1+2 Split) */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-primary mb-8 tracking-tight">Cảm nhận từ <br/><span className="italic font-light">khách hàng</span></h2>
            <div className="p-10 bg-primary/5 hover-premium">
              <Quote className="w-8 h-8 text-gold mb-6" />
              <p className="text-primary text-xl font-serif italic mb-8 leading-relaxed">"Tôi cực kỳ ấn tượng với phong cách phục vụ tại đây. Không gian thư giãn tuyệt đối và kỹ thuật viên rất có tâm. Đây là Spa tốt nhất tôi từng trải nghiệm."</p>
              <div className="flex items-center space-x-4">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" alt="Ngọc Lan" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-medium text-primary">Ngọc Lan</h4>
                  <span className="text-[10px] text-primary/60 uppercase tracking-[0.15em]">Doanh nhân</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-8 border border-primary/10 hover-premium flex flex-col justify-between h-full">
              <p className="text-primary/80 font-light mb-8 leading-relaxed">"Gói chăm sóc phục hồi chuyên sâu tại Lumière thực sự là cứu cánh cho làn da của tôi sau những ngày làm việc căng thẳng."</p>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-serif">M</div>
                <div>
                  <h4 className="font-medium text-primary text-sm">Mai Phương</h4>
                </div>
              </div>
            </div>
            
            <div className="p-8 border border-primary/10 hover-premium flex flex-col justify-between h-full mt-0 sm:mt-12">
              <p className="text-primary/80 font-light mb-8 leading-relaxed">"Mỗi tuần tôi đều ghé qua đây để xả stress. Âm nhạc du dương và sự chăm sóc ân cần làm tôi quên hết mọi áp lực."</p>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-serif">H</div>
                <div>
                  <h4 className="font-medium text-primary text-sm">Hà Trang</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BOOKING CTA (Clean & Direct) */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-20">
        <div className="bg-primary text-bg-spa px-8 py-24 sm:px-20 text-center relative overflow-hidden flex flex-col items-center">
          <h2 className="text-5xl md:text-7xl font-serif font-medium tracking-tight mb-8">Dành thời gian <br/><span className="italic font-light text-gold">cho chính bạn</span></h2>
          <p className="text-bg-spa/70 max-w-xl font-light mb-12">Hãy để Lumière chăm sóc sức khỏe và vẻ đẹp của bạn. Đặt lịch ngay hôm nay.</p>
          
          <Link 
            to="/booking" 
            className="px-12 py-5 bg-bg-spa text-primary font-medium uppercase tracking-[0.2em] text-xs hover-premium active-press"
          >
            Giữ chỗ ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
