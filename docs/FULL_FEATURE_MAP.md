# Spa Booking System - Full Feature Map

Hệ thống quản lý đặt lịch Spa trực tuyến (Hoàn thiện 100% cho TTTN).

## 1. Phân hệ Khách hàng (Customer Interface)
- **Trang chủ & Danh mục**:
  - Giao diện Lumière Spa cao cấp với bảng màu Emerald/Rose.
  - Xem danh sách dịch vụ với hình ảnh và mô tả chuyên nghiệp.
  - Bộ lọc dịch vụ theo danh mục (Skincare, Massage, Treatment...).
  - Xem chi tiết dịch vụ (Giá, Thời gian, Cam kết chất lượng).
- **Quy trình Đặt lịch Thông minh (Stepper Flow)**:
  - Hệ thống 4 bước: Chi nhánh -> Dịch vụ/Chuyên viên -> Thời gian -> Xác nhận.
  - Tự động reset dữ liệu khi thay đổi chi nhánh hoặc dịch vụ để tránh sai sót.
  - Hiển thị Availability Slot thời gian thực dựa trên lịch làm việc và ngày nghỉ của nhân viên.
  - Tóm tắt lịch hẹn (Summary Card) luôn hiển thị giúp khách hàng dễ theo dõi.
- **Quản lý cá nhân**:
  - Đăng ký / Đăng nhập bảo mật.
  - Quản lý hồ sơ cá nhân với giao diện hiện đại.
  - Xem lịch sử đặt lịch với hiệu ứng Framer Motion mượt mà.
  - Hủy lịch hẹn hoặc yêu cầu đổi lịch (Reschedule).

## 2. Phân hệ Quản trị (Admin/Manager Dashboard)
- **Dashboard Trung tâm**:
  - Thống kê thời gian thực: Tổng lịch hẹn, Lịch hôm nay, Doanh thu thực tế, Quy mô nhân sự.
  - Biểu đồ và danh sách hoạt động gần đây trực quan.
  - Tác vụ nhanh (Quick Actions) điều hướng tức thì đến các module quản lý.
- **Quản lý Vận hành (Operations)**:
  - Quản lý lịch hẹn toàn hệ thống với bộ lọc nâng cao (Ngày, Chi nhánh, Nhân viên, Trạng thái).
  - Quy trình trạng thái chặt chẽ: PENDING -> CONFIRMED -> CHECKED_IN -> COMPLETED.
  - Confirm Modal cho mọi thao tác quan trọng để đảm bảo an toàn dữ liệu.
- **Quản lý Nhân sự chuyên sâu**:
  - Thiết lập hồ sơ chuyên gia, gán chi nhánh làm việc.
  - Gán danh mục dịch vụ phụ trách cho từng nhân viên.
  - **Quản lý Lịch làm việc định kỳ**: Thiết lập khung giờ trực hàng tuần.
  - **Quản lý Nghỉ phép (Time Off)**: Đăng ký ngày nghỉ, hệ thống tự động khóa lịch đặt chỗ.
- **Quản lý Catalog & Cơ sở**:
  - Quản lý hệ thống chi nhánh (Địa chỉ, Giờ mở/đóng cửa).
  - Quản lý danh mục dịch vụ: Thêm mới, chỉnh sửa giá, thời lượng, ảnh minh họa.

## 3. Kiến trúc Kỹ thuật & Bảo mật
- **Tech Stack**: Spring Boot 3.x (Java 17), MySQL 8.x, React 18+ (Vite), Tailwind CSS 4.
- **Bảo mật**: Spring Security + JWT, Role-based Access Control (ADMIN, MANAGER, RECEPTIONIST, CUSTOMER).
- **Xử lý dữ liệu**: 
  - Snapshot Pattern cho Service Price/Name trong Appointment.
  - Thuật toán tính Slot trống dựa trên Block-time (không trùng lịch).
  - Tích hợp tự động khởi tạo dữ liệu mẫu (Data Seeding) cho demo.
