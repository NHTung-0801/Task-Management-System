package com.taskmanager.entity;

import com.taskmanager.enums.TaskPriority;
import com.taskmanager.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity mapping với bảng `tasks` trong database.
 *
 * Điểm đặc biệt so với User:
 * - @ManyToOne    → Nhiều task thuộc về 1 user (quan hệ ngược của @OneToMany bên User)
 * - @JoinColumn   → Chỉ định cột khóa ngoại trong bảng tasks là `user_id`
 * - @Enumerated(STRING) → Lưu enum dưới dạng chuỗi ("TODO", "HIGH") thay vì số (0, 1, 2)
 *                          → Quan trọng: nếu dùng ORDINAL, thêm/xóa enum sẽ sai thứ tự!
 */
@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quan hệ nhiều-1: nhiều task thuộc 1 user
    // LAZY → chỉ tải User từ DB khi thực sự cần dùng (tối ưu hiệu năng)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Tiêu đề task: bắt buộc, tối đa 200 ký tự
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    // Mô tả chi tiết: không bắt buộc, lưu dạng TEXT (không giới hạn độ dài)
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Trạng thái: lưu dạng String ("TODO", "IN_PROGRESS", "DONE") khớp với DB
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    // Mức ưu tiên: lưu dạng String ("LOW", "MEDIUM", "HIGH") khớp với DB
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    // Ngày hết hạn: dùng LocalDate vì chỉ cần ngày, không cần giờ/phút/giây
    @Column(name = "due_date")
    private LocalDate dueDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
