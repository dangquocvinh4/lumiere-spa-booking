# Staging Deployment Guide - Spa Booking System

Tài liệu này hướng dẫn bạn cách đưa hệ thống lên các nền tảng Cloud miễn phí để chạy thử nghiệm (Staging).

## 1. Database: Neon PostgreSQL
1. Truy cập [Neon.tech](https://neon.tech/) và tạo một Project mới.
2. Tại bảng điều khiển, copy chuỗi kết nối (Connection String) dạng: `postgresql://user:password@hostname/neondb?sslmode=require`.
3. Chạy script `workflow-backend/full-setup.sql` trên Neon Console hoặc công cụ như DBeaver để khởi tạo dữ liệu mẫu.

## 2. Backend: Render
1. Truy cập [Render.com](https://render.com/), tạo một **Web Service** mới.
2. Kết nối với Repository GitHub của dự án.
3. Cấu hình dịch vụ:
   - **Runtime**: `Java`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/workflow-backend-0.0.1-SNAPSHOT.jar`
   - **Environment Variables**: Thêm các biến từ file `ENVIRONMENT_VARIABLES.md`.
4. Copy link dịch vụ sau khi deploy xong (VD: `https://spa-backend.onrender.com`).

## 3. Frontend: Vercel
1. Truy cập [Vercel.com](https://vercel.com/), chọn **Add New Project**.
2. Kết nối với Repository GitHub của dự án.
3. Cấu hình Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `workflow-frontend`
   - **Environment Variables**:
     - `VITE_API_BASE_URL`: Dán link Backend từ Render (thêm `/api` vào cuối).
4. Nhấn **Deploy**.

## 4. Cập nhật chéo (Cross-Config)
Sau khi có link Frontend từ Vercel (VD: `https://spa-harmony.vercel.app`), bạn cần quay lại **Render (Backend)** và cập nhật biến:
- `ALLOWED_ORIGINS`: Thêm link Vercel vào danh sách để cho phép gọi API (CORS).

---
**Lưu ý**: Nếu dùng gói miễn phí của Render, Server sẽ "ngủ" sau 15p không hoạt động. Lần gọi đầu tiên sẽ mất khoảng 30s để khởi động lại.
