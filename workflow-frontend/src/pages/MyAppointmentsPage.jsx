import { useState, useEffect } from 'react';
import api from '../api/axios';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/UI';
import { toast } from 'react-hot-toast';
import { Clock, Calendar, MapPin, User, ChevronRight } from 'lucide-react';

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/my');
      setAppointments(res.data);
    } catch {
      setError('Không thể tải lịch hẹn của bạn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) return;
    
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('Đã hủy lịch hẹn thành công');
      fetchAppointments();
    } catch {
      toast.error('Hủy lịch thất bại. Vui lòng thử lại.');
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      'PENDING': 'bg-yellow-100 text-yellow-700',
      'CONFIRMED': 'bg-green-100 text-green-700',
      'CANCELLED': 'bg-red-100 text-red-700',
      'COMPLETED': 'bg-blue-100 text-blue-700',
      'CHECKED_IN': 'bg-indigo-100 text-indigo-700'
    };
    return configs[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lịch hẹn của tôi</h1>
        <p className="text-gray-500 mt-1">Quản lý và theo dõi lịch sử chăm sóc tại Spa.</p>
      </div>

      {appointments.length === 0 ? (
        <EmptyState message="Bạn chưa có lịch hẹn nào." />
      ) : (
        <div className="space-y-4">
          {appointments.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-100 transition">
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500 font-medium">#{app.id.substring(0, 8)}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-indigo-500" />
                    <span className="font-medium">{new Date(app.startAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3 text-indigo-500" />
                    <span className="font-medium">{new Date(app.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {app.status === 'PENDING' && (
                  <button 
                    onClick={() => handleCancel(app.id)}
                    className="text-red-600 font-semibold text-sm hover:underline"
                  >
                    Hủy lịch
                  </button>
                )}
                <button className="flex items-center space-x-1 text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition">
                  <span>Chi tiết</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
