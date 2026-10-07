// ============================================
// Hằng số dùng chung cho toàn bộ ứng dụng
// ============================================

// --- Trạng thái Task (mapping 1:1 với enum backend) ---
export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
};

// Nhãn hiển thị tiếng Việt cho UI
export const TASK_STATUS_LABEL = {
  [TASK_STATUS.TODO]: 'Cần làm',
  [TASK_STATUS.IN_PROGRESS]: 'Đang làm',
  [TASK_STATUS.DONE]: 'Hoàn thành',
};

// --- Mức ưu tiên Task (mapping 1:1 với enum backend) ---
export const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
};

export const TASK_PRIORITY_LABEL = {
  [TASK_PRIORITY.LOW]: 'Thấp',
  [TASK_PRIORITY.MEDIUM]: 'Trung bình',
  [TASK_PRIORITY.HIGH]: 'Cao',
};

// --- Số task mỗi trang (phân trang) ---
export const PAGE_SIZE = 10;
