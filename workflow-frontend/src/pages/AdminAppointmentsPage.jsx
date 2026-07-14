import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { LoadingSpinner, ErrorMessage, EmptyState, ConfirmModal } from '../components/UI';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  User as UserIcon, 
  Calendar, 
  Clock,
  Filter,
  Check,
  MapPin,
  ClipboardList,
  RefreshCcw,
  List as ListIcon,
  AlignLeft,
  Plus,
  FileDown
} from 'lucide-react';
import TimelineView from '../components/TimelineView';
import * as XLSX from 'xlsx';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStaff, setFilterStaff] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'timeline'

  const [confirmData, setConfirmData] = useState({ isOpen: false, id: null, action: '' });

  const fetchData = async () => {
    try {
      const [resBranches, resStaff] = await Promise.all([
        api.get('/branches'),
        api.get('/staff')
      ]);
      setBranches(resBranches.data);
      setStaffList(resStaff.data);
    } catch (err) {
      console.error('Lỗi khi tải metadata:', err);
    }
  };

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/appointments', {
        params: { 
          status: filterStatus || undefined,
          date: filterDate || undefined,
          branchId: filterBranch || undefined,
          staffId: filterStaff || undefined
        }
      });
      setAppointments(res.data);
    } catch {
      setError('Không thể tải danh sách lịch hẹn.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterDate, filterBranch, filterStaff]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleUpdateStatus = async () => {
    const { id, action } = confirmData;
    const loadingToast = toast.loading('Đang cập nhật...');
    try {
      await api.patch(`/admin/appointments/${id}/${action}`);
      toast.success(`Cập nhật trạng thái thành công`, { id: loadingToast });
      fetchAppointments();
    } catch {
      toast.error('Cập nhật trạng thái thất bại.', { id: loadingToast });
    } finally {
      setConfirmData({ isOpen: false, id: null, action: '' });
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      'PENDING': 'bg-amber-50 text-amber-700 border-amber-200/50',
      'CONFIRMED': 'bg-emerald-50/80 text-emerald-800 border-emerald-200/50',
      'CHECKED_IN': 'bg-teal-50/80 text-teal-800 border-teal-200/50',
      'COMPLETED': 'bg-emerald-850/10 text-emerald-900 border-emerald-850/20',
      'CANCELLED': 'bg-rose-50 text-rose-700 border-rose-200/50',
    };
    return styles[status] || 'bg-gray-50 text-gray-700';
  };

  const getActionLabel = (action) => {
    switch(action) {
      case 'confirm': return 'xác nhận';
      case 'check-in': return 'check-in';
      case 'complete': return 'hoàn thành';
      case 'cancel': return 'hủy';
      default: return action;
    }
  };

  const handleExportExcel = () => {
    if (!appointments || appointments.length === 0) {
      toast.error('Không có dữ liệu để xuất Excel');
      return;
    }

    const exportData = appointments.map(app => ({
      'Mã Lịch Hẹn': app.id.substring(0, 8).toUpperCase(),
      'Khách Hàng': app.customer?.fullName || 'N/A',
      'Điện Thoại': app.customer?.phone || 'N/A',
      'Ngày Đặt': new Date(app.startAt).toLocaleDateString('vi-VN'),
      'Giờ Đặt': new Date(app.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      'Chi Nhánh': app.branch?.name || 'N/A',
      'Nhân Viên Phụ Trách': app.staff?.user?.fullName || 'Chưa phân công',
      'Dịch Vụ': app.services?.map(s => s.serviceName).join(', ') || 'N/A',
      'Trạng Thái': app.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lịch Hẹn');
    
    // Tạo file tên theo ngày giờ xuất
    const fileName = `LichHen_Lumiere_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Đã xuất Excel thành công');
  };

  if (loading && appointments.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
          <div>
            <h1 className="text-4xl font-serif font-medium text-primary tracking-tight">Vận hành Spa</h1>
            <p className="text-primary/60 text-sm font-light mt-1">Theo dõi và điều phối lịch hẹn của khách hàng một cách tối ưu.</p>
          </div>
          <Link to="/admin/booking" className="flex items-center bg-primary text-bg-spa px-6 py-3 font-medium text-xs uppercase tracking-[0.15em] hover-premium transition-all shadow-md cursor-pointer w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4 mr-2" /> Tạo lịch hẹn
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-auto">
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700/40 w-4 h-4 transition-colors group-focus-within:text-emerald-800" />
            <label htmlFor="filter-date" className="sr-only">Lọc theo ngày</label>
            <input 
              id="filter-date"
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-700 shadow-premium-sm transition-all duration-300"
            />
          </div>
          
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700/40 w-4 h-4 transition-colors group-focus-within:text-emerald-800" />
            <label htmlFor="filter-branch" className="sr-only">Lọc theo chi nhánh</label>
            <select 
              id="filter-branch"
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="w-full pl-11 pr-8 py-3.5 bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-700 shadow-premium-sm appearance-none cursor-pointer transition-all duration-300 text-emerald-950"
            >
              <option value="">Tất cả chi nhánh</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="relative group">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700/40 w-4 h-4 transition-colors group-focus-within:text-emerald-800" />
            <label htmlFor="filter-staff" className="sr-only">Lọc theo nhân viên</label>
            <select 
              id="filter-staff"
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="w-full pl-11 pr-8 py-3.5 bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-700 shadow-premium-sm appearance-none cursor-pointer transition-all duration-300 text-emerald-950"
            >
              <option value="">Tất cả nhân viên</option>
              {staffList.map(s => <option key={s.id} value={s.id}>{s.user?.fullName}</option>)}
            </select>
          </div>

          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700/40 w-4 h-4 transition-colors group-focus-within:text-emerald-800" />
            <label htmlFor="filter-status" className="sr-only">Lọc theo trạng thái</label>
            <select 
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-11 pr-8 py-3.5 bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-700 shadow-premium-sm appearance-none cursor-pointer transition-all duration-300 text-emerald-950"
            >
              <option value="">Trạng thái</option>
              <option value="PENDING">ĐANG CHỜ</option>
              <option value="CONFIRMED">ĐẠ XÁC NHẬN</option>
              <option value="CHECKED_IN">ĐÃ CHECK-IN</option>
              <option value="COMPLETED">HOÀN THÀNH</option>
              <option value="CANCELLED">ĐÃ HỦY</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex bg-emerald-900/5 p-1.5 rounded-2xl shadow-inner border border-emerald-900/10 backdrop-blur-sm">
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 ${viewMode === 'list' ? 'bg-white text-emerald-900 shadow-premium-sm' : 'text-emerald-700/60 hover:text-emerald-900 hover:bg-white/50'}`}
          >
            <ListIcon className="w-4 h-4 mr-2" /> Danh sách
          </button>
          <button 
            onClick={() => setViewMode('timeline')}
            className={`flex items-center px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 ${viewMode === 'timeline' ? 'bg-white text-emerald-900 shadow-premium-sm' : 'text-emerald-700/60 hover:text-emerald-900 hover:bg-white/50'}`}
          >
            <AlignLeft className="w-4 h-4 mr-2" /> Lưới thời gian
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportExcel}
            className="flex items-center text-[10px] sm:text-xs text-emerald-900 font-black bg-gold/20 hover:bg-gold hover:text-emerald-950 px-5 py-3 rounded-2xl transition-all duration-300 uppercase tracking-widest cursor-pointer shadow-premium-sm hover:shadow-premium-md border border-gold/30 hover:-translate-y-0.5"
          >
            <FileDown className="w-4 h-4 mr-2" /> Xuất Excel
          </button>
          
          <button 
            onClick={() => { setFilterDate(''); setFilterStatus(''); setFilterBranch(''); setFilterStaff(''); }}
            className="flex items-center text-[10px] sm:text-xs text-white font-black bg-emerald-800 hover:bg-emerald-900 px-5 py-3 rounded-2xl transition-all duration-300 uppercase tracking-widest cursor-pointer shadow-premium-sm hover:shadow-premium-md border border-emerald-700 hover:-translate-y-0.5"
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Làm mới
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {viewMode === 'timeline' ? (
        <TimelineView 
          appointments={appointments} 
          staffList={filterBranch ? staffList.filter(s => s.branchId === filterBranch) : staffList} 
          filterDate={filterDate} 
        />
      ) : (
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-premium-xl border border-emerald-100/20 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-emerald-50/50 text-emerald-800 text-[10px] font-black uppercase tracking-[0.2em] border-b border-emerald-100/20">
                <tr>
                  <th className="px-8 py-6">Khách hàng</th>
                  <th className="px-8 py-6">Lịch hẹn</th>
                  <th className="px-8 py-6">Dịch vụ & Nhân sự</th>
                  <th className="px-8 py-6">Trạng thái</th>
                  <th className="px-8 py-6 text-right">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50/10">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20">
                      <EmptyState message="Không có lịch hẹn nào." />
                    </td>
                  </tr>
                ) : (
                  appointments.map((app) => (
                    <tr key={app.id} className="hover:bg-emerald-50/20 transition-all duration-300 group">
                      <td className="px-8 py-7">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-serif font-black shadow-inner">
                            {app.customer?.fullName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-emerald-950 text-base leading-none group-hover:text-emerald-800 transition-colors">{app.customer?.fullName || 'N/A'}</p>
                            <p className="text-emerald-800/40 text-[9px] font-bold mt-2 uppercase tracking-widest">#{app.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <div className="space-y-2">
                          <div className="flex items-center text-emerald-950 font-bold text-xs uppercase tracking-tight">
                            <Calendar className="w-3.5 h-3.5 mr-2 text-emerald-700" />
                            {new Date(app.startAt).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="flex items-center text-emerald-700/60 font-medium text-xs">
                            <Clock className="w-3.5 h-3.5 mr-2 text-emerald-700/40" />
                            {new Date(app.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center text-[10px] text-gold font-bold uppercase tracking-widest">
                            <MapPin className="w-3 h-3 mr-1 text-gold/60" />
                            {app.branch?.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-1.5">
                            {app.services?.map((s, idx) => (
                              <span key={idx} className="bg-emerald-50/50 border border-emerald-100 text-emerald-950 text-[9px] px-2.5 py-1 rounded-lg font-bold shadow-sm uppercase tracking-wide">
                                {s.serviceName}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center text-emerald-700/70 text-[10px] font-bold uppercase tracking-widest">
                            <ClipboardList className="w-3.5 h-3.5 mr-2 text-gold" />
                            {app.staff?.user?.fullName || 'TỰ ĐỘNG PHÂN PHỐI'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold tracking-widest uppercase border-2 shadow-sm ${getStatusStyle(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-8 py-7 text-right">
                        <div className="flex items-center justify-end space-x-2.5">
                          {app.status === 'PENDING' && (
                            <button 
                              onClick={() => setConfirmData({ isOpen: true, id: app.id, action: 'confirm' })}
                              className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-700 rounded-2xl hover:bg-emerald-800 hover:text-white hover:scale-105 transition-all duration-300 shadow-premium-sm cursor-pointer"
                              title="Xác nhận lịch hẹn"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          {app.status === 'CONFIRMED' && (
                            <button 
                              onClick={() => setConfirmData({ isOpen: true, id: app.id, action: 'check-in' })}
                              className="w-10 h-10 flex items-center justify-center bg-teal-50 text-teal-800 rounded-2xl hover:bg-teal-800 hover:text-white hover:scale-105 transition-all duration-300 shadow-premium-sm cursor-pointer"
                              title="Check-in khách hàng"
                            >
                              <UserIcon className="w-5 h-5" />
                            </button>
                          )}
                          {app.status === 'CHECKED_IN' && (
                            <button 
                              onClick={() => setConfirmData({ isOpen: true, id: app.id, action: 'complete' })}
                              className="w-10 h-10 flex items-center justify-center bg-emerald-800 text-white rounded-2xl hover:bg-emerald-950 hover:scale-105 transition-all duration-300 shadow-premium-md border-b-2 border-gold cursor-pointer"
                              title="Hoàn thành lịch hẹn"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          {(app.status === 'PENDING' || app.status === 'CONFIRMED') && (
                            <button 
                              onClick={() => setConfirmData({ isOpen: true, id: app.id, action: 'cancel' })}
                              className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white hover:scale-105 transition-all duration-300 shadow-premium-sm cursor-pointer"
                              title="Hủy lịch hẹn"
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
      )}

      <ConfirmModal 
        isOpen={confirmData.isOpen}
        title={`Xác nhận ${getActionLabel(confirmData.action)}`}
        message={`Bạn có chắc chắn muốn thực hiện hành động ${getActionLabel(confirmData.action)} cho lịch hẹn này không?`}
        onConfirm={handleUpdateStatus}
        onCancel={() => setConfirmData({ isOpen: false, id: null, action: '' })}
        type={confirmData.action === 'cancel' ? 'danger' : 'success'}
      />
    </div>
  );
}
