# 🗄️ THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN)

> **Hệ quản trị CSDL:** MySQL 8.x (tương thích TiDB Serverless)  
> **Công cụ Migration:** Flyway  
> **Nguyên tắc:** Tối giản (KISS), chuẩn hóa, đảm bảo toàn vẹn dữ liệu.

---

## 1. Tổng quan — Dự án có bao nhiêu bảng?

Dự án này chỉ cần **đúng 2 bảng**:

| Bảng | Chức năng | Số lượng bản ghi dự kiến |
|---|---|---|
| `users` | Lưu tài khoản người dùng (đăng ký, đăng nhập) | Ít (vài chục đến vài trăm) |
| `tasks` | Lưu công việc của từng người dùng | Nhiều (mỗi user có nhiều task) |

**Mối quan hệ:** 1 user có nhiều task, nhưng 1 task chỉ thuộc về đúng 1 user.

---

## 2. Sơ đồ quan hệ (ERD)

```
╔══════════════════════════════╗          ╔═══════════════════════════════════╗
║          BẢNG: users         ║          ║           BẢNG: tasks             ║
╠══════════════════════════════╣          ╠═══════════════════════════════════╣
║ 🔑 id          (PK)         ║          ║ 🔑 id           (PK)             ║
║    username     (UNIQUE)     ║  1 ──< N ║ 🔗 user_id      (FK → users.id)  ║
║    email        (UNIQUE)     ║──────────║    title                          ║
║    password_hash             ║          ║    description                    ║
║    full_name                 ║          ║    status        (TODO/IN.../DONE)║
║    created_at                ║          ║    priority      (LOW/MED/HIGH)   ║
║    updated_at                ║          ║    due_date                       ║
╚══════════════════════════════╝          ║    created_at                     ║
                                          ║    updated_at                     ║
                                          ╚═══════════════════════════════════╝

    Ký hiệu:
    🔑 PK = Primary Key (Khóa chính — định danh duy nhất mỗi dòng)
    🔗 FK = Foreign Key (Khóa ngoại — liên kết sang bảng khác)
    1 ──< N = Quan hệ "Một - Nhiều" (1 user có N task)
```

### Đọc sơ đồ như thế nào?

Mũi tên `1 ──< N` có nghĩa:
- **1 user** → có thể sở hữu **nhiều (N) task**
- **1 task** → chỉ thuộc về **đúng 1 user** (thông qua cột `user_id`)

Ví dụ thực tế:
```
users:  id=1, username="tungnh"
            │
            ├── tasks: id=1, user_id=1, title="Viết báo cáo",  status=TODO
            ├── tasks: id=2, user_id=1, title="Code backend",   status=IN_PROGRESS
            └── tasks: id=3, user_id=1, title="Setup database", status=DONE

users:  id=2, username="anhnv"
            │
            ├── tasks: id=4, user_id=2, title="Thiết kế UI",   status=TODO
            └── tasks: id=5, user_id=2, title="Fix bug login",  status=DONE
```

> ⚠️ **User Isolation (Cách ly dữ liệu):** `tungnh` (id=1) **KHÔNG** được nhìn thấy task của `anhnv` (id=2) và ngược lại. Backend sẽ luôn lọc `WHERE user_id = <id của người đang đăng nhập>`.

---

## 3. Chi tiết bảng `users`

**Mục đích:** Lưu thông tin tài khoản, phục vụ đăng ký và đăng nhập.

| # | Tên cột | Kiểu dữ liệu | Bắt buộc? | Ràng buộc | Ý nghĩa & Giải thích |
|---|---|---|---|---|---|
| 1 | `id` | `BIGINT` | ✅ | `PRIMARY KEY`, `AUTO_INCREMENT` | Số định danh tự tăng. Mỗi user có 1 id riêng, không trùng. |
| 2 | `username` | `VARCHAR(50)` | ✅ | `UNIQUE` | Tên đăng nhập. Không ai được phép trùng username. |
| 3 | `email` | `VARCHAR(100)` | ✅ | `UNIQUE` | Email đăng ký. Cũng không được trùng. |
| 4 | `password_hash` | `VARCHAR(255)` | ✅ | — | Mật khẩu **đã được mã hóa** bằng BCrypt. Không lưu mật khẩu gốc! |
| 5 | `full_name` | `VARCHAR(100)` | ❌ | — | Họ tên hiển thị. Có thể để trống. |
| 6 | `created_at` | `DATETIME` | ✅ | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo tài khoản. MySQL tự điền. |
| 7 | `updated_at` | `DATETIME` | ✅ | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Tự cập nhật mỗi khi sửa thông tin user. |

### Giải thích các ràng buộc trên bảng `users`:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Ràng buộc bảng users                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  PRIMARY KEY (id)                                                     │
│  └── Mỗi user có 1 id duy nhất, MySQL tự tạo (1, 2, 3...)            │
│                                                                       │
│  UNIQUE (username)                                                    │
│  └── Ngăn 2 người đăng ký cùng username "tungnh"                     │
│      → Nếu ai đó cố tạo → MySQL báo lỗi "Duplicate entry"           │
│                                                                       │
│  UNIQUE (email)                                                       │
│  └── Ngăn 2 người đăng ký cùng email "tung@gmail.com"                │
│                                                                       │
│  NOT NULL (username, email, password_hash)                            │
│  └── Bắt buộc phải có. Không thể tạo user mà thiếu 3 trường này     │
│                                                                       │
│  DEFAULT CURRENT_TIMESTAMP (created_at)                               │
│  └── Khi INSERT mà không truyền created_at → MySQL tự điền giờ hiện  │
│      tại. Ví dụ: "2026-10-07 16:00:00"                               │
│                                                                       │
│  ON UPDATE CURRENT_TIMESTAMP (updated_at)                             │
│  └── Khi UPDATE bất kỳ cột nào → MySQL tự cập nhật updated_at       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Chi tiết bảng `tasks`

**Mục đích:** Lưu công việc của từng người dùng. Đây là bảng chính chứa dữ liệu nghiệp vụ.

| # | Tên cột | Kiểu dữ liệu | Bắt buộc? | Ràng buộc | Ý nghĩa & Giải thích |
|---|---|---|---|---|---|
| 1 | `id` | `BIGINT` | ✅ | `PRIMARY KEY`, `AUTO_INCREMENT` | Số định danh task, tự tăng. |
| 2 | `user_id` | `BIGINT` | ✅ | `FOREIGN KEY → users(id)`, `ON DELETE CASCADE` | **Khóa ngoại**: Task này thuộc user nào. |
| 3 | `title` | `VARCHAR(255)` | ✅ | — | Tiêu đề công việc. Ví dụ: "Viết báo cáo tuần". |
| 4 | `description` | `TEXT` | ❌ | — | Mô tả chi tiết (có thể dài). Có thể để trống. |
| 5 | `status` | `VARCHAR(20)` | ✅ | `DEFAULT 'TODO'` | Trạng thái: `TODO` / `IN_PROGRESS` / `DONE`. |
| 6 | `priority` | `VARCHAR(20)` | ✅ | `DEFAULT 'MEDIUM'` | Mức ưu tiên: `LOW` / `MEDIUM` / `HIGH`. |
| 7 | `due_date` | `DATE` | ❌ | — | Hạn hoàn thành. Ví dụ: `2026-10-10`. Có thể để trống. |
| 8 | `created_at` | `DATETIME` | ✅ | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo task. |
| 9 | `updated_at` | `DATETIME` | ✅ | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Tự cập nhật khi sửa task. |

### Giải thích khóa ngoại trên bảng `tasks`:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Khóa ngoại: tasks.user_id → users.id               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  FOREIGN KEY (user_id) REFERENCES users(id)                           │
│  └── Cột user_id PHẢI chứa giá trị tồn tại trong cột users.id       │
│      ✅ INSERT task với user_id = 1 → OK (nếu user id=1 tồn tại)     │
│      ❌ INSERT task với user_id = 999 → LỖI (user 999 không tồn tại) │
│                                                                       │
│  ON DELETE CASCADE                                                    │
│  └── Khi xóa 1 user → tự động xóa TẤT CẢ task của user đó           │
│                                                                       │
│      Ví dụ: DELETE FROM users WHERE id = 1;                           │
│      → Tất cả task có user_id = 1 sẽ bị xóa tự động                 │
│      → Không còn task "mồ côi" (task mà user đã bị xóa)             │
│                                                                       │
│  Giá trị hợp lệ cho status:                                          │
│      'TODO'        → Chưa bắt đầu (mặc định khi tạo mới)            │
│      'IN_PROGRESS' → Đang thực hiện                                  │
│      'DONE'        → Đã hoàn thành                                   │
│                                                                       │
│  Giá trị hợp lệ cho priority:                                        │
│      'LOW'         → Ưu tiên thấp                                    │
│      'MEDIUM'      → Ưu tiên trung bình (mặc định khi tạo mới)      │
│      'HIGH'        → Ưu tiên cao                                     │
│                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Chỉ mục (Index) — Tăng tốc truy vấn

**Index là gì?** Giống như mục lục sách — thay vì đọc từng trang để tìm nội dung, bạn mở mục lục → nhảy thẳng đến trang cần. Database cũng vậy.

| # | Tên Index | Cột được đánh | Dùng cho truy vấn nào | Tại sao cần? |
|---|---|---|---|---|
| 1 | `idx_tasks_user_id` | `user_id` | `WHERE user_id = ?` | Lấy tất cả task của 1 user — truy vấn phổ biến nhất |
| 2 | `idx_tasks_user_status` | `user_id`, `status` | `WHERE user_id = ? AND status = ?` | Lọc task theo trạng thái + thống kê Dashboard |
| 3 | `idx_tasks_user_due_date` | `user_id`, `due_date` | `WHERE user_id = ? AND due_date BETWEEN ...` | Tìm task sắp đến hạn cho Dashboard |

> **Lưu ý:** Với dự án nhỏ, index không tạo ra khác biệt lớn về tốc độ. Nhưng thêm index thể hiện bạn **có tư duy về hiệu năng** — điểm cộng khi phỏng vấn!

---

## 6. Script SQL hoàn chỉnh (Migration Files)

Đây là **nội dung chính xác** sẽ được đặt vào Flyway migration.

### 6.1. File `V1__init_schema.sql` — Tạo cấu trúc bảng

```sql
-- =============================================
-- V1: Khởi tạo schema cho Task Management System
-- =============================================

-- Bảng 1: users (Quản lý tài khoản)
CREATE TABLE users (
    id             BIGINT       AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(50)  NOT NULL,
    email          VARCHAR(100) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    full_name      VARCHAR(100) NULL,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Ràng buộc: username và email không được trùng
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email    UNIQUE (email)
);

-- Bảng 2: tasks (Quản lý công việc)
CREATE TABLE tasks (
    id             BIGINT       AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT       NOT NULL,
    title          VARCHAR(255) NOT NULL,
    description    TEXT         NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'TODO',
    priority       VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    due_date       DATE         NULL,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Khóa ngoại: mỗi task thuộc về 1 user
    -- ON DELETE CASCADE: xóa user → xóa luôn task của user đó
    CONSTRAINT fk_tasks_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Chỉ mục: tăng tốc các truy vấn thường dùng
CREATE INDEX idx_tasks_user_id       ON tasks(user_id);
CREATE INDEX idx_tasks_user_status   ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date);
```

### 6.2. File `V2__seed_sample_data.sql` — Dữ liệu mẫu

```sql
-- =============================================
-- V2: Dữ liệu mẫu để test và demo
-- =============================================

-- Tài khoản test (password gốc: "123456" → đã băm bằng BCrypt)
INSERT INTO users (username, email, password_hash, full_name) VALUES
('testuser', 'test@example.com', '$2a$10$XXXXX_BCRYPT_HASH_XXXXX', 'Test User');

-- Task mẫu với đầy đủ trạng thái và mức ưu tiên
INSERT INTO tasks (user_id, title, description, status, priority, due_date) VALUES
(1, 'Thiết kế database',        'Thiết kế ERD và viết migration',       'DONE',        'HIGH',   '2026-10-07'),
(1, 'Viết API Authentication',  'Register, Login với JWT',              'DONE',        'HIGH',   '2026-10-07'),
(1, 'Viết API Task CRUD',       'Create, Read, Update, Delete task',    'IN_PROGRESS', 'HIGH',   '2026-10-08'),
(1, 'Tích hợp Swagger',         'Cấu hình springdoc-openapi',          'IN_PROGRESS', 'MEDIUM', '2026-10-08'),
(1, 'Xây dựng giao diện Login', 'Form đăng nhập với validate',         'TODO',        'MEDIUM', '2026-10-09'),
(1, 'Xây dựng Kanban Board',    'Drag & drop giữa 3 cột trạng thái',  'TODO',        'LOW',    '2026-10-10');
```

> **Lưu ý:** Giá trị `$2a$10$XXXXX_BCRYPT_HASH_XXXXX` sẽ được thay bằng hash thật khi ta code xong `BCryptPasswordEncoder`. Hash này được sinh ra từ mật khẩu gốc `"123456"`.

---

## 7. Luồng dữ liệu chính (Data Flow)

### 7.1. Luồng đăng nhập (Authentication)

```
Người dùng nhập: username="tungnh", password="123456"
        │
        ▼
Backend nhận request → Tìm user trong database:
   SELECT * FROM users WHERE username = 'tungnh';
        │
        ▼
Tìm thấy → Lấy password_hash ra → So sánh với BCrypt:
   BCrypt.matches("123456", "$2a$10$...hash_trong_db...")
        │
        ├── Khớp ✅ → Sinh JWT token chứa {userId: 1, username: "tungnh"}
        │              → Trả token về cho frontend
        │
        └── Không khớp ❌ → Trả lỗi "Sai mật khẩu"
```

### 7.2. Luồng lấy danh sách task (có lọc + phân trang)

```
Frontend gọi: GET /api/tasks?page=0&size=10&status=TODO&keyword=báo+cáo
        │
        ▼
Backend giải mã JWT → Biết user hiện tại: userId = 1
        │
        ▼
Truy vấn database (luôn lọc theo user_id để cách ly dữ liệu):
   SELECT * FROM tasks
   WHERE user_id = 1                              ← Chỉ task của user đang đăng nhập
     AND status = 'TODO'                           ← Lọc theo trạng thái
     AND title LIKE '%báo cáo%'                    ← Tìm theo từ khóa
   ORDER BY due_date ASC                           ← Sắp xếp theo hạn gần nhất
   LIMIT 10 OFFSET 0;                             ← Phân trang: trang 1, 10 task/trang
        │
        ▼
Trả về JSON: { content: [...], totalPages: 3, totalElements: 25 }
```

### 7.3. Luồng Dashboard thống kê

```
Frontend gọi: GET /api/dashboard/stats
        │
        ▼
Backend truy vấn 2 câu SQL:

  ① Đếm tổng số task theo trạng thái:
     SELECT status, COUNT(*) AS count
     FROM tasks WHERE user_id = 1
     GROUP BY status;
     → Kết quả: { TODO: 5, IN_PROGRESS: 3, DONE: 8 }

  ② Lấy task sắp hết hạn (trong 3 ngày tới, chưa DONE):
     SELECT * FROM tasks
     WHERE user_id = 1
       AND status != 'DONE'
       AND due_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY)
     ORDER BY due_date ASC;
     → Kết quả: [{title: "Viết API CRUD", due_date: "2026-10-08"}, ...]
        │
        ▼
Trả về JSON: { totalTasks: 16, todo: 5, inProgress: 3, done: 8, upcomingTasks: [...] }
```

### 7.4. Luồng Kanban kéo thả

```
Người dùng kéo task "Viết API CRUD" từ cột "In Progress" → cột "Done"
        │
        ▼
Frontend gọi: PUT /api/tasks/3
   Body: { "status": "DONE" }
        │
        ▼
Backend kiểm tra:
   ① Task id=3 có tồn tại không?           → ✅ Có
   ② Task id=3 có thuộc user đang login?    → ✅ user_id = 1 = userId trong JWT
        │
        ▼
Cập nhật database:
   UPDATE tasks SET status = 'DONE', updated_at = NOW() WHERE id = 3;
        │
        ▼
Trả về: { id: 3, title: "Viết API CRUD", status: "DONE", ... }
Frontend cập nhật vị trí card trên giao diện ✅
```
