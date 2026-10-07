import api from './api';

// ============================================
// Task Service — Gọi API quản lý công việc (CRUD)
// ============================================

const taskService = {
  /**
   * Lấy danh sách task (có phân trang, tìm kiếm, lọc)
   * @param {Object} params - { page, size, keyword, status, priority }
   * @returns {Promise}
   */
  getTasks(params = {}) {
    return api.get('/tasks', { params });
  },

  /**
   * Lấy chi tiết 1 task theo ID
   * @param {number} id
   * @returns {Promise}
   */
  getTaskById(id) {
    return api.get(`/tasks/${id}`);
  },

  /**
   * Tạo task mới
   * @param {Object} data - { title, description, status, priority, dueDate }
   * @returns {Promise}
   */
  createTask(data) {
    return api.post('/tasks', data);
  },

  /**
   * Cập nhật task
   * @param {number} id
   * @param {Object} data - Các trường cần cập nhật
   * @returns {Promise}
   */
  updateTask(id, data) {
    return api.put(`/tasks/${id}`, data);
  },

  /**
   * Xóa task
   * @param {number} id
   * @returns {Promise}
   */
  deleteTask(id) {
    return api.delete(`/tasks/${id}`);
  },
};

export default taskService;
