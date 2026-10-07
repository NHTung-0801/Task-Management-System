import api from './api';

const userService = {
  getProfile() {
    return api.get('/users/me');
  },

  updateProfile(data) {
    return api.put('/users/me', data);
  },

  changePassword(data) {
    return api.put('/users/me/password', data);
  },
};

export default userService;
