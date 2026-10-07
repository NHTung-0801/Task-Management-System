import axios from 'axios';

// ============================================
// Axios Instance — Cấu hình gọi API tập trung
// ============================================
// - baseURL đọc từ biến môi trường Vite (không hardcode)
// - Request interceptor: tự gắn JWT token vào header Authorization
// - Response interceptor: khi nhận 401 (token hết hạn) → xóa token và chuyển về /login

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor: Gắn token vào mỗi request ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor: Xử lý lỗi 401 (Unauthorized) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
