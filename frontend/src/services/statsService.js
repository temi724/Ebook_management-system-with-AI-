import api from './api';

export const statsService = {
    // Librarian/admin only — the API rejects other roles with 403.
    async getDashboardStats() {
        const response = await api.get('/stats/dashboard');
        return response.data;
    },
};

export default statsService;
