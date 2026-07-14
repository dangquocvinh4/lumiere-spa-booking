import { useState, useEffect } from 'react';
import api from '../api/axios';
import { LoadingSpinner, ErrorMessage } from '../components/UI';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Briefcase, 
  Clock, 
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import HeatmapChart from '../components/HeatmapChart';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const user = useAuthStore(state => state.user);
  const isReceptionist = user?.roles?.includes('ROLE_RECEPTIONIST');

  useEffect(() => {
    if (isReceptionist) return;
    const fetch = async () => {
      try {
        const res = await api.get('/admin/dashboard/summary');
        setSummary(res.data);
      } catch {
        setError('Không thể tải dữ liệu tổng quan.');
      } finally {
        setLoading(false);
      }
    };
    if (!isReceptionist) {
      fetch();
    }
  }, [isReceptionist]);

  if (isReceptionist) {
    return <Navigate to="/admin/appointments" replace />;
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const handleExportDashboard = () => {
    if (!summary) {
      toast.error('Không có dữ liệu để xuất');
      return;
    }

    // Sheet 1: Tổng quan
    const overviewData = [
      { 'Chỉ tiêu': 'Tổng doanh thu', 'Giá trị': summary.totalRevenue || 0 },
      { 'Chỉ tiêu': 'Tổng lịch hẹn', 'Giá trị': summary.totalAppointments || 0 },
      { 'Chỉ tiêu': 'Lịch hẹn hôm nay', 'Giá trị': summary.todayAppointments || 0 },
      { 'Chỉ tiêu': 'Tổng nhân viên', 'Giá trị': summary.totalStaff || 0 },
    ];
    const wsOverview = XLSX.utils.json_to_sheet(overviewData);

    // Sheet 2: Lịch hẹn gần đây
    const recentData = (summary.recentAppointments || []).map(app => ({
      'Mã Lịch Hẹn': app.id.substring(0, 8).toUpperCase(),
      'Khách Hàng': app.customer?.fullName || 'N/A',
      'Ngày Giờ': new Date(app.startAt).toLocaleString('vi-VN'),
      'Dịch Vụ': app.services?.[0]?.serviceName || 'N/A',
      'Trạng Thái': app.status
    }));
    const wsRecent = XLSX.utils.json_to_sheet(recentData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, wsOverview, 'Tổng Quan');
    XLSX.utils.book_append_sheet(workbook, wsRecent, 'Lịch Hẹn Gần Đây');

    const fileName = `BaoCao_Lumiere_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Đã xuất Báo cáo thành công');
  };

  const stats = [
    { 
      name: 'Tổng lịch hẹn', 
      value: summary?.totalAppointments || 0, 
      icon: Calendar, 
      bgClass: 'bg-emerald-100/50 text-emerald-800', 
      pillClass: 'bg-emerald-200/50 text-emerald-950', 
      trend: 'Tất cả' 
    },
    { 
      name: 'Lịch hôm nay', 
      value: summary?.todayAppointments || 0, 
      icon: Clock, 
      bgClass: 'bg-teal-100/50 text-teal-800', 
      pillClass: 'bg-teal-200/50 text-teal-950', 
      trend: 'Hôm nay' 
    },
    { 
      name: 'Doanh thu', 
      value: `${(summary?.totalRevenue || 0).toLocaleString()}đ`, 
      icon: TrendingUp, 
      bgClass: 'bg-amber-100/50 text-amber-800', 
      pillClass: 'bg-amber-200/50 text-amber-950', 
      trend: 'Tổng cộng' 
    },
    { 
      name: 'Nhân viên', 
      value: summary?.totalStaff || 0, 
      icon: UserCheck, 
      bgClass: 'bg-gold-hover/10 text-gold-hover', 
      pillClass: 'bg-gold-hover/20 text-gold-hover', 
      trend: 'Đang trực' 
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-emerald-950 tracking-tight">Chào buổi sáng, Admin</h1>
          <p className="text-emerald-700/60 font-medium mt-2">Dưới đây là tóm tắt hoạt động của Lumière Spa hôm nay.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-md px-6 py-3.5 rounded-2xl shadow-premium-sm border border-emerald-100/30">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em]">Hệ thống trực tuyến</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-premium-md border border-emerald-100/20 flex flex-col justify-between hover-premium group overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 -rotate-12" />
            <div className="flex items-center justify-between relative z-10">
              <div className={`p-4 rounded-2xl shadow-inner group-hover:scale-110 transition-transform ${stat.bgClass}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest ${stat.pillClass}`}>{stat.trend}</span>
            </div>
            <div className="mt-8 relative z-10">
              <p className="text-[10px] font-bold text-emerald-800/40 uppercase tracking-[0.15em]">{stat.name}</p>
              <h3 className="text-3xl font-serif font-black text-emerald-950 mt-1 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-serif font-black text-emerald-950 flex items-center">
              <Sparkles className="w-5 h-5 mr-3 text-gold animate-pulse" /> Lịch hẹn gần đây
            </h3>
            <Link to="/admin/appointments" className="text-xs font-black text-emerald-800 hover:text-gold transition-colors uppercase tracking-[0.15em]">Xem tất cả</Link>
          </div>
          
          <div className="bg-white/80 backdrop-blur-md rounded-[3rem] shadow-premium-lg border border-emerald-100/20 overflow-hidden">
            <div className="divide-y divide-emerald-100/10">
              {summary?.recentAppointments?.map((app) => (
                <Link to="/admin/appointments" key={app.id} className="p-8 flex items-center justify-between hover:bg-emerald-50/40 transition-all group cursor-pointer block">
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center font-serif font-bold group-hover:bg-emerald-800 group-hover:text-white transition-all shadow-inner">
                      {app.customer?.fullName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-emerald-950 text-lg group-hover:text-emerald-800 transition-colors">{app.customer?.fullName}</p>
                      <p className="text-xs text-emerald-700/60 font-bold uppercase tracking-widest mt-1">{app.services?.[0]?.serviceName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-emerald-950">{new Date(app.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${app.status === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-600'}`}>{app.status}</p>
                    </div>
                    <div className="p-3 bg-emerald-50/50 rounded-xl text-emerald-700 group-hover:text-gold group-hover:bg-emerald-800 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              ))}
              {(!summary?.recentAppointments || summary.recentAppointments.length === 0) && (
                <div className="p-20 text-center text-emerald-700/40 font-serif italic">Chưa có lịch hẹn mới.</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Chart */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-black text-emerald-950 px-4">Tác vụ nhanh</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { name: 'Cấu hình dịch vụ', path: '/admin/services', icon: Briefcase, desc: 'Thêm hoặc cập nhật bảng giá', colorClass: 'bg-emerald-50 text-emerald-700' },
                { name: 'Quản lý nhân viên', path: '/admin/staff', icon: Users, desc: 'Phân lịch và ngày nghỉ', colorClass: 'bg-teal-50 text-teal-700' },
                { name: 'Hệ thống chi nhánh', path: '/admin/branches', icon: ArrowUpRight, desc: 'Mở rộng quy mô Spa', colorClass: 'bg-amber-50 text-amber-700' },
              ].map((action) => (
                <Link 
                  key={action.name}
                  to={action.path}
                  className="group bg-white/85 backdrop-blur-md p-6 rounded-[2rem] shadow-premium-sm border border-emerald-100/10 flex items-center space-x-5 hover:bg-emerald-800 transition-all duration-300 cursor-pointer"
                >
                  <div className={`p-4 rounded-2xl group-hover:bg-white group-hover:text-emerald-900 transition-all shadow-inner ${action.colorClass}`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-950 uppercase tracking-widest text-xs group-hover:text-white transition-colors">{action.name}</h4>
                    <p className="text-[10px] text-emerald-700/60 font-bold group-hover:text-emerald-100 transition-colors mt-1">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Revenue Chart placeholder */}
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] shadow-premium-lg border border-emerald-100/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black text-emerald-950 uppercase tracking-[0.1em]">Doanh Thu Gần Đây</h2>
              <button 
                onClick={handleExportDashboard}
                className="text-[10px] font-black text-gold hover:text-white hover:bg-gold px-4 py-2 rounded-xl transition-all duration-300 uppercase tracking-widest cursor-pointer border border-gold/30 shadow-sm"
              >
                Xuất Báo Cáo
              </button>
            </div>
            <div className="h-44 flex items-end justify-between space-x-2.5 pt-6">
              {[40, 60, 30, 85, 50, 95, 75].map((height, i) => (
                <div key={i} className="w-full bg-emerald-100/30 rounded-t-xl relative group h-full flex flex-col justify-end">
                  <div 
                    className="w-full bg-emerald-600 rounded-t-xl group-hover:bg-gold transition-colors duration-300 cursor-pointer"
                    style={{ height: `${height}%` }}
                  />
                  <div className="absolute -bottom-6 w-full text-center text-[9px] font-black text-emerald-800/40">T{i+2}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <HeatmapChart />
      </div>
    </div>
  );
}
