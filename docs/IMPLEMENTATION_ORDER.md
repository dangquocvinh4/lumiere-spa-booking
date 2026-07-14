# Implementation Order - Spa Booking System

Thứ tự triển khai ưu tiên để hoàn thiện dự án theo module.

## 🟢 Module 1: UI Polish & UX (Đang thực hiện)
1. **Skeleton Loading**: Đã xong trang Services. Cần áp dụng cho Dashboard.
2. **Toast Notifications**: Áp dụng cho tất cả các form (Login, Register, Admin actions).
3. **Responsive Design**: Kiểm tra hiển thị trên Mobile cho trang Đặt lịch (Khách hàng hay dùng điện thoại).

## 🔵 Module 2: Admin Dashboard & Analytics
1. **Backend Stats API**: Tạo một endpoint tổng hợp số liệu (Revenue, Appt counts) để Frontend không phải tự tính.
2. **Dashboard Charts**: Tích hợp Recharts để hiển thị biểu đồ doanh thu và lượng khách theo ngày.
3. **Recent Activity**: Hiển thị danh sách 5-10 lịch hẹn mới nhất ngay tại Dashboard.

## 🟡 Module 3: Staff & Schedule Management (Nâng cao)
1. **Working Schedule UI**: Giao diện cho Admin gán lịch làm việc cho từng nhân viên (Thứ 2 - Chủ Nhật, Giờ bắt đầu - Kết thúc).
2. **Staff-Service Mapping**: Giao diện (Checkbox list) để gán dịch vụ cho nhân viên. Hiện tại dữ liệu đang được đổ thủ công bằng SQL.
3. **Staff Profile View**: Trang chi tiết giới thiệu nhân viên (Bio, kỹ năng) cho khách hàng xem trước khi đặt.

## 🟠 Module 4: Appointment Lifecycle & Notifications
1. **Check-in/Check-out Flow**: Hoàn thiện nút bấm và logic trạng thái cho nhân viên lễ tân.
2. **Cancel Policy**: Logic chặn khách hàng hủy lịch nếu sát giờ (ví dụ < 2 tiếng).
3. **Email Notification**: Tích hợp JavaMailSender để gửi mail xác nhận khi khách đặt lịch thành công.

## 🔴 Module 5: Final Polish & Report (TTTN)
1. **Export Data**: Thêm tính năng xuất danh sách lịch hẹn (Report) ra file Excel/PDF.
2. **Search & Filter**: Hoàn thiện bộ lọc nâng cao cho trang Admin Appointments (Lọc theo chi nhánh, ngày, trạng thái đồng thời).
3. **Manual Documentation**: Hoàn thiện User Guide và Admin Guide cho báo cáo.

---

### 📅 Lịch trình đề xuất:
- **Tuần 1**: Hoàn thiện Module 1 & 2 (Giao diện & Dashboard).
- **Tuần 2**: Hoàn thiện Module 3 & 4 (Quản lý NV & Quy trình đặt lịch).
- **Tuần 3**: Hoàn thiện Module 5 & Viết báo cáo.
