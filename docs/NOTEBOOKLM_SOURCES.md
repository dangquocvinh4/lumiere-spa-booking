# NotebookLM Source List - Lumière Spa Project

Để tận dụng tối đa sức mạnh của AI trong việc viết báo cáo, tóm tắt và chuẩn bị câu hỏi phản biện, bạn hãy add các file sau vào **Google NotebookLM**:

### 1. Tài liệu Dự án (Hạt nhân kiến thức)
- `docs/FULL_FEATURE_MAP.md`: Tổng quan tính năng để AI hiểu hệ thống làm được gì.
- `docs/TTTN_REPORT_NOTES.md`: Các luận điểm chuyên môn để AI hỗ trợ viết báo cáo.
- `docs/API_OVERVIEW.md`: Cấu trúc kỹ thuật và các luồng dữ liệu.

### 2. Mã nguồn Backend (Logic nghiệp vụ)
- `workflow-backend/src/main/java/com/dangquocvinh/workflow_backend/services/AvailabilityService.java`: AI sẽ giúp bạn giải thích thuật toán tính giờ trống.
- `workflow-backend/src/main/java/com/dangquocvinh/workflow_backend/models/Appointment.java`: Cấu trúc dữ liệu và logic Snapshot.
- `workflow-backend/src/main/java/com/dangquocvinh/workflow_backend/controllers/AdminController.java`: Quy trình vận hành và quản lý của Admin.

### 3. Mã nguồn Frontend (Trải nghiệm người dùng)
- `workflow-frontend/src/pages/BookingPage.jsx`: Quy trình đặt lịch Stepper 4 bước.
- `workflow-frontend/src/index.css`: Triết lý thiết kế và hệ thống màu sắc Emerald/Rose.

### 4. Gợi ý câu hỏi để hỏi NotebookLM:
- "Dựa trên mã nguồn, hãy giải thích chi tiết cách hệ thống ngăn chặn việc đặt lịch trùng lặp?"
- "Viết giúp tôi chương 'Phân tích thiết kế hệ thống' dựa trên các file docs đã cung cấp."
- "Những câu hỏi phản biện nào hội đồng có thể hỏi về kiến trúc Database này?"
- "Tóm tắt quy trình từ khi khách hàng chọn dịch vụ đến khi Admin hoàn thành lịch hẹn."
