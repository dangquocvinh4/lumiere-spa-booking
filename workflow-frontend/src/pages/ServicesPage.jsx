import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ErrorMessage, LoadingSpinner, EmptyState } from '../components/UI';
import { Search, Clock, Sparkles, Filter, ChevronRight } from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/services');
        setServices(res.data);
      } catch {
        setError('Không thể tải danh sách dịch vụ.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const categories = [...new Set(services.map(s => s.category || 'Dịch vụ Spa'))];

  const filtered = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterCategory === '' || s.category === filterCategory)
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[400px] rounded-[3.5rem] overflow-hidden group shadow-premium-xl">
        <img 
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=2000" 
          alt="Spa Hero" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10000ms] scale-105 group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/85 via-emerald-900/40 to-transparent flex items-center p-8 sm:p-16" />
        <div className="absolute inset-0 flex items-center p-8 sm:p-16">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-black uppercase tracking-widest border border-white/20">
              <Sparkles className="w-4 h-4 text-gold" />
              <span>Khám phá hành trình thư giãn</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-black text-white tracking-tight leading-none">
              Đánh thức <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-gold text-glow">Vẻ đẹp tiềm ẩn</span>
            </h1>
            <p className="text-emerald-50/80 font-medium text-base sm:text-lg leading-relaxed max-w-md">
              Trải nghiệm liệu trình chăm sóc da chuyên sâu và thư giãn tinh thần với công nghệ tiên tiến nhất từ Thụy Sĩ.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Sticky Bar */}
      <div className="sticky top-24 z-30 flex flex-col md:flex-row gap-4 bg-white/70 backdrop-blur-xl p-4 rounded-3xl border border-primary/10 shadow-premium-md">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm kiếm liệu trình..." 
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl outline-none font-bold text-text-spa shadow-inner border border-primary/5 focus:border-primary/20 focus:ring-1 focus:ring-primary/20 transition-all cursor-text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 rounded-2xl border border-primary/5 shadow-inner">
          <Filter className="w-5 h-5 text-primary" />
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="py-4 bg-transparent border-none outline-none font-black text-xs uppercase tracking-widest text-primary appearance-none cursor-pointer pr-8"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Services Grid */}
      {filtered.length === 0 ? (
        <EmptyState message="Không tìm thấy dịch vụ phù hợp." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((s) => (
            <div 
              key={s.id} 
              className="group bg-white rounded-[2.5rem] overflow-hidden border border-primary/5 hover-premium"
            >
              <div className="relative h-64 overflow-hidden">
                {s.imageUrl ? (
                  <img 
                    src={s.imageUrl} 
                    alt={s.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  /* Elegant Fallback Option B: glass-emerald + Sparkles */
                  <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-teal-900 flex flex-col items-center justify-center text-emerald-300 p-4">
                    <div className="glass-emerald p-4 rounded-2xl shadow-premium-sm border border-emerald-400/20">
                      <Sparkles className="w-8 h-8 text-gold animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200 mt-4">Lumière Premium Care</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/95 backdrop-blur-md text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-premium-sm">
                    {s.category || 'Best Seller'}
                  </span>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">{s.name}</h3>
                  <p className="text-gray-400 text-sm mt-3 line-clamp-2 font-medium leading-relaxed">{s.description}</p>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-emerald-50">
                  <div className="flex items-center space-x-2 text-primary">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-black tracking-widest uppercase">{s.durationMinutes} phút</span>
                  </div>
                  <div className="text-2xl font-black text-gray-900 tracking-tighter">
                    {s.price?.toLocaleString()}đ
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/services/${s.id}`)}
                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all shadow-premium-sm group/btn cursor-pointer"
                >
                  <span>Xem chi tiết</span>
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
