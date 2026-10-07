package com.taskmanager.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity mapping với bảng `users` trong database.
 *
 * Giải thích các annotation:
 * - @Entity       → Đánh dấu class này là một đối tượng được Hibernate quản lý
 * - @Table        → Khai báo tên bảng trong DB (mặc định sẽ lấy tên class nếu không khai báo)
 * - @Id           → Đây là khóa chính (Primary Key)
 * - @GeneratedValue(IDENTITY) → DB tự tăng ID (AUTO_INCREMENT trong MySQL)
 * - @Column       → Cấu hình chi tiết cho cột: tên, nullable, unique, độ dài tối đa
 * - @CreationTimestamp → Hibernate tự set giá trị khi INSERT (không cần code thủ công)
 * - @UpdateTimestamp   → Hibernate tự set giá trị mỗi khi UPDATE
 * - @OneToMany    → 1 user có nhiều task; cascade + orphanRemoval để xóa task khi xóa user
 * - @JsonIgnore   → Không trả về danh sách tasks khi serialize User sang JSON (tránh vòng lặp)
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên đăng nhập: bắt buộc, không trùng, tối đa 50 ký tự
    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    // Email: bắt buộc, không trùng, tối đa 100 ký tự
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    // Mật khẩu đã băm bằng BCrypt — KHÔNG BAO GIỜ lưu mật khẩu gốc
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    // Tên hiển thị (không bắt buộc)
    @Column(name = "full_name", length = 100)
    private String fullName;

    // Thời điểm tạo tài khoản — Hibernate tự điền, không cần set thủ công
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Thời điểm cập nhật lần cuối — tự cập nhật mỗi khi save
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Quan hệ 1-nhiều: 1 user có nhiều task
    // cascade = ALL: mọi thao tác trên User (save, delete) đều lan sang Task
    // orphanRemoval = true: Task không có User sẽ bị xóa khỏi DB
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Task> tasks;
}
