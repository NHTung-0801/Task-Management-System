export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
};

export const TASK_STATUS_LABEL = {
  [TASK_STATUS.TODO]: 'Cần làm',
  [TASK_STATUS.IN_PROGRESS]: 'Đang làm',
  [TASK_STATUS.DONE]: 'Hoàn thành',
};

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

export const PAGE_SIZE = 10;
