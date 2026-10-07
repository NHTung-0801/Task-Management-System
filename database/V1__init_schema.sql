-- =============================================
-- V1__init_schema.sql
-- Khởi tạo cấu trúc database cho Task Management System
-- =============================================

-- -----------------------------------------
-- Bảng 1: users — Quản lý tài khoản
-- -----------------------------------------
CREATE TABLE users (
    id             BIGINT        AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(50)   NOT NULL,
    email          VARCHAR(100)  NOT NULL,
    password_hash  VARCHAR(255)  NOT NULL,
    full_name      VARCHAR(100)  NULL,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Ràng buộc UNIQUE: không cho phép trùng username hoặc email
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email    UNIQUE (email)
);

-- -----------------------------------------
-- Bảng 2: tasks — Quản lý công việc
-- -----------------------------------------
CREATE TABLE tasks (
    id             BIGINT        AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT        NOT NULL,
    title          VARCHAR(255)  NOT NULL,
    description    TEXT          NULL,
    status         VARCHAR(20)   NOT NULL DEFAULT 'TODO',
    priority       VARCHAR(20)   NOT NULL DEFAULT 'MEDIUM',
    due_date       DATE          NULL,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Khóa ngoại: liên kết task → user
    -- ON DELETE CASCADE: xóa user → tự động xóa tất cả task của user đó
    CONSTRAINT fk_tasks_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------
-- Chỉ mục (Index): tăng tốc truy vấn
-- -----------------------------------------

-- Index 1: Tìm tất cả task của 1 user
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Index 2: Lọc task theo trạng thái (dùng cho Dashboard thống kê + bộ lọc)
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);

-- Index 3: Tìm task sắp đến hạn (dùng cho Dashboard "upcoming tasks")
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date);
