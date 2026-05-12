# Environment Variables List

Danh sách các biến môi trường cần thiết để cấu hình trên các nền tảng Staging.

## 📦 Backend (Render/Railway)
| Biến | Giá trị ví dụ | Ý nghĩa |
|---|---|---|
| `DATABASE_URL` | `jdbc:postgresql://ep-xxx.neon.tech/neondb?sslmode=require` | Link kết nối DB (Lưu ý: Thêm `jdbc:` phía trước URL của Neon) |
| `DATABASE_USERNAME` | `dangquocvinh` | Username DB |
| `DATABASE_PASSWORD` | `********` | Password DB |
| `JWT_SECRET` | `ChuoiKyTuBaoMatCucManhNenDungRandomKey` | Khóa bí mật để ký Token |
| `JWT_EXPIRATION_MS` | `86400000` | Thời gian hết hạn (24h) |
| `ALLOWED_ORIGINS` | `https://spa-harmony.vercel.app` | Link Frontend để pass CORS |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `validate` hoặc `update` | `update` cho staging, `validate` cho prod |

## 🖼️ Frontend (Vercel/Netlify)
| Biến | Giá trị ví dụ | Ý nghĩa |
|---|---|---|
| `VITE_API_BASE_URL` | `https://spa-backend.onrender.com/api` | Link Backend API |

---
**QUAN TRỌNG**: 
- Không bao giờ commit file `.env` chứa giá trị thực lên GitHub. 
- Chỉ dán các giá trị này vào phần **Environment Variables** trong bảng điều khiển của Render/Vercel.
