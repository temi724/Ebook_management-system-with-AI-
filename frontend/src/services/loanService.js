import api from './api';

export const loanService = {
    async createLoan(loanData) {
        const response = await api.post('/loans', loanData);
        return response.data;
    },

    async getMyLoans(status = null) {
        const params = status ? `?status=${status}` : '';
        const response = await api.get(`/loans/my-loans${params}`);
        return response.data;
    },

    async getAllLoans(params = {}) {
        const { page = 1, pageSize = 20, status } = params;
        const skip = (page - 1) * pageSize;

        const queryParams = new URLSearchParams({
            skip: skip.toString(),
            limit: pageSize.toString(),
        });

        if (status) queryParams.append('status', status);

        const response = await api.get(`/loans?${queryParams.toString()}`);
        return response.data;
    },

    async returnLoan(loanId) {
        const response = await api.post(`/loans/${loanId}/return`);
        return response.data;
    },

    async renewLoan(loanId) {
        const response = await api.post(`/loans/${loanId}/renew`);
        return response.data;
    },

    async checkOverdue() {
        const response = await api.post('/loans/check-overdue');
        return response.data;
    },
};

export default loanService;
