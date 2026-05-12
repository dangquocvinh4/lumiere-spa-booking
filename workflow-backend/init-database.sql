-- DỮ LIỆU MẪU CHO SPA BOOKING SYSTEM
-- Lưu ý: Chạy script này trong PostgreSQL console

-- 1. XÓA DỮ LIỆU CŨ (Nếu bạn đã có dữ liệu và muốn reset, hãy bỏ comment dòng dưới)
-- TRUNCATE TABLE appointments, working_schedules, staff_services, staff_profiles, spa_services, user_roles, users, roles, branches CASCADE;

-- 2. INSERT ROLES
INSERT INTO roles (id, name) VALUES 
('e1a1a1a1-1111-1111-1111-111111111111', 'ROLE_ADMIN'),
('e1a1a1a2-2222-2222-2222-222222222222', 'ROLE_MANAGER'),
('e1a1a1a3-3333-3333-3333-333333333333', 'ROLE_RECEPTIONIST'),
('e1a1a1a4-4444-4444-4444-444444444444', 'ROLE_THERAPIST'),
('e1a1a1a5-5555-5555-5555-555555555555', 'ROLE_CUSTOMER');

-- 3. INSERT BRANCH (1 Chi nhánh chính)
INSERT INTO branches (id, name, opening_time, closing_time) VALUES
('b1b1b1b1-1111-1111-1111-111111111111', 'Spa Paradise - Chi nhánh 1', '09:00:00', '21:00:00');

-- 4. INSERT USERS (Pass mặc định là 'password' đã được băm BCrypt: $2a$10$8.UnVuG9shgme074w.2fVO5674c9XG9V7GjI18o8v5Wv/pGg5w8qS)
-- Ghi chú: password ở đây là 'password123'
INSERT INTO users (id, email, password, full_name, phone, status, created_at) VALUES
('u1u1u1u1-1111-1111-1111-111111111111', 'admin@spa.com', '$2a$10$8.UnVuG9shgme074w.2fVO5674c9XG9V7GjI18o8v5Wv/pGg5w8qS', 'Nguyễn Admin', '0911111111', 'ACTIVE', NOW()),
('u1u1u1u2-2222-2222-2222-222222222222', 'manager@spa.com', '$2a$10$8.UnVuG9shgme074w.2fVO5674c9XG9V7GjI18o8v5Wv/pGg5w8qS', 'Trần Quản Lý', '0922222222', 'ACTIVE', NOW()),
('u1u1u1u3-3333-3333-3333-333333333333', 'reception@spa.com', '$2a$10$8.UnVuG9shgme074w.2fVO5674c9XG9V7GjI18o8v5Wv/pGg5w8qS', 'Lê Lễ Tân', '0933333333', 'ACTIVE', NOW()),
('u1u1u1u4-4444-4444-4444-444444444444', 'staff1@spa.com', '$2a$10$8.UnVuG9shgme074w.2fVO5674c9XG9V7GjI18o8v5Wv/pGg5w8qS', 'KTV Hoàng Yến', '0944444441', 'ACTIVE', NOW()),
('u1u1u1u5-5555-5555-5555-555555555555', 'staff2@spa.com', '$2a$10$8.UnVuG9shgme074w.2fVO5674c9XG9V7GjI18o8v5Wv/pGg5w8qS', 'KTV Minh Tú', '0944444442', 'ACTIVE', NOW()),
('u1u1u1u6-6666-6666-6666-666666666666', 'customer1@gmail.com', '$2a$10$8.UnVuG9shgme074w.2fVO5674c9XG9V7GjI18o8v5Wv/pGg5w8qS', 'Phạm Khách 1', '0955555551', 'ACTIVE', NOW()),
('u1u1u1u7-7777-7777-7777-777777777777', 'customer2@gmail.com', '$2a$10$8.UnVuG9shgme074w.2fVO5674c9XG9V7GjI18o8v5Wv/pGg5w8qS', 'Vũ Khách 2', '0955555552', 'ACTIVE', NOW());

-- Phân quyền
INSERT INTO user_roles (user_id, role_id) VALUES
('u1u1u1u1-1111-1111-1111-111111111111', 'e1a1a1a1-1111-1111-1111-111111111111'),
('u1u1u1u2-2222-2222-2222-222222222222', 'e1a1a1a2-2222-2222-2222-222222222222'),
('u1u1u1u3-3333-3333-3333-333333333333', 'e1a1a1a3-3333-3333-3333-333333333333'),
('u1u1u1u4-4444-4444-4444-444444444444', 'e1a1a1a4-4444-4444-4444-444444444444'),
('u1u1u1u5-5555-5555-5555-555555555555', 'e1a1a1a4-4444-4444-4444-444444444444'),
('u1u1u1u6-6666-6666-6666-666666666666', 'e1a1a1a5-5555-5555-5555-555555555555'),
('u1u1u1u7-7777-7777-7777-777777777777', 'e1a1a1a5-5555-5555-5555-555555555555');

-- 5. INSERT SPA SERVICES
INSERT INTO spa_services (id, name, description, price, duration_minutes, category, active, created_at) VALUES
('s1s1s1s1-1111-1111-1111-111111111111', 'Massage Body Thụy Điển', 'Thư giãn cơ bắp với tinh dầu', 350000, 60, 'Massage', true, NOW()),
('s1s1s1s2-2222-2222-2222-222222222222', 'Chăm sóc da mặt chuyên sâu', 'Làm sạch và dưỡng ẩm sâu', 500000, 90, 'Skincare', true, NOW()),
('s1s1s1s3-3333-3333-3333-333333333333', 'Gội đầu dưỡng sinh', 'Gội đầu kết hợp massage cổ vai gáy', 150000, 45, 'Hair', true, NOW()),
('s1s1s1s4-4444-4444-4444-444444444444', 'Massage Chân (Foot)', 'Bấm huyệt giải tỏa mệt mỏi', 200000, 45, 'Massage', true, NOW()),
('s1s1s1s5-5555-5555-5555-555555555555', 'Trị mụn Laser', 'Công nghệ Laser hiện đại', 1200000, 120, 'Skincare', true, NOW());

-- 6. INSERT STAFF PROFILES
INSERT INTO staff_profiles (id, user_id, branch_id, title, bio, active) VALUES
('p1p1p1p1-1111-1111-1111-111111111111', 'u1u1u1u4-4444-4444-4444-444444444444', 'b1b1b1b1-1111-1111-1111-111111111111', 'Kỹ thuật viên chính', 'Chuyên về Massage Body', true),
('p1p1p1p2-2222-2222-2222-222222222222', 'u1u1u1u5-5555-5555-5555-555555555555', 'b1b1b1b1-1111-1111-1111-111111111111', 'Chuyên gia Skincare', '5 năm kinh nghiệm Laser', true);

-- Gán dịch vụ cho nhân viên
INSERT INTO staff_services (staff_id, service_id) VALUES
('p1p1p1p1-1111-1111-1111-111111111111', 's1s1s1s1-1111-1111-1111-111111111111'),
('p1p1p1p1-1111-1111-1111-111111111111', 's1s1s1s4-4444-4444-4444-444444444444'),
('p1p1p1p2-2222-2222-2222-222222222222', 's1s1s1s2-2222-2222-2222-222222222222'),
('p1p1p1p2-2222-2222-2222-222222222222', 's1s1s1s5-5555-5555-5555-555555555555');

-- 7. INSERT WORKING SCHEDULES (Thứ 2 đến Thứ 7, 09h00 - 20h00)
INSERT INTO working_schedules (id, staff_id, day_of_week, start_time, end_time) VALUES
(gen_random_uuid(), 'p1p1p1p1-1111-1111-1111-111111111111', 2, '09:00:00', '20:00:00'),
(gen_random_uuid(), 'p1p1p1p1-1111-1111-1111-111111111111', 3, '09:00:00', '20:00:00'),
(gen_random_uuid(), 'p1p1p1p1-1111-1111-1111-111111111111', 4, '09:00:00', '20:00:00'),
(gen_random_uuid(), 'p1p1p1p2-2222-2222-2222-222222222222', 2, '09:00:00', '20:00:00'),
(gen_random_uuid(), 'p1p1p1p2-2222-2222-2222-222222222222', 3, '09:00:00', '20:00:00');

-- 8. INSERT SAMPLE APPOINTMENTS (Sử dụng ngày 2026-05-12 và các trạng thái khác nhau)
INSERT INTO appointments (id, code, customer_id, branch_id, staff_id, start_at, end_at, status, total_amount, note, created_at) VALUES
(gen_random_uuid(), 'SPA001', 'u1u1u1u6-6666-6666-6666-666666666666', 'b1b1b1b1-1111-1111-1111-111111111111', 'p1p1p1p1-1111-1111-1111-111111111111', '2026-05-12 09:00:00', '2026-05-12 10:00:00', 'COMPLETED', 350000, 'Khách quen', NOW()),
(gen_random_uuid(), 'SPA002', 'u1u1u1u7-7777-7777-7777-777777777777', 'b1b1b1b1-1111-1111-1111-111111111111', 'p1p1p1p2-2222-2222-2222-222222222222', '2026-05-12 10:00:00', '2026-05-12 11:30:00', 'IN_SERVICE', 500000, '', NOW()),
(gen_random_uuid(), 'SPA003', 'u1u1u1u6-6666-6666-6666-666666666666', 'b1b1b1b1-1111-1111-1111-111111111111', 'p1p1p1p1-1111-1111-1111-111111111111', '2026-05-12 11:00:00', '2026-05-12 12:00:00', 'CONFIRMED', 200000, 'Làm nhẹ nhàng', NOW()),
(gen_random_uuid(), 'SPA004', 'u1u1u1u7-7777-7777-7777-777777777777', 'b1b1b1b1-1111-1111-1111-111111111111', 'p1p1p1p2-2222-2222-2222-222222222222', '2026-05-12 14:00:00', '2026-05-12 16:00:00', 'PENDING', 1200000, 'Khách mới đặt online', NOW()),
(gen_random_uuid(), 'SPA005', 'u1u1u1u6-6666-6666-6666-666666666666', 'b1b1b1b1-1111-1111-1111-111111111111', 'p1p1p1p1-1111-1111-1111-111111111111', '2026-05-12 15:00:00', '2026-05-12 16:00:00', 'CANCELLED', 350000, 'Bận việc đột xuất', NOW());
