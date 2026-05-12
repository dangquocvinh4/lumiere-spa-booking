# Spa Booking System - Spa Harmony

Hệ thống quản lý và đặt lịch dịch vụ Spa Harmony. Đây là đồ án Thực tập Tốt nghiệp (TTTN).

## 📁 Cấu trúc dự án
- `/workflow-frontend`: Ứng dụng Client (React, Vite, TailwindCSS).
- `/workflow-backend`: Ứng dụng Server (Spring Boot, PostgreSQL).
- `/docs`: Tài liệu hướng dẫn, API và báo cáo.

## 🛠 Yêu cầu hệ thống
- **Java 17+**
- **Node.js 18+**
- **PostgreSQL 14+**

## 🚀 Hướng dẫn chạy Local

### 1. Database
- Tạo database tên `spa_db` trong PostgreSQL.
- Chạy script `workflow-backend/full-setup.sql` để khởi tạo dữ liệu mẫu.

### 2. Backend
- Di chuyển vào thư mục: `cd workflow-backend`
- Tạo file `.env` dựa trên `.env.example`.
- Chạy ứng dụng: `./mvnw spring-boot:run`
- API sẽ chạy tại: `http://localhost:8080/api`

### 3. Frontend
- Di chuyển vào thư mục: `cd workflow-frontend`
- Cài đặt dependencies: `npm install`
- Tạo file `.env` với `VITE_API_BASE_URL=http://localhost:8080/api`
- Chạy ứng dụng: `npm run dev`
- Truy cập tại: `http://localhost:5173`

## 🔐 Tài khoản dùng thử
- **Admin**: `admin@spa.com` / `admin123`
- **Customer**: `customer@example.com` / `password123`

## 📄 Tài liệu
- [API Overview](./docs/API_OVERVIEW.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Admin Guide](./docs/ADMIN_GUIDE.md)
- [TTTN Report Notes](./docs/TTTN_REPORT_NOTES.md)
