import api from './api';

const dashboardService = {
  getStats() {
    return api.get('/dashboard/stats');
  },

  getUpcomingTasks(limit = 5) {
    return api.get('/dashboard/upcoming', { params: { limit } });
  },
};

export default dashboardService;
