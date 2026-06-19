import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Parts
export const getParts = (params = {}) => api.get('/parts', { params });
export const getPart = (id) => api.get(`/parts/${id}`);
export const createPart = (data) => api.post('/parts', data);
export const updatePart = (id, data) => api.put(`/parts/${id}`, data);
export const deletePart = (id) => api.delete(`/parts/${id}`);
export const getPartHistory = (id) => api.get(`/parts/${id}/price-history`);

// Configurations
export const getConfigurations = (params = {}) => api.get('/configurations', { params });
export const getConfiguration = (id) => api.get(`/configurations/${id}`);
export const createConfiguration = (data) => api.post('/configurations', data);
export const updateConfiguration = (id, data) => api.put(`/configurations/${id}`, data);
export const deleteConfiguration = (id) => api.delete(`/configurations/${id}`);
export const recalculateConfiguration = (id) => api.post(`/configurations/${id}/recalculate`);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');

export default api;
