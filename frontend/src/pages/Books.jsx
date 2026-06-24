import { useEffect, useState } from 'react';
import { Search, Filter, BookOpen, Plus, BookPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import AddBookModal from '../components/common/AddBookModal';
import BookCover from '../components/common/BookCover';
import useBookStore from '../stores/bookStore';
import useAuthStore from '../stores/authStore';
import bookService from '../services/bookService';
import loanService from '../services/loanService';

const Books = () => {
    const { user } = useAuthStore();
    const {
        books,
        setBooks,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        page,
        setPage,
        total,
        setTotal,
        isLoading,
        setLoading,
    } = useBookStore();

    const [localSearch, setLocalSearch] = useState(searchQuery);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [borrowingId, setBorrowingId] = useState(null);

    useEffect(() => {
        fetchBooks();
    }, [page, searchQuery, filters]);

    // Live search: auto-search once the user types 3+ characters (debounced),
    // and reset to the full list when the box is cleared. No button press needed.
    useEffect(() => {
        const q = localSearch.trim();
        const timer = setTimeout(() => {
            if (q.length >= 3) {
                setSearchQuery(q);
                setPage(1);
            } else if (q.length === 0) {
                setSearchQuery('');
                setPage(1);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [localSearch, setSearchQuery, setPage]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const data = await bookService.getBooks({
                page,
                pageSize: 20,
                query: searchQuery,
                ...filters,
            });
            setBooks(data.books);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchQuery(localSearch.trim());
        setPage(1);
    };

    const handleBorrow = async (bookId) => {
        setBorrowingId(bookId);
        try {
            await loanService.requestBorrow(bookId);
            toast.success('Borrow request submitted! Wait for admin approval.', {
                position: 'top-right',
                autoClose: 4000,
            });
        } catch (error) {
            const msg = error.response?.data?.detail || 'Failed to submit borrow request.';
            toast.error(msg, { position: 'top-right', autoClose: 5000 });
        } finally {
            setBorrowingId(null);
        }
    };

    const handleAddBook = async (bookData) => {
        try {
            await bookService.createBook(bookData);
            toast.success('Book added successfully!', {
                position: "top-right",
                autoClose: 3000,
            });
            // Refresh the book list
            fetchBooks();
        } catch (error) {
            console.error('Error adding book:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to add book. Please try again.';
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
            });
            throw error; // Re-throw to let modal handle it
        }
    };

    const isLibrarian = user?.role === 'admin' || user?.role === 'librarian';

    if (isLoading && books.length === 0) {
        return <Loading fullScreen message="Loading books..." />;
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="section-header mb-0">Book Collection</h1>
                    <p className="text-gray-400">
                        Browse through our extensive library of {total} books
                    </p>
                </div>

                {isLibrarian && (
                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Add New Book
                    </Button>
                )}
            </div>

            {/* Add Book Modal */}
            <AddBookModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onBookAdded={handleAddBook}
            />

            {/* Search and Filters */}
            <Card className="mb-8">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search books by title, author, or description..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            icon={Search}
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="primary"
                        icon={Search}
                        aria-label="Search"
                        className="px-4 shrink-0"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        icon={Filter}
                        onClick={() => {
                            setLocalSearch('');
                            setSearchQuery('');
                            setFilters({ category: '', author: '' });
                        }}
                    >
                        Clear
                    </Button>
                </form>
            </Card>

            {/* Books Grid */}
            {books.length === 0 ? (
                <div className="text-center py-20">
                    <BookOpen className="text-gray-600 mx-auto mb-4" size={64} />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                        No books found
                    </h3>
                    <p className="text-gray-500">
                        Try adjusting your search criteria
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-6 mb-8">
                        {books.map((book, index) => {
                            const isReader = user?.role !== 'admin' && user?.role !== 'librarian';
                            const available = book.available_copies > 0;
                            return (
                                <div
                                    key={book.id}
                                    className="group flex flex-col items-center text-center animate-fade-in"
                                    style={{ animationDelay: `${index * 40}ms` }}
                                >
                                    <BookCover
                                        title={book.title}
                                        author={book.author}
                                        category={book.category}
                                        className="w-[5.5rem] h-32 mb-2"
                                    />
                                    <h3 className="font-display font-bold text-gray-900 text-xs line-clamp-2 leading-snug">
                                        {book.title}
                                    </h3>
                                    <p className="text-[11px] text-gray-500 line-clamp-1">{book.author}</p>
                                    <span className={`text-[11px] font-medium mt-1 ${available ? 'text-accent-700' : 'text-red-600'}`}>
                                        {available ? `${book.available_copies} available` : 'Out of stock'}
                                    </span>

                                    {isReader && (
                                        <Button
                                            variant={available ? 'primary' : 'ghost'}
                                            size="sm"
                                            icon={BookPlus}
                                            disabled={!available || borrowingId === book.id}
                                            onClick={() => handleBorrow(book.id)}
                                            className="mt-2 w-full max-w-[7.5rem] text-xs px-3 py-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto transition-opacity"
                                        >
                                            {borrowingId === book.id ? '…' : available ? 'Borrow' : 'N/A'}
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {total > 20 && (
                        <div className="flex items-center justify-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1 || isLoading}
                            >
                                Previous
                            </Button>
                            <span className="text-gray-400">
                                Page {page} of {Math.ceil(total / 20)}
                            </span>
                            <Button
                                variant="ghost"
                                onClick={() => setPage(page + 1)}
                                disabled={page >= Math.ceil(total / 20) || isLoading}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Books;
