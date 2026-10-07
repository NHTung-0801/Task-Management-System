-- =============================================
-- V2__seed_sample_data.sql
-- Dữ liệu mẫu để nhà tuyển dụng có thể test ngay khi chạy dự án
-- =============================================

-- -----------------------------------------
-- Tài khoản test
-- Username: testuser  |  Password gốc: 123456
-- (password_hash dưới đây là "123456" đã băm bằng BCrypt)
-- Hash này sẽ được cập nhật chính xác khi Spring Boot BCryptPasswordEncoder chạy lần đầu
-- -----------------------------------------
INSERT INTO users (username, email, password_hash, full_name) VALUES
('testuser', 'test@example.com', '$2a$10$PIYFBnj.xjGSQy/BFFpEouBBqo1hFqvvuC167mn4Aa6HI1U6ml29q', 'Nguyen Van Test');

-- -----------------------------------------
-- Task mẫu — đủ 3 trạng thái và 3 mức ưu tiên để demo
-- -----------------------------------------
INSERT INTO tasks (user_id, title, description, status, priority, due_date) VALUES

-- Task đã hoàn thành (DONE)
(1, 'Thiết kế database',
     'Thiết kế ERD gồm 2 bảng users và tasks, viết migration Flyway.',
     'DONE', 'HIGH', '2026-10-07'),

(1, 'Viết API Authentication',
     'Xây dựng API Register và Login với Spring Security + JWT.',
     'DONE', 'HIGH', '2026-10-07'),

-- Task đang làm (IN_PROGRESS)
(1, 'Viết API Task CRUD',
     'Xây dựng 4 endpoint: Create, Read, Update, Delete task.',
     'IN_PROGRESS', 'HIGH', '2026-10-08'),

(1, 'Tích hợp Swagger',
     'Cấu hình springdoc-openapi để tự sinh tài liệu API.',
     'IN_PROGRESS', 'MEDIUM', '2026-10-09'),

-- Task chưa làm (TODO)
(1, 'Xây dựng giao diện Login',
     'Form đăng nhập với validate email và password ở phía client.',
     'TODO', 'MEDIUM', '2026-10-09'),

(1, 'Xây dựng Kanban Board',
     'Giao diện kéo thả 3 cột: To Do, In Progress, Done.',
     'TODO', 'LOW', '2026-10-10');
