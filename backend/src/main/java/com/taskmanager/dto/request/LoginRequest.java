package com.taskmanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Dữ liệu nhận từ client khi đăng nhập.
 * POST /api/auth/login
 *
 * Chỉ cần 2 trường: username và password.
 * Server sẽ:
 * 1. Tìm user theo username trong DB
 * 2. So sánh password gõ vào với passwordHash đã lưu (dùng BCrypt)
 * 3. Nếu khớp → tạo JWT token và trả về
 */
@Data
public class LoginRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
}
