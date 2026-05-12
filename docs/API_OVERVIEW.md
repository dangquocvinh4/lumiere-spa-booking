# API Overview - Spa Booking System

Hệ thống cung cấp REST API chuẩn cho Frontend, sử dụng JWT để xác thực.

## Base URL
- Local: `http://localhost:8080/api`

## Authentication
| Endpoint | Method | Description |
|---|---|---|
| `/auth/register` | POST | Đăng ký tài khoản mới |
| `/auth/login` | POST | Đăng nhập nhận JWT token |

## Public Data
| Endpoint | Method | Description |
|---|---|---|
| `/branches` | GET | Lấy danh sách chi nhánh |
| `/services` | GET | Lấy danh sách dịch vụ |
| `/staff` | GET | Lấy danh sách nhân viên (có filter branch/service) |
| `/availability` | GET | Kiểm tra khung giờ trống của nhân viên |

## Customer (Yêu cầu Token)
| Endpoint | Method | Description |
|---|---|---|
| `/appointments` | POST | Đặt lịch hẹn mới |
| `/appointments/my` | GET | Xem lịch hẹn cá nhân |
| `/appointments/{id}/cancel` | PATCH | Hủy lịch hẹn |
| `/users/profile` | PUT | Cập nhật thông tin cá nhân |

## Admin/Manager (Yêu cầu Role Admin/Manager)
| Endpoint | Method | Description |
|---|---|---|
| `/appointments/admin` | GET | Quản lý toàn bộ lịch hẹn hệ thống |
| `/appointments/{id}/confirm` | PATCH | Xác nhận lịch hẹn |
| `/appointments/{id}/check-in` | PATCH | Khách đã đến Spa |
| `/appointments/{id}/complete` | PATCH | Hoàn thành dịch vụ |
| `/admin/services` | POST/PUT/DELETE | Quản lý danh mục dịch vụ |
| `/admin/staff` | GET/POST/PUT/DELETE | Quản lý đội ngũ nhân viên |
| `/branches` | POST/PUT/DELETE | Quản lý chi nhánh |

---
**Ghi chú**: Mọi request yêu cầu xác thực phải kèm Header: `Authorization: Bearer <token>`
