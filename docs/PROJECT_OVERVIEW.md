# 📋 TỔNG QUAN DỰ ÁN: TASK MANAGEMENT SYSTEM

> **Dự án ứng tuyển:** Thực tập sinh Backend / Fullstack Developer  
> **Đơn vị tuyển dụng:** TechVanguard  
> **Thời gian thực hiện đề xuất:** 2–3 ngày  
> **Phiên bản tài liệu:** 1.0  

---

## 1. Mục tiêu dự án
Xây dựng ứng dụng **Task Management System** (Hệ thống quản lý công việc) cho phép người dùng cá nhân hoặc nhóm nhỏ:
- Đăng ký, đăng nhập và bảo mật thông tin tài khoản.
- Quản lý công việc cá nhân (Tạo, xem, cập nhật trạng thái, xóa task).
- Tìm kiếm, lọc và phân trang danh sách công việc.
- Thống kê tiến độ qua bảng điều khiển (Dashboard) và giao diện trực quan (Kanban).

Dự án hướng tới tiêu chí: **Chuẩn chỉ kiến trúc, sạch sẽ, không phình to tính năng không cần thiết (Keep It Simple & Clean), bám sát 100% yêu cầu của TechVanguard.**

---

## 2. Phạm vi yêu cầu (Scope)

### A. Chức năng bắt buộc (MVP - Must Have)
1. **Quản lý tài khoản (Authentication & Authorization):**
   - Đăng ký tài khoản mới (username/email, password).
   - Đăng nhập và trả về JWT (JSON Web Token).
   - Mật khẩu mã hóa một chiều bằng BCrypt.
   - **Bảo mật phân quyền dữ liệu:** Người dùng nào chỉ được xem, chỉnh sửa, xóa công việc của chính người dùng đó (`User Isolation`).

2. **Quản lý công việc (Task CRUD):**
   - Tạo mới task: `tiêu đề (title)`, `mô tả (description)`, `trạng thái (status: TODO, IN_PROGRESS, DONE)`, `mức ưu tiên (priority: LOW, MEDIUM, HIGH)`, `hạn hoàn thành (due_date)`.
   - Xem chi tiết task.
   - Cập nhật thông tin task và trạng thái.
   - Xóa task.

3. **Tìm kiếm & Lọc (Search, Filter, Pagination):**
   - Tìm kiếm công việc theo từ khóa trong tiêu đề.
   - Lọc theo trạng thái (`TODO`, `IN_PROGRESS`, `DONE`) và mức ưu tiên (`LOW`, `MEDIUM`, `HIGH`).
   - Phân trang (Pagination) để tối ưu hiệu năng khi dữ liệu nhiều.

4. **Dashboard thống kê:**
   - Tổng số task hiện có của người dùng.
   - Số lượng task theo từng trạng thái (Đã hoàn thành, đang thực hiện, chưa bắt đầu).
   - Danh sách công việc sắp đến hạn (gần deadline).

### B. Chức năng cộng điểm (Bonus - Should Have)
- **Kanban Board:** Giao diện dạng cột kéo thả trực quan (To Do -> In Progress -> Done).
- **Docker Compose:** Khởi chạy toàn bộ hệ thống (MySQL/Database + Backend + Frontend) bằng 1 câu lệnh `docker compose up -d`.
- **API Documentation:** Tích hợp Swagger / OpenAPI (`springdoc-openapi`) tự động sinh tài liệu API tại `/swagger-ui.html`.
- **Database Migration:** Sử dụng Flyway để quản lý phiên bản database và script seed dữ liệu mẫu (2 users, 24 tasks).
- **Unit / Integration Tests:** Viết 18 test cases với JUnit 5 & Mockito (100% pass) kiểm thử AuthService, TaskService & User Isolation Security.
- **CI Pipeline:** GitHub Actions tự động kiểm thử Backend & Frontend khi push code.
- **Deploy Cloud:** Triển khai Live Cloud hoàn chỉnh: Frontend trên Vercel ([taskflow-core.vercel.app](https://taskflow-core.vercel.app)), Backend trên Render ([task-management-system-dvkr.onrender.com](https://task-management-system-dvkr.onrender.com)), Database trên TiDB Cloud Serverless.

---

## 3. Kiến trúc kỹ thuật (Tech Stack & Architecture)

### 3.1. Cấu trúc Monorepo
```
Task-Management-System/
├── docs/                   # Tài liệu thiết kế, database, kế hoạch sprint & luật AI
├── backend/                # Java Spring Boot 3.3.5 (Maven, Java 17)
├── frontend/               # React 19 + Vite 8 SPA
├── database/               # Scripts Flyway Migration (V1 schema, V2 seed data)
├── docker-compose.yml      # Cấu hình chạy local đa dịch vụ (MySQL + Backend + Frontend)
├── .env.example            # Mẫu biến môi trường
└── README.md               # Hướng dẫn chạy và checklist bàn giao
```

### 3.2. Chi tiết công nghệ
- **Backend:** Java 17, Spring Boot 3.3.5, Spring Data JPA, Spring Security, JJWT, Validation, Lombok.
- **Database:** MySQL 8.0 (Local & Docker) / TiDB Serverless (Cloud AWS Singapore).
- **Migration:** Flyway (V1 schema, V2 seed 24 tasks mẫu).
- **API Documentation:** Springdoc OpenAPI (Swagger UI).
- **Frontend:** React 19, Vite 8, Axios, Lucide React icons, Native Drag & Drop Kanban (nhẹ và mượt mà).
- **DevOps / Deploy:** Docker, Docker Compose, Nginx, Render (Backend), Vercel (Frontend), TiDB Cloud (Database), GitHub Actions (CI Pipeline).

---

## 4. Tiêu chí bàn giao (Deliverables Checklist)
- [x] Pull Request chuẩn bị sẵn sàng cho repo gốc của TechVanguard.
- [x] `README.md` cập nhật hướng dẫn chi tiết cách build, cấu hình, chạy Docker/IDE và link Live Demo.
- [x] File `.env.example` chuẩn, không chứa secret/mật khẩu thật.
- [x] Scripts Database Migration (Flyway V1 + V2) và dữ liệu mẫu (24 task đa dạng).
- [x] Tài liệu API (Swagger UI truy cập được tại `/swagger-ui.html` cả local lẫn Cloud).
- [x] Bảng checklist các tính năng đã hoàn thành (10/10 MVP, 7/7 Bonus).
- [x] Kịch bản demo 3–5 phút / phỏng vấn trực tiếp tại `docs/ke-hoach/DEMO_SCRIPT.md`.

