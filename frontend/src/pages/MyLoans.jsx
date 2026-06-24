import { useEffect, useState } from 'react';
import { BookMarked, QrCode, RotateCcw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import loanService from '../services/loanService';

const STATUS_CONFIG = {
    pending:          { label: 'Pending',          color: 'text-yellow-600', bg: 'bg-yellow-50',  Icon: Clock },
    approved:         { label: 'Approved',          color: 'text-blue-600',   bg: 'bg-blue-50',    Icon: QrCode },
    active:           { label: 'Active',            color: 'text-green-600',  bg: 'bg-green-50',   Icon: CheckCircle },
    renewed:          { label: 'Renewed',           color: 'text-green-600',  bg: 'bg-green-50',   Icon: CheckCircle },
    overdue:          { label: 'Overdue',           color: 'text-red-600',    bg: 'bg-red-50',     Icon: AlertCircle },
    return_requested: { label: 'Return Requested',  color: 'text-purple-600', bg: 'bg-purple-50',  Icon: RotateCcw },
    returned:         { label: 'Returned',          color: 'text-gray-500',   bg: 'bg-gray-100',   Icon: CheckCircle },
    rejected:         { label: 'Rejected',          color: 'text-red-500',    bg: 'bg-red-50',     Icon: XCircle },
};

const TABS = [
    { key: 'active',   label: 'Active',   statuses: ['approved', 'active', 'renewed', 'overdue'] },
    { key: 'pending',  label: 'Pending',  statuses: ['pending'] },
    { key: 'return',   label: 'Returning', statuses: ['return_requested'] },
    { key: 'history',  label: 'History',  statuses: ['returned', 'rejected'] },
];

const LoanCard = ({ loan, onRequestReturn, onShowQR, returning }) => {
    const cfg = STATUS_CONFIG[loan.status] || STATUS_CONFIG.pending;
    const { Icon } = cfg;
    const due = new Date(loan.due_date);
    const isOverdue = loan.is_overdue || loan.status === 'overdue';

    return (
        <Card className="p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{loan.book_title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{loan.book_author}</p>

                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}>
                        <Icon size={12} />
                        {cfg.label}
                    </div>

                    <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                        <p>Requested: {new Date(loan.loan_date).toLocaleDateString()}</p>
                        <p className={isOverdue ? 'text-red-600 font-medium' : ''}>
                            Due: {due.toLocaleDateString()} {isOverdue && '⚠ Overdue'}
                        </p>
                        {loan.return_date && (
                            <p>Returned: {new Date(loan.return_date).toLocaleDateString()}</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                    {loan.status === 'approved' && loan.qr_code && (
                        <Button variant="primary" size="sm" icon={QrCode} onClick={() => onShowQR(loan)}>
                            Show QR
                        </Button>
                    )}
                    {['approved', 'active', 'renewed', 'overdue'].includes(loan.status) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={RotateCcw}
                            disabled={returning === loan.id}
                            onClick={() => onRequestReturn(loan.id)}
                        >
                            {returning === loan.id ? 'Sending…' : 'I Returned It'}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};

const MyLoans = () => {
    const [loans, setLoans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [returning, setReturning] = useState(null);
    const [qrLoan, setQrLoan] = useState(null);

    const fetchLoans = async () => {
        try {
            setIsLoading(true);
            const data = await loanService.getMyLoans();
            setLoans(data);
        } catch {
            toast.error('Failed to load your loans');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchLoans(); }, []);

    const handleRequestReturn = async (loanId) => {
        setReturning(loanId);
        try {
            await loanService.requestReturn(loanId);
            toast.success('Return request sent. The librarian will confirm it shortly.');
            await fetchLoans();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to request return');
        } finally {
            setReturning(null);
        }
    };

    const visibleLoans = loans.filter(l =>
        TABS.find(t => t.key === activeTab)?.statuses.includes(l.status)
    );

    const tabCount = (key) => {
        const tab = TABS.find(t => t.key === key);
        return loans.filter(l => tab?.statuses.includes(l.status)).length;
    };

    if (isLoading) return <MyLoansSkeleton />;

    return (
        <div className="page-container">
            <div className="mb-6">
                <h1 className="section-header mb-1 flex items-center gap-2">
                    <BookMarked size={28} /> My Borrows
                </h1>
                <p className="text-gray-400">Track your borrow requests and approved loans</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === tab.key
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {tab.label}
                        {tabCount(tab.key) > 0 && (
                            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                                activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'
                            }`}>
                                {tabCount(tab.key)}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Loan list */}
            {visibleLoans.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <BookMarked size={48} className="mx-auto mb-3 opacity-30" />
                    <p>No loans in this category</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleLoans.map(loan => (
                        <LoanCard
                            key={loan.id}
                            loan={loan}
                            onRequestReturn={handleRequestReturn}
                            onShowQR={setQrLoan}
                            returning={returning}
                        />
                    ))}
                </div>
            )}

            {/* QR Code Modal */}
            {qrLoan && (
                <Modal
                    isOpen={!!qrLoan}
                    onClose={() => setQrLoan(null)}
                    title="Your Library QR Code"
                >
                    <div className="text-center p-4">
                        <p className="text-sm text-gray-600 mb-4">
                            Show this QR code at the library counter to collect your book.
                        </p>
                        <div className="flex justify-center mb-4">
                            <img
                                src={`data:image/png;base64,${qrLoan.qr_code}`}
                                alt="Loan QR Code"
                                className="w-56 h-56 border rounded-lg shadow"
                            />
                        </div>
                        <div className="text-left bg-gray-50 rounded-lg p-3 text-sm text-gray-700 space-y-1">
                            <p><span className="font-medium">Book:</span> {qrLoan.book_title}</p>
                            <p><span className="font-medium">Due date:</span> {new Date(qrLoan.due_date).toLocaleDateString()}</p>
                        </div>
                        <Button
                            variant="ghost"
                            className="mt-4 w-full"
                            onClick={() => {
                                const a = document.createElement('a');
                                a.href = `data:image/png;base64,${qrLoan.qr_code}`;
                                a.download = `loan-qr-${qrLoan.id}.png`;
                                a.click();
                            }}
                        >
                            Download QR Code
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const MyLoansSkeleton = () => (
    <div className="page-container animate-pulse">
        {/* Header */}
        <div className="mb-6 space-y-2">
            <div className="h-7 w-44 bg-gray-200 rounded" />
            <div className="h-4 w-72 bg-gray-200 rounded" />
        </div>
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-9 w-24 bg-gray-200 rounded-lg" />
            ))}
        </div>
        {/* Loan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-4 space-y-3">
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded" />
                    <div className="h-5 w-20 bg-gray-200 rounded-full" />
                    <div className="space-y-1.5 pt-1">
                        <div className="h-3 w-2/3 bg-gray-200 rounded" />
                        <div className="h-3 w-1/2 bg-gray-200 rounded" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default MyLoans;
