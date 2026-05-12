# Post-Deploy Smoke Test Checklist

Sau khi triển khai lên Staging, hãy thực hiện các bài test nhanh sau để đảm bảo hệ thống hoạt động ổn định.

## 1. Khách hàng (User Flow)
- [ ] Truy cập Trang chủ: Load được danh sách dịch vụ.
- [ ] Đăng ký: Tạo tài khoản mới thành công.
- [ ] Đăng nhập: Nhận được token và chuyển hướng đúng.
- [ ] Đặt lịch: Chọn được Chi nhánh -> Dịch vụ -> Nhân viên -> Giờ trống.
- [ ] Xác nhận đặt lịch thành công và thấy lịch trong "Lịch của tôi".
- [ ] Hủy lịch: Thử hủy lịch vừa đặt.

## 2. Quản trị (Admin Flow)
- [ ] Đăng nhập Admin: Chuyển hướng vào `/admin`.
- [ ] Dashboard: Các con số thống kê hiển thị (không bị lỗi 500).
- [ ] Quản lý lịch hẹn: Thấy lịch vừa đặt của khách hàng.
- [ ] Đổi trạng thái: Chuyển từ `Pending` -> `Confirmed` -> `Checked-in`.
- [ ] Quản lý chi nhánh/dịch vụ: Thử sửa tên một dịch vụ và lưu lại.

## 3. Kỹ thuật (Technical Check)
- [ ] Console log (F12): Không có lỗi đỏ liên quan đến CORS.
- [ ] Network tab: Các request API trả về `200 OK` hoặc `201 Created`.
- [ ] JWT: Refresh trang không bị mất trạng thái đăng nhập (Token lưu đúng LocalStorage).

---
**Lưu ý**: Nếu gặp lỗi 404 khi nhấn F5 ở các trang con trên Vercel, hãy kiểm tra file `vercel.json` xem đã cấu hình rewrites cho SPA chưa.
