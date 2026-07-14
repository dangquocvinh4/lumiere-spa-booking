-- ==========================================
-- FULL SETUP SCRIPT FOR SPA BOOKING SYSTEM (MYSQL LOCAL)
-- Bao gồm: Tạo bảng (Schema) + Đổ dữ liệu mẫu (Seed Data)
-- ==========================================

-- 1. XÓA CÁC BẢNG NẾU ĐÃ TỒN TẠI (Reset hoàn toàn)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS appointment_services;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS staff_time_off;
DROP TABLE IF EXISTS working_schedules;
DROP TABLE IF EXISTS staff_services;
DROP TABLE IF EXISTS staff_profiles;
DROP TABLE IF EXISTS spa_services;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS branches;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. TẠO CẤU TRÚC BẢNG (DDL)

CREATE TABLE branches (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    opening_time TIME,
    closing_time TIME,
    address TEXT
);

CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id VARCHAR(36),
    role_id VARCHAR(36),
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE spa_services (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(15,2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE staff_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE,
    branch_id VARCHAR(36),
    title VARCHAR(255),
    bio TEXT,
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE staff_services (
    staff_id VARCHAR(36),
    service_id VARCHAR(36),
    PRIMARY KEY (staff_id, service_id),
    FOREIGN KEY (staff_id) REFERENCES staff_profiles(id),
    FOREIGN KEY (service_id) REFERENCES spa_services(id)
);

CREATE TABLE working_schedules (
    id VARCHAR(36) PRIMARY KEY,
    staff_id VARCHAR(36),
    day_of_week INTEGER NOT NULL, -- 2 to 8 (Monday to Sunday)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (staff_id) REFERENCES staff_profiles(id)
);

CREATE TABLE appointments (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36),
    branch_id VARCHAR(36),
    staff_id VARCHAR(36),
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    total_amount DECIMAL(15,2),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (staff_id) REFERENCES staff_profiles(id)
);

CREATE TABLE appointment_services (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(36),
    service_id VARCHAR(36),
    service_name VARCHAR(255),
    price DECIMAL(15,2),
    duration_minutes INTEGER,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (service_id) REFERENCES spa_services(id)
);

-- 3. ĐỔ DỮ LIỆU MẪU (SEED DATA)

-- Roles
INSERT INTO roles (id, name) VALUES 
('e1a1a1a1-1111-1111-1111-111111111111', 'ROLE_ADMIN'),
('e1a1a1a2-2222-2222-2222-222222222222', 'ROLE_MANAGER'),
('e1a1a1a3-3333-3333-3333-333333333333', 'ROLE_RECEPTIONIST'),
('e1a1a1a4-4444-4444-4444-444444444444', 'ROLE_THERAPIST'),
('e1a1a1a5-5555-5555-5555-555555555555', 'ROLE_CUSTOMER');

-- Branch
INSERT INTO branches (id, name, opening_time, closing_time, address) VALUES
('b1b1b1b1-1111-1111-1111-111111111111', 'Spa Paradise - Chi nhánh 1', '09:00:00', '21:00:00', '123 Đường ABC, Quận 1, TP.HCM');

-- Users (Pass: password123)
INSERT INTO users (id, email, password, full_name, phone, status) VALUES
('u1u1u1u1-1111-1111-1111-111111111111', 'admin@spa.com', '$2a$10$8.UnVuG9shgme074w.2fVO5674c9XG9V7GjI18o8v5Wv/pGg5w8qS', 'Nguyễn Admin', '0911111111', 'ACTIVE'),
('u1u1u1u2-2222-2222-2222-222222222222', 'manager@spa.com', '$2a$10$8.UnVuG9shgme074w.2fVO5674c9XG9V7GjI18o8v5Wv/pGg5w8qS', 'Trần Quản Lý', '0922222222', 'ACTIVE'),
('u1u1u1u3-3333-3333-3333-333333333333', 'reception@spa.com', '$2a$10$8.UnVuG9shgme074w.2fVO5674c9XG9V7GjI18o8v5Wv/pGg5w8qS', 'Lê Lễ Tân', '0933333333', 'ACTIVE'),
('u1u1u1u4-4444-4444-4444-444444444444', 'staff1@spa.com', '$2a$10$8.UnVuG9shgme074w.2fVO5674c9XG9V7GjI18o8v5Wv/pGg5w8qS', 'KTV Hoàng Yến', '0944444441', 'ACTIVE'),
('u1u1u1u5-5555-5555-5555-555555555555', 'staff2@spa.com', '$2a$10$8.UnVuG9shgme074w.2fVO5674c9XG9V7GjI18o8v5Wv/pGg5w8qS', 'KTV Minh Tú', '0944444442', 'ACTIVE'),
('u1u1u1u6-6666-6666-6666-666666666666', 'customer1@gmail.com', '$2a$10$8.UnVuG9shgme074w.2fVO5674c9XG9V7GjI18o8v5Wv/pGg5w8qS', 'Phạm Khách 1', '0955555551', 'ACTIVE'),
('u1u1u1u7-7777-7777-7777-777777777777', 'customer2@gmail.com', '$2a$10$8.UnVuG9shgme074w.2fVO5674c9XG9V7GjI18o8v5Wv/pGg5w8qS', 'Vũ Khách 2', '0955555552', 'ACTIVE');

-- User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
('u1u1u1u1-1111-1111-1111-111111111111', 'e1a1a1a1-1111-1111-1111-111111111111'),
('u1u1u1u2-2222-2222-2222-222222222222', 'e1a1a1a2-2222-2222-2222-222222222222'),
('u1u1u1u3-3333-3333-3333-333333333333', 'e1a1a1a3-3333-3333-3333-333333333333'),
('u1u1u1u4-4444-4444-4444-444444444444', 'e1a1a1a4-4444-4444-4444-444444444444'),
('u1u1u1u5-5555-5555-5555-555555555555', 'e1a1a1a4-4444-4444-4444-444444444444'),
('u1u1u1u6-6666-6666-6666-666666666666', 'e1a1a1a5-5555-5555-5555-555555555555'),
('u1u1u1u7-7777-7777-7777-777777777777', 'e1a1a1a5-5555-5555-5555-555555555555');

-- Spa Services (Xịn hơn)
INSERT INTO spa_services (id, name, description, price, duration_minutes, category, image_url) VALUES
('s1s1s1s1-1111-1111-1111-111111111111', 'Massage Body Thụy Điển', 'Liệu pháp massage kinh điển kết hợp tinh dầu thiên nhiên, giúp giảm căng thẳng cơ bắp và lưu thông khí huyết toàn thân.', 350000, 60, 'Massage', 'https://images.unsplash.com/photo-1544161515-4ae6ce6fe859?q=80&w=2070&auto=format&fit=crop'),
('s1s1s1s2-2222-2222-2222-222222222222', 'Chăm sóc da mặt chuyên sâu', 'Quy trình 12 bước làm sạch, thải độc và cung cấp dưỡng chất Collagen, đem lại làn da sáng mịn và tràn đầy sức sống.', 500000, 90, 'Skincare', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop'),
('s1s1s1s3-3333-3333-3333-333333333333', 'Gội đầu dưỡng sinh thảo dược', 'Kết hợp gội đầu bằng thảo dược tự nhiên với massage bấm huyệt vùng cổ vai gáy, giúp ngủ ngon và giảm stress.', 150000, 45, 'Hair', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2014&auto=format&fit=crop'),
('s1s1s1s4-4444-4444-4444-444444444444', 'Ngâm chân thảo dược & Massage', 'Bấm huyệt lòng bàn chân kết hợp ngâm bồn gỗ thảo dược, xua tan mệt mỏi cho những người phải di chuyển nhiều.', 200000, 45, 'Massage', 'https://images.unsplash.com/photo-1519415510236-8657b223315f?q=80&w=2070&auto=format&fit=crop'),
('s1s1s1s5-5555-5555-5555-555555555555', 'Trị mụn công nghệ Laser CO2', 'Ứng dụng công nghệ Laser CO2 Fractional hiện đại giúp điều trị mụn dứt điểm và se khít lỗ chân lông hiệu quả.', 1200000, 120, 'Skincare', 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=2070&auto=format&fit=crop'),
('s1s1s1s6-6666-6666-6666-666666666666', 'Tẩy tế bào chết toàn thân', 'Sử dụng muối khoáng và cà phê organic giúp loại bỏ lớp sừng già cỗi, cho bạn làn da mềm mượt như lụa.', 400000, 60, 'Body', 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=2070&auto=format&fit=crop');

-- Staff Profiles
INSERT INTO staff_profiles (id, user_id, branch_id, title, bio) VALUES
('p1p1p1p1-1111-1111-1111-111111111111', 'u1u1u1u4-4444-4444-4444-444444444444', 'b1b1b1b1-1111-1111-1111-111111111111', 'Kỹ thuật viên chính', 'Chuyên về Massage Body'),
('p1p1p1p2-2222-2222-2222-222222222222', 'u1u1u1u5-5555-5555-5555-555555555555', 'b1b1b1b1-1111-1111-1111-111111111111', 'Chuyên gia Skincare', '5 năm kinh nghiệm Laser');

-- Staff Services
INSERT INTO staff_services (staff_id, service_id) VALUES
('p1p1p1p1-1111-1111-1111-111111111111', 's1s1s1s1-1111-1111-1111-111111111111'),
('p1p1p1p1-1111-1111-1111-111111111111', 's1s1s1s4-4444-4444-4444-444444444444'),
('p1p1p1p2-2222-2222-2222-222222222222', 's1s1s1s2-2222-2222-2222-222222222222'),
('p1p1p1p2-2222-2222-2222-222222222222', 's1s1s1s5-5555-5555-5555-555555555555');

-- Working Schedules
INSERT INTO working_schedules (id, staff_id, day_of_week, start_time, end_time) VALUES
(UUID(), 'p1p1p1p1-1111-1111-1111-111111111111', 2, '09:00:00', '20:00:00'),
(UUID(), 'p1p1p1p1-1111-1111-1111-111111111111', 3, '09:00:00', '20:00:00'),
(UUID(), 'p1p1p1p1-1111-1111-1111-111111111111', 4, '09:00:00', '20:00:00'),
(UUID(), 'p1p1p1p2-2222-2222-2222-222222222222', 2, '09:00:00', '20:00:00'),
(UUID(), 'p1p1p1p2-2222-2222-2222-222222222222', 3, '09:00:00', '20:00:00');

-- Appointments
INSERT INTO appointments (id, customer_id, branch_id, staff_id, start_at, end_at, status, total_amount, note) VALUES
(UUID(), 'u1u1u1u6-6666-6666-6666-666666666666', 'b1b1b1b1-1111-1111-1111-111111111111', 'p1p1p1p1-1111-1111-1111-111111111111', '2026-05-12 09:00:00', '2026-05-12 10:00:00', 'COMPLETED', 350000, 'Khách quen'),
(UUID(), 'u1u1u1u7-7777-7777-7777-777777777777', 'b1b1b1b1-1111-1111-1111-111111111111', 'p1p1p1p2-2222-2222-2222-222222222222', '2026-05-12 10:00:00', '2026-05-12 11:30:00', 'IN_SERVICE', 500000, ''),
(UUID(), 'u1u1u1u6-6666-6666-6666-666666666666', 'b1b1b1b1-1111-1111-1111-111111111111', 'p1p1p1p1-1111-1111-1111-111111111111', '2026-05-12 11:00:00', '2026-05-12 12:00:00', 'CONFIRMED', 200000, 'Làm nhẹ nhàng'),
(UUID(), 'u1u1u1u7-7777-7777-7777-777777777777', 'b1b1b1b1-1111-1111-1111-111111111111', 'p1p1p1p2-2222-2222-2222-222222222222', '2026-05-12 14:00:00', '2026-05-12 16:00:00', 'PENDING', 1200000, 'Khách mới đặt online'),
(UUID(), 'u1u1u1u6-6666-6666-6666-666666666666', 'b1b1b1b1-1111-1111-1111-111111111111', 'p1p1p1p1-1111-1111-1111-111111111111', '2026-05-12 15:00:00', '2026-05-12 16:00:00', 'CANCELLED', 350000, 'Bận việc đột xuất');
