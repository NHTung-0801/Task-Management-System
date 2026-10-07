package com.taskmanager.enums;

/**
 * Trạng thái của một task.
 * Mapping 1:1 với cột `status VARCHAR(20)` trong bảng tasks (V1__init_schema.sql).
 *
 * - TODO        → Công việc chưa bắt đầu
 * - IN_PROGRESS → Đang thực hiện
 * - DONE        → Đã hoàn thành
 */
public enum TaskStatus {
    TODO,
    IN_PROGRESS,
    DONE
}
