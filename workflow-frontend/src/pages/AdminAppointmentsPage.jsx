import { useState, useEffect } from 'react';
import api from '../api/axios';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/UI';
import { toast } from 'react-hot-toast';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar, 
  Clock,
  Filter,
  Check
} from 'lucide-react';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments/admin', {
        params: { status: filterStatus }
      });
      setAppointments(res.data);
    } catch {
      setError('Không thể tải danh sách lịch hẹn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  const handleUpdateStatus = async (id, newStatus) => {
    const endpointMap = {
      'CONFIRMED': `/appointments/${id}/confirm`,
      'CHECKED_IN': `/appointments/${id}/check-in`,
      'COMPLETED': `/appointments/${id}/complete`,
      'CANCELLED': `/appointments/${id}/cancel`
    };

    try {
      await api.patch(endpointMap[newStatus]);
      toast.success(`Đã chuyển trạng thái sang ${newStatus}`);
      fetchAppointments();
    } catch {
      toast.error('Cập nhật trạng thái thất bại.');
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      'PENDING': 'bg-yellow-50 text-yellow-600 border-yellow-100',
      'CONFIRMED': 'bg-green-50 text-green-600 border-green-100',
      'CHECKED_IN': 'bg-indigo-50 text-indigo-600 border-indigo-100',
      'COMPLETED': 'bg-blue-50 text-blue-600 border-blue-100',
      'CANCELLED': 'bg-red-50 text-red-600 border-red-100',
    };
    return styles[status] || 'bg-gray-50 text-gray-600';
  };

  if (loading && appointments.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý lịch hẹn</h1>
          <p className="text-gray-500 text-sm">Xem và cập nhật lịch trình của khách hàng.</p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Đang chờ</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="CHECKED_IN">Đã Check-in</option>
            <option value="COMPLETED">Đã xong</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Khách hàng</th>
              <th className="px-6 py-4">Thời gian</th>
              <th className="px-6 py-4">Dịch vụ/Ghi chú</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12">
                  <EmptyState message="Không có lịch hẹn nào." />
                </td>
              </tr>
            ) : (
              appointments.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="text-sm">
                        <p className="font-bold text-gray-900">Khách hàng</p>
                        <p className="text-gray-400 text-xs truncate w-32">{app.customerId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm space-y-1">
                      <p className="font-medium text-gray-900 flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        {new Date(app.startAt).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-gray-400" />
                        {new Date(app.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-600 italic line-clamp-1">{app.note || 'Không có ghi chú'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {app.status === 'PENDING' && (
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                          className="p-1 hover:bg-green-100 text-green-600 rounded transition"
                          title="Xác nhận"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      {app.status === 'CONFIRMED' && (
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'CHECKED_IN')}
                          className="p-1 hover:bg-indigo-100 text-indigo-600 rounded transition"
                          title="Check-in"
                        >
                          <User className="w-5 h-5" />
                        </button>
                      )}
                      {app.status === 'CHECKED_IN' && (
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                          className="p-1 hover:bg-blue-100 text-blue-600 rounded transition"
                          title="Hoàn thành"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      {(app.status === 'PENDING' || app.status === 'CONFIRMED') && (
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                          className="p-1 hover:bg-red-100 text-red-600 rounded transition"
                          title="Hủy"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
