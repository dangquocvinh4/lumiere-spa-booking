import { useState, useEffect } from 'react';
import api from '../api/axios';
import { LoadingSpinner, ErrorMessage, Modal, ConfirmModal, EmptyState } from '../components/UI';
import { toast } from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  XCircle, 
  ChevronRight,
  User,
  MessageSquare,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [appToCancel, setAppToCancel] = useState(null);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [appToReview, setAppToReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
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

  const handleCancel = async () => {
    if (!appToCancel) return;
    try {
      await api.patch(`/appointments/${appToCancel.id}/cancel`);
      toast.success('Đã hủy lịch hẹn thành công.');
      fetchAppointments();
      setSelectedApp(null);
    } catch {
      toast.error('Không thể hủy lịch hẹn này.');
    } finally {
      setShowConfirmCancel(false);
      setAppToCancel(null);
    }
  };

  const handlePayment = async (app) => {
    try {
      const toastId = toast.loading('Đang khởi tạo thanh toán VNPay...');
      const res = await api.get('/payment/create-url', { params: { appointmentId: app.id } });
      toast.dismiss(toastId);
      if (res.data && res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Không thể tạo URL thanh toán.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi khởi tạo thanh toán VNPay.');
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        appointmentId: appToReview.id,
        serviceId: appToReview.services[0].serviceId,
        rating,
        comment
      });
      toast.success('Cảm ơn bạn đã gửi đánh giá!');
      setShowReviewModal(false);
      setAppToReview(null);
      setRating(0);
      setComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi đánh giá.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFIRMED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CHECKED_IN': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMPLETED': return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'CANCELLED': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getGoogleCalendarUrl = (app) => {
    if (!app || !app.startAt) return '#';
    const startDate = new Date(app.startAt);
    const duration = app.services?.[0]?.durationMinutes || 60;
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000); 
    
    const formatTime = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const text = encodeURIComponent(`Lịch hẹn Spa: ${app.services?.[0]?.serviceName || 'Dịch vụ'}`);
    const dates = `${formatTime(startDate)}/${formatTime(endDate)}`;
    const details = encodeURIComponent(`Lịch hẹn chăm sóc tại Lumière Spa.\nChi nhánh: ${app.branch?.name}\nKỹ thuật viên: ${app.staff?.user?.fullName || 'Tự động phân bổ'}`);
    const location = encodeURIComponent(app.branch?.address || app.branch?.name || '');
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-full text-primary text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
          <Sparkles className="w-4 h-4 text-gold animate-pulse" />
          <span>Hành trình làm đẹp của bạn</span>
        </div>
        <h1 className="text-5xl font-serif font-black text-gray-900 tracking-tight">Lịch hẹn <span className="text-primary">của tôi</span></h1>
        <p className="text-gray-500 font-medium max-w-lg mx-auto">Theo dõi trạng thái và quản lý các buổi chăm sóc da chuyên sâu tại Lumière Spa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {appointments.length === 0 ? (
          <div className="col-span-full">
            <EmptyState message="Bạn chưa có lịch hẹn nào." />
          </div>
        ) : (
          appointments.map((app) => (
            <motion.div 
              layoutId={app.id}
              key={app.id} 
              onClick={() => setSelectedApp(app)}
              className="group bg-white p-8 rounded-[3rem] border border-primary/5 hover-premium relative overflow-hidden cursor-pointer shadow-premium-md"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="bg-primary/10 p-4 rounded-2xl text-primary shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="flex flex-col space-y-2 items-end">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border shadow-sm ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                  {app.paymentStatus === 'PAID' && (
                    <span className="flex items-center text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">
                      <CheckCircle className="w-3 h-3 mr-1" /> Đã TT
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-serif font-black text-gray-900 leading-tight line-clamp-1 group-hover:text-primary transition-colors">{app.services?.[0]?.serviceName}</h3>
                <div className="flex items-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  <span>{app.branch?.name}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-emerald-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">Thời gian</span>
                  <span className="font-black text-gray-950 mt-0.5">{new Date(app.startAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-gray-300 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Appointment Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <Modal onClose={() => setSelectedApp(null)} title="Chi tiết lịch hẹn" wide>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="p-8 bg-emerald-950 rounded-[2.5rem] text-white shadow-premium-lg relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles className="w-24 h-24 text-gold" /></div>
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-4">Trạng thái hiện tại</p>
                  <h4 className="text-4xl font-serif font-black tracking-tight mb-6">{selectedApp.status}</h4>
                  
                  <div className="space-y-4 border-t border-emerald-900/60 pt-6">
                    <div className="flex items-center space-x-3 text-emerald-100">
                      <Clock className="w-5 h-5 text-gold" />
                      <span className="font-bold text-sm sm:text-base">{new Date(selectedApp.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {new Date(selectedApp.startAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-emerald-100">
                      <MapPin className="w-5 h-5 text-gold" />
                      <span className="font-bold text-sm sm:text-base">{selectedApp.branch?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="glass p-8 rounded-[2.5rem] border border-primary/5 shadow-premium-sm space-y-6">
                  <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Kỹ thuật viên phục vụ</h5>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black shadow-inner">
                      {selectedApp.staff?.user?.fullName?.charAt(0) || <User className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-serif font-black text-gray-900 text-lg leading-tight">{selectedApp.staff?.user?.fullName || 'Tự động phân bổ'}</p>
                      <p className="text-primary text-[9px] font-black uppercase tracking-widest mt-1">{selectedApp.staff?.title || 'Chuyên viên Spa'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <h5 className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Danh sách dịch vụ</h5>
                  <div className="space-y-3">
                    {selectedApp.services?.map((s, idx) => (
                      <div key={idx} className="p-6 bg-gray-50/80 border border-gray-100 rounded-2xl flex justify-between items-center group hover:bg-primary/5 transition-colors duration-300">
                        <div>
                          <p className="font-black text-gray-900">{s.serviceName}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Snapshot Price</p>
                        </div>
                        <p className="font-black text-primary text-lg">{s.price?.toLocaleString()}đ</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedApp.note && (
                  <div className="space-y-3">
                    <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                      <MessageSquare className="w-3 h-3 mr-2" /> Ghi chú của bạn
                    </h5>
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/5 italic text-emerald-950/80 font-medium leading-relaxed">
                      "{selectedApp.note}"
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-100">
                  <a 
                    href={getGoogleCalendarUrl(selectedApp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-5 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-lg shadow-blue-100 flex items-center justify-center space-x-3 mb-4 cursor-pointer"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Lưu vào Google Calendar</span>
                  </a>
                </div>

                {(selectedApp.status === 'PENDING' || selectedApp.status === 'CONFIRMED') && (
                  <div className="pt-6 border-t border-gray-100">
                    {new Date(selectedApp.startAt).getTime() - new Date().getTime() < 2 * 60 * 60 * 1000 ? (
                      <div className="w-full py-5 bg-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-3 cursor-not-allowed">
                        <XCircle className="w-5 h-5" />
                        <span>Không thể hủy (Sắp đến giờ hẹn)</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setAppToCancel(selectedApp); setShowConfirmCancel(true); }}
                        className="w-full py-5 bg-rose-50 text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-lg shadow-rose-100 flex items-center justify-center space-x-3 group cursor-pointer"
                      >
                        <XCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Hủy lịch hẹn này</span>
                      </button>
                    )}
                    <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-widest mt-4">
                      Vui lòng hủy trước ít nhất 2 giờ. Nếu quá thời gian, vui lòng gọi Hotline.
                    </p>
                  </div>
                )}

                {selectedApp.paymentStatus !== 'PAID' && selectedApp.status !== 'CANCELLED' && selectedApp.status !== 'COMPLETED' && selectedApp.totalAmount > 0 && (
                  <div className="pt-6 border-t border-gray-100">
                    <button 
                      onClick={() => handlePayment(selectedApp)}
                      className="w-full py-5 bg-primary hover-premium text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-premium-md flex items-center justify-center space-x-3 group cursor-pointer transition-all duration-300"
                    >
                      <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span>Thanh toán VNPay</span>
                    </button>
                    <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-widest mt-4">
                      Tổng tiền: {selectedApp.totalAmount.toLocaleString()}đ
                    </p>
                  </div>
                )}

                {selectedApp.status === 'COMPLETED' && (
                  <div className="pt-6 border-t border-gray-100">
                    <button 
                      onClick={() => { setAppToReview(selectedApp); setShowReviewModal(true); }}
                      className="w-full py-5 bg-amber-50 text-amber-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all duration-300 shadow-lg shadow-amber-100 flex items-center justify-center space-x-3 cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5 text-gold" />
                      <span>Đánh giá dịch vụ này</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReviewModal && appToReview && (
          <Modal onClose={() => { setShowReviewModal(false); setAppToReview(null); }} title="Đánh giá dịch vụ">
            <form onSubmit={handleReview} className="space-y-6">
              <div className="text-center space-y-2 mb-8">
                <p className="text-gray-500">Bạn cảm thấy dịch vụ <strong>{appToReview.services?.[0]?.serviceName}</strong> thế nào?</p>
              </div>
              <div className="flex justify-center space-x-4 mb-8">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none cursor-pointer hover:scale-110 transition-transform"
                  >
                    <svg className={`w-12 h-12 transition-colors duration-300 ${rating >= star ? 'text-gold' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
              <div>
                <textarea 
                  aria-label="Nhập nội dung đánh giá"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-1 focus:ring-primary/20 focus:border-primary/20 outline-none resize-none h-32"
                  placeholder="Chia sẻ trải nghiệm của bạn (không bắt buộc)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={rating === 0}
                className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-premium-md disabled:opacity-50 disabled:shadow-none transition-all duration-300 cursor-pointer"
              >
                GỬI ĐÁNH GIÁ
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={showConfirmCancel}
        title="Xác nhận hủy lịch hẹn"
        message="Bạn có chắc chắn muốn hủy lịch hẹn này? Hành động này không thể hoàn tác."
        onConfirm={handleCancel}
        onCancel={() => setShowConfirmCancel(false)}
      />
    </div>
  );
}
