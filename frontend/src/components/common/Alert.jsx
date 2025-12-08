import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { useEffect } from 'react';

const Alert = ({
    type = 'info',
    message,
    onClose,
    autoClose = false,
    autoCloseDelay = 5000
}) => {
    useEffect(() => {
        if (autoClose && onClose) {
            const timer = setTimeout(onClose, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [autoClose, autoCloseDelay, onClose]);

    const types = {
        success: {
            icon: CheckCircle,
            bgClass: 'bg-green-500/20 border-green-500/30',
            textClass: 'text-green-300',
            iconClass: 'text-green-400',
        },
        error: {
            icon: XCircle,
            bgClass: 'bg-red-500/20 border-red-500/30',
            textClass: 'text-red-300',
            iconClass: 'text-red-400',
        },
        warning: {
            icon: AlertCircle,
            bgClass: 'bg-yellow-500/20 border-yellow-500/30',
            textClass: 'text-yellow-300',
            iconClass: 'text-yellow-400',
        },
        info: {
            icon: Info,
            bgClass: 'bg-blue-500/20 border-blue-500/30',
            textClass: 'text-blue-300',
            iconClass: 'text-blue-400',
        },
    };

    const { icon: Icon, bgClass, textClass, iconClass } = types[type] || types.info;

    return (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${bgClass} ${textClass} animate-slide-down`}>
            <Icon className={iconClass} size={20} />
            <p className="flex-1 text-sm font-medium">{message}</p>
            {onClose && (
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
};

export default Alert;
