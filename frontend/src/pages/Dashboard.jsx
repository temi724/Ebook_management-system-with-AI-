import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen, BookMarked, AlertTriangle, Sparkles, ClipboardList,
    ArrowRight, Library, Clock,
} from 'lucide-react';
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

    const isStaff = user?.role === 'admin' || user?.role === 'librarian';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                if (!isStaff) {
                    const loansData = await loanService.getMyLoans();
                    setMyLoans(loansData);

                    const active = loansData.filter(loan =>
                        ['approved', 'active', 'renewed'].includes(loan.status)
                    ).length;
                    const overdue = loansData.filter(loan => loan.status === 'overdue').length;
                    const returned = loansData.filter(loan => loan.status === 'returned').length;

                    setStats({ activeLoans: active, overdueLoans: overdue, totalBooksRead: returned });

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
    }, [setMyLoans, setPersonalizedRecommendations, isStaff]);

    if (isLoading) {
        return <Loading fullScreen message="Loading your dashboard..." />;
    }

    const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const statCards = [
        { label: 'Active Loans', value: stats.activeLoans, Icon: BookMarked, gradient: 'from-primary-500 to-primary-700' },
        { label: 'Overdue Books', value: stats.overdueLoans, Icon: AlertTriangle, gradient: 'from-secondary-400 to-secondary-600' },
        { label: 'Books Read', value: stats.totalBooksRead, Icon: BookOpen, gradient: 'from-accent-500 to-accent-700' },
    ];

    return (
        <div className="page-container">
            {/* ── Welcome banner ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 to-primary-900 p-8 md:p-10 mb-8 shadow-lg animate-fade-in">
                <div className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 bg-secondary-500/20 rounded-full blur-3xl" />
                <div className="relative">
                    <p className="text-primary-200 text-sm mb-1">{today}</p>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                        Welcome back, {user?.full_name?.split(' ')[0] || 'Reader'}! 👋
                    </h1>
                    <p className="text-primary-100 text-sm mt-1">
                        {isStaff
                            ? `You're signed in as ${user?.role}. Manage the library from the tools below.`
                            : "Here's what's happening with your library account."}
                    </p>
                    <span className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white capitalize">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-300" /> {user?.role}
                    </span>
                </div>
            </div>

            {!isStaff && (
                <>
                    {/* ── Stat cards ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {statCards.map((s, i) => (
                            <Card key={s.label} className="p-5 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">{s.label}</p>
                                        <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${s.gradient} shadow-md`}>
                                        <s.Icon className="text-white" size={22} />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* ── Quick actions ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                        <QuickAction
                            to="/books" Icon={BookOpen} gradient="from-primary-500 to-primary-700"
                            title="Browse Books" subtitle="Explore the full collection"
                        />
                        <QuickAction
                            to="/recommendations" Icon={Sparkles} gradient="from-accent-500 to-accent-700"
                            title="AI Recommendations" subtitle="Get personalised suggestions"
                        />
                    </div>

                    {/* ── Personalized recommendations ── */}
                    {personalizedRecommendations.length > 0 && (
                        <div className="animate-fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="text-accent-600" size={20} /> Recommended For You
                                </h2>
                                <Link to="/recommendations" className="text-primary-600 hover:text-primary-700 text-sm font-semibold inline-flex items-center gap-1">
                                    See all <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {personalizedRecommendations.slice(0, 3).map((rec, index) => (
                                    <Card key={index} hover className="p-4">
                                        <div className="flex items-start gap-3 mb-2">
                                            <div className="p-2 bg-accent-500/10 rounded-xl shrink-0">
                                                <BookOpen className="text-accent-600" size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-gray-900 text-sm truncate">{rec.title}</h3>
                                                <p className="text-xs text-gray-500">{rec.author}</p>
                                            </div>
                                        </div>
                                        {rec.reason && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{rec.reason}</p>}
                                        <div className="flex items-center justify-between">
                                            {rec.category && (
                                                <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-md font-medium">{rec.category}</span>
                                            )}
                                            <Link to="/recommendations" className="text-primary-600 hover:text-primary-700 text-xs font-semibold inline-flex items-center gap-1">
                                                View <ArrowRight size={12} />
                                            </Link>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── Staff dashboard ── */}
            {isStaff && (
                <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-4">
                    <QuickAction
                        to="/books" Icon={Library} gradient="from-primary-500 to-primary-700"
                        title="Manage Books" subtitle="Add, edit and organise the catalogue"
                    />
                    <QuickAction
                        to="/admin/loans" Icon={ClipboardList} gradient="from-secondary-400 to-secondary-600"
                        title="Loan Requests" subtitle="Approve borrows and confirm returns"
                    />
                </div>
            )}
        </div>
    );
};

const QuickAction = ({ to, Icon, gradient, title, subtitle }) => (
    <Link to={to} className="block group">
        <Card hover className="h-full p-5">
            <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradient} shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white" size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-display font-bold text-gray-900">{title}</h3>
                    <p className="text-gray-500 text-sm">{subtitle}</p>
                </div>
                <ArrowRight className="text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" size={20} />
            </div>
        </Card>
    </Link>
);

export default Dashboard;
