import api from './api';

const dashboardService = {
  getStats() {
    return api.get('/dashboard/stats');
  },

  getUpcoming() {
    return api.get('/dashboard/upcoming');
  },
};

export default dashboardService;
