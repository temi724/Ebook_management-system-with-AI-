import api from './api';

export const authService = {
    async register(userData) {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    async login(credentials) {
        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },

    async getCurrentUser() {
        const response = await api.get('/users/me');
        return response.data;
    },

    async updateProfile(userData) {
        const response = await api.put('/users/me', userData);
        return response.data;
    },
};

export default authService;
