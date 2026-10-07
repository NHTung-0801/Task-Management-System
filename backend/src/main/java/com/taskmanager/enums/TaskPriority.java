package com.taskmanager.enums;

/**
 * Mức độ ưu tiên của một task.
 * Mapping 1:1 với cột `priority VARCHAR(20)` trong bảng tasks (V1__init_schema.sql).
 *
 * - LOW    → Ưu tiên thấp
 * - MEDIUM → Ưu tiên trung bình (mặc định)
 * - HIGH   → Ưu tiên cao
 */
public enum TaskPriority {
    LOW,
    MEDIUM,
    HIGH
}
