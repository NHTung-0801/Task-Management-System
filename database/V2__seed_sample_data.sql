-- =============================================
-- V2__seed_sample_data.sql
-- Dữ liệu mẫu để nhà tuyển dụng có thể test ngay khi chạy dự án
-- =============================================

-- Tắt kiểm tra khóa ngoại để dọn dẹp sạch sẽ
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE tasks;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------
-- Tài khoản duy nhất:
-- Username: user01  |  Password: Pass12345
-- BCrypt hash của Pass12345: $2a$10$MCgmA5C/4UXsJZPST3r8LurKeiwLjJgBKtJpL3leoIFwVEY/4sMtC
-- -----------------------------------------
INSERT INTO users (id, username, email, password_hash, full_name) VALUES
(1, 'user01', 'tung@gmail.com', '$2a$10$MCgmA5C/4UXsJZPST3r8LurKeiwLjJgBKtJpL3leoIFwVEY/4sMtC', 'Nguyen Hoang Tung');

-- -----------------------------------------
-- 12 Task mẫu cho user01 — Đầy đủ trạng thái và mức ưu tiên
-- -----------------------------------------
INSERT INTO tasks (id, user_id, title, description, status, priority, due_date) VALUES

-- Cột DONE (Đã hoàn thành)
(1, 1, 'Khởi tạo kiến trúc Monorepo & Database Schema',
    'Thiết lập Spring Boot 3 Monorepo, cấu hình MySQL 8.0, cấu trúc thư mục Controller/Service/Repository và Flyway migrations V1, V2.',
    'DONE', 'HIGH', '2026-10-06'),

(2, 1, 'Hệ thống Xác thực Bảo mật Spring Security & JWT',
    'Triển khai API Register, Login, băm mật khẩu chuẩn BCrypt và cơ chế xác thực Stateless Token JWT Bearer với UserDetailsService.',
    'DONE', 'HIGH', '2026-10-07'),

(3, 1, 'Thiết kế RESTful API Task CRUD & User Isolation',
    'Xây dựng trọn bộ API Create, Read, Update, Delete Task với ràng buộc bảo mật User Isolation (chỉ truy cập công việc của chính mình).',
    'DONE', 'HIGH', '2026-10-07'),

(4, 1, 'Tích hợp tài liệu tương tác tự động Swagger OpenAPI 3.0',
    'Cấu hình springdoc-openapi, định nghĩa schema @Tag, @Operation, @ApiResponse và nút Authorize Bearer Token trực quan tại /swagger-ui.html.',
    'DONE', 'MEDIUM', '2026-10-07'),

-- Cột IN_PROGRESS (Đang thực hiện)
(5, 1, 'Tối ưu hóa bộ lọc động & Phân trang với JPA Specification',
    'Hỗ trợ tìm kiếm từ khóa keyword đa trường (title, description), lọc nhiều tiêu chí status, priority, kết hợp phân trang Pageable chuẩn REST.',
    'IN_PROGRESS', 'HIGH', '2026-10-08'),

(6, 1, 'Phát triển bảng Kanban kéo thả thời gian thực',
    'Giao diện trực quan 3 cột To Do / In Progress / Done sử dụng HTML5 Drag and Drop API, hỗ trợ di chuyển nhanh và cập nhật ngay lập tức.',
    'IN_PROGRESS', 'HIGH', '2026-10-08'),

(7, 1, 'Xây dựng Dashboard thống kê tiến độ & Deadlines sắp đến',
    'Thiết kế 4 thẻ KPI động, thanh tiến độ tổng thể, danh sách việc cần xử lý gấp trong 7 ngày tới kèm phím tắt hành động nhanh.',
    'IN_PROGRESS', 'MEDIUM', '2026-10-09'),

(8, 1, 'Viết bộ Unit Test & Integration Test cho Service',
    'Viết kiểm thử tự động với JUnit 5 và Mockito cho AuthService, TaskService kiểm tra phân quyền User Isolation và logic nghiệp vụ.',
    'IN_PROGRESS', 'MEDIUM', '2026-10-10'),

-- Cột TODO (Chưa bắt đầu)
(9, 1, 'Đóng gói môi trường toàn diện với Docker Compose',
    'Viết Dockerfile đa tầng cho Backend Spring Boot, Nginx phục vụ Frontend React Vite và docker-compose.yml khởi động hệ sinh thái với 1 lệnh.',
    'TODO', 'HIGH', '2026-10-11'),

(10, 1, 'Thiết lập pipeline tự động hóa CI/CD GitHub Actions',
    'Xây dựng workflow tự động build, chạy test và kiểm tra chất lượng mã nguồn mỗi khi tạo Pull Request vào nhánh chính.',
    'TODO', 'MEDIUM', '2026-10-12'),

(11, 1, 'Soạn thảo kịch bản và quay Video Demo sản phẩm 3-5 phút',
    'Quay video giới thiệu kiến trúc, luồng người dùng: đăng nhập, thao tác kéo thả Kanban, thống kê Dashboard và giải thích User Isolation.',
    'TODO', 'MEDIUM', '2026-10-13'),

(12, 1, 'Chuẩn hóa tài liệu README & Checklist bàn giao dự án',
    'Hoàn thiện hướng dẫn cài đặt từng bước, bảng phân chia API, sơ đồ kiến trúc hệ thống và tổng kết các điểm cộng theo tiêu chuẩn TechVanguard.',
    'TODO', 'LOW', '2026-10-14');
