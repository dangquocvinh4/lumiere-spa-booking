# Tài liệu hỗ trợ Báo cáo Thực tập Tốt nghiệp (TTTN)

## 1. Tổng quan đề tài
- **Tên đề tài**: Xây dựng hệ thống quản lý và đặt lịch dịch vụ Spa Harmony.
- **Lý do chọn đề tài**: Giải quyết bài toán quản lý lịch hẹn thủ công, tối ưu hóa thời gian rảnh của nhân viên và nâng cao trải nghiệm khách hàng trong ngành làm đẹp.

## 2. Công nghệ sử dụng
- **Frontend**: React 19, Vite, TailwindCSS, Zustand (State Management), React Router 7, Lucide Icons.
- **Backend**: Java 17, Spring Boot 3, Spring Security (JWT), Hibernate/JPA.
- **Database**: PostgreSQL.
- **Testing**: JUnit 5, Playwright (Smoke test).
- **Tools**: Git, Docker (optional), NotebookLM (Knowledge base).

## 3. Kiến trúc hệ thống
- **Client-Server**: Tách biệt Frontend và Backend thông qua RESTful API.
- **Bảo mật**: Cơ chế Stateless với JWT. Phân quyền theo Role (ADMIN, MANAGER, CUSTOMER).
- **Database**: Thiết kế chuẩn hóa (Normal Form) đảm bảo tính toàn vẹn dữ liệu giữa Lịch hẹn - Khách hàng - Nhân viên - Dịch vụ.

## 4. Các chức năng chính
### Đối với Khách hàng:
- Đăng ký/Đăng nhập.
- Xem danh mục dịch vụ trực tuyến.
- Đặt lịch hẹn thông minh (tự động check lịch trống nhân viên).
- Quản lý lịch sử cuộc hẹn.
- Cập nhật thông tin cá nhân.

### Đối với Quản trị viên:
- Dashboard thống kê kinh doanh.
- Quản lý quy trình lịch hẹn (Xác nhận -> Check-in -> Hoàn thành).
- Quản lý danh mục dịch vụ và bảng giá.
- Quản lý đội ngũ nhân viên và chi nhánh.

## 5. Kết quả đạt được
- Hệ thống chạy ổn định trên môi trường local.
- Giao diện hiện đại, đáp ứng tốt trải nghiệm người dùng (UX).
- Xử lý được các bài toán xung đột lịch hẹn (double-booking).
- Đảm bảo an toàn thông tin với quy trình xác thực JWT và bảo mật biến môi trường.

## 6. Hướng phát triển
- Tích hợp thanh toán trực tuyến (VNPay/Momo).
- Hệ thống nhắc lịch qua SMS/Email tự động.
- Ứng dụng di động (Mobile App) dành cho nhân viên.
