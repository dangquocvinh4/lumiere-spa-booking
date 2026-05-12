# AGENT TASKS - Spa Booking System

## 🔴 Priority P0: Critical Blockers (Phase 2 Focus)
### Backend Specialist
- [ ] Chuyển các thông số nhạy cảm (DB, JWT Secret) sang Environment Variables (`application-prod.properties` hoặc `.env`).
- [ ] Kiểm tra lại logic API Booking: Chặn việc gửi `customerId` từ client (lấy trực tiếp từ Principal/Context).
- [ ] Xây dựng API `/branches` (Public/Auth) để Frontend có thể fetch dữ liệu chi nhánh.
- [ ] Xây dựng API public để lấy danh sách nhân viên (Staff) theo chi nhánh/dịch vụ.

### Frontend Specialist
- [ ] Kết nối `LoginPage` với `authStore`, gọi đúng endpoint login backend.
- [ ] Cập nhật `authStore` để lưu trữ token và thông tin user sau khi login.
- [ ] Fix lỗi lệch contract dữ liệu (JSON keys) giữa FE và BE.
- [ ] Cấu hình `VITE_API_BASE_URL` linh hoạt theo môi trường.

### Security Auditor
- [ ] Audit rủi ro IDOR trên toàn bộ các endpoint cập nhật/xem thông tin cá nhân.
- [ ] Kiểm tra cấu hình CORS trên Backend (chỉ cho phép domain cụ thể khi deploy).

---

## 🟡 Priority P1: Core Features & Refactoring
### Backend Specialist
- [ ] Refactor mã nguồn theo chuẩn Clean Code (SOLID).
- [ ] Bổ sung Validation cho các DTO đầu vào.
- [ ] Xử lý Exception tập trung (Global Exception Handler).

### Frontend Specialist
- [ ] Hoàn thiện Dashboard cho Customer (Lịch sử đặt chỗ, thông tin cá nhân).
- [ ] Xây dựng giao diện chọn kỹ thuật viên (Staff selection) khi đặt lịch.

### Database Architect
- [ ] Kiểm tra lại kiểu dữ liệu UUID trong script `full-setup.sql` để đảm bảo tương thích với Entity Java.
- [ ] Tối ưu Index cho các bảng `appointments` và `working_schedules`.

---

## 🔵 Priority P2: Quality & Polish
### Test Engineer
- [ ] Viết Unit Test cho Service layer (Backend).
- [ ] Viết E2E Test cho luồng Booking chính bằng Playwright.

### Devops Engineer
- [ ] Thiết lập Dockerfile cho Frontend và Backend.
- [ ] Cấu hình CI/CD (GitHub Actions) để tự động deploy lên Staging.
