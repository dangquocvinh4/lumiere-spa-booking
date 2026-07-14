import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, Search, User } from 'lucide-react';
import api from '../api/axios';

export default function StaffDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await api.get('/staff-portal/schedule');
      setAppointments(res.data);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn đánh dấu ca này đã HOÀN THÀNH?')) return;
    try {
      await api.patch(`/staff-portal/appointment/${id}/complete`);
      fetchSchedule(); // Refresh the list
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi hoàn thành ca.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CHECKED_IN': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'CHECKED_IN': return 'Đã đến (Check-in)';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif text-gray-900 mb-2">Lịch Làm Việc Của Tôi</h1>
        <p className="text-gray-500">Xem và quản lý các ca phục vụ trong ngày của bạn.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Tìm kiếm ca làm việc..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải lịch làm việc...</div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Bạn chưa có lịch hẹn nào được phân công.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((app) => (
              <div key={app.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  
                  {/* Left info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                        {getStatusText(app.status)}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">Mã: {app.id.substring(0, 8)}</span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium text-gray-900">
                          {new Date(app.startAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - 
                          {new Date(app.endAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span>({new Date(app.startAt).toLocaleDateString('vi-VN')})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        Khách hàng: Khách ID ({app.customerId.substring(0, 8)}) {/* Ideally we fetch customerName */}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {app.services?.map(s => (
                        <span key={s.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                          {s.serviceName} ({s.durationMinutes}p)
                        </span>
                      ))}
                    </div>

                    {app.note && (
                      <p className="text-sm text-gray-500 italic">
                        " {app.note} "
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  {app.status === 'CHECKED_IN' && (
                    <button 
                      onClick={() => handleComplete(app.id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-sm"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Hoàn thành ca
                    </button>
                  )}
                  {app.status === 'PENDING' && (
                     <p className="text-xs text-yellow-600 font-medium bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-100">
                       Khách chưa xác nhận/Check-in
                     </p>
                  )}
                  {app.status === 'CONFIRMED' && (
                     <p className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                       Chờ Lễ tân Check-in
                     </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
