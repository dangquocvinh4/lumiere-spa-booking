# Spa Booking System - Spa Harmony

Hệ thống quản lý và đặt lịch dịch vụ Spa Harmony. Đây là đồ án Thực tập Tốt nghiệp (TTTN).

## 📁 Cấu trúc dự án
- `/workflow-frontend`: Ứng dụng Client (React, Vite, TailwindCSS).
- `/workflow-backend`: Ứng dụng Server (Spring Boot, PostgreSQL).
- `/docs`: Tài liệu hướng dẫn, API và báo cáo.

## 🛠 Yêu cầu hệ thống
- **Java 17+**
- **Node.js 18+**
- **MySQL 8.0+** (Database chính hiện tại)

## 🚀 Hướng dẫn chạy Local

### 1. Database
- Cài đặt MySQL và tạo database `spa_booking`.
- Chi tiết xem tại: [Hướng dẫn MySQL Local](./docs/MYSQL_LOCAL_SETUP.md).

### 2. Backend
- Di chuyển vào thư mục: `cd workflow-backend`
- Tạo file `.env` và điền mật khẩu MySQL của bạn.
- Chạy ứng dụng: `.\mvnw.cmd spring-boot:run`

### 3. Frontend
- Di chuyển vào thư mục: `cd workflow-frontend`
- Chạy ứng dụng: `npm run dev`

## 🔐 Tài khoản dùng thử
- **Admin**: `admin@spa.com` / `admin123`
- **Customer**: `customer@example.com` / `password123`

## 📄 Tài liệu hỗ trợ
- [Local Run Checklist](./docs/LOCAL_RUN_CHECKLIST.md)
- [API Overview](./docs/API_OVERVIEW.md)
- [TTTN Report Notes](./docs/TTTN_REPORT_NOTES.md)
