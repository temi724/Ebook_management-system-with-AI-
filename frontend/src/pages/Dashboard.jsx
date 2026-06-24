import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    BookOpen, BookMarked, AlertTriangle, Sparkles, ClipboardList,
    ArrowRight, Library, Tag, QrCode, RotateCcw,
} from 'lucide-react';
import Card from '../components/common/Card';
import BookCover from '../components/common/BookCover';
import useAuthStore from '../stores/authStore';
import useLoanStore from '../stores/loanStore';
import useBookStore from '../stores/bookStore';
import useRecommendationStore from '../stores/recommendationStore';
import loanService from '../services/loanService';
import bookService from '../services/bookService';
import recommendationService from '../services/recommendationService';

const ACTIVE_STATUSES = ['approved', 'active', 'renewed', 'overdue'];

const Dashboard = () => {
    const { user } = useAuthStore();
    const { myLoans, setMyLoans } = useLoanStore();
    const { setSearchQuery, setFilters, setPage } = useBookStore();
    const { personalizedRecommendations, setPersonalizedRecommendations } = useRecommendationStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({ activeLoans: 0, overdueLoans: 0, totalBooksRead: 0 });

    const isStaff = user?.role === 'admin' || user?.role === 'librarian';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                if (!isStaff) {
                    const loansData = await loanService.getMyLoans();
                    setMyLoans(loansData);

                    const active = loansData.filter(l => ['approved', 'active', 'renewed'].includes(l.status)).length;
                    const overdue = loansData.filter(l => l.status === 'overdue').length;
                    const returned = loansData.filter(l => l.status === 'returned').length;
                    setStats({ activeLoans: active, overdueLoans: overdue, totalBooksRead: returned });

                    // Derive a list of categories from the catalogue for the "Browse by category" row.
                    try {
                        const booksData = await bookService.getBooks({ pageSize: 50 });
                        const seen = new Set();
                        const cats = [];
                        for (const b of booksData.books || []) {
                            const c = (b.category || '').trim();
                            if (c && !seen.has(c.toLowerCase())) {
                                seen.add(c.toLowerCase());
                                cats.push(c);
                            }
                        }
                        setCategories(cats.slice(0, 10));
                    } catch (err) {
                        console.error('Failed to fetch categories:', err);
                    }

                    try {
                        const recsData = await recommendationService.getPersonalizedRecommendations(8);
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
        return <DashboardSkeleton isStaff={isStaff} />;
    }

    const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const statCards = [
        { label: 'Active Loans', value: stats.activeLoans, Icon: BookMarked },
        { label: 'Overdue Books', value: stats.overdueLoans, Icon: AlertTriangle },
        { label: 'Books Read', value: stats.totalBooksRead, Icon: BookOpen },
    ];

    // The "currently borrowed" feature: soonest-due active loan.
    const featured = myLoans
        .filter(l => ACTIVE_STATUSES.includes(l.status))
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

    const goToCategory = (cat) => {
        setSearchQuery('');
        setFilters({ category: cat, author: '' });
        setPage(1);
        navigate('/books');
    };

    return (
        <div className="page-container">
            {/* ── Welcome banner ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 to-primary-900 p-8 md:p-10 mb-8 animate-fade-in">
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
                                    <div className="p-3 rounded-2xl bg-primary-50">
                                        <s.Icon className="text-primary-600" size={22} />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* ── Currently borrowed (featured) ── */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-display font-bold text-gray-900">Currently Borrowed</h2>
                            <Link to="/my-loans" className="text-primary-600 hover:text-primary-700 text-sm font-semibold inline-flex items-center gap-1">
                                My borrows <ArrowRight size={14} />
                            </Link>
                        </div>
                        {featured ? <FeaturedLoan loan={featured} /> : <EmptyFeatured />}
                    </div>

                    {/* ── Browse by category ── */}
                    {categories.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Tag className="text-primary-600" size={20} /> Browse by Category
                            </h2>
                            <div className="flex flex-wrap gap-2.5">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => goToCategory(cat)}
                                        className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700 font-medium hover:border-primary-400 hover:text-primary-700 hover:shadow-sm transition-all"
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

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
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3 gap-y-5">
                                {personalizedRecommendations.slice(0, 6).map((rec, index) => (
                                    <Link to="/recommendations" key={index} className="block group">
                                        <BookCover
                                            title={rec.title}
                                            author={rec.author}
                                            category={rec.category}
                                            className="w-[5.5rem] h-32 mx-auto mb-2"
                                        />
                                        <h3 className="font-display font-bold text-gray-900 text-xs line-clamp-2 leading-snug text-center">{rec.title}</h3>
                                        <p className="text-[11px] text-gray-500 text-center line-clamp-1">{rec.author}</p>
                                    </Link>
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
                        to="/books" Icon={Library}
                        title="Manage Books" subtitle="Add, edit and organise the catalogue"
                    />
                    <QuickAction
                        to="/admin/loans" Icon={ClipboardList}
                        title="Loan Requests" subtitle="Approve borrows and confirm returns"
                    />
                </div>
            )}
        </div>
    );
};

const FeaturedLoan = ({ loan }) => {
    // Snapshot "now" once on mount (lazy init keeps render pure).
    const [now] = useState(() => Date.now());
    const start = new Date(loan.loan_date).getTime();
    const due = new Date(loan.due_date).getTime();
    const overdue = loan.is_overdue || loan.status === 'overdue';
    const pct = overdue ? 100 : Math.max(3, Math.min(100, Math.round(((now - start) / (due - start)) * 100)));
    const daysLeft = Math.ceil((due - now) / 86_400_000);
    const dueLabel = overdue ? 'Overdue' : daysLeft <= 0 ? 'Due today' : `Due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
    const barColor = overdue ? 'bg-red-500' : 'bg-primary-600';

    return (
        <Card className="p-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-5">
                <BookCover
                    title={loan.book_title}
                    author={loan.book_author}
                    className="w-24 h-36 shrink-0 mx-auto sm:mx-0"
                />
                <div className="flex-1 flex flex-col min-w-0">
                    <span className="text-[11px] uppercase tracking-wider text-primary-600 font-semibold mb-1">
                        Continue where you left off
                    </span>
                    <h3 className="text-lg font-display font-bold text-gray-900 truncate">{loan.book_title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{loan.book_author}</p>

                    <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className={overdue ? 'text-red-600 font-semibold' : 'text-gray-500'}>{dueLabel}</span>
                        <span className="text-gray-400">due {new Date(loan.due_date).toLocaleDateString()}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>

                    <div className="mt-auto pt-4 flex gap-2">
                        <Link
                            to="/my-loans"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            {loan.status === 'approved' ? <><QrCode size={15} /> Show QR</> : <><RotateCcw size={15} /> Manage loan</>}
                        </Link>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const EmptyFeatured = () => (
    <Card className="p-8 text-center">
        <BookMarked className="mx-auto mb-3 text-gray-300" size={40} />
        <p className="text-gray-500 mb-4">You have no active borrows right now.</p>
        <Link
            to="/books"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
            <BookOpen size={16} /> Browse the library
        </Link>
    </Card>
);

const DashboardSkeleton = ({ isStaff }) => (
    <div className="page-container animate-pulse">
        {/* Welcome banner placeholder */}
        <div className="h-32 md:h-36 rounded-3xl bg-gray-200 mb-8" />

        {!isStaff ? (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="card p-5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <div className="h-3 w-20 bg-gray-200 rounded" />
                                    <div className="h-7 w-12 bg-gray-200 rounded" />
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-gray-200" />
                            </div>
                        </div>
                    ))}
                </div>
                {/* Featured loan placeholder */}
                <div className="card p-5 mb-8 flex gap-5">
                    <div className="w-24 h-36 rounded-lg bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-3">
                        <div className="h-3 w-32 bg-gray-200 rounded" />
                        <div className="h-5 w-48 bg-gray-200 rounded" />
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                        <div className="h-2 w-full bg-gray-200 rounded-full" />
                    </div>
                </div>
                {/* Category chips placeholder */}
                <div className="flex flex-wrap gap-2.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-9 w-24 rounded-full bg-gray-200" />
                    ))}
                </div>
            </>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="card p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gray-200" />
                            <div className="flex-1 space-y-2">
                                <div className="h-5 w-40 bg-gray-200 rounded" />
                                <div className="h-3 w-52 bg-gray-200 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const QuickAction = ({ to, Icon, title, subtitle }) => (
    <Link to={to} className="block group">
        <Card hover className="h-full p-5">
            <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-primary-50 group-hover:bg-primary-100 transition-colors">
                    <Icon className="text-primary-600" size={24} />
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
