# API Overview - Spa Booking System

Tài liệu tóm tắt các Endpoint thực tế của hệ thống (Localhost:8080).

## 🔐 Authentication (`/api/auth`)
- `POST /login`: Đăng nhập, nhận JWT Token.
- `POST /register`: Đăng ký tài khoản khách hàng mới.

## 📅 Booking & Appointments (`/api/appointments`)
- `GET /my`: Danh sách lịch hẹn của khách hàng đang đăng nhập.
- `POST /`: Tạo lịch hẹn (Nhận list serviceIds, branchId, staffId, startAt).
- `PATCH /{id}/cancel`: Khách hàng tự hủy lịch của mình.
- `PATCH /{id}/reschedule`: Đổi ngày giờ lịch hẹn.
- `GET /availability`: Tính lịch trống (Params: serviceId, branchId, staffId, date).

## 👑 Admin/Manager Control (`/api/admin`)
### Dashboard & Appointments
- `GET /dashboard/summary`: Lấy số liệu thống kê cho Dashboard.
- `GET /appointments`: Danh sách toàn bộ lịch hẹn (Filter: status, date, branchId, staffId).
- `PATCH /appointments/{id}/confirm`: Xác nhận lịch chờ.
- `PATCH /appointments/{id}/check-in`: Đón khách tại quầy.
- `PATCH /appointments/{id}/complete`: Hoàn thành dịch vụ & chốt doanh thu.
- `PATCH /appointments/{id}/cancel`: Hủy lịch (Admin quyền cao nhất).

### Staff Management (`/api/admin/staff`)
- `GET /`: Danh sách hồ sơ nhân viên.
- `POST /`: Tạo hồ sơ nhân viên mới.
- `PUT /{id}`: Cập nhật thông tin/chi nhánh/trạng thái nhân viên.
- `POST /{id}/services`: Gán danh sách dịch vụ nhân viên có thể thực hiện.
- `GET /{id}/schedules`: Lấy lịch làm việc hàng tuần.
- `POST /{id}/schedules`: Thêm khung giờ trực.
- `GET /{id}/time-off`: Danh sách ngày nghỉ phép.
- `POST /{id}/time-off`: Đăng ký ngày nghỉ cho nhân viên.

### Catalog & Branches
- `GET /admin/services`: Quản lý danh mục dịch vụ (bao gồm dịch vụ đã ẩn).
- `POST /admin/services`: Thêm dịch vụ mới.
- `PUT /admin/services/{id}`: Cập nhật dịch vụ.
- `DELETE /admin/services/{id}`: Vô hiệu hóa dịch vụ (Soft delete).
- `PATCH /admin/services/{id}/restore`: Khôi phục dịch vụ.
- `POST /admin/branches`: Thêm chi nhánh mới.
- `PUT /admin/branches/{id}`: Cập nhật thông tin chi nhánh.

## 🛠️ Public Endpoints (No Auth/Customer)
- `GET /api/services`: Danh sách dịch vụ đang kinh doanh.
- `GET /api/branches`: Danh sách các cơ sở spa.
- `GET /api/staff`: Lọc nhân viên theo chi nhánh và dịch vụ.
