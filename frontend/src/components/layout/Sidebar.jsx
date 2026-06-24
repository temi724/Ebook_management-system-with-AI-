import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
    BookOpen, Home, Library, BookMarked, Sparkles, ClipboardList,
    LogOut, Menu, X,
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const Sidebar = () => {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const isStaff = user?.role === 'admin' || user?.role === 'librarian';

    const links = [
        { to: '/dashboard', label: 'Dashboard', icon: Home },
        { to: '/books', label: 'Books', icon: Library },
        ...(isStaff
            ? [{ to: '/admin/loans', label: 'Loan Requests', icon: ClipboardList }]
            : [
                { to: '/my-loans', label: 'My Loans', icon: BookMarked },
                { to: '/recommendations', label: 'AI Recommendations', icon: Sparkles },
            ]),
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
        }`;

    const content = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100 shrink-0"
            >
                <div className="p-1.5 bg-primary-600 rounded-lg">
                    <BookOpen className="text-white" size={20} />
                </div>
                <div>
                    <h1 className="text-base font-display font-bold text-gray-900 leading-none">E-Library</h1>
                    <p className="text-[10px] text-gray-400 mt-0.5">Powered by AI</p>
                </div>
            </Link>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {links.map(l => (
                    <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={linkClass}>
                        <l.icon size={18} />
                        {l.label}
                    </NavLink>
                ))}
            </nav>

            {/* User + logout */}
            <div className="border-t border-gray-100 p-3 shrink-0">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm shrink-0">
                        {user?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name}</p>
                        <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile top bar */}
            <div className="lg:hidden fixed top-0 inset-x-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary-600 rounded-lg">
                        <BookOpen className="text-white" size={18} />
                    </div>
                    <span className="font-display font-bold text-gray-900">E-Library</span>
                </Link>
                <button onClick={() => setOpen(true)} className="p-2 text-gray-600" aria-label="Open menu">
                    <Menu size={22} />
                </button>
            </div>

            {/* Desktop fixed sidebar */}
            <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30">
                {content}
            </aside>

            {/* Mobile drawer */}
            {open && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl animate-slide-down">
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-3 p-1 text-gray-400 hover:text-gray-600 z-10"
                            aria-label="Close menu"
                        >
                            <X size={20} />
                        </button>
                        {content}
                    </aside>
                </div>
            )}
        </>
    );
};

export default Sidebar;
