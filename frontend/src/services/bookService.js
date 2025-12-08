import api from './api';

export const bookService = {
    async getBooks(params = {}) {
        const { page = 1, pageSize = 20, query, category, author } = params;
        const skip = (page - 1) * pageSize;

        const queryParams = new URLSearchParams({
            skip: skip.toString(),
            limit: pageSize.toString(),
        });

        if (query) queryParams.append('query', query);
        if (category) queryParams.append('category', category);
        if (author) queryParams.append('author', author);

        const response = await api.get(`/books?${queryParams.toString()}`);
        return response.data;
    },

    async getBook(bookId) {
        const response = await api.get(`/books/${bookId}`);
        return response.data;
    },

    async createBook(bookData) {
        const response = await api.post('/books', bookData);
        return response.data;
    },

    async updateBook(bookId, bookData) {
        const response = await api.put(`/books/${bookId}`, bookData);
        return response.data;
    },

    async deleteBook(bookId) {
        await api.delete(`/books/${bookId}`);
    },

    async uploadCover(bookId, file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(`/books/${bookId}/upload-cover`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async uploadPdf(bookId, file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(`/books/${bookId}/upload-pdf`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

export default bookService;
