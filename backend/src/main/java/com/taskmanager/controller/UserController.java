package com.taskmanager.controller;

import com.taskmanager.dto.request.ChangePasswordRequest;
import com.taskmanager.dto.request.UpdateProfileRequest;
import com.taskmanager.dto.response.UserProfileResponse;
import com.taskmanager.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý các API liên quan đến hồ sơ người dùng (yêu cầu JWT).
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "API quản lý hồ sơ người dùng")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin hồ sơ cá nhân của user hiện tại")
    public ResponseEntity<UserProfileResponse> getProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @PutMapping("/me")
    @Operation(summary = "Cập nhật thông tin hồ sơ (fullName, email)")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Đổi mật khẩu (yêu cầu xác nhận mật khẩu cũ)")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.noContent().build();
    }
}
