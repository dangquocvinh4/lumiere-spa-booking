# Hướng dẫn cài đặt MySQL Local - Spa Booking System

Hệ thống sử dụng **MySQL** làm hệ quản trị cơ sở dữ liệu. **Đặc biệt: Backend đã tích hợp cơ chế tự động khởi tạo và đổ dữ liệu mẫu.**

## 1. Yêu cầu
- Đã cài đặt **MySQL Server** (XAMPP, WampServer, hoặc MySQL Installer).

## 2. Các bước thực hiện (Cực kỳ đơn giản)

### Bước 1: Khởi động MySQL Server
Đảm bảo dịch vụ MySQL đang chạy trên máy tính của bạn (mặc định cổng 3306).

### Bước 2: Cấu hình thông tin kết nối
1. Mở file `v:\TTTN\workflow-backend\.env`.
2. Đảm bảo các thông tin sau là chính xác với máy của bạn:
   - `DATABASE_USERNAME=root` (Mặc định)
   - `DATABASE_PASSWORD=` (Mặc định của XAMPP thường để trống)

### Bước 3: Khởi chạy Backend
Hệ thống sẽ **tự động** thực hiện các việc sau khi bạn chạy Backend lần đầu:
- Tự động tạo Database `spa_booking` (nếu chưa có).
- Tự động tạo cấu trúc bảng (Tables).
- Tự động đổ dữ liệu mẫu (Roles, Admin, Customer, Services, Staff...).

**Lệnh chạy:**
```bash
./mvnw spring-boot:run
```

## 3. Các tài khoản thử nghiệm (Đã có sẵn)
Sau khi chạy lần đầu, bạn có thể đăng nhập ngay bằng các tài khoản:
- **Admin**: `admin@spa.com` / `password123`
- **Khách hàng**: `customer1@gmail.com` / `password123`
- **Nhân viên**: `staff1@spa.com` / `password123`

---
**Lưu ý**: Bạn KHÔNG cần import bất kỳ file SQL nào thủ công. Nếu muốn reset lại dữ liệu, bạn chỉ cần xóa database `spa_booking` và chạy lại Backend.
