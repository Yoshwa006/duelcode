import { api } from './client';

export const friendsApi = {
    getAll: () => api.get('/api/friends'),
    getRequests: () => api.get('/api/friends/requests'),
    getSent: () => api.get('/api/friends/requests/sent'),
    sendRequest: (receiverId) => api.post('/api/friends/requests', { receiverId }),
    accept: (requestId) => api.post(`/api/friends/requests/${requestId}/accept`),
    reject: (requestId) => api.post(`/api/friends/requests/${requestId}/reject`),
    remove: (friendId) => api.delete(`/api/friends/${friendId}`),
};

export default friendsApi;
