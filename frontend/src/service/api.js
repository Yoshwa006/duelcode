import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('jwt');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export async function getQuestions() {
    try {
        const response = await api.get('/api/questions');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch questions:', error.message);
        throw error;
    }
}

export const createQuestion = async (questionData) => {
    try {
        const res = await api.post('/api/questions', questionData);
        return res.data;
    } catch (error) {
        console.error('Failed to create question:', error.message);
        throw error;
    }
};

export async function getSingleQuestion(id) {
    try {
        const res = await api.get(`/api/questions/${id}`);
        return res.data;
    } catch (error) {
        console.error('Failed to fetch question:', error.message);
        throw error;
    }
}

export async function generateKey(questionId) {
    try {
        const res = await api.post('/api/generate', { questionId });
        return res.data;
    } catch (error) {
        console.error('Failed to generate token:', error);
        throw error;
    }
}

export async function enterToken(token) {
    try {
        const response = await api.post('/api/join-key', { key: token });
        const res = response.data;

        if (res.status === 'SUCCESS' || res.errorCode === 0) {
            sessionStorage.setItem('sessionToken', token);
            return res;
        } else {
            throw new Error(res.message || 'Failed to join session');
        }
    } catch (error) {
        console.error('Failed to enter token:', error);
        throw error;
    }
}

export async function getSessionByToken(token) {
    try {
        const res = await api.get(`/api/match/${token}`);
        return res.data;
    } catch (error) {
        console.error('Failed to fetch session info', error);
        throw error;
    }
}

export const submitCode = async ({ language_id, source_code }) => {
    const res = await api.post('/api/submit', {
        language_id,
        source_code,
    });
    return res.data;
};

export async function getComments(questionId, page = 0, size = 10) {
    try {
        const res = await api.get(`/api/questions/${questionId}/comments?page=${page}&size=${size}`);
        return res.data;
    } catch (error) {
        console.error('Failed to fetch comments', error);
        throw error;
    }
}

export async function createComment(questionId, { content, parentId }) {
    try {
        const res = await api.post(`/api/questions/${questionId}/comments`, {
            content,
            parentId,
        });
        return res.data;
    } catch (error) {
        console.error('Failed to create comment', error);
        throw error;
    }
}

export async function register({ email, password }) {
    try {
        const res = await api.post('/api/auth/register', { email, password });
        return res.data;
    } catch (error) {
        console.error('Failed to register:', error.message);
        throw error;
    }
}

export async function login({ email, password }) {
    try {
        const res = await api.post('/api/auth/login', { email, password });
        const token = res.data?.token;

        if (!token) {
            throw new Error('Login failed: no token received from server');
        }

        localStorage.setItem('jwt', token);
        return token;
    } catch (error) {
        console.error('Failed to login:', error.message);
        throw error;
    }
}

export async function getLeaderboard() {
    try {
        const res = await api.get('/api/leaderboard');
        return res.data;
    } catch (error) {
        console.error('Failed to fetch leaderboard', error);
        throw error;
    }
}

export async function getMyActiveSession() {
    try {
        const res = await api.get('/api/my-session');
        return res.data;
    } catch (error) {
        console.error('Failed to fetch active session', error);
        return null;
    }
}

export async function surrender(token) {
    try {
        const res = await api.post(`/api/surrender?token=${token}`);
        return res.data;
    } catch (error) {
        console.error('Failed to surrender', error);
        throw error;
    }
}

export async function joinRandom() {
    try {
        const res = await api.get('/api/join-random');
        return res.data;
    } catch (error) {
        console.error('Failed to join random match', error);
        throw error;
    }
}

export async function searchSessions(request) {
    try {
        const res = await api.post('/api/search', request);
        return res.data;
    } catch (error) {
        console.error('Failed to search sessions', error);
        throw error;
    }
}

export default api;
