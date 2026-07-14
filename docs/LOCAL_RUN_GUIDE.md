# Hướng dẫn chạy dự án Spa Booking System (Localhost)

Dự án Lumière Spa đã được thiết lập để bạn có thể trình diễn ngay lập tức trên máy tính cá nhân mà không cần cấu hình phức tạp.

## 1. Yêu cầu môi trường
- **Java**: JDK 17 hoặc 21.
- **Node.js**: Phiên bản 18 trở lên (Khuyên dùng v20+).
- **Database**: MySQL 8.x cài đặt sẵn trên máy.

## 2. Các bước khởi chạy nhanh

### Bước 1: Chuẩn bị Database
1. Mở MySQL Workbench hoặc CLI.
2. Tạo database mới: `CREATE DATABASE spa_booking;` (Nếu chưa có).
3. Đảm bảo thông tin đăng nhập trong `workflow-backend/.env` khớp với máy của bạn:
   - `SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/spa_booking`
   - `SPRING_DATASOURCE_USERNAME=root`
   - `SPRING_DATASOURCE_PASSWORD=your_password`

### Bước 2: Chạy Backend
1. Mở Terminal tại `v:\TTTN\workflow-backend`.
2. Chạy lệnh:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
   *Hệ thống sẽ tự động tạo bảng và đổ dữ liệu mẫu chuyên nghiệp (Seed data) ở lần chạy đầu tiên.*

### Bước 3: Chạy Frontend
1. Mở Terminal mới tại `v:\TTTN\workflow-frontend`.
2. Cài đặt (nếu là lần đầu): `npm install`
3. Chạy lệnh:
   ```powershell
   npm run dev
   ```
4. Truy cập trình duyệt: `http://localhost:5173`

## 3. Tài khoản Demo (Sử dụng cho bảo vệ TTTN)
Hệ thống đã chuẩn bị sẵn bộ dữ liệu với mật khẩu chung là `password123`:

- **Quản trị viên (Full quyền)**:
  - Email: `admin@spa.com`
- **Khách hàng mẫu**:
  - Email: `customer1@gmail.com`
- **Nhân viên mẫu**:
  - Email: `staff1@spa.com`

## 4. Các lưu ý quan trọng
- **Làm mới dữ liệu**: Nếu bạn muốn xóa hết các lịch hẹn đã đặt để demo lại từ đầu, chỉ cần DROP database `spa_booking` và khởi động lại Backend.
- **Cổng mặc định**: 
  - Backend: `8080`
  - Frontend: `5173`
- **Encoding**: Dự án sử dụng UTF-8 hoàn toàn, hỗ trợ tiếng Việt có dấu chuẩn xác.
