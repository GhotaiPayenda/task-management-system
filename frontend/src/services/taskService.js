import api from './api';

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );
}

const taskService = {
  async list(params = {}) {
    const { data } = await api.get('/tasks', { params: cleanParams(params) });
    return data;
  },

  async get(id) {
    const { data } = await api.get(`/tasks/${id}`);
    return data.task;
  },

  async create(payload) {
    const { data } = await api.post('/tasks', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/tasks/${id}`, payload);
    return data;
  },

  async updateStatus(id, status) {
    const { data } = await api.patch(`/tasks/${id}/status`, { status });
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },
};

export default taskService;
