-- ==========================================
-- FULL SETUP SCRIPT FOR SPA BOOKING SYSTEM
-- Bao gồm: Tạo bảng (Schema) + Đổ dữ liệu mẫu (Seed Data)
-- ==========================================

-- 1. XÓA CÁC BẢNG NẾU ĐÃ TỒN TẠI (Reset hoàn toàn)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS staff_time_off CASCADE;
DROP TABLE IF EXISTS working_schedules CASCADE;
DROP TABLE IF EXISTS staff_services CASCADE;
DROP TABLE IF EXISTS staff_profiles CASCADE;
DROP TABLE IF EXISTS spa_services CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS branches CASCADE;

-- 2. TẠO CẤU TRÚC BẢNG (DDL)

CREATE TABLE branches (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    opening_time TIME,
    closing_time TIME,
    address TEXT
);

CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE spa_services (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(15,2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    category VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE staff_profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) UNIQUE,
    branch_id UUID REFERENCES branches(id),
    title VARCHAR(255),
    bio TEXT,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE staff_services (
    staff_id UUID REFERENCES staff_profiles(id),
    service_id UUID REFERENCES spa_services(id),
    PRIMARY KEY (staff_id, service_id)
);

CREATE TABLE working_schedules (
    id UUID PRIMARY KEY,
    staff_id UUID REFERENCES staff_profiles(id),
    day_of_week INTEGER NOT NULL, -- 2 to 8 (Monday to Sunday)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY,
    code VARCHAR(50),
    customer_id UUID REFERENCES users(id),
    branch_id UUID REFERENCES branches(id),
    staff_id UUID REFERENCES staff_profiles(id),
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    total_amount DECIMAL(15,2),
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
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

-- Spa Services
INSERT INTO spa_services (id, name, description, price, duration_minutes, category) VALUES
('s1s1s1s1-1111-1111-1111-111111111111', 'Massage Body Thụy Điển', 'Thư giãn cơ bắp với tinh dầu', 350000, 60, 'Massage'),
('s1s1s1s2-2222-2222-2222-222222222222', 'Chăm sóc da mặt chuyên sâu', 'Làm sạch và dưỡng ẩm sâu', 500000, 90, 'Skincare'),
('s1s1s1s3-3333-3333-3333-333333333333', 'Gội đầu dưỡng sinh', 'Gội đầu kết hợp massage cổ vai gáy', 150000, 45, 'Hair'),
('s1s1s1s4-4444-4444-4444-444444444444', 'Massage Chân (Foot)', 'Bấm huyệt giải tỏa mệt mỏi', 200000, 45, 'Massage'),
('s1s1s1s5-5555-5555-5555-555555555555', 'Trị mụn Laser', 'Công nghệ Laser hiện đại', 1200000, 120, 'Skincare');

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
(gen_random_uuid(), 'p1p1p1p1-1111-1111-1111-111111111111', 2, '09:00:00', '20:00:00'),
(gen_random_uuid(), 'p1p1p1p1-1111-1111-1111-111111111111', 3, '09:00:00', '20:00:00'),
(gen_random_uuid(), 'p1p1p1p1-1111-1111-1111-111111111111', 4, '09:00:00', '20:00:00'),
(gen_random_uuid(), 'p1p1p1p2-2222-2222-2222-222222222222', 2, '09:00:00', '20:00:00'),
(gen_random_uuid(), 'p1p1p1p2-2222-2222-2222-222222222222', 3, '09:00:00', '20:00:00');

-- Appointments
INSERT INTO appointments (id, code, customer_id, branch_id, staff_id, start_at, end_at, status, total_amount, note) VALUES
(gen_random_uuid(), 'SPA001', 'u1u1u1u6-6666-6666-6666-666666666666', 'b1b1b1b1-1111-1111-1111-111111111111', 'p1p1p1p1-1111-1111-1111-111111111111', '2026-05-12 09:00:00', '2026-05-12 10:00:00', 'COMPLETED', 350000, 'Khách quen'),
(gen_random_uuid(), 'SPA002', 'u1u1u1u7-7777-7777-7777-777777777777', 'b1b1b1b1-1111-1111-1111-111111111111', 'p1p1p1p2-2222-2222-2222-222222222222', '2026-05-12 10:00:00', '2026-05-12 11:30:00', 'IN_SERVICE', 500000, ''),
(gen_random_uuid(), 'SPA003', 'u1u1u1u6-6666-6666-6666-666666666666', 'b1b1b1b1-1111-1111-1111-111111111111', 'p1p1p1p1-1111-1111-1111-111111111111', '2026-05-12 11:00:00', '2026-05-12 12:00:00', 'CONFIRMED', 200000, 'Làm nhẹ nhàng'),
(gen_random_uuid(), 'SPA004', 'u1u1u1u7-7777-7777-7777-777777777777', 'b1b1b1b1-1111-1111-1111-111111111111', 'p1p1p1p2-2222-2222-2222-222222222222', '2026-05-12 14:00:00', '2026-05-12 16:00:00', 'PENDING', 1200000, 'Khách mới đặt online'),
(gen_random_uuid(), 'SPA005', 'u1u1u1u6-6666-6666-6666-666666666666', 'b1b1b1b1-1111-1111-1111-111111111111', 'p1p1p1p1-1111-1111-1111-111111111111', '2026-05-12 15:00:00', '2026-05-12 16:00:00', 'CANCELLED', 350000, 'Bận việc đột xuất');
