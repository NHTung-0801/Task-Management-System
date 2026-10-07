import api from './api';

// ============================================
// Dashboard Service — Gọi API thống kê tổng quan
// ============================================

const dashboardService = {
  /**
   * Lấy thống kê tổng quan (đếm task theo trạng thái)
   * @returns {Promise} { totalTasks, todoCount, inProgressCount, doneCount }
   */
  getStats() {
    return api.get('/dashboard/stats');
  },

  /**
   * Lấy danh sách task sắp hết hạn
   * @returns {Promise} Mảng các task có due_date gần nhất
   */
  getUpcoming() {
    return api.get('/dashboard/upcoming');
  },
};

export default dashboardService;
