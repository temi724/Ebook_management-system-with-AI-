import { Link } from 'react-router-dom';
import {
    BookOpen, Sparkles, TrendingUp, Shield, ArrowRight,
    Search, QrCode, CheckCircle2, Library,
} from 'lucide-react';
import useAuthStore from '../stores/authStore';

const features = [
    {
        icon: Sparkles,
        title: 'AI Recommendations',
        text: 'Personalised book suggestions powered by a Retrieval-Augmented Generation pipeline running on local Ollama models.',
        gradient: 'from-primary-500 to-primary-700',
    },
    {
        icon: TrendingUp,
        title: 'Smart Loan Tracking',
        text: 'A guided borrow → approve → collect → return workflow with QR verification, renewals, and overdue tracking.',
        gradient: 'from-secondary-400 to-secondary-600',
    },
    {
        icon: Shield,
        title: 'Secure & Role-Based',
        text: 'JWT authentication with bcrypt-hashed passwords and four access roles: Admin, Librarian, Faculty and Student.',
        gradient: 'from-accent-500 to-accent-700',
    },
];

const steps = [
    { icon: Search, title: 'Discover', text: 'Search the catalogue or ask the AI for books on any topic.' },
    { icon: BookOpen, title: 'Request', text: 'Send a borrow request in one click and await approval.' },
    { icon: QrCode, title: 'Collect', text: 'Show your generated QR code at the library counter.' },
    { icon: CheckCircle2, title: 'Return', text: 'Mark it returned — staff confirm and you’re all set.' },
];

const Home = () => {
    const { isAuthenticated } = useAuthStore();
    const primaryCta = isAuthenticated
        ? { to: '/dashboard', label: 'Go to Dashboard' }
        : { to: '/register', label: 'Get Started Free' };

    return (
        <div>
            {/* ───────────── Hero ───────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900">
                {/* decorative blobs */}
                <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-24 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />

                <div className="relative page-container py-24 md:py-32">
                    <div className="max-w-3xl mx-auto text-center animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full mb-6 backdrop-blur-sm">
                            <Sparkles className="text-secondary-300" size={15} />
                            <span className="text-sm text-white/90 font-medium">AI-Powered University Library</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white leading-tight mb-6">
                            Your Gateway to
                            <span className="block bg-gradient-to-r from-secondary-300 to-accent-300 bg-clip-text text-transparent">
                                Infinite Knowledge
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-primary-100 mb-9 max-w-2xl mx-auto leading-relaxed">
                            Discover, borrow, and manage books effortlessly — with intelligent
                            recommendations, QR-verified loans, and a beautiful, modern experience.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to={primaryCta.to}
                                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-primary-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-95"
                            >
                                {primaryCta.label}
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            {!isAuthenticated && (
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/30 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* soft fade into page background */}
                <div className="h-px w-full bg-white/10" />
            </section>

            {/* ───────────── Features ───────────── */}
            <section className="page-container py-20">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 mb-2">What you get</p>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
                        Everything a modern library needs
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <div
                            key={f.title}
                            className="group bg-white rounded-2xl border border-gray-200 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                            style={{ animationDelay: `${i * 120}ms` }}
                        >
                            <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${f.gradient} rounded-2xl mb-5 shadow-md group-hover:scale-110 transition-transform`}>
                                <f.icon className="text-white" size={26} />
                            </div>
                            <h3 className="text-lg font-display font-bold text-gray-900 mb-2">{f.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{f.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ───────────── How it works ───────────── */}
            <section className="bg-white border-y border-gray-200">
                <div className="page-container py-20">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 mb-2">How it works</p>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
                            Borrow a book in four simple steps
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((s, i) => (
                            <div key={s.title} className="relative text-center">
                                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 border border-primary-100 mb-4">
                                    <s.icon className="text-primary-600" size={26} />
                                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-secondary-500 text-white text-xs font-bold flex items-center justify-center shadow">
                                        {i + 1}
                                    </span>
                                </div>
                                <h3 className="font-display font-bold text-gray-900 mb-1">{s.title}</h3>
                                <p className="text-gray-500 text-sm">{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────── Stats band ───────────── */}
            <section className="page-container py-16">
                <div className="rounded-3xl bg-gradient-to-r from-primary-700 to-primary-800 p-10 md:p-14 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
                        {[
                            { value: 'RAG', label: 'AI-powered discovery' },
                            { value: '4', label: 'User roles supported' },
                            { value: 'QR', label: 'Verified book collection' },
                        ].map((s) => (
                            <div key={s.label}>
                                <p className="text-4xl md:text-5xl font-display font-extrabold text-secondary-300 mb-2">{s.value}</p>
                                <p className="text-primary-100">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────── CTA ───────────── */}
            <section className="page-container pb-24">
                <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-sm text-center max-w-3xl mx-auto p-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-6 shadow-md">
                        <Library className="text-white" size={30} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-3">
                        Ready to transform your reading experience?
                    </h2>
                    <p className="text-gray-500 mb-8 max-w-xl mx-auto">
                        Join your campus library’s smarter, faster, AI-assisted home for books.
                    </p>
                    <Link
                        to={primaryCta.to}
                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-95"
                    >
                        {primaryCta.label}
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
