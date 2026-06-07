import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, Clock, BookOpen, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import loanService from '../services/loanService';
import useAuthStore from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

const TABS = [
    { key: 'pending', label: 'Borrow Requests', icon: Clock },
    { key: 'returns', label: 'Return Requests', icon: RotateCcw },
    { key: 'all',     label: 'All Loans',       icon: BookOpen },
];

const STATUS_BADGE = {
    pending:          'bg-yellow-100 text-yellow-700',
    approved:         'bg-blue-100 text-blue-700',
    active:           'bg-green-100 text-green-700',
    renewed:          'bg-green-100 text-green-700',
    overdue:          'bg-red-100 text-red-700',
    return_requested: 'bg-purple-100 text-purple-700',
    returned:         'bg-gray-100 text-gray-600',
    rejected:         'bg-red-50 text-red-400',
};

const STATUS_LABEL = {
    pending:          'Pending',
    approved:         'Approved',
    active:           'Active',
    renewed:          'Renewed',
    overdue:          'Overdue',
    return_requested: 'Return Requested',
    returned:         'Returned',
    rejected:         'Rejected',
};

const AdminLoans = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingLoans, setPendingLoans] = useState([]);
    const [returnRequests, setReturnRequests] = useState([]);
    const [allLoans, setAllLoans] = useState({ loans: [], total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [actingId, setActingId] = useState(null);

    useEffect(() => {
        if (!user || !['admin', 'librarian'].includes(user.role)) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [pending, returns, all] = await Promise.all([
                loanService.getPendingLoans(),
                loanService.getReturnRequests(),
                loanService.getAllLoans({ pageSize: 50 }),
            ]);
            setPendingLoans(pending);
            setReturnRequests(returns);
            setAllLoans(all);
        } catch (err) {
            toast.error('Failed to load loan data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const act = async (fn, successMsg) => {
        try {
            await fn();
            toast.success(successMsg);
            await fetchData();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Action failed');
        } finally {
            setActingId(null);
        }
    };

    const handleApprove = (loanId) => {
        setActingId(loanId);
        act(() => loanService.approveLoan(loanId), 'Loan approved and QR code sent to user.');
    };

    const handleReject = (loanId) => {
        setActingId(loanId);
        act(() => loanService.rejectLoan(loanId), 'Loan request rejected.');
    };

    const handleConfirmReturn = (loanId) => {
        setActingId(loanId);
        act(() => loanService.confirmReturn(loanId), 'Return confirmed. Book copies updated.');
    };

    if (isLoading) return <Loading fullScreen message="Loading loan management…" />;

    const renderPendingRow = (loan) => (
        <Card key={loan.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-gray-900 truncate">{loan.book_title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[loan.status]}`}>
                        {STATUS_LABEL[loan.status]}
                    </span>
                </div>
                <p className="text-sm text-gray-500">by {loan.book_author}</p>
                <div className="mt-1 text-xs text-gray-400 flex flex-wrap gap-3">
                    <span>Student: <span className="text-gray-600 font-medium">{loan.user_name}</span></span>
                    <span>Email: {loan.user_email}</span>
                    <span>Requested: {new Date(loan.loan_date).toLocaleDateString()}</span>
                    <span>Due: {new Date(loan.due_date).toLocaleDateString()}</span>
                </div>
            </div>
            <div className="flex gap-2 shrink-0">
                <Button
                    variant="primary"
                    size="sm"
                    icon={CheckCircle}
                    disabled={actingId === loan.id}
                    onClick={() => handleApprove(loan.id)}
                >
                    Approve
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    icon={XCircle}
                    disabled={actingId === loan.id}
                    onClick={() => handleReject(loan.id)}
                    className="text-red-500 hover:text-red-700"
                >
                    Reject
                </Button>
            </div>
        </Card>
    );

    const renderReturnRow = (loan) => (
        <Card key={loan.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-gray-900 truncate">{loan.book_title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[loan.status]}`}>
                        {STATUS_LABEL[loan.status]}
                    </span>
                </div>
                <p className="text-sm text-gray-500">by {loan.book_author}</p>
                <div className="mt-1 text-xs text-gray-400 flex flex-wrap gap-3">
                    <span>Student: <span className="text-gray-600 font-medium">{loan.user_name}</span></span>
                    <span>Email: {loan.user_email}</span>
                    <span>Approved: {new Date(loan.loan_date).toLocaleDateString()}</span>
                    <span>Due: {new Date(loan.due_date).toLocaleDateString()}</span>
                </div>
            </div>
            <Button
                variant="primary"
                size="sm"
                icon={CheckCircle}
                disabled={actingId === loan.id}
                onClick={() => handleConfirmReturn(loan.id)}
            >
                {actingId === loan.id ? 'Confirming…' : 'Confirm Return'}
            </Button>
        </Card>
    );

    const renderAllRow = (loan) => (
        <Card key={loan.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 text-sm truncate">{loan.book_title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[loan.status] || 'bg-gray-100 text-gray-500'}`}>
                        {STATUS_LABEL[loan.status] || loan.status}
                    </span>
                    {loan.is_overdue && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-600">
                            Overdue
                        </span>
                    )}
                </div>
                <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-2">
                    <span>{loan.user_name}</span>
                    <span>·</span>
                    <span>Due {new Date(loan.due_date).toLocaleDateString()}</span>
                    {loan.return_date && <><span>·</span><span>Returned {new Date(loan.return_date).toLocaleDateString()}</span></>}
                </div>
            </div>
        </Card>
    );

    return (
        <div className="page-container">
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="section-header mb-1 flex items-center gap-2">
                        <Users size={28} /> Loan Management
                    </h1>
                    <p className="text-gray-400">Review and manage student borrow requests</p>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchData}>
                    Refresh
                </Button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'Pending', value: pendingLoans.length, color: 'text-yellow-600' },
                    { label: 'Return Requests', value: returnRequests.length, color: 'text-purple-600' },
                    { label: 'Total Loans', value: allLoans.total, color: 'text-blue-600' },
                    { label: 'Active', value: allLoans.loans?.filter(l => ['approved','active','renewed','overdue'].includes(l.status)).length || 0, color: 'text-green-600' },
                ].map(stat => (
                    <Card key={stat.label} className="p-3 text-center">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {TABS.map(tab => {
                    const count = tab.key === 'pending' ? pendingLoans.length
                        : tab.key === 'returns' ? returnRequests.length
                        : allLoans.total;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <tab.icon size={15} />
                            {tab.label}
                            {count > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                    activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'
                                }`}>{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="space-y-3">
                {activeTab === 'pending' && (
                    pendingLoans.length === 0
                        ? <div className="text-center py-16 text-gray-400"><Clock size={48} className="mx-auto mb-3 opacity-30" /><p>No pending requests</p></div>
                        : pendingLoans.map(renderPendingRow)
                )}
                {activeTab === 'returns' && (
                    returnRequests.length === 0
                        ? <div className="text-center py-16 text-gray-400"><RotateCcw size={48} className="mx-auto mb-3 opacity-30" /><p>No return requests</p></div>
                        : returnRequests.map(renderReturnRow)
                )}
                {activeTab === 'all' && (
                    allLoans.loans?.length === 0
                        ? <div className="text-center py-16 text-gray-400"><BookOpen size={48} className="mx-auto mb-3 opacity-30" /><p>No loans found</p></div>
                        : (allLoans.loans || []).map(renderAllRow)
                )}
            </div>
        </div>
    );
};

export default AdminLoans;
