import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/UI';
import { Search, Filter, Calendar } from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        setServices(res.data);
      } catch {
        setError('Không thể tải danh sách dịch vụ.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dịch vụ Spa</h1>
          <p className="text-gray-500 mt-1">Khám phá các dịch vụ chăm sóc sắc đẹp cao cấp của chúng tôi.</p>
        </div>
        
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
          />
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <EmptyState message="Không tìm thấy dịch vụ nào phù hợp." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
              <div className="h-48 bg-indigo-50 flex items-center justify-center relative">
                {/* Placeholder for service image */}
                <span className="text-indigo-200 font-bold text-4xl group-hover:scale-110 transition duration-300">
                  {service.name.charAt(0)}
                </span>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-indigo-600 shadow-sm">
                  {service.price.toLocaleString()}đ
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition">{service.name}</h3>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">{service.description || 'Chưa có mô tả cho dịch vụ này.'}</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-sm text-gray-400 flex items-center">
                    <Filter className="w-4 h-4 mr-1" />
                    {service.durationMinutes} phút
                  </span>
                  
                  <button 
                    onClick={() => navigate('/booking', { state: { serviceId: service.id } })}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Đặt lịch</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
