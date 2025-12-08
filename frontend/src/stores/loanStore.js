import { create } from 'zustand';

const useLoanStore = create((set, get) => ({
    loans: [],
    myLoans: [],
    currentLoan: null,
    total: 0,
    page: 1,
    pageSize: 20,
    isLoading: false,
    error: null,
    statusFilter: null,

    setLoans: (loans) => set({ loans }),

    setMyLoans: (loans) => set({ myLoans: loans }),

    setCurrentLoan: (loan) => set({ currentLoan: loan }),

    addLoan: (loan) => {
        const myLoans = get().myLoans;
        set({ myLoans: [loan, ...myLoans] });
    },

    updateLoan: (loanId, updatedData) => {
        const loans = get().loans;
        const myLoans = get().myLoans;

        const updatedLoans = loans.map(loan =>
            loan.id === loanId ? { ...loan, ...updatedData } : loan
        );

        const updatedMyLoans = myLoans.map(loan =>
            loan.id === loanId ? { ...loan, ...updatedData } : loan
        );

        set({ loans: updatedLoans, myLoans: updatedMyLoans });

        // Update current loan if it's the one being updated
        const currentLoan = get().currentLoan;
        if (currentLoan?.id === loanId) {
            set({ currentLoan: { ...currentLoan, ...updatedData } });
        }
    },

    removeLoan: (loanId) => {
        const loans = get().loans;
        const myLoans = get().myLoans;
        set({
            loans: loans.filter(loan => loan.id !== loanId),
            myLoans: myLoans.filter(loan => loan.id !== loanId)
        });
    },

    setTotal: (total) => set({ total }),

    setPage: (page) => set({ page }),

    setPageSize: (pageSize) => set({ pageSize }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    clearError: () => set({ error: null }),

    setStatusFilter: (status) => set({ statusFilter: status, page: 1 }),

    clearFilters: () => set({ statusFilter: null, page: 1 }),

    resetLoans: () => set({
        loans: [],
        myLoans: [],
        currentLoan: null,
        total: 0,
        page: 1,
        error: null
    }),
}));

export default useLoanStore;
