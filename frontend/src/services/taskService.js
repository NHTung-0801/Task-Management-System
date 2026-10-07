import api from './api';

const taskService = {
  getTasks(params = {}) {
    return api.get('/tasks', { params });
  },

  getTaskById(id) {
    return api.get(`/tasks/${id}`);
  },

  createTask(data) {
    return api.post('/tasks', data);
  },

  updateTask(id, data) {
    return api.put(`/tasks/${id}`, data);
  },

  deleteTask(id) {
    return api.delete(`/tasks/${id}`);
  },
};

export default taskService;
