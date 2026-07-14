# LOCAL RUN CHECKLIST - Spa Booking System

Danh sách kiểm tra để đảm bảo hệ thống chạy ổn định 100% trên môi trường local cho buổi báo vệ/demo.

## 1. Cơ sở dữ liệu (MySQL)
- [ ] Đã chạy lệnh `CREATE DATABASE spa_booking`.
- [ ] Đã thực thi script `full-setup-mysql.sql` thành công.
- [ ] Kiểm tra bảng `users` có dữ liệu mẫu (admin@spa.com, customer1@gmail.com).
- [ ] Kiểm tra bảng `spa_services` có đủ danh sách dịch vụ.

## 2. Cấu hình Backend
- [ ] File `.env` đã trỏ đúng vào `jdbc:mysql://localhost:3306/spa_booking`.
- [ ] `DATABASE_PASSWORD` khớp với mật khẩu MySQL local.
- [ ] `JWT_SECRET` đã được thiết lập (ít nhất 32 ký tự).
- [ ] Đã chạy `mvnw clean compile` không có lỗi.

## 3. Cấu hình Frontend
- [ ] File `.env` có `VITE_API_BASE_URL=http://localhost:8080/api`.
- [ ] Đã chạy `npm install` để cài đặt đủ node_modules.
- [ ] Đã thử chạy `npm run build` để kiểm tra lỗi build tiềm ẩn.

## 4. Luồng vận hành chính (Offline Demo)
- [ ] **Đăng nhập**: Thử đăng nhập Admin và Khách hàng.
- [ ] **Đặt lịch**: Khách hàng đặt được lịch và thấy trong lịch sử.
- [ ] **Điều phối**: Admin đổi được trạng thái lịch hẹn (Pending -> Confirmed).
- [ ] **Dữ liệu**: Thông tin được lưu vào MySQL (không mất đi sau khi khởi động lại server).

---
**Ghi chú**: Mọi lỗi liên quan đến CORS thường do Backend chưa khởi động hoặc port 8080 bị chiếm dụng.
