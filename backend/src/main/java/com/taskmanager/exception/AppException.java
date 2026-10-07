package com.taskmanager.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Class exception tùy chỉnh của ứng dụng.
 *
 * Thay vì throw các exception chung chung (RuntimeException, IllegalArgumentException),
 * mình dùng AppException để mang theo:
 * - `message` → thông báo lỗi rõ ràng bằng tiếng Việt/Anh
 * - `status`  → HTTP status code phù hợp (400, 401, 403, 404...)
 *
 * Ví dụ sử dụng trong Service:
 *   throw new AppException("Username đã tồn tại", HttpStatus.BAD_REQUEST);
 *   throw new AppException("Sai mật khẩu", HttpStatus.UNAUTHORIZED);
 */
@Getter
public class AppException extends RuntimeException {

    private final HttpStatus status;

    public AppException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
