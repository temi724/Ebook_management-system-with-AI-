import { Loader2 } from 'lucide-react';

const Loading = ({ fullScreen = false, message = 'Loading...' }) => {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-primary-950 z-50">
                <div className="text-center">
                    <Loader2 className="animate-spin text-primary-500 mx-auto mb-4" size={48} />
                    <p className="text-gray-300 text-lg">{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12">
            <div className="text-center">
                <Loader2 className="animate-spin text-primary-500 mx-auto mb-4" size={40} />
                <p className="text-gray-400">{message}</p>
            </div>
        </div>
    );
};

export default Loading;
