import api from './api';

// ============================================
// Auth Service — Gọi API đăng ký / đăng nhập
// ============================================

const authService = {
  /**
   * Đăng ký tài khoản mới
   * @param {Object} data - { username, email, password, fullName }
   * @returns {Promise} response từ server
   */
  register(data) {
    return api.post('/auth/register', data);
  },

  /**
   * Đăng nhập — nhận JWT token từ server
   * @param {Object} data - { username, password }
   * @returns {Promise} response chứa token
   */
  login(data) {
    return api.post('/auth/login', data);
  },

  /**
   * Đăng xuất — xóa token khỏi localStorage (xử lý phía client)
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Lưu token và thông tin người dùng vào localStorage
   * @param {Object} data - response từ server chứa token và user info
   */
  saveAuthData(data) {
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    const user = {
      userId: data.userId,
      username: data.username,
      email: data.email,
      fullName: data.fullName,
    };
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Lấy thông tin user hiện tại từ localStorage
   * @returns {Object|null}
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  /**
   * Lấy token đã lưu
   * @returns {string|null} JWT token
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Kiểm tra người dùng đã đăng nhập chưa
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};

export default authService;
