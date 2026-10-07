import api from './api';

const authService = {
  register(data) {
    return api.post('/auth/register', data);
  },

  login(data) {
    return api.post('/auth/login', data);
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

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

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};

export default authService;
