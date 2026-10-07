package com.taskmanager.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Bắt và xử lý mọi exception trong toàn bộ ứng dụng tại 1 nơi.
 *
 * @RestControllerAdvice = @ControllerAdvice + @ResponseBody
 * → Mọi Controller khi throw exception sẽ được class này bắt và format response.
 *
 * Có 2 loại lỗi cần xử lý:
 * 1. AppException       → Lỗi nghiệp vụ (username trùng, sai mật khẩu...)
 * 2. Validation errors  → Dữ liệu input không hợp lệ (@NotBlank, @Email bị vi phạm)
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Xử lý lỗi nghiệp vụ (AppException).
     * Trả về đúng HTTP status và message đã định nghĩa trong Service.
     */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<Map<String, Object>> handleAppException(AppException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", ex.getStatus().value());
        body.put("error", ex.getStatus().getReasonPhrase());
        body.put("message", ex.getMessage());

        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    /**
     * Xử lý lỗi validation (@Valid trong Controller bị vi phạm).
     * Trả về danh sách lỗi theo từng field.
     *
     * Ví dụ response:
     * {
     *   "status": 400,
     *   "errors": {
     *     "email": "Email không đúng định dạng",
     *     "username": "Tên đăng nhập phải từ 3 đến 50 ký tự"
     *   }
     * }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");
        body.put("errors", fieldErrors);

        return ResponseEntity.badRequest().body(body);
    }
}
