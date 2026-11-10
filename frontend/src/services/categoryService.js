import api from './api';

const categoryService = {
  async list() {
    const { data } = await api.get('/categories');
    return data.categories;
  },

  async create(payload) {
    const { data } = await api.post('/categories', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/categories/${id}`, payload);
    return data;
  },

  async remove(id, options = {}) {
    const { data } = await api.delete(`/categories/${id}`, { data: options });
    return data;
  },
};

export default categoryService;
