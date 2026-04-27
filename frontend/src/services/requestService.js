import api from './api';

const requestService = {
  // Create a new request (SDP)
  create: async (requestData) => {
    const response = await api.post('/requests/', requestData);
    return response.data;
  },

  // Get user's own requests (SDP)
  getMyRequests: async () => {
    const response = await api.get('/requests/');
    return response.data;
  },

  // Get all requests (Admin)
  getAllRequests: async (statusFilter = '') => {
    const url = statusFilter ? `/requests/all/?status_filter=${statusFilter}` : '/requests/all/';
    const response = await api.get(url);
    return response.data;
  },

  // Get specific request details
  getById: async (id) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  // Approve a request (Admin)
  approve: async (id) => {
    const response = await api.post(`/requests/approve/${id}`);
    return response.data;
  },

  // Reject a request (Admin)
  reject: async (id) => {
    const response = await api.post(`/requests/reject/${id}`);
    return response.data;
  }
};

export default requestService;
