-- =============================================
-- V2__seed_sample_data.sql
-- Dữ liệu mẫu phục vụ kiểm thử và đánh giá dự án
-- Gồm 2 tài khoản và 24 công việc đa dạng trạng thái
-- =============================================

-- Tắt kiểm tra khóa ngoại để dọn dẹp sạch sẽ
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE tasks;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------
-- 2 Tài khoản kiểm thử:
-- Mật khẩu chung: Pass12345
-- BCrypt hash của Pass12345: $2a$10$MCgmA5C/4UXsJZPST3r8LurKeiwLjJgBKtJpL3leoIFwVEY/4sMtC
-- -----------------------------------------
INSERT INTO users (id, username, email, password_hash, full_name) VALUES
(1, 'user01', 'user01@gmail.com', '$2a$10$MCgmA5C/4UXsJZPST3r8LurKeiwLjJgBKtJpL3leoIFwVEY/4sMtC', 'Nguyễn Hoàng Tùng'),
(2, 'user02', 'user02@gmail.com', '$2a$10$MCgmA5C/4UXsJZPST3r8LurKeiwLjJgBKtJpL3leoIFwVEY/4sMtC', 'Trần Minh Đức');

-- -----------------------------------------
-- PHẦN 1: 12 Task cho user01 (Kế hoạch học tập & nâng cao Tiếng Anh)
-- -----------------------------------------
INSERT INTO tasks (id, user_id, title, description, status, priority, due_date) VALUES

-- Cột DONE (Đã xong)
(1, 1, 'Làm bài kiểm tra năng lực tiếng Anh đầu vào',
    'Hoàn thành bài test 4 kỹ năng (Nghe, Đọc, Viết, Nói) trên web để xác định trình độ hiện tại.',
    'DONE', 'HIGH', '2026-10-04'),

(2, 1, 'Mua giáo trình và sách từ vựng Oxford',
    'Đặt mua cuốn sách Destination B1 và từ điển Oxford Learner để phục vụ lộ trình học 3 tháng tới.',
    'DONE', 'MEDIUM', '2026-10-05'),

(3, 1, 'Cài đặt ứng dụng học từ vựng Quizlet và Anki',
    'Tải app trên điện thoại, đăng ký tài khoản và tạo các bộ thẻ flashcard từ vựng theo chủ đề hằng ngày.',
    'DONE', 'LOW', '2026-10-06'),

(4, 1, 'Tham gia câu lạc bộ tiếng Anh cuối tuần',
    'Kết nối với câu lạc bộ giao tiếp tại trường để luyện phản xạ nói 2 buổi vào thứ Bảy và Chủ nhật.',
    'DONE', 'MEDIUM', '2026-10-07'),

-- Cột IN_PROGRESS (Đang làm)
(5, 1, 'Học 30 từ vựng chủ đề "Môi trường & Đời sống"',
    'Tra phiên âm chuẩn IPA, nghe phát âm mẫu và đặt ít nhất 2 câu ví dụ thực tế cho mỗi từ mới.',
    'IN_PROGRESS', 'HIGH', '2026-10-09'),

(6, 1, 'Ôn tập ngữ pháp thì Hiện tại hoàn thành',
    'Xem lại lý thuyết, phân biệt cách dùng "since/for" và hoàn thành 20 câu bài tập chia động từ.',
    'IN_PROGRESS', 'MEDIUM', '2026-10-10'),

(7, 1, 'Luyện nghe Podcast "6 Minute English" mỗi sáng',
    'Nghe chép chính tả 1 tập tin ngắn 6 phút của BBC, tra cứu từ mới trong transcript và nhại lại giọng đọc.',
    'IN_PROGRESS', 'HIGH', '2026-10-11'),

(8, 1, 'Viết đoạn văn ngắn 150 từ về sở thích cá nhân',
    'Áp dụng từ vựng đã học trong tuần, chú ý cách nối câu bằng liên từ (however, furthermore, therefore).',
    'IN_PROGRESS', 'MEDIUM', '2026-10-12'),

-- Cột TODO (Chưa làm)
(9, 1, 'Thi thử đề thi giữa kỳ môn tiếng Anh trên lớp',
    'Bấm giờ làm đề trong 60 phút nghiêm túc, tự chấm điểm và ghi chép lại các lỗi sai vào sổ tay.',
    'TODO', 'HIGH', '2026-10-14'),

(10, 1, 'Luyện phát âm bảng ký tự quốc tế IPA',
    'Luyện tập các cặp âm dễ nhầm lẫn như /iː/ và /ɪ/, /θ/ và /ð/ trước gương khoảng 15 phút mỗi ngày.',
    'TODO', 'MEDIUM', '2026-10-16'),

(11, 1, 'Xem 1 tập phim hoạt hình có phụ đề song ngữ',
    'Chọn tập phim hoạt hình trên Netflix để vừa giải trí vừa làm quen với ngữ điệu tự nhiên của người bản xứ.',
    'TODO', 'LOW', '2026-10-18'),

(12, 1, 'Đăng ký tham gia cuộc thi Hùng biện tiếng Anh',
    'Điền đơn đăng ký online và chuẩn bị bài phát biểu ngắn 1 phút giới thiệu bản thân trước ban tổ chức.',
    'TODO', 'LOW', '2026-10-20'),

-- -----------------------------------------
-- PHẦN 2: 12 Task cho user02 (Kế hoạch phát triển trang web Quản lý công việc)
-- -----------------------------------------

-- Cột DONE (Đã xong)
(13, 2, 'Lập dàn ý và thiết kế giao diện cơ bản',
    'Vẽ phác thảo bố cục các trang chính gồm: Đăng nhập, Bảng điều khiển, Danh sách công việc và Bảng kéo thả theo đề bài.',
    'DONE', 'HIGH', '2026-10-05'),

(14, 2, 'Làm chức năng đăng ký và đăng nhập an toàn',
    'Cho phép người dùng tạo tài khoản, bảo vệ mật khẩu an toàn và tự động ghi nhớ phiên làm việc để không phải đăng nhập lại nhiều lần.',
    'DONE', 'HIGH', '2026-10-06'),

(15, 2, 'Làm chức năng thêm, sửa, xóa công việc hằng ngày',
    'Tạo biểu mẫu nhập tên việc cần làm, ghi chú mô tả, ngày hết hạn và chọn mức độ ưu tiên từ thấp đến cao.',
    'DONE', 'HIGH', '2026-10-07'),

(16, 2, 'Thiết kế bảng Kanban kéo thả việc cần làm',
    'Chia công việc thành 3 cột (Chưa làm, Đang làm, Đã xong), cho phép dùng chuột kéo thả thẻ qua lại để đổi trạng thái nhanh chóng.',
    'DONE', 'MEDIUM', '2026-10-07'),

-- Cột IN_PROGRESS (Đang làm)
(17, 2, 'Thêm ô tìm kiếm và bộ lọc việc theo độ ưu tiên',
    'Giúp người dùng gõ từ khóa để tìm việc cần làm ngay lập tức, đồng thời lọc danh sách theo mức độ khẩn cấp và trạng thái.',
    'IN_PROGRESS', 'HIGH', '2026-10-09'),

(18, 2, 'Xây dựng trang Dashboard tổng kết tiến độ',
    'Hiển thị các thẻ đếm số lượng công việc đã làm xong, việc còn dang dở và danh sách nhắc nhở các việc sắp đến hạn trong tuần.',
    'IN_PROGRESS', 'HIGH', '2026-10-10'),

(19, 2, 'Kiểm tra bảo mật dữ liệu riêng tư cho người dùng',
    'Đảm bảo mỗi người chỉ nhìn thấy và sửa được việc của chính mình, người khác tuyệt đối không thể xem trộm hoặc can thiệp.',
    'IN_PROGRESS', 'HIGH', '2026-10-11'),

(20, 2, 'Đóng gói ứng dụng để khởi động nhanh bằng 1 câu lệnh',
    'Thiết lập cấu hình trọn gói để bất kỳ ai tải dự án về máy tính cũng có thể mở lên dùng thử ngay mà không cần cài đặt phức tạp.',
    'IN_PROGRESS', 'MEDIUM', '2026-10-12'),

-- Cột TODO (Chưa làm)
(21, 2, 'Viết bộ kiểm tra tự động để phòng ngừa lỗi phần mềm',
    'Tạo các bài kiểm tra tự động chạy thử toàn bộ chức năng đăng nhập và quản lý công việc để đảm bảo hệ thống luôn chạy mượt mà.',
    'TODO', 'HIGH', '2026-10-13'),

(22, 2, 'Hoàn thiện tài liệu hướng dẫn cài đặt và sử dụng',
    'Viết tài liệu hướng dẫn chi tiết từng bước, cung cấp sẵn tài khoản dùng thử và liệt kê đầy đủ các tính năng đã hoàn thành.',
    'TODO', 'MEDIUM', '2026-10-15'),

(23, 2, 'Tập dượt kịch bản thuyết trình và quay video demo',
    'Chuẩn bị bài nói 3-5 phút giới thiệu các điểm nổi bật của trang web, cách dùng bảng kéo thả và trả lời câu hỏi phỏng vấn.',
    'TODO', 'MEDIUM', '2026-10-17'),

(24, 2, 'Rà soát toàn diện lần cuối và nộp bài cho công ty',
    'Kiểm tra lại toàn bộ đường dẫn, mã nguồn và gửi hồ sơ hoàn thiện tới quý công ty TechVanguard trước thời hạn quy định.',
    'TODO', 'LOW', '2026-10-20');
