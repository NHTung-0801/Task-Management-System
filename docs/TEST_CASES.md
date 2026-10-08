# 🧪 TÀI LIỆU CHI TIẾT CÁC TEST CASE KIỂM THỬ (TEST SPECIFICATION & REPORT)

> **Dự án:** Task Management System  
> **Đơn vị đánh giá:** TechVanguard  
> **Module kiểm thử:** Backend Services (JUnit 5 & Mockito)  
> **Mã tính năng:** Bonus B5 (Unit & Integration Testing)  
> **Trạng thái:** ✅ **18/18 Tests Passed (100%)** — Tốc độ thực thi: **~1.8s**  

---

## 📌 1. TỔNG QUAN CHIẾN LƯỢC KIỂM THỬ (TESTING STRATEGY)

Nhằm đảm bảo chất lượng mã nguồn, tính tin cậy của nghiệp vụ và tuân thủ nguyên tắc **Anti-Bloat** theo tài liệu `AGENTS.md`, chiến lược kiểm thử cho hệ thống được thiết kế theo mô hình **Unit Test độc lập**:

1. **Cô lập phụ thuộc (Pure Isolation with Mockito):**
   - Sử dụng `@ExtendWith(MockitoExtension.class)` và `@Mock` / `@InjectMocks`.
   - Không tải toàn bộ ngữ cảnh Spring Boot (`@SpringBootTest`) đối với tầng Service, loại bỏ sự phụ thuộc vào database MySQL thật hoặc Docker.
   - Tốc độ chạy cực nhanh (~0.23s cho Service Tests), phù hợp chạy liên tục trong luồng CI/CD (GitHub Actions).

2. **Giả lập định danh phiên đăng nhập (SecurityContext Simulation):**
   - Đóng giả người dùng đã xác thực bằng `SecurityContextHolder.getContext().setAuthentication(UsernamePasswordAuthenticationToken)` trong `@BeforeEach`.
   - Tự động dọn dẹp môi trường bằng `SecurityContextHolder.clearContext()` trong `@AfterEach` để loại bỏ side-effects giữa các test case.

3. **Trọng tâm bảo mật dữ liệu (User Isolation Enforcement):**
   - Kiểm tra nghiêm ngặt nguyên tắc: **Người dùng A tuyệt đối không thể đọc, sửa hoặc xóa dữ liệu của Người dùng B**.
   - Mọi hành vi vi phạm quyền sở hữu đều phải bị chặn lại và ném `AppException` với mã trạng thái HTTP `403 FORBIDDEN`.

4. **Khung kiểm thử và Assertions:**
   - **Framework:** JUnit 5 (Jupiter), Mockito 5.
   - **Thư viện đối sánh:** AssertJ Fluent Assertions (`assertThat`, `assertThatThrownBy`).

---

## 📊 2. BẢNG MA TRẬN TEST CASE (TEST MATRIX SUMMARY)

| Mã TC | Class kiểm thử | Phương thức Test | Nhóm nghiệp vụ | Kết quả kỳ vọng | Trạng thái |
|---|---|---|---|---|:---:|
| **TC-AUTH-01** | `AuthServiceTest` | `register_Success` | Đăng ký | Tạo user mới, hash pass, sinh JWT token | ✅ PASS |
| **TC-AUTH-02** | `AuthServiceTest` | `register_DuplicateUsername_ThrowsAppException` | Đăng ký | Chặn trùng Username -> `409 / 400 Bad Request` | ✅ PASS |
| **TC-AUTH-03** | `AuthServiceTest` | `register_DuplicateEmail_ThrowsAppException` | Đăng ký | Chặn trùng Email -> `409 / 400 Bad Request` | ✅ PASS |
| **TC-AUTH-04** | `AuthServiceTest` | `login_Success` | Đăng nhập | Xác thực đúng mật khẩu -> Trả JWT token | ✅ PASS |
| **TC-AUTH-05** | `AuthServiceTest` | `login_UserNotFound_ThrowsAppException` | Đăng nhập | Sai Username -> Ném `401 Unauthorized` | ✅ PASS |
| **TC-AUTH-06** | `AuthServiceTest` | `login_WrongPassword_ThrowsAppException` | Đăng nhập | Sai Password -> Ném `401 Unauthorized` | ✅ PASS |
| **TC-TASK-01** | `TaskServiceTest` | `createTask_Success` | Tạo Task | Tạo task thành công, gán đúng chủ sở hữu User A | ✅ PASS |
| **TC-TASK-02** | `TaskServiceTest` | `createTask_DefaultValues_WhenStatusAndPriorityNull` | Tạo Task | Tự động gán mặc định `TODO` và `MEDIUM` | ✅ PASS |
| **TC-TASK-03** | `TaskServiceTest` | `getTaskById_Success_WhenBelongsToCurrentUser` | Xem chi tiết | User A đọc task của chính mình thành công | ✅ PASS |
| **TC-TASK-04** | `TaskServiceTest` | `getTaskById_UserIsolation_ThrowsForbidden_WhenBelongsToAnotherUser` | **User Isolation** | Chặn User A xem task của User B -> Ném `403 Forbidden` | ✅ PASS |
| **TC-TASK-05** | `TaskServiceTest` | `getTaskById_NotFound_ThrowsNotFound` | Xem chi tiết | ID không tồn tại -> Ném `404 Not Found` | ✅ PASS |
| **TC-TASK-06** | `TaskServiceTest` | `updateTask_Success_WhenBelongsToCurrentUser` | Cập nhật | User A cập nhật task của chính mình thành công | ✅ PASS |
| **TC-TASK-07** | `TaskServiceTest` | `updateTask_UserIsolation_ThrowsForbidden_WhenBelongsToAnotherUser` | **User Isolation** | Chặn User A sửa task của User B -> Ném `403 Forbidden` | ✅ PASS |
| **TC-TASK-08** | `TaskServiceTest` | `deleteTask_Success_WhenBelongsToCurrentUser` | Xóa Task | User A xóa task của chính mình thành công | ✅ PASS |
| **TC-TASK-09** | `TaskServiceTest` | `deleteTask_UserIsolation_ThrowsForbidden_WhenBelongsToAnotherUser` | **User Isolation** | Chặn User A xóa task của User B -> Ném `403 Forbidden` | ✅ PASS |
| **TC-TASK-10** | `TaskServiceTest` | `getTasks_Success_WithPaginationAndFilter` | Lọc & Phân trang | Trả về `PageResponse` với Specification chuẩn | ✅ PASS |
| **TC-TASK-11** | `TaskServiceTest` | `getCurrentUser_Unauthenticated_ThrowsUnauthorized` | Xác thực | Chưa login gọi service -> Ném `401 Unauthorized` | ✅ PASS |
| **TC-SYS-01** | `TaskManagerApplicationTests` | `contextLoads` | Tích hợp hệ thống | Khởi tạo Spring Context và load cấu hình thành công | ✅ PASS |

---

## 🔍 3. CHI TIẾT TỪNG TEST CASE

### 3.1. Phân hệ Xác thực & Tài khoản (`AuthServiceTest`)

#### **TC-AUTH-01: Đăng ký tài khoản thành công**
- **Mã kịch bản:** `TC-AUTH-01`
- **Tên phương thức:** `register_Success()`
- **Mục tiêu:** Xác minh luồng đăng ký người dùng mới hoạt động chính xác khi dữ liệu đầu vào hợp lệ và chưa từng tồn tại trên hệ thống.
- **Tiền điều kiện (Given):**
  - `UserRepository.existsByUsername("testuser")` trả về `false`.
  - `UserRepository.existsByEmail("test@example.com")` trả về `false`.
  - `PasswordEncoder.encode("Password123")` trả về chuỗi băm `"hashedPassword123"`.
  - `JwtUtil.generateToken("testuser")` trả về token `"mocked.jwt.token"`.
- **Hành vi thực thi (When):**
  - Gọi `authService.register(registerRequest)`.
- **Kết quả kỳ vọng (Then):**
  - Đối tượng `AuthResponse` trả về không null.
  - Token bằng `"mocked.jwt.token"` với loại token là `"Bearer"`.
  - Verify `UserRepository.save()` được gọi chính xác 1 lần với mật khẩu đã băm.
  - Verify không bao giờ lưu mật khẩu dạng thô (plaintext).

---

#### **TC-AUTH-02: Đăng ký thất bại do trùng Username**
- **Mã kịch bản:** `TC-AUTH-02`
- **Tên phương thức:** `register_DuplicateUsername_ThrowsAppException()`
- **Mục tiêu:** Kiểm tra cơ chế chống trùng lặp tên đăng nhập trong hệ thống.
- **Tiền điều kiện (Given):**
  - `UserRepository.existsByUsername("testuser")` trả về `true`.
- **Hành vi thực thi (When):**
  - Gọi `authService.register(registerRequest)`.
- **Kết quả kỳ vọng (Then):**
  - Bắt ngoại lệ `AppException`.
  - HTTP Status là `HttpStatus.BAD_REQUEST` (400).
  - Thông báo lỗi: `"Tên đăng nhập 'testuser' đã được sử dụng"`.
  - Verify phương thức `UserRepository.save()` và `JwtUtil.generateToken()` **tuyệt đối không được gọi** (`never()`).

---

#### **TC-AUTH-03: Đăng ký thất bại do trùng Email**
- **Mã kịch bản:** `TC-AUTH-03`
- **Tên phương thức:** `register_DuplicateEmail_ThrowsAppException()`
- **Mục tiêu:** Kiểm tra cơ chế chống trùng lặp địa chỉ email.
- **Tiền điều kiện (Given):**
  - `UserRepository.existsByUsername("testuser")` trả về `false`.
  - `UserRepository.existsByEmail("test@example.com")` trả về `true`.
- **Hành vi thực thi (When):**
  - Gọi `authService.register(registerRequest)`.
- **Kết quả kỳ vọng (Then):**
  - Bắt ngoại lệ `AppException`.
  - HTTP Status là `HttpStatus.BAD_REQUEST` (400).
  - Thông báo lỗi: `"Email 'test@example.com' đã được sử dụng"`.
  - Verify `UserRepository.save()` không được kích hoạt.

---

#### **TC-AUTH-04: Đăng nhập thành công với tài khoản và mật khẩu đúng**
- **Mã kịch bản:** `TC-AUTH-04`
- **Tên phương thức:** `login_Success()`
- **Mục tiêu:** Xác minh người dùng cung cấp đúng thông tin đăng nhập sẽ nhận được JWT Token.
- **Tiền điều kiện (Given):**
  - `UserRepository.findByUsername("testuser")` tìm thấy người dùng.
  - `PasswordEncoder.matches("Password123", "hashedPassword123")` trả về `true`.
  - `JwtUtil.generateToken("testuser")` trả về token hợp lệ.
- **Hành vi thực thi (When):**
  - Gọi `authService.login(loginRequest)`.
- **Kết quả kỳ vọng (Then):**
  - Trả về đối tượng `AuthResponse` chứa JWT token và thông tin profile cơ bản (`userId`, `username`).
  - Verify kiểm tra khớp mật khẩu thành công.

---

#### **TC-AUTH-05: Đăng nhập thất bại do Username không tồn tại**
- **Mã kịch bản:** `TC-AUTH-05`
- **Tên phương thức:** `login_UserNotFound_ThrowsAppException()`
- **Mục tiêu:** Đảm bảo hệ thống từ chối đăng nhập an toàn khi không tìm thấy tài khoản.
- **Tiền điều kiện (Given):**
  - `UserRepository.findByUsername("testuser")` trả về `Optional.empty()`.
- **Hành vi thực thi (When):**
  - Gọi `authService.login(loginRequest)`.
- **Kết quả kỳ vọng (Then):**
  - Bắt ngoại lệ `AppException` với status `HttpStatus.UNAUTHORIZED` (401).
  - Thông báo lỗi chung an toàn: `"Tên đăng nhập hoặc mật khẩu không chính xác"` (không làm lộ tài khoản có tồn tại hay không).
  - Verify `PasswordEncoder.matches()` và `JwtUtil.generateToken()` không được gọi.

---

#### **TC-AUTH-06: Đăng nhập thất bại do sai mật khẩu**
- **Mã kịch bản:** `TC-AUTH-06`
- **Tên phương thức:** `login_WrongPassword_ThrowsAppException()`
- **Mục tiêu:** Đảm bảo hệ thống chặn đăng nhập khi mật khẩu không khớp.
- **Tiền điều kiện (Given):**
  - `UserRepository.findByUsername("testuser")` tìm thấy người dùng.
  - `PasswordEncoder.matches("Password123", "hashedPassword123")` trả về `false`.
- **Hành vi thực thi (When):**
  - Gọi `authService.login(loginRequest)`.
- **Kết quả kỳ vọng (Then):**
  - Bắt ngoại lệ `AppException` với status `HttpStatus.UNAUTHORIZED` (401).
  - Verify không sinh JWT token (`jwtUtil.generateToken()` không được gọi).

---

### 3.2. Phân hệ Quản lý Công việc & Bảo mật Dữ liệu (`TaskServiceTest`)

#### **TC-TASK-01: Tạo task thành công và gán đúng chủ sở hữu**
- **Mã kịch bản:** `TC-TASK-01`
- **Tên phương thức:** `createTask_Success()`
- **Mục tiêu:** Xác minh khi tạo mới task, task luôn tự động liên kết với người dùng đang đăng nhập trong `SecurityContext`.
- **Tiền điều kiện (Given):**
  - `SecurityContext` chứa phiên của `usera` (User ID = 1).
  - Request có tiêu đề `"Công việc mới"`, trạng thái `TODO`, mức ưu tiên `HIGH`.
- **Hành vi thực thi (When):**
  - Gọi `taskService.createTask(request)`.
- **Kết quả kỳ vọng (Then):**
  - Trả về `TaskResponse` hợp lệ.
  - Verify `TaskRepository.save()` được gọi với đối tượng Task có `user.id == 1L`.

---

#### **TC-TASK-02: Tự động gán giá trị mặc định cho Status và Priority**
- **Mã kịch bản:** `TC-TASK-02`
- **Tên phương thức:** `createTask_DefaultValues_WhenStatusAndPriorityNull()`
- **Mục tiêu:** Đảm bảo tính toàn vẹn dữ liệu: nếu client bỏ trống trạng thái hoặc độ ưu tiên, hệ thống tự động gán `TODO` và `MEDIUM`.
- **Tiền điều kiện (Given):**
  - Request chỉ có `title`, không có `status` và `priority`.
- **Hành vi thực thi (When):**
  - Gọi `taskService.createTask(request)`.
- **Kết quả kỳ vọng (Then):**
  - Verify `taskRepository.save()` nhận đối tượng Task có `task.getStatus() == TaskStatus.TODO` và `task.getPriority() == TaskPriority.MEDIUM`.

---

#### **TC-TASK-03: Xem chi tiết task thành công của chính mình**
- **Mã kịch bản:** `TC-TASK-03`
- **Tên phương thức:** `getTaskById_Success_WhenBelongsToCurrentUser()`
- **Mục tiêu:** User A truy vấn task thuộc quyền sở hữu của chính User A.
- **Tiền điều kiện (Given):**
  - Đăng nhập `usera`.
  - Task ID 100 thuộc về `usera`.
- **Hành vi thực thi (When):**
  - Gọi `taskService.getTaskById(100L)`.
- **Kết quả kỳ vọng (Then):**
  - Trả về `TaskResponse` với `id == 100L` và tiêu đề khớp dữ liệu mẫu.

---

#### **TC-TASK-04: User Isolation - Chặn User A xem chi tiết task của User B**
- **Mã kịch bản:** `TC-TASK-04` (Trọng tâm bảo mật)
- **Tên phương thức:** `getTaskById_UserIsolation_ThrowsForbidden_WhenBelongsToAnotherUser()`
- **Mục tiêu:** Kiểm tra lỗ hổng IDOR (Insecure Direct Object Reference) - Đảm bảo User A không thể đọc trộm task của User B bằng cách đổi ID trên URL.
- **Tiền điều kiện (Given):**
  - Đăng nhập `usera` (User ID = 1).
  - Task ID 200 tồn tại trong hệ thống nhưng thuộc sở hữu của `userb` (User ID = 2).
- **Hành vi thực thi (When):**
  - `usera` gọi `taskService.getTaskById(200L)`.
- **Kết quả kỳ vọng (Then):**
  - Hệ thống ném ngoại lệ `AppException`.
  - Mã trạng thái HTTP: **`HttpStatus.FORBIDDEN` (403)**.
  - Thông báo: `"Bạn không có quyền truy cập công việc này"`.

---

#### **TC-TASK-05: Xem chi tiết thất bại khi task không tồn tại**
- **Mã kịch bản:** `TC-TASK-05`
- **Tên phương thức:** `getTaskById_NotFound_ThrowsNotFound()`
- **Mục tiêu:** Trả về mã lỗi phù hợp khi tìm kiếm ID không có trong cơ sở dữ liệu.
- **Tiền điều kiện (Given):**
  - Task ID 999 không tồn tại (`Optional.empty()`).
- **Hành vi thực thi (When):**
  - Gọi `taskService.getTaskById(999L)`.
- **Kết quả kỳ vọng (Then):**
  - Ném `AppException` với status **`HttpStatus.NOT_FOUND` (404)**.
  - Thông báo lỗi: `"Công việc không tồn tại"`.

---

#### **TC-TASK-06: Cập nhật task thành công khi thuộc quyền sở hữu**
- **Mã kịch bản:** `TC-TASK-06`
- **Tên phương thức:** `updateTask_Success_WhenBelongsToCurrentUser()`
- **Mục tiêu:** Cho phép người dùng chỉnh sửa thông tin task của chính mình.
- **Tiền điều kiện (Given):**
  - Đăng nhập `usera`.
  - Task ID 100 thuộc về `usera`.
  - Request cập nhật tiêu đề, trạng thái `IN_PROGRESS`, ưu tiên `LOW`.
- **Hành vi thực thi (When):**
  - Gọi `taskService.updateTask(100L, request)`.
- **Kết quả kỳ vọng (Then):**
  - Dữ liệu task được cập nhật chính xác.
  - Verify `taskRepository.save()` được gọi 1 lần.

---

#### **TC-TASK-07: User Isolation - Chặn User A cập nhật task của User B**
- **Mã kịch bản:** `TC-TASK-07` (Trọng tâm bảo mật)
- **Tên phương thức:** `updateTask_UserIsolation_ThrowsForbidden_WhenBelongsToAnotherUser()`
- **Mục tiêu:** Đảm bảo User A không thể can thiệp, sửa đổi trái phép dữ liệu task của User B.
- **Tiền điều kiện (Given):**
  - Đăng nhập `usera`.
  - Task ID 200 thuộc về `userb`.
- **Hành vi thực thi (When):**
  - `usera` gọi `taskService.updateTask(200L, request)`.
- **Kết quả kỳ vọng (Then):**
  - Ném `AppException` với status **`HttpStatus.FORBIDDEN` (403)**.
  - Thông báo lỗi: `"Bạn không có quyền sửa công việc này"`.
  - **Verify then chốt:** `taskRepository.save()` **tuyệt đối không được gọi** (`never().save(...)`).

---

#### **TC-TASK-08: Xóa task thành công khi thuộc quyền sở hữu**
- **Mã kịch bản:** `TC-TASK-08`
- **Tên phương thức:** `deleteTask_Success_WhenBelongsToCurrentUser()`
- **Mục tiêu:** Cho phép người dùng xóa task do chính mình tạo ra.
- **Tiền điều kiện (Given):**
  - Đăng nhập `usera`.
  - Task ID 100 thuộc về `usera`.
- **Hành vi thực thi (When):**
  - Gọi `taskService.deleteTask(100L)`.
- **Kết quả kỳ vọng (Then):**
  - Verify `taskRepository.delete(taskA)` được kích hoạt thành công 1 lần.

---

#### **TC-TASK-09: User Isolation - Chặn User A xóa task của User B**
- **Mã kịch bản:** `TC-TASK-09` (Trọng tâm bảo mật)
- **Tên phương thức:** `deleteTask_UserIsolation_ThrowsForbidden_WhenBelongsToAnotherUser()`
- **Mục tiêu:** Ngăn chặn hành vi phá hoại dữ liệu: User A không thể xóa task của User B.
- **Tiền điều kiện (Given):**
  - Đăng nhập `usera`.
  - Task ID 200 thuộc về `userb`.
- **Hành vi thực thi (When):**
  - `usera` gọi `taskService.deleteTask(200L)`.
- **Kết quả kỳ vọng (Then):**
  - Ném `AppException` với status **`HttpStatus.FORBIDDEN` (403)**.
  - Thông báo lỗi: `"Bạn không có quyền xóa công việc này"`.
  - **Verify then chốt:** `taskRepository.delete()` **tuyệt đối không được gọi** (`never().delete(...)`).

---

#### **TC-TASK-10: Truy vấn danh sách công việc có phân trang và bộ lọc**
- **Mã kịch bản:** `TC-TASK-10`
- **Tên phương thức:** `getTasks_Success_WithPaginationAndFilter()`
- **Mục tiêu:** Kiểm tra khả năng tìm kiếm từ khóa, lọc theo `status`, `priority` và phân trang JPA Specification.
- **Tiền điều kiện (Given):**
  - Repository mock trả về `Page<Task>` chứa danh sách task phù hợp.
- **Hành vi thực thi (When):**
  - Gọi `taskService.getTasks("Task", TaskStatus.TODO, TaskPriority.HIGH, 0, 10, "createdAt", "desc")`.
- **Kết quả kỳ vọng (Then):**
  - Trả về đối tượng `PageResponse` với `totalElements`, `totalPages`, và danh sách content.
  - Verify `taskRepository.findAll(any(Specification.class), any(Pageable.class))` được gọi.

---

#### **TC-TASK-11: Chặn thao tác khi chưa đăng nhập (Unauthenticated)**
- **Mã kịch bản:** `TC-TASK-11`
- **Tên phương thức:** `getCurrentUser_Unauthenticated_ThrowsUnauthorized()`
- **Mục tiêu:** Đảm bảo khi gọi hàm nghiệp vụ mà không có JWT Authentication trong `SecurityContext`, hệ thống lập tức từ chối.
- **Tiền điều kiện (Given):**
  - `SecurityContextHolder.clearContext()` (không có thông tin phiên làm việc).
- **Hành vi thực thi (When):**
  - Gọi `taskService.createTask(request)`.
- **Kết quả kỳ vọng (Then):**
  - Ném `AppException` với status **`HttpStatus.UNAUTHORIZED` (401)**.
  - Thông báo: `"Yêu cầu đăng nhập để thực hiện thao tác"`.
  - Verify không có bản ghi nào bị ghi vào cơ sở dữ liệu (`never().save(...)`).

---

### 3.3. Kiểm thử Tích hợp Cấu hình Ứng dụng (`TaskManagerApplicationTests`)

#### **TC-SYS-01: Kiểm tra khởi động Spring ApplicationContext**
- **Mã kịch bản:** `TC-SYS-01`
- **Tên phương thức:** `contextLoads()`
- **Mục tiêu:** Đảm bảo toàn bộ cấu hình Spring Boot (Beans, JPA Entities, Flyway Migrations, Security Filter Chain) hợp lệ và sẵn sàng hoạt động mà không bị crash.
- **Kết quả:** Spring Boot Context nạp thành công trong 5.97s, không phát sinh lỗi BeanDefinition.

---

## 🚀 4. HƯỚNG DẪN CHẠY TEST (EXECUTION GUIDE)

Các câu lệnh hữu ích dành cho nhà tuyển dụng hoặc người chấm bài để kiểm chứng toàn bộ test cases:

### 1. Chạy toàn bộ Test Suite:
```bash
cd backend
./mvnw test
```

### 2. Chạy riêng từng Class kiểm thử:
```bash
# Kiểm thử phân hệ Xác thực
./mvnw test -Dtest=AuthServiceTest

# Kiểm thử phân hệ Công việc & User Isolation
./mvnw test -Dtest=TaskServiceTest
```

### 3. Chạy riêng nhóm kiểm thử User Isolation:
```bash
./mvnw test -Dtest=TaskServiceTest#*UserIsolation*
```

---

## 📈 5. BÁO CÁO THỰC THI THỰC TẾ (TEST EXECUTION LOG)

```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.taskmanager.service.AuthServiceTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.664 s -- in com.taskmanager.service.AuthServiceTest
[INFO] Running com.taskmanager.service.TaskServiceTest
[INFO] Tests run: 11, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.232 s -- in com.taskmanager.service.TaskServiceTest
[INFO] Running com.taskmanager.TaskManagerApplicationTests
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 6.485 s -- in com.taskmanager.TaskManagerApplicationTests
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 18, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  11.876 s
```

---
*Tài liệu được biên soạn phục vụ đối chiếu tiêu chí tuyển dụng kỹ sư phần mềm tại TechVanguard.*
