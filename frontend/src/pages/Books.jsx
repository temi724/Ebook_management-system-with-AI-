import { useEffect, useState } from 'react';
import { Search, Filter, BookOpen, Plus } from 'lucide-react';
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
        setSearchQuery(localSearch);
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
                    <Button type="submit" variant="primary">
                        Search
                    </Button>
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
                        {books.map((book, index) => (
                            <Card
                                key={book.id}
                                hover
                                className="flex flex-col p-4 animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Actual book cover */}
                                <BookCover
                                    title={book.title}
                                    author={book.author}
                                    category={book.category}
                                    className="aspect-[2/3] w-full mb-4"
                                />

                                {/* Book Info */}
                                <h3 className="font-display font-bold text-gray-900 mb-0.5 line-clamp-2 text-sm leading-snug">
                                    {book.title}
                                </h3>
                                <p className="text-xs text-gray-500 mb-3">{book.author}</p>

                                {/* Actions */}
                                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                                    <span className={`text-xs font-medium ${book.available_copies > 0 ? 'text-accent-700' : 'text-red-600'}`}>
                                        {book.available_copies > 0 ? `${book.available_copies} available` : 'Out'}
                                    </span>
                                    {user?.role !== 'admin' && user?.role !== 'librarian' && (
                                        <Button
                                            variant={book.available_copies > 0 ? 'primary' : 'ghost'}
                                            size="sm"
                                            disabled={book.available_copies === 0 || borrowingId === book.id}
                                            onClick={() => handleBorrow(book.id)}
                                            className="text-xs px-3 py-1"
                                        >
                                            {borrowingId === book.id ? '…' : book.available_copies > 0 ? 'Borrow' : 'N/A'}
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}
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
