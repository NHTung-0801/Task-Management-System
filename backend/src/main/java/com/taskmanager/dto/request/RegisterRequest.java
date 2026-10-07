package com.taskmanager.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Dữ liệu nhận từ client khi đăng ký tài khoản.
 * POST /api/auth/register
 *
 * @NotBlank → Không được null và không được chỉ chứa khoảng trắng
 * @Size     → Giới hạn độ dài chuỗi (min/max)
 * @Email    → Phải đúng định dạng email (có @ và domain)
 *
 * Các annotation @Valid trong Controller sẽ kích hoạt validation này.
 * Nếu vi phạm → Spring tự động trả lỗi 400 Bad Request.
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
    private String username;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 100, message = "Mật khẩu phải từ 6 ký tự trở lên")
    private String password;

    // Không bắt buộc — người dùng có thể bỏ qua
    private String fullName;
}
