import api from './api';

const inventoryService = {
  getAll: async () => {
    const response = await api.get('/inventory/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  create: async (itemData) => {
    const response = await api.post('/inventory/', itemData);
    return response.data;
  },

  update: async (id, itemData) => {
    const response = await api.put(`/inventory/${id}`, itemData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },

  getLowStock: async () => {
    const response = await api.get('/inventory/low-stock/');
    return response.data;
  }
};

export default inventoryService;
