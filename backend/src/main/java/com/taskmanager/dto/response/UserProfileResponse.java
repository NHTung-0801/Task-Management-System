package com.taskmanager.dto.response;

import com.taskmanager.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO trả về thông tin hồ sơ người dùng.
 *
 * Lưu ý: password_hash KHÔNG được đưa vào response vì lý do bảo mật.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Factory method: chuyển đổi từ entity User sang DTO response.
     * Không bao giờ expose passwordHash.
     */
    public static UserProfileResponse fromEntity(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
