package com.taskmanager.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dữ liệu trả về cho client sau khi đăng ký hoặc đăng nhập thành công.
 *
 * Client (React) nhận response này, lưu `token` vào localStorage,
 * sau đó gắn vào mọi request qua header: Authorization: Bearer <token>
 *
 * Trường `tokenType` luôn là "Bearer" — đây là chuẩn JWT phổ biến nhất.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    // JWT token — client phải giữ và gửi kèm trong mọi request tiếp theo
    private String token;

    // Loại token — luôn là "Bearer" theo chuẩn OAuth2/JWT
    private String tokenType;

    // Thông tin cơ bản của user đã đăng nhập (để hiển thị trên UI)
    private Long userId;
    private String username;
    private String email;
    private String fullName;
}
