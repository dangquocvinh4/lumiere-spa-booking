import { useState, useEffect } from 'react';
import api from '../api/axios';
import { LoadingSpinner } from '../components/UI';
import { 
  Users, 
  CalendarCheck, 
  DollarSign, 
  TrendingUp,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    appointments: 0,
    revenue: 0,
    customers: 0,
    services: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo stats - In real app, call aggregate API
    const fetchStats = async () => {
      try {
        const [resApp, resServ] = await Promise.all([
          api.get('/appointments/admin'),
          api.get('/services')
        ]);
        setStats({
          appointments: resApp.data.length,
          revenue: resApp.data.filter(a => a.status === 'COMPLETED').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
          customers: new Set(resApp.data.map(a => a.customerId)).size,
          services: resServ.data.length
        });
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Tổng lịch hẹn', value: stats.appointments, icon: CalendarCheck, color: 'bg-blue-500' },
    { label: 'Doanh thu (Ước tính)', value: `${stats.revenue.toLocaleString()}đ`, icon: DollarSign, color: 'bg-green-500' },
    { label: 'Khách hàng', value: stats.customers, icon: Users, color: 'bg-purple-500' },
    { label: 'Dịch vụ active', value: stats.services, icon: TrendingUp, color: 'bg-orange-500' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-gray-500">Chào mừng quay trở lại, đây là số liệu hôm nay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`${card.color} p-3 rounded-xl text-white shadow-lg`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-indigo-500" />
            Hoạt động gần đây
          </h3>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm italic">Tính năng đang phát triển...</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Dịch vụ hot
          </h3>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm italic">Tính năng đang phát triển...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
