import api, { ADMIN_KEY, TOKEN_KEY } from './api';

function persistSession(data) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin));
  return data;
}

const authService = {
  async login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    return persistSession(data);
  },

  async register(details) {
    const { data } = await api.post('/auth/register', details);
    return persistSession(data);
  },

  async me() {
    const { data } = await api.get('/auth/me');
    localStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin));
    return data.admin;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  },

  getStoredAdmin() {
    try {
      const raw = localStorage.getItem(ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
};

export default authService;
