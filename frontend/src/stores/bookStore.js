import { create } from 'zustand';

const useBookStore = create((set, get) => ({
    books: [],
    currentBook: null,
    total: 0,
    page: 1,
    pageSize: 20,
    isLoading: false,
    error: null,
    searchQuery: '',
    filters: {
        category: '',
        author: '',
    },

    setBooks: (books) => set({ books }),

    setCurrentBook: (book) => set({ currentBook: book }),

    addBook: (book) => {
        const books = get().books;
        set({ books: [book, ...books] });
    },

    updateBook: (bookId, updatedData) => {
        const books = get().books;
        const updatedBooks = books.map(book =>
            book.id === bookId ? { ...book, ...updatedData } : book
        );
        set({ books: updatedBooks });

        // Update current book if it's the one being updated
        const currentBook = get().currentBook;
        if (currentBook?.id === bookId) {
            set({ currentBook: { ...currentBook, ...updatedData } });
        }
    },

    removeBook: (bookId) => {
        const books = get().books;
        set({ books: books.filter(book => book.id !== bookId) });
    },

    setTotal: (total) => set({ total }),

    setPage: (page) => set({ page }),

    setPageSize: (pageSize) => set({ pageSize }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    clearError: () => set({ error: null }),

    setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),

    setFilters: (filters) => set({ filters, page: 1 }),

    clearFilters: () => set({
        filters: { category: '', author: '' },
        searchQuery: '',
        page: 1
    }),

    resetBooks: () => set({
        books: [],
        currentBook: null,
        total: 0,
        page: 1,
        error: null
    }),
}));

export default useBookStore;
