package com.taskmanager.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO để cập nhật thông tin hồ sơ người dùng.
 *
 * Người dùng chỉ được phép thay đổi full_name và email.
 * Username là định danh duy nhất — không cho phép thay đổi.
 */
@Data
public class UpdateProfileRequest {

    @Size(max = 100, message = "Họ và tên không được vượt quá 100 ký tự")
    private String fullName;

    @Email(message = "Địa chỉ email không hợp lệ")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    private String email;
}
