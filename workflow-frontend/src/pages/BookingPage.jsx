import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const BookingPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [bookingData, setBookingData] = useState({
    serviceId: '',
    branchId: '',
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    slot: '',
    note: ''
  });

  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Load ban đầu: Dịch vụ và Chi nhánh
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
      } catch {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Load nhân viên khi chọn chi nhánh
  useEffect(() => {
    if (bookingData.branchId) {
      api.get('/staff', {
        params: {
          branchId: bookingData.branchId,
          serviceId: bookingData.serviceId
        }
      }).then(res => {
        setStaffList(res.data);
      }).catch(() => console.error('Error fetching staff'));
    }
  }, [bookingData.branchId, bookingData.serviceId]);

  // 3. Gọi API tìm giờ trống (Availability) khi đủ thông tin
  useEffect(() => {
    const fetchSlots = async () => {
      if (bookingData.serviceId && bookingData.branchId && bookingData.staffId && bookingData.date) {
        try {
          setSlotsLoading(true);
          const res = await api.get('/availability', {
            params: {
              serviceId: bookingData.serviceId,
              branchId: bookingData.branchId,
              staffId: bookingData.staffId,
              date: bookingData.date
            }
          });
          setAvailableSlots(res.data);
        } catch {
          // Error handled
        } finally {
          setSlotsLoading(false);
        }
      }
    };
    fetchSlots();
  }, [bookingData.serviceId, bookingData.branchId, bookingData.staffId, bookingData.date]);

  const handleBooking = async () => {
    if (!bookingData.slot) return alert('Vui lòng chọn khung giờ!');
    
    try {
      setLoading(true);
      const payload = {
        branchId: bookingData.branchId,
        staffId: bookingData.staffId,
        serviceIds: [bookingData.serviceId],
        startAt: `${bookingData.date}T${bookingData.slot}`,
        note: bookingData.note
      };
      
      await api.post('/appointments', payload);
      alert('Đặt lịch thành công!');
      navigate('/my-appointments');
    } catch {
      alert('Đặt lịch thất bại!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Đặt lịch dịch vụ Spa</h2>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

      <div className="space-y-4">
        {/* Bước 1: Chọn dịch vụ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chọn dịch vụ</label>
          <select 
            className="w-full border p-2 rounded focus:ring-indigo-500"
            value={bookingData.serviceId}
            onChange={(e) => setBookingData({...bookingData, serviceId: e.target.value})}
          >
            <option value="">-- Chọn dịch vụ --</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.price.toLocaleString()}đ - {s.durationMinutes}p)</option>
            ))}
          </select>
        </div>

        {/* Bước 2: Chọn chi nhánh */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chọn chi nhánh</label>
          <select 
            className="w-full border p-2 rounded focus:ring-indigo-500"
            value={bookingData.branchId}
            onChange={(e) => setBookingData({...bookingData, branchId: e.target.value})}
          >
            <option value="">-- Chọn chi nhánh --</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Bước 3: Chọn ngày */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đặt lịch</label>
          <input 
            type="date"
            className="w-full border p-2 rounded focus:ring-indigo-500"
            value={bookingData.date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
          />
        </div>

        {/* Bước 4: Chọn nhân viên */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chọn nhân viên</label>
          <select 
            className="w-full border p-2 rounded focus:ring-indigo-500"
            value={bookingData.staffId}
            onChange={(e) => setBookingData({...bookingData, staffId: e.target.value})}
          >
            <option value="">-- Chọn nhân viên --</option>
            {staffList.map(s => (
              <option key={s.id} value={s.id}>{s.user.fullName} - {s.title}</option>
            ))}
          </select>
        </div>

        {/* Bước 5: Chọn giờ trống */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khung giờ trống {slotsLoading && <span className="text-xs text-gray-400">(Đang check...)</span>}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {availableSlots.length > 0 ? availableSlots.map(slot => (
              <button
                key={slot}
                onClick={() => setBookingData({...bookingData, slot})}
                className={`p-2 text-sm rounded border transition ${bookingData.slot === slot ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 hover:border-indigo-400'}`}
              >
                {slot.substring(0, 5)}
              </button>
            )) : (
              <div className="col-span-4 text-sm text-gray-400 italic">Vui lòng điền đủ thông tin để xem giờ rảnh</div>
            )}
          </div>
        </div>

        {/* Bước 6: Ghi chú */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
          <textarea 
            className="w-full border p-2 rounded focus:ring-indigo-500"
            rows="3"
            value={bookingData.note}
            onChange={(e) => setBookingData({...bookingData, note: e.target.value})}
            placeholder="Ví dụ: Tôi muốn làm phòng yên tĩnh..."
          ></textarea>
        </div>

        <button
          onClick={handleBooking}
          disabled={loading || !bookingData.slot}
          className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition ${loading || !bookingData.slot ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch ngay'}
        </button>
      </div>
    </div>
  );
};

export default BookingPage;
