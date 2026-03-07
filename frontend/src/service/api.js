// getData.js
import axios from 'axios';

// Add interceptor to automatically attach JWT to requests
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("jwt");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

export default async function get() {
    try {
        const response = await axios.get("http://localhost:8080/api/questions");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch:", error.message);
        throw error;
    }
}


export async function getSingle({ id }) {
    try {
        const res = await axios.get(`http://localhost:8080/api/questions/${id}`);
        console.log(res.data);
        return res.data;
    } catch (error) {
        console.error("Failed to fetch:", error.message);
        throw error;
    }
}

export async function generateKey({ questionId }) {
    const body = {
        questionId
    };

    try {
        // Backend expects generating key only, it knows who we are via JWT
        const res = await axios.post(`http://localhost:8080/api/generate`, body);
        return res.data;
    } catch (error) {
        console.error('Failed to generate token:', error);
        throw error;
    }
}

export async function enterToken({ token }) {
    console.log("Submitting token:", token);

    try {
        // Updated backend URL for joining a match by key
        const response = await axios.get(`http://localhost:8080/api/join-key?key=${token}`);
        const res = response.data;

        if (res != null) {
            localStorage.setItem("q", res);
        }
        localStorage.setItem("key", token);
        return res;
    } catch (error) {
        console.error("Failed to enter token:", error);
        throw error;
    }
}

export async function validateUser({ token }) {
    // Left empty for now, use JWT token validation directly in requests instead
    return true;
}

export async function getComments(questionId, page = 0, size = 10) {
    try {
        const res = await axios.get(`http://localhost:8080/api/questions/${questionId}/comments?page=${page}&size=${size}`);
        return res.data;
    } catch (error) {
        console.error("Failed to fetch comments", error);
        throw error;
    }
}

export async function createComment(questionId, { content, parentId }) {
    try {
        const res = await axios.post(`http://localhost:8080/api/questions/${questionId}/comments`, {
            content,
            parentId
        });
        return res.data;
    } catch (error) {
        console.error("Failed to create comment", error);
        throw error;
    }
}


export async function register({ email, password }) {
    try {
        const res = await axios.post("http://localhost:8080/api/auth/register", { email, password });
        return res.data;
    } catch (error) {
        console.error("Failed to register:", error.response?.data || error.message);
        throw error;
    }
}

export async function login({ email, password }) {
    try {
        const res = await axios.post("http://localhost:8080/api/auth/login", { email, password });
        const token = res.data?.token;

        if (!token) {
            throw new Error("Login failed: no token received from server");
        }

        localStorage.setItem("jwt", token);
        return token;
    } catch (error) {
        console.error("Failed to login:", error.response?.data || error.message);
        throw error;
    }
}

export async function getSessionByToken(token) {
    try {
        const res = await axios.get(`http://localhost:8080/api/match/${token}`);
        return res.data;
    } catch (error) {
        console.error("Failed to fetch session info", error);
        throw error;
    }
}

export const submitCode = async ({ language_id, source_code, stdin, expected_output }) => {
    const res = await axios.post(`http://localhost:8080/api/submit`, {
        language_id,
        source_code,
        stdin,
        expected_output
        // We do not send jwtToken manually because it's in the Axios interceptor
    });
    return res.data;
};

