import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, BookMarked, TrendingUp, Sparkles } from 'lucide-react';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import useAuthStore from '../../stores/authStore';
import useLoanStore from '../../stores/loanStore';
import useRecommendationStore from '../../stores/recommendationStore';
import loanService from '../../services/loanService';
import recommendationService from '../../services/recommendationService';

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
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [setMyLoans, setPersonalizedRecommendations]);

    if (isLoading) {
        return <Loading fullScreen message="Loading your dashboard..." />;
    }

    return (
        <div className="page-container">
            {/* Welcome Section */}
            <div className="mb-8 animate-fade-in">
                <h1 className="text-4xl font-display font-bold text-gradient mb-2">
                    Welcome back, {user?.full_name}!
                </h1>
                <p className="text-gray-400">
                    Here's what's happening with your library account
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="animate-slide-up">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Active Loans</p>
                            <p className="text-3xl font-bold text-white">{stats.activeLoans}</p>
                        </div>
                        <div className="p-3 bg-primary-500/20 rounded-xl">
                            <BookMarked className="text-primary-400" size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="animate-slide-up animation-delay-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Overdue Books</p>
                            <p className="text-3xl font-bold text-white">{stats.overdueLoans}</p>
                        </div>
                        <div className="p-3 bg-red-500/20 rounded-xl">
                            <TrendingUp className="text-red-400" size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="animate-slide-up animation-delay-400">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Books Read</p>
                            <p className="text-3xl font-bold text-white">{stats.totalBooksRead}</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-xl">
                            <BookOpen className="text-green-400" size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link to="/books" className="block">
                    <Card hover className="h-full">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                                <BookOpen className="text-white" size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-bold text-white mb-1">
                                    Browse Books
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Explore our vast collection of books
                                </p>
                            </div>
                        </div>
                    </Card>
                </Link>

                <Link to="/recommendations" className="block">
                    <Card hover className="h-full">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl">
                                <Sparkles className="text-white" size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-bold text-white mb-1">
                                    AI Recommendations
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Get personalized book suggestions
                                </p>
                            </div>
                        </div>
                    </Card>
                </Link>
            </div>

            {/* Personalized Recommendations */}
            {personalizedRecommendations.length > 0 && (
                <div className="animate-fade-in">
                    <h2 className="section-header">Recommended For You</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {personalizedRecommendations.slice(0, 3).map((rec, index) => (
                            <Card key={index} hover>
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="p-2 bg-accent-500/20 rounded-lg">
                                        <Sparkles className="text-accent-400" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white mb-1">{rec.title}</h3>
                                        <p className="text-sm text-gray-400">{rec.author}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mb-3">{rec.reason}</p>
                                <div className="flex items-center justify-between">
                                    <span className="badge-primary">{rec.category}</span>
                                    <Link to={`/books/${rec.book_id}`} className="text-primary-400 hover:text-primary-300 text-sm font-semibold transition-colors">
                                        View Details →
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
