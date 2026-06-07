import { useState, useEffect } from 'react';
import { Sparkles, Search, BookOpen, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import recommendationService from '../services/recommendationService';
import loanService from '../services/loanService';

const BookRecommendationCard = ({ rec, onBorrow, borrowingId }) => (
    <Card hover className="p-4 flex flex-col">
        <div className="w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-lg mb-3 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
                {rec.title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
            </span>
        </div>
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{rec.title}</h3>
        <p className="text-xs text-gray-500 mb-1">{rec.author}</p>
        {rec.category && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 w-fit mb-2">
                {rec.category}
            </span>
        )}
        {rec.reason && (
            <p className="text-xs text-gray-400 line-clamp-3 flex-1 mb-3">{rec.reason}</p>
        )}
        {rec.similarity_score !== undefined && (
            <div className="flex items-center gap-1 mb-3">
                <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                    <div
                        className="h-1.5 rounded-full bg-indigo-500"
                        style={{ width: `${Math.round(rec.similarity_score * 100)}%` }}
                    />
                </div>
                <span className="text-xs text-gray-400">{Math.round(rec.similarity_score * 100)}% match</span>
            </div>
        )}
        <Button
            variant="primary"
            size="sm"
            className="w-full"
            disabled={borrowingId === rec.book_id}
            onClick={() => onBorrow(rec.book_id)}
        >
            {borrowingId === rec.book_id ? 'Requesting…' : 'Request Borrow'}
        </Button>
    </Card>
);

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
        } catch (err) {
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i} className="p-4 animate-pulse">
                                <div className="w-full h-32 bg-gray-200 rounded-lg mb-3" />
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </Card>
                        ))}
                    </div>
                ) : personalized.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
                        <p>Borrow a few books to get personalized recommendations!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
