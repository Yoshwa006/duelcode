// getData.js
import axios from 'axios';

export default async function get() {
    try {
        const response = await axios.get("http://localhost:8080/api");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch:", error.message);
        throw error;
    }
}


export async function getSingle({id}) {
    try {
        const res = await axios.get(`http://localhost:8080/api/${id}`);
        console.log(res.data);
        return res.data;
    } catch (error) {
        console.error("Failed to fetch:", error.message);
        throw error;
    }
}

    export async function generateKey({ questionId }) {
        const jwt = localStorage.getItem("token");
        const body = {
            questionId,
            jwt
        };

        try {
            const res = await axios.post(`http://localhost:8080/api/generate`, body);
            return res.data;
        } catch (error) {
            console.error('Failed to generate token:', error);
            throw error;
        }
}
export async function enterToken({ token }) {
    console.log("Submitting token:", token);
    const jwt = localStorage.getItem("token");

    const body = {
        jwt,
        token
    };

    try {
        const response = await axios.post(`http://localhost:8080/api/enter`, body);
        const res = response.data;

        if (res !== -1) {
            localStorage.setItem("q", res);
        }
        localStorage.setItem("key", token);
        return res;
    } catch (error) {
        console.error("Failed to enter token:", error);
        throw error;
    }
}

export async function validateUser({token}){
    const body ={
        token
    }

    try{
        const response = await axios.post(`https://localhost:8080/api/auth/validate`, body);
        const res = response.data;

        if(res == false) {
            return false;
        }

        return true;
    }
        catch(error){
            console.log("Some error has happend in validating the user !", token)
            throw error;
        }
    }


export async function register({ email, password }) {
    try {
        const res = await axios.post("http://localhost:8080/auth/register", { email, password });
        return res.data;
    } catch (error) {
        console.error("Failed to register:", error.response?.data || error.message);
        throw error;
    }
}

export async function login({ email, password }) {
    try {
        const res = await axios.post("http://localhost:8080/auth/login", { email, password });
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

export const submitCode = async ({ language_id, source_code, stdin, expected_output, jwtToken, token }) => {
    const res = await axios.post(`http://localhost:8080/api/submit`, {
        language_id,
        source_code,
        stdin,
        expected_output,
        jwtToken,
        token
    });
    return res.data;
};


export function polling() {
    return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
            console.log("polling...");
            const ctoken = localStorage.getItem("ctoken");
            console.log(ctoken);
            try {
                const res = await axios.get(
                    `http://localhost:8080/api/poll/${ctoken}`,
                );

                if (res.data === true) {
                    clearInterval(interval);
                    resolve();
                }
            } catch (error) {
                console.error("Polling failed:", error);
                clearInterval(interval);
                reject(error);
            }
        }, 1000);
    });
}

