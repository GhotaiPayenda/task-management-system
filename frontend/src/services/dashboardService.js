import api from './api';

const dashboardService = {
  async getStats() {
    const { data } = await api.get('/dashboard/stats');
    return data;
  },

  async getRecentTasks(limit = 5) {
    const { data } = await api.get('/dashboard/recent-tasks', { params: { limit } });
    return data.tasks;
  },

  async getUpcomingTasks(limit = 5) {
    const { data } = await api.get('/dashboard/upcoming-tasks', { params: { limit } });
    return data.tasks;
  },
};

export default dashboardService;
