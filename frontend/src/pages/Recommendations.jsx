import { useState, useEffect } from 'react';
import { Sparkles, Search, BookOpen, RefreshCw, BookPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import recommendationService from '../services/recommendationService';
import loanService from '../services/loanService';
import BookCover from '../components/common/BookCover';

const BookRecommendationCard = ({ rec, onBorrow, borrowingId }) => {
    return (
        <div className="group flex flex-col items-center text-center">
            <BookCover
                title={rec.title}
                author={rec.author}
                category={rec.category}
                className="w-[5.5rem] h-32 mb-2"
            />
            <h3 className="font-display font-bold text-gray-900 text-xs line-clamp-2 leading-snug">{rec.title}</h3>
            <p className="text-[11px] text-gray-500 line-clamp-1 mb-2">{rec.author}</p>
            <Button
                variant="primary"
                size="sm"
                icon={BookPlus}
                className="w-full max-w-[7.5rem] text-xs px-3 py-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto transition-opacity"
                disabled={borrowingId === rec.book_id}
                onClick={() => onBorrow(rec.book_id)}
            >
                {borrowingId === rec.book_id ? '…' : 'Borrow'}
            </Button>
        </div>
    );
};

const Recommendations = () => {
    const [personalized, setPersonalized] = useState([]);
    const [queryResults, setQueryResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingPersonalized, setIsLoadingPersonalized] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [borrowingId, setBorrowingId] = useState(null);
    const [searched, setSearched] = useState(false);

    const fetchPersonalized = async () => {
        setIsLoadingPersonalized(true);
        try {
            const data = await recommendationService.getPersonalizedRecommendations(8);
            setPersonalized(data.recommendations || []);
        } catch (err) {
            console.error('Failed to load personalized recommendations', err);
        } finally {
            setIsLoadingPersonalized(false);
        }
    };

    useEffect(() => { fetchPersonalized(); }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setSearched(true);
        try {
            const data = await recommendationService.getRecommendationsByQuery(searchQuery, 8);
            setQueryResults(data.recommendations || []);
        } catch {
            toast.error('Search failed. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleBorrow = async (bookId) => {
        setBorrowingId(bookId);
        try {
            await loanService.requestBorrow(bookId);
            toast.success('Borrow request submitted! Awaiting admin approval.', { position: 'top-right' });
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to submit request');
        } finally {
            setBorrowingId(null);
        }
    };

    return (
        <div className="page-container">
            <div className="mb-6">
                <h1 className="section-header mb-1 flex items-center gap-2">
                    <Sparkles size={28} className="text-indigo-500" /> AI Recommendations
                </h1>
                <p className="text-gray-400">Discover books tailored to your interests</p>
            </div>

            {/* Search section */}
            <Card className="mb-8">
                <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Search size={18} /> Search by Interest
                </h2>
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder="e.g. machine learning, ancient history, mystery novels…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            icon={Search}
                        />
                    </div>
                    <Button type="submit" variant="primary" disabled={isSearching || !searchQuery.trim()}>
                        {isSearching ? 'Searching…' : 'Search'}
                    </Button>
                </form>

                {searched && (
                    <div className="mt-6">
                        {isSearching ? (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <RefreshCw size={16} className="animate-spin" /> Finding best matches…
                            </div>
                        ) : queryResults.length === 0 ? (
                            <p className="text-gray-400 text-sm">No results found. Try a different search.</p>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-6">
                                {queryResults.map(rec => (
                                    <BookRecommendationCard
                                        key={rec.book_id}
                                        rec={rec}
                                        onBorrow={handleBorrow}
                                        borrowingId={borrowingId}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Personalized section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Sparkles size={18} className="text-indigo-500" /> Recommended For You
                    </h2>
                    <Button variant="ghost" size="sm" icon={RefreshCw} onClick={fetchPersonalized} disabled={isLoadingPersonalized}>
                        Refresh
                    </Button>
                </div>

                {isLoadingPersonalized ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center animate-pulse">
                                <div className="w-[5.5rem] h-32 bg-gray-200 rounded-lg mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
                                <div className="h-2.5 bg-gray-200 rounded w-12" />
                            </div>
                        ))}
                    </div>
                ) : personalized.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
                        <p>Borrow a few books to get personalized recommendations!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-6">
                        {personalized.map(rec => (
                            <BookRecommendationCard
                                key={rec.book_id}
                                rec={rec}
                                onBorrow={handleBorrow}
                                borrowingId={borrowingId}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recommendations;
