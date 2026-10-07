package com.taskmanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO để đổi mật khẩu.
 *
 * Yêu cầu người dùng cung cấp mật khẩu cũ để xác minh danh tính
 * trước khi cho phép đặt mật khẩu mới — ngăn chặn tấn công chiếm
 * quyền khi token bị lộ nhưng kẻ tấn công không biết mật khẩu gốc.
 */
@Data
public class ChangePasswordRequest {

    @NotBlank(message = "Mật khẩu hiện tại không được để trống")
    private String currentPassword;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, max = 100, message = "Mật khẩu mới phải từ 6 đến 100 ký tự")
    private String newPassword;
}
