# DEPLOY CHECKLIST - Spa Booking System

## 🌐 Môi trường dự kiến
- **Database**: Neon PostgreSQL (SaaS).
- **Backend**: Render hoặc Railway (PaaS).
- **Frontend**: Vercel hoặc Netlify (Static Hosting).

---

## 🏗️ Pre-deployment (Checklist kỹ thuật)
- [x] **Environment Variables**:
    - [x] Đã tạo `.env.example` đầy đủ cho FE/BE.
    - [x] Xác nhận không còn hardcoded secrets trong code.
- [x] **Build Process**:
    - [x] `mvn clean compile` thành công.
    - [x] `npm run build` thành công.
- [x] **Security**:
    - [x] Đã externalize toàn bộ config nhạy cảm.
    - [x] CORS đã cấu hình động qua biến môi trường.
    - [x] Đã fix các lỗi bảo mật P0 (CustomerId IDOR).

---

## 🚀 Deployment Steps (Dự kiến)
### Step 1: Database
1. Truy cập Neon Console, tạo database mới.
2. Chạy script `full-setup.sql` (phần Schema) để khởi tạo cấu trúc.

### Step 2: Backend
1. Kết nối Repository GitHub với Render/Railway.
2. Cấu hình biến môi trường (Environment Variables).
3. Verify endpoint `/health` hoặc tương đương.

### Step 3: Frontend
1. Kết nối Repository GitHub với Vercel.
2. Cấu hình `VITE_API_BASE_URL`.
3. Kiểm tra routing (fix lỗi 404 trên SPA host).

---

## 🏗️ Staging Readiness (Phase 5)
- [x] **Documentation**: Đã có `STAGING_DEPLOY_GUIDE.md` và `ENVIRONMENT_VARIABLES.md`.
- [x] **Smoke Test Plan**: Đã có `POST_DEPLOY_SMOKE_TEST.md`.
- [x] **Infrastructure**: Đã chọn xong Stack (Vercel + Render + Neon).
- [ ] **Live Deployment**: Chờ lệnh từ User để thực hiện push GitHub và config.

---

## 🐳 Docker Staging (Option)
- [ ] Kiểm tra `docker-compose.yml` local.
- [ ] Build image và push lên Docker Hub (nếu cần).
