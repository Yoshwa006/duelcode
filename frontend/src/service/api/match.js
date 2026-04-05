import { api } from './client';

export const matchApi = {
    generateKey: (questionId) => api.post('/api/generate', { questionId }),
    enterToken: async (token) => {
        const res = await api.post('/api/join-key', { key: token });
        if (res.data.status === 'SUCCESS' || res.data.errorCode === 0) {
            sessionStorage.setItem('sessionToken', token);
            return res.data;
        }
        throw new Error(res.data.message || 'Failed to join session');
    },
    getByToken: (token) => api.get(`/api/match/${token}`),
    submit: (data) => api.post('/api/submit', data),
    surrender: (token) => api.post(`/api/surrender?token=${token}`),
    cancel: (token) => api.post(`/api/cancel?token=${token}`),
    joinRandom: () => api.get('/api/join-random'),
    search: (request) => api.post('/api/search', request),
    getMyActive: () => api.get('/api/my-session'),
};

export default matchApi;
