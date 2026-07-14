# Ghi chú Báo cáo Tốt nghiệp - Lumière Spa System

Tài liệu này tổng hợp các luận điểm chuyên môn quan trọng để bạn đưa vào báo cáo và trình bày trước hội đồng.

## 1. Mục tiêu và Đối tượng
- **Đề tài**: Xây dựng hệ thống quản lý và đặt lịch Spa thông minh theo hướng tự động hóa vận hành.
- **Vấn đề giải quyết**: Khắc phục tình trạng chồng chéo lịch hẹn, thiếu minh bạch trong quản lý doanh thu và khó khăn khi khách hàng muốn lựa chọn kỹ thuật viên yêu thích.
- **Đối tượng**: Khách hàng cá nhân, nhân viên spa, và bộ phận quản lý.

## 2. Điểm nhấn Công nghệ (Technical Highlights)
- **Kiến trúc**: Micro-monolith tối giản, tách biệt Frontend (React) và Backend (Spring Boot), giao tiếp qua RESTful API chuẩn hóa.
- **Tính toán Availability (Bài toán lõi)**: 
  - Áp dụng thuật toán tính toán khung giờ trống dựa trên: Giờ mở cửa chi nhánh, Lịch trực của nhân viên, Danh sách ngày nghỉ phép, và Thời lượng thực tế của từng loại dịch vụ.
  - Đảm bảo tính nhất quán (Consistency) trong môi trường đa người dùng.
- **Snapshot Pattern**: 
  - Kỹ thuật lưu trữ bản sao dữ liệu dịch vụ (Tên, Giá) ngay tại thời điểm khách đặt lịch.
  - Giúp báo cáo tài chính chính xác ngay cả khi dịch vụ gốc thay đổi giá hoặc bị xóa sau này.
- **Thiết kế UI/UX**:
  - Ngôn ngữ thiết kế: Glassmorphism kết hợp Emerald Spa Theme.
  - Tối ưu hóa trải nghiệm: Hệ thống Stepper Booking giảm thiểu cognitive load cho người dùng.
  - Tính đáp ứng: Đạt 100% Mobile Responsive (verified on 375px width).

## 3. Các thực thể Database quan trọng (ERD Logic)
- **User & Role**: Phân quyền 4 cấp độ (RBAC).
- **SpaService & Category**: Phân loại dịch vụ đa cấp.
- **StaffProfile & WorkingSchedule**: Liên kết chặt chẽ để xác định năng lực phục vụ.
- **StaffTimeOff**: Thực thể quản lý ngoại lệ trong lịch làm việc.
- **Appointment & AppointmentService**: Cấu trúc lưu trữ snapshot để quản lý doanh thu bền vững.

## 4. Kịch bản Kiểm thử (Testing Scenarios)
- **Smoke Test**: Đăng ký -> Đăng nhập -> Đặt lịch thành công.
- **Boundary Test**: Đặt lịch vào sát giờ đóng cửa (Hệ thống phải tự động ẩn các slot không đủ thời gian thực hiện dịch vụ).
- **Conflict Test**: 2 khách hàng cùng đặt 1 nhân viên vào 1 giờ (Hệ thống chỉ cho phép 1 người thành công).
- **State Test**: Admin không thể hoàn thành một lịch hẹn đã bị hủy (Chống sai lệch trạng thái).

## 5. Kết luận & Hướng phát triển
- **Đạt được**: Một hệ thống hoàn chỉnh từ đặt lịch, vận hành đến thống kê, có tính thẩm mỹ và bảo mật cao.
- **Mở rộng**: Tích hợp thanh toán online (VNPay/Momo), gửi thông báo qua Zalo/Email tự động, và ứng dụng AI để gợi ý dịch vụ theo lịch sử khách hàng.
