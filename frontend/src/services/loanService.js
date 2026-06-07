import api from './api';

export const loanService = {
    // ── User actions ──────────────────────────────────────────────────────────

    async requestBorrow(bookId, notes = '') {
        const response = await api.post('/loans/', { book_id: bookId, notes });
        return response.data;
    },

    async getMyLoans(status = null) {
        const params = status ? `?status=${status}` : '';
        const response = await api.get(`/loans/my-loans${params}`);
        return response.data;
    },

    async requestReturn(loanId) {
        const response = await api.post(`/loans/${loanId}/request-return`);
        return response.data;
    },

    async renewLoan(loanId) {
        const response = await api.post(`/loans/${loanId}/renew`);
        return response.data;
    },

    // ── Admin / Librarian actions ─────────────────────────────────────────────

    async getPendingLoans() {
        const response = await api.get('/loans/pending');
        return response.data;
    },

    async getReturnRequests() {
        const response = await api.get('/loans/return-requests');
        return response.data;
    },

    async getAllLoans(params = {}) {
        const { page = 1, pageSize = 20, status } = params;
        const skip = (page - 1) * pageSize;
        const queryParams = new URLSearchParams({ skip: String(skip), limit: String(pageSize) });
        if (status) queryParams.append('status', status);
        const response = await api.get(`/loans?${queryParams}`);
        return response.data;
    },

    async approveLoan(loanId) {
        const response = await api.post(`/loans/${loanId}/approve`);
        return response.data;
    },

    async rejectLoan(loanId) {
        const response = await api.post(`/loans/${loanId}/reject`);
        return response.data;
    },

    async confirmReturn(loanId) {
        const response = await api.post(`/loans/${loanId}/confirm-return`);
        return response.data;
    },

    async checkOverdue() {
        const response = await api.post('/loans/check-overdue');
        return response.data;
    },

    // Legacy aliases
    async createLoan(loanData) {
        const response = await api.post('/loans/', loanData);
        return response.data;
    },

    async returnLoan(loanId) {
        const response = await api.post(`/loans/${loanId}/return`);
        return response.data;
    },
};

export default loanService;
