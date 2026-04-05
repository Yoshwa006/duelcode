import { api } from './client';

export const usersApi = {
    getCurrent: () => api.get('/api/users/me'),
    getById: (id) => api.get(`/api/users/${id}`),
    update: (data) => api.put('/api/users/me', data),
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/api/users?${query}`);
    },
    search: (query, limit = 10) => 
        api.get(`/api/users/search?query=${encodeURIComponent(query)}&limit=${limit}`),
};

export default usersApi;
