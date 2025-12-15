import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, BookMarked, TrendingUp, Sparkles } from 'lucide-react';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import useAuthStore from '../stores/authStore';
import useLoanStore from '../stores/loanStore';
import useRecommendationStore from '../stores/recommendationStore';
import loanService from '../services/loanService';
import recommendationService from '../services/recommendationService';

const Dashboard = () => {
    const { user } = useAuthStore();
    const { myLoans, setMyLoans } = useLoanStore();
    const { personalizedRecommendations, setPersonalizedRecommendations } = useRecommendationStore();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        activeLoans: 0,
        overdueLoans: 0,
        totalBooksRead: 0,
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);

                // Only fetch loans and recommendations for non-admin users
                if (user?.role !== 'admin' && user?.role !== 'librarian') {
                    // Fetch user's loans
                    const loansData = await loanService.getMyLoans();
                    setMyLoans(loansData);

                    // Calculate stats
                    const active = loansData.filter(loan =>
                        ['active', 'renewed'].includes(loan.status)
                    ).length;
                    const overdue = loansData.filter(loan =>
                        loan.status === 'overdue'
                    ).length;
                    const returned = loansData.filter(loan =>
                        loan.status === 'returned'
                    ).length;

                    setStats({
                        activeLoans: active,
                        overdueLoans: overdue,
                        totalBooksRead: returned,
                    });

                    // Fetch personalized recommendations
                    try {
                        const recsData = await recommendationService.getPersonalizedRecommendations(5);
                        setPersonalizedRecommendations(recsData.recommendations);
                    } catch (err) {
                        console.error('Failed to fetch recommendations:', err);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [setMyLoans, setPersonalizedRecommendations, user?.role]);

    if (isLoading) {
        return <Loading fullScreen message="Loading your dashboard..." />;
    }

    return (
        <div className="page-container">
            {/* Welcome Section */}
            <div className="mb-6 animate-fade-in">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-1">
                    Welcome back, {user?.full_name}!
                </h1>
                <p className="text-gray-600 text-sm">
                    Here's what's happening with your library account
                </p>
            </div>

            {/* Stats Grid - Only for non-admin users */}
            {user?.role !== 'admin' && user?.role !== 'librarian' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card className="animate-slide-up p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">Active Loans</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.activeLoans}</p>
                                </div>
                                <div className="p-2 bg-primary-500/10 rounded-lg">
                                    <BookMarked className="text-primary-600" size={20} />
                                </div>
                            </div>
                        </Card>

                        <Card className="animate-slide-up animation-delay-200 p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">Overdue Books</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.overdueLoans}</p>
                                </div>
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                    <TrendingUp className="text-red-600" size={20} />
                                </div>
                            </div>
                        </Card>

                        <Card className="animate-slide-up animation-delay-400 p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">Books Read</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalBooksRead}</p>
                                </div>
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <BookOpen className="text-green-600" size={20} />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Link to="/books" className="block">
                            <Card hover className="h-full p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
                                        <BookOpen className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-display font-bold text-gray-900 mb-0.5">
                                            Browse Books
                                        </h3>
                                        <p className="text-gray-600 text-xs">
                                            Explore our vast collection
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </Link>

                        <Link to="/recommendations" className="block">
                            <Card hover className="h-full p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg">
                                        <Sparkles className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-display font-bold text-gray-900 mb-0.5">
                                            AI Recommendations
                                        </h3>
                                        <p className="text-gray-600 text-xs">
                                            Get personalized suggestions
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    </div>

                    {/* Personalized Recommendations */}
                    {personalizedRecommendations.length > 0 && (
                        <div className="animate-fade-in">
                            <h2 className="text-xl font-display font-bold text-gray-900 mb-4">Recommended For You</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {personalizedRecommendations.slice(0, 3).map((rec, index) => (
                                    <Card key={index} hover className="p-4">
                                        <div className="flex items-start gap-2 mb-2">
                                            <div className="p-1.5 bg-accent-500/10 rounded-lg">
                                                <Sparkles className="text-accent-600" size={16} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">{rec.title}</h3>
                                                <p className="text-xs text-gray-600">{rec.author}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{rec.reason}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-md font-medium">{rec.category}</span>
                                            <Link to={`/books/${rec.book_id}`} className="text-primary-600 hover:text-primary-700 text-xs font-semibold transition-colors">
                                                View →
                                            </Link>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Admin/Librarian Dashboard - Show relevant content */}
            {(user?.role === 'admin' || user?.role === 'librarian') && (
                <div className="animate-fade-in">
                    <Card className="p-8 text-center">
                        <BookOpen className="mx-auto mb-4 text-primary-600" size={64} />
                        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
                            Welcome, {user?.role === 'admin' ? 'Administrator' : 'Librarian'}!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Manage the library system using the navigation menu above.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            <Link to="/books">
                                <button className="w-full btn-primary">
                                    Manage Books
                                </button>
                            </Link>
                            <Link to="/loans">
                                <button className="w-full btn-ghost">
                                    View All Loans
                                </button>
                            </Link>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
