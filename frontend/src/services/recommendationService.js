import api from './api';

export const recommendationService = {
    async getRecommendationsByQuery(query, limit = 5) {
        const response = await api.post('/recommendations/query', {
            query,
            limit,
        });
        return response.data;
    },

    async getPersonalizedRecommendations(limit = 5) {
        const response = await api.get(`/recommendations/personalized?limit=${limit}`);
        return response.data;
    },

    async initializeVectorStore() {
        const response = await api.post('/recommendations/initialize-vector-store');
        return response.data;
    },
};

export default recommendationService;
