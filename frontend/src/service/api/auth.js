import { api } from './client';

export const authApi = {
    register: (data) => api.post('/api/auth/register', data),
    login: async (data) => {
        const res = await api.post('/api/auth/login', data);
        const token = res.data?.token;
        if (!token) throw new Error('Login failed: no token received');
        localStorage.setItem('jwt', token);
        return token;
    },
};

export default authApi;
