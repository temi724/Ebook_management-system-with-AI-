import axios from 'axios';
import useAuthStore from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
        const hadActiveSession = !!useAuthStore.getState().token;

        // Only force a logout + redirect when a previously-authenticated session
        // becomes unauthorized (e.g. an expired token). A 401 from the login or
        // register call just means bad credentials — let the page handle it and
        // show an error, instead of reloading and swallowing the message.
        if (error.response?.status === 401 && !isAuthEndpoint && hadActiveSession) {
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
