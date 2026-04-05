import { api } from './client';

export const questionsApi = {
    getAll: () => api.get('/api/questions'),
    getById: (id) => api.get(`/api/questions/${id}`),
    create: (data) => api.post('/api/questions', data),
    getComments: (questionId, page = 0, size = 10) => 
        api.get(`/api/questions/${questionId}/comments?page=${page}&size=${size}`),
    createComment: (questionId, data) => 
        api.post(`/api/questions/${questionId}/comments`, data),
};

export default questionsApi;
