import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { LoadingSpinner } from '../components/UI';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { 
  Calendar as CalendarIcon, 
  User, 
  MapPin, 
  Sparkles, 
  ChevronRight,
  Clock,
  ArrowLeft,
  CheckCircle2,
  UserX,
  PhoneCall
} from 'lucide-react';

export default function BookingPage() {
  const getServerUrl = () => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    return base.replace(/\/api$/, '');
  };

  const resolveAvatarUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${getServerUrl()}${url}`;
  };

  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [holdingSlot, setHoldingSlot] = useState(false);

  const [bookingData, setBookingData] = useState({
    serviceId: location.state?.serviceId || '',
    branchId: '',
    staffId: '',
    actualStaffId: '',
    date: new Date().toISOString().split('T')[0],
    slot: '',
    note: '',
    customerPhone: '',
    customerName: '',
    voucherCode: ''
  });

  const [discount, setDiscount] = useState(0);

  const user = useAuthStore(state => state.user);
  const isAdmin = user?.roles?.some(r => ['ROLE_ADMIN', 'ROLE_RECEPTIONIST', 'ROLE_MANAGER'].includes(r));

  // Step names
  const steps = [
    { id: 1, name: 'Chi nhánh & Dịch vụ', icon: MapPin },
    { id: 2, name: 'Chuyên viên', icon: User },
    { id: 3, name: 'Thời gian', icon: Clock },
    { id: 4, name: 'Xác nhận', icon: CheckCircle2 }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resServices, resBranches] = await Promise.all([
          api.get('/services'),
          api.get('/branches')
        ]);
        setServices(resServices.data);
        setBranches(resBranches.data);
        if (location.state?.serviceId) setStep(1); // Mặc định ở step 1 nhưng đã chọn service
      } catch {
        toast.error('Không thể tải dữ liệu ban đầu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.state]);

  // Reset staff and slot when service or branch changes
  useEffect(() => {
    setBookingData(prev => ({ ...prev, staffId: '', actualStaffId: '', slot: '' }));
    setStaffList([]);
    setAvailableSlots([]);
    
    if (bookingData.branchId && bookingData.serviceId) {
      api.get('/staff', {
        params: { branchId: bookingData.branchId, serviceId: bookingData.serviceId }
      }).then(res => setStaffList(res.data))
      .catch(() => toast.error('Lỗi khi tải danh sách nhân viên'));
    }
  }, [bookingData.branchId, bookingData.serviceId]);

  // Fetch slots
  useEffect(() => {
    const fetchSlots = async () => {
      if (bookingData.staffId && bookingData.date) {
        try {
          setSlotsLoading(true);
          const params = {
            date: bookingData.date,
            serviceIds: bookingData.serviceId,
            branchId: bookingData.branchId
          };
          if (bookingData.staffId !== 'ANY') {
            params.staffId = bookingData.staffId;
          }
          const res = await api.get('/availability', { params });
          setAvailableSlots(res.data);
        } catch {
          toast.error('Không thể lấy lịch trống');
        } finally {
          setSlotsLoading(false);
        }
      }
    };
    fetchSlots();
  }, [bookingData.staffId, bookingData.date]);

  const selectedService = useMemo(() => services.find(s => s.id === bookingData.serviceId), [services, bookingData.serviceId]);
  const selectedBranch = useMemo(() => branches.find(b => b.id === bookingData.branchId), [branches, bookingData.branchId]);
  const selectedStaff = useMemo(() => staffList.find(s => s.id === bookingData.staffId), [staffList, bookingData.staffId]);

  const handleBooking = async () => {
    const loadingToast = toast.loading('Đang xử lý đặt lịch...');
    try {
      const payload = {
        branchId: bookingData.branchId,
        staffId: bookingData.actualStaffId || bookingData.staffId,
        serviceIds: [bookingData.serviceId],
        startAt: `${bookingData.date}T${bookingData.slot}`,
        note: bookingData.note,
        customerPhone: isAdmin ? bookingData.customerPhone : undefined,
        customerName: isAdmin ? bookingData.customerName : undefined,
        voucherCode: bookingData.voucherCode || undefined,
        depositAmount: (selectedService?.price || 0) * 0.3
      };
      
      const res = await api.post('/appointments', payload);
      const appointment = res.data;
      
      // Get VNPay URL and redirect
      if (isAdmin) {
        toast.success('Đặt lịch thành công!', { id: loadingToast });
        navigate('/admin/appointments');
      } else {
        toast.loading('Đang chuyển hướng đến cổng thanh toán VNPay...', { id: loadingToast });
        const payRes = await api.get(`/payment/create-url?appointmentId=${appointment.id}`);
        window.location.href = payRes.data.url;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đặt lịch thất bại. Vui lòng thử lại.', { id: loadingToast });
      
      // Tải lại danh sách lịch trống của KTV
      if (bookingData.staffId && bookingData.date) {
        setSlotsLoading(true);
        const params = {
          date: bookingData.date,
          serviceIds: bookingData.serviceId,
          branchId: bookingData.branchId
        };
        if (bookingData.staffId !== 'ANY') {
          params.staffId = bookingData.staffId;
        }
        api.get('/availability', { params }).then(res => {
          setAvailableSlots(res.data);
          setBookingData(prev => ({ ...prev, slot: '' })); // Reset slot đã chọn
          setStep(3); // Quay lại bước chọn thời gian
        }).catch(() => toast.error('Không thể cập nhật danh sách lịch trống mới.'))
        .finally(() => setSlotsLoading(false));
      }
    }
  };

  const handleSlotSelection = async (timeStr, staffIdVal) => {
    setHoldingSlot(true);
    const loadingToast = toast.loading('Đang khóa ghế tạm...');
    try {
      await api.post('/appointments/hold', {
        branchId: bookingData.branchId,
        staffId: staffIdVal === 'ANY' ? null : staffIdVal,
        serviceIds: [bookingData.serviceId],
        startAt: `${bookingData.date}T${timeStr}`
      });
      toast.success('Đã giữ chỗ! Khung giờ này sẽ được khóa trong 5 phút.', { id: loadingToast });
      setBookingData({...bookingData, slot: timeStr, actualStaffId: staffIdVal});
    } catch (err) {
      toast.error('Rất tiếc! Khung giờ này vừa có người khác chọn. Vui lòng chọn khung giờ khác.', { id: loadingToast });
      // Refetch slots
      if (bookingData.staffId && bookingData.date) {
        const params = {
          date: bookingData.date,
          serviceIds: bookingData.serviceId,
          branchId: bookingData.branchId
        };
        if (bookingData.staffId !== 'ANY') params.staffId = bookingData.staffId;
        api.get('/availability', { params }).then(res => setAvailableSlots(res.data));
      }
    } finally {
      setHoldingSlot(false);
    }
  };

  const getEndTime = (startTimeStr) => {
    if (!startTimeStr || !selectedService?.durationMinutes) return '';
    const [hours, minutes] = startTimeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + selectedService.durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="min-h-[60vh] flex justify-center items-center"><LoadingSpinner /></div>;

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 px-4 sm:px-8">
      {/* Title */}
      <div className="text-center pt-8">
        <h1 className="text-4xl md:text-5xl font-serif font-medium text-primary tracking-tight">Đặt lịch hẹn</h1>
        <p className="text-primary/60 mt-4 text-sm font-light">Bắt đầu hành trình phục hồi và chăm sóc bản thân</p>
      </div>

      {/* Stepper progress bar */}
      <div className="py-6 border-b border-primary/10 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex-1 flex items-center group w-full relative">
              <div className={`flex items-center space-x-3 transition-colors ${step >= s.id ? 'text-primary' : 'text-primary/30'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step >= s.id ? 'bg-primary text-bg-spa shadow-md' : 'bg-primary/5'}`}>
                  {step > s.id ? <CheckCircle2 className="w-5 h-5 text-bg-spa" /> : <s.icon className="w-4 h-4" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-medium opacity-70">Bước {s.id}</span>
                  <span className="text-sm font-serif font-medium">{s.name}</span>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={`hidden md:block absolute top-1/2 left-[80%] right-[-20%] h-px transition-colors ${step > s.id ? 'bg-primary/40' : 'bg-primary/10'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Main Selection Area */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-12"
              >
                <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-medium text-primary flex items-center">
                    <MapPin className="w-5 h-5 mr-3 text-gold" /> Chọn chi nhánh
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {branches.map(b => (
                      <button 
                        key={b.id}
                        onClick={() => setBookingData({...bookingData, branchId: b.id})}
                        className={`p-6 text-left transition-all duration-300 cursor-pointer ${bookingData.branchId === b.id ? 'border border-primary bg-primary/5' : 'border border-primary/10 bg-white hover:border-primary/30 hover:shadow-sm'}`}
                      >
                        <p className={`font-serif text-lg mb-2 ${bookingData.branchId === b.id ? 'text-primary' : 'text-primary/80'}`}>{b.name}</p>
                        <p className="text-primary/60 text-sm font-light leading-relaxed">{b.address}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-medium text-primary flex items-center">
                    <Sparkles className="w-5 h-5 mr-3 text-gold" /> Chọn dịch vụ
                  </h3>
                  <div className="relative">
                    <select 
                      id="service-select"
                      aria-label="Chọn dịch vụ spa"
                      value={bookingData.serviceId}
                      onChange={(e) => setBookingData({...bookingData, serviceId: e.target.value})}
                      className="w-full p-5 bg-white border border-primary/10 focus:border-primary focus:ring-0 outline-none font-medium text-primary appearance-none cursor-pointer rounded-none"
                    >
                      <option value="" disabled>-- Chọn dịch vụ --</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name} - {(s.price || 0).toLocaleString()}đ</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-primary">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-8">
                  <button 
                    disabled={!bookingData.branchId || !bookingData.serviceId}
                    onClick={() => setStep(2)}
                    className="bg-primary text-bg-spa px-10 py-4 font-medium uppercase tracking-[0.15em] text-xs hover-premium active-press transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center cursor-pointer"
                  >
                    <span>Tiếp tục</span>
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <h3 className="text-2xl font-serif font-medium text-primary flex items-center">
                  <User className="w-5 h-5 mr-3 text-gold" /> Chọn chuyên viên
                </h3>
                
                {staffList.length === 0 ? (
                  <div className="bg-primary/5 p-8 border border-primary/10 text-center space-y-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                      <UserX className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-serif text-primary">Chi nhánh chưa có chuyên viên phù hợp</p>
                      <p className="text-primary/60 text-sm font-light max-w-md mx-auto">
                        Hiện tại dịch vụ này chưa có chuyên viên phục vụ tại chi nhánh đã chọn. Quý khách vui lòng chọn chi nhánh khác.
                      </p>
                    </div>
                    <div className="flex justify-center mt-6">
                      <button 
                        onClick={() => setStep(1)} 
                        className="text-xs uppercase tracking-[0.15em] font-medium text-primary border-b border-primary/30 pb-1 hover:border-primary transition-colors cursor-pointer"
                      >
                        Đổi chi nhánh / dịch vụ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => setBookingData({...bookingData, staffId: 'ANY', actualStaffId: ''})}
                      className={`p-6 flex items-start space-x-4 transition-all duration-300 cursor-pointer text-left ${bookingData.staffId === 'ANY' ? 'border border-primary bg-primary/5' : 'border border-primary/10 bg-white hover:border-primary/30'}`}
                    >
                      <div className={`w-12 h-12 flex items-center justify-center rounded-full ${bookingData.staffId === 'ANY' ? 'bg-primary text-bg-spa' : 'bg-primary/5 text-primary'}`}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-serif text-lg text-primary leading-none">Bất kỳ ai</p>
                        <p className="text-[9px] uppercase tracking-[0.15em] text-primary/50 mt-2 mb-2">Sắp xếp tự động</p>
                        <p className="text-xs font-light text-primary/70">Hiển thị nhiều khung giờ nhất</p>
                      </div>
                    </button>

                    {staffList.map(s => (
                      <button 
                        key={s.id}
                        onClick={() => setBookingData({...bookingData, staffId: s.id, actualStaffId: s.id})}
                        className={`p-6 flex items-start space-x-4 transition-all duration-300 cursor-pointer text-left ${bookingData.staffId === s.id ? 'border border-primary bg-primary/5' : 'border border-primary/10 bg-white hover:border-primary/30'}`}
                      >
                        {s.user?.avatarUrl ? (
                          <img 
                            src={resolveAvatarUrl(s.user.avatarUrl)} 
                            alt={s.user.fullName} 
                            className="w-12 h-12 rounded-full object-cover" 
                          />
                        ) : (
                          <div className={`w-12 h-12 flex items-center justify-center rounded-full font-serif text-lg ${bookingData.staffId === s.id ? 'bg-primary text-bg-spa' : 'bg-primary/5 text-primary'}`}>
                            {s.user?.fullName?.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 pt-1">
                          <p className="font-serif text-lg text-primary leading-none">{s.user?.fullName}</p>
                          <p className="text-[9px] uppercase tracking-[0.15em] text-primary/50 mt-2 mb-2">{s.title}</p>
                          <p className="text-xs font-light text-primary/70 line-clamp-2">{s.bio}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-8 border-t border-primary/10">
                  <button onClick={() => setStep(1)} className="flex items-center text-xs font-medium text-primary/60 hover:text-primary transition-colors uppercase tracking-[0.15em] cursor-pointer">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Trở lại
                  </button>
                  {staffList.length > 0 && (
                    <button 
                      disabled={!bookingData.staffId}
                      onClick={() => setStep(3)}
                      className="bg-primary text-bg-spa px-10 py-4 font-medium uppercase tracking-[0.15em] text-xs hover-premium active-press transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center cursor-pointer"
                    >
                      <span>Tiếp tục</span>
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-10"
              >
                <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-medium text-primary flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-3 text-gold" /> Chọn ngày hẹn
                  </h3>
                  <input 
                    type="date" 
                    aria-label="Chọn ngày đặt lịch"
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    className="w-full p-5 bg-white border border-primary/10 focus:border-primary focus:ring-0 outline-none font-medium text-primary cursor-pointer"
                  />
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-medium text-primary flex items-center">
                    <Clock className="w-5 h-5 mr-3 text-gold" /> Chọn khung giờ
                  </h3>
                  {slotsLoading ? (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                      {availableSlots.map(slotObj => {
                        const isString = typeof slotObj === 'string';
                        const timeStr = isString ? slotObj : slotObj.time;
                        const staffIdVal = isString ? bookingData.staffId : slotObj.staffId;
                        
                        return (
                          <button 
                            key={timeStr}
                            disabled={holdingSlot}
                            onClick={() => handleSlotSelection(timeStr, staffIdVal)}
                            className={`py-4 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer disabled:opacity-50 ${bookingData.slot === timeStr ? 'bg-primary text-bg-spa' : 'bg-primary/5 text-primary hover:bg-primary/10 border border-transparent'}`}
                          >
                            <span className="text-lg font-serif">{timeStr.substring(0, 5)}</span>
                            {selectedService?.durationMinutes && (
                              <span className={`text-[9px] mt-1 uppercase tracking-[0.1em] ${bookingData.slot === timeStr ? 'text-bg-spa/80' : 'text-primary/60'}`}>
                                đến {getEndTime(timeStr.substring(0, 5))}
                              </span>
                            )}
                          </button>
                        );
                      })}
                      {availableSlots.length === 0 && (
                        <p className="col-span-full text-center text-primary/60 italic py-8 border border-primary/5 bg-primary/5">Hết lịch trống cho ngày này. Vui lòng chọn ngày khác.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-primary/10">
                  <button onClick={() => setStep(2)} className="flex items-center text-xs font-medium text-primary/60 hover:text-primary transition-colors uppercase tracking-[0.15em] cursor-pointer">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Trở lại
                  </button>
                  <button 
                    disabled={!bookingData.slot}
                    onClick={() => setStep(4)}
                    className="bg-primary text-bg-spa px-10 py-4 font-medium uppercase tracking-[0.15em] text-xs hover-premium active-press transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center cursor-pointer"
                  >
                    <span>Tiếp tục</span>
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <h3 className="text-2xl font-serif font-medium text-primary flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-3 text-gold" /> Xác nhận thông tin
                </h3>
                
                {isAdmin && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary/5 p-8 border border-primary/10">
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium text-primary/60 uppercase tracking-[0.15em] block">SĐT khách (Bắt buộc)</label>
                      <input 
                        type="tel"
                        className="w-full p-4 bg-white border border-primary/20 focus:border-primary focus:ring-0 outline-none font-medium text-primary"
                        value={bookingData.customerPhone}
                        onChange={(e) => setBookingData({...bookingData, customerPhone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium text-primary/60 uppercase tracking-[0.15em] block">Tên khách hàng</label>
                      <input 
                        type="text"
                        className="w-full p-4 bg-white border border-primary/20 focus:border-primary focus:ring-0 outline-none font-medium text-primary"
                        value={bookingData.customerName}
                        onChange={(e) => setBookingData({...bookingData, customerName: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <label htmlFor="booking-note" className="text-[10px] font-medium text-primary/60 uppercase tracking-[0.15em] block">Lời nhắn cho Spa (Tùy chọn)</label>
                  <textarea 
                    id="booking-note"
                    placeholder="Ghi chú thêm về tình trạng da, yêu cầu đặc biệt..."
                    className="w-full p-5 bg-white border border-primary/10 focus:border-primary outline-none h-32 font-light text-primary resize-none transition-colors"
                    value={bookingData.note}
                    onChange={(e) => setBookingData({...bookingData, note: e.target.value})}
                  />
                </div>

                <div className="space-y-3 pt-4 border-t border-primary/10">
                  <label className="text-[10px] font-medium text-primary/60 uppercase tracking-[0.15em] block">Mã khuyến mãi (Voucher)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Nhập mã voucher"
                      className="w-full p-4 bg-white border border-primary/20 focus:border-primary focus:ring-0 outline-none font-medium text-primary uppercase"
                      value={bookingData.voucherCode}
                      onChange={(e) => setBookingData({...bookingData, voucherCode: e.target.value.toUpperCase()})}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (bookingData.voucherCode) {
                          try {
                            const res = await api.get(`/vouchers/${bookingData.voucherCode}`);
                            const voucher = res.data;
                            const price = selectedService?.price || 0;
                            if (voucher.minOrderValue && price < voucher.minOrderValue) {
                              toast.error(`Đơn hàng phải từ ${voucher.minOrderValue.toLocaleString()}đ để dùng mã này`);
                              setDiscount(0);
                              return;
                            }
                            const now = new Date();
                            if (voucher.startDate && new Date(voucher.startDate) > now) {
                              toast.error('Mã khuyến mãi chưa có hiệu lực');
                              setDiscount(0);
                              return;
                            }
                            if (voucher.endDate && new Date(voucher.endDate) < now) {
                              toast.error('Mã khuyến mãi đã hết hạn');
                              setDiscount(0);
                              return;
                            }
                            if (voucher.usageCount >= voucher.usageLimit) {
                              toast.error('Mã khuyến mãi đã hết lượt sử dụng');
                              setDiscount(0);
                              return;
                            }
                            if (!voucher.active) {
                              toast.error('Mã khuyến mãi không hoạt động');
                              setDiscount(0);
                              return;
                            }
                            
                            let calcDiscount = price * (voucher.discountPercent / 100);
                            if (voucher.maxDiscountAmount && calcDiscount > voucher.maxDiscountAmount) {
                              calcDiscount = voucher.maxDiscountAmount;
                            }
                            setDiscount(calcDiscount);
                            toast.success(`Áp dụng mã thành công (-${voucher.discountPercent}%)`);
                          } catch (err) {
                            toast.error('Mã giảm giá không hợp lệ hoặc không tồn tại');
                            setDiscount(0);
                          }
                        } else {
                          setDiscount(0);
                        }
                      }}
                      className="px-6 bg-primary/10 text-primary hover:bg-primary/20 font-medium text-xs uppercase tracking-widest transition-colors whitespace-nowrap"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-primary/10 gap-6">
                  <button onClick={() => setStep(3)} className="flex items-center text-xs font-medium text-primary/60 hover:text-primary transition-colors uppercase tracking-[0.15em] cursor-pointer w-full sm:w-auto justify-center">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Trở lại
                  </button>
                  <button 
                    disabled={isAdmin && !bookingData.customerPhone}
                    onClick={handleBooking}
                    className="w-full sm:w-auto bg-primary text-bg-spa px-12 py-5 font-medium uppercase tracking-[0.2em] text-xs hover-premium active-press transition-all cursor-pointer disabled:opacity-50"
                  >
                    Thanh toán cọc (30%)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Summary Card - Asymmetric right side */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 p-8 bg-primary/5 border border-primary/10 flex flex-col h-auto min-h-[400px]">
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-8 border-b border-primary/10 pb-4">Tóm tắt lịch hẹn</h4>
            
            <div className="space-y-6 flex-1">
              <div className="flex flex-col">
                <span className="text-[10px] font-medium text-primary/50 uppercase tracking-[0.15em] mb-1">Dịch vụ</span>
                <span className="font-serif text-xl text-primary leading-tight">{selectedService?.name || 'Chưa chọn'}</span>
                {selectedService?.durationMinutes && (
                  <span className="text-xs text-primary/60 mt-1 font-light">{selectedService.durationMinutes} phút</span>
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-medium text-primary/50 uppercase tracking-[0.15em] mb-1">Thời gian</span>
                <span className="font-serif text-lg text-primary leading-tight">
                  {bookingData.slot ? `${bookingData.slot.substring(0, 5)} - ` : 'Chưa chọn'}
                  {bookingData.date ? new Date(bookingData.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-medium text-primary/50 uppercase tracking-[0.15em] mb-1">Địa điểm</span>
                <span className="font-serif text-lg text-primary leading-tight">{selectedBranch?.name || 'Chưa chọn'}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-medium text-primary/50 uppercase tracking-[0.15em] mb-1">Chuyên viên</span>
                <span className="font-serif text-lg text-primary leading-tight">
                  {bookingData.staffId === 'ANY' 
                    ? (bookingData.actualStaffId 
                        ? (staffList.find(s => s.id === bookingData.actualStaffId)?.user?.fullName || 'Tự động sắp xếp') 
                        : 'Bất kỳ ai (Tự động sắp xếp)')
                    : (selectedStaff?.user?.fullName || 'Chưa chọn')}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-primary/10 space-y-3">
              <div className="flex justify-between items-center text-primary/60">
                <span className="text-xs uppercase tracking-widest">Tạm tính</span>
                <span className="text-sm font-medium">{(selectedService?.price || 0).toLocaleString()}đ</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="text-xs uppercase tracking-widest">Giảm giá (Voucher)</span>
                  <span className="text-sm font-medium">-{discount.toLocaleString()}đ</span>
                </div>
              )}
              <div className="flex justify-between items-center text-primary border-t border-primary/10 pt-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.15em]">Tổng cộng</span>
                <span className="text-3xl font-serif tracking-tight">{Math.max(0, (selectedService?.price || 0) - discount).toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between items-center text-primary/80 mt-2">
                <span className="text-[10px] font-medium uppercase tracking-[0.15em]">Thanh toán cọc 30% (qua VNPay)</span>
                <span className="text-xl font-serif tracking-tight">{Math.max(0, ((selectedService?.price || 0) - discount) * 0.3).toLocaleString()}đ</span>
              </div>
            </div>
            
            {bookingData.slot && (
              <div className="mt-6 p-4 bg-primary text-bg-spa text-center">
                <p className="text-[10px] uppercase tracking-widest opacity-80">Ghế đang được giữ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
