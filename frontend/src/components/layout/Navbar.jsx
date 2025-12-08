import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, User, Menu, X, Home, Library, BookMarked, Sparkles } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../../stores/authStore';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-40 glass-card border-b border-white/10 animate-slide-down">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <BookOpen className="text-white" size={28} />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-display font-bold text-gradient">
                                E-Library
                            </h1>
                            <p className="text-xs text-gray-400">Powered by AI</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {isAuthenticated && (
                            <>
                                <Link to="/dashboard" className="nav-link">
                                    <Home size={18} />
                                    <span>Dashboard</span>
                                </Link>
                                <Link to="/books" className="nav-link">
                                    <Library size={18} />
                                    <span>Books</span>
                                </Link>
                                <Link to="/my-loans" className="nav-link">
                                    <BookMarked size={18} />
                                    <span>My Loans</span>
                                </Link>
                                <Link to="/recommendations" className="nav-link">
                                    <Sparkles size={18} />
                                    <span>AI Recommendations</span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <div className="hidden sm:flex items-center gap-3 px-4 py-2 glass-card-light rounded-xl">
                                    <User size={20} className="text-primary-400" />
                                    <div>
                                        <p className="text-sm font-semibold text-white">{user?.full_name}</p>
                                        <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={20} className="text-gray-300" />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="btn-ghost text-sm">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary text-sm">
                                    Register
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && isAuthenticated && (
                    <div className="md:hidden py-4 border-t border-white/10 animate-slide-down">
                        <div className="flex flex-col gap-2">
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Home size={18} />
                                <span>Dashboard</span>
                            </Link>
                            <Link
                                to="/books"
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Library size={18} />
                                <span>Books</span>
                            </Link>
                            <Link
                                to="/my-loans"
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <BookMarked size={18} />
                                <span>My Loans</span>
                            </Link>
                            <Link
                                to="/recommendations"
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Sparkles size={18} />
                                <span>AI Recommendations</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
