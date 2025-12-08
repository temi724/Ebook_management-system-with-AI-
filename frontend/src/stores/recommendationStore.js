import { create } from 'zustand';

const useRecommendationStore = create((set) => ({
    recommendations: [],
    personalizedRecommendations: [],
    isLoading: false,
    error: null,
    lastQuery: '',

    setRecommendations: (recommendations, query = '') =>
        set({ recommendations, lastQuery: query }),

    setPersonalizedRecommendations: (recommendations) =>
        set({ personalizedRecommendations: recommendations }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    clearError: () => set({ error: null }),

    resetRecommendations: () => set({
        recommendations: [],
        personalizedRecommendations: [],
        error: null,
        lastQuery: ''
    }),
}));

export default useRecommendationStore;
