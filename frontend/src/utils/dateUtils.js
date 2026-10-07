// ============================================
// Hàm tiện ích xử lý ngày tháng
// ============================================

/**
 * Định dạng ngày theo kiểu dd/MM/yyyy (phổ biến ở Việt Nam)
 * @param {string} dateString - Chuỗi ngày (ISO format hoặc yyyy-MM-dd)
 * @returns {string} Chuỗi đã định dạng, ví dụ: "07/10/2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Tính số ngày còn lại đến deadline
 * @param {string} dateString - Ngày deadline (yyyy-MM-dd)
 * @returns {number} Số ngày còn lại (âm = đã quá hạn)
 */
export function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  const diffMs = target - today;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
