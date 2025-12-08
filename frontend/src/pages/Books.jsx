import { useEffect, useState } from 'react';
import { Search, Filter, BookOpen, Plus } from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import useBookStore from '../../stores/bookStore';
import useAuthStore from '../../stores/authStore';
import bookService from '../../services/bookService';

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
                    <Button variant="primary" icon={Plus}>
                        Add New Book
                    </Button>
                )}
            </div>

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {books.map((book, index) => (
                            <Card
                                key={book.id}
                                hover
                                className={`flex flex-col animate-fade-in`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Book Cover Placeholder */}
                                <div className="w-full h-48 bg-gradient-to-br from-primary-900 to-accent-900 rounded-xl mb-4 flex items-center justify-center">
                                    <BookOpen className="text-white/30" size={48} />
                                </div>

                                {/* Book Info */}
                                <h3 className="font-display font-bold text-white mb-2 line-clamp-2">
                                    {book.title}
                                </h3>
                                <p className="text-sm text-gray-400 mb-3">{book.author}</p>

                                {book.category && (
                                    <span className="badge-primary mb-3">{book.category}</span>
                                )}

                                <p className="text-xs text-gray-400 mb-4 line-clamp-2 flex-1">
                                    {book.description || 'No description available'}
                                </p>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className={`text-sm ${book.available_copies > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {book.available_copies > 0 ? `${book.available_copies} available` : 'Not available'}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={book.available_copies === 0}
                                    >
                                        Borrow
                                    </Button>
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
