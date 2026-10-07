package com.taskmanager.controller;

import com.taskmanager.dto.request.LoginRequest;
import com.taskmanager.dto.request.RegisterRequest;
import com.taskmanager.dto.response.AuthResponse;
import com.taskmanager.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý các request liên quan đến xác thực (Authentication).
 *
 * @RestController  → Kết hợp @Controller + @ResponseBody: tự động serialize kết quả sang JSON
 * @RequestMapping  → Tất cả endpoint trong class này có prefix "/api/auth"
 * @Tag             → Nhóm API này trong Swagger UI dưới nhãn "Authentication"
 *
 * Controller chỉ làm 3 việc:
 * 1. Nhận request
 * 2. Gọi Service xử lý
 * 3. Trả response
 * Không chứa logic nghiệp vụ (logic nằm ở Service).
 *
 * @Valid → Kích hoạt Bean Validation trên DTO (các annotation @NotBlank, @Email...)
 *          Nếu vi phạm → GlobalExceptionHandler tự xử lý, trả lỗi 400.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "API đăng ký và đăng nhập")
public class AuthController {

    private final AuthService authService;

    /**
     * Đăng ký tài khoản mới.
     * POST /api/auth/register
     * Body: { "username": "...", "email": "...", "password": "...", "fullName": "..." }
     * Response 201 Created + AuthResponse chứa JWT token
     */
    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản", description = "Tạo tài khoản mới và nhận JWT token")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Đăng nhập.
     * POST /api/auth/login
     * Body: { "username": "...", "password": "..." }
     * Response 200 OK + AuthResponse chứa JWT token
     */
    @PostMapping("/login")
    @Operation(summary = "Đăng nhập", description = "Xác thực tài khoản và nhận JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
