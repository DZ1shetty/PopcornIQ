import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, X, Check, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const Toast = ({ id, message, type, onDismiss }) => {
    const icons = {
        success: Check,
        archive: Bookmark,
        error: AlertCircle,
        info: Info
    };

    const colors = {
        success: 'border-green-500/30 bg-green-500/10',
        archive: 'border-accent/30 bg-accent/10',
        error: 'border-red-500/30 bg-red-500/10',
        info: 'border-blue-500/30 bg-blue-500/10'
    };

    const iconColors = {
        success: 'text-green-400',
        archive: 'text-accent',
        error: 'text-red-400',
        info: 'text-blue-400'
    };

    const labels = {
        success: 'Success',
        archive: 'Added to Watchlist',
        error: 'Error',
        info: 'Info'
    };

    const Icon = icons[type] || icons.info;

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`relative flex items-center gap-4 px-5 py-4 border backdrop-blur-xl shadow-2xl min-w-[320px] max-w-[420px] ${colors[type] || colors.info}`}
        >
            {/* Glow Effect */}
            <div className={`absolute inset-0 opacity-20 blur-xl ${type === 'archive' ? 'bg-accent' : type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} />

            {/* Content */}
            <div className="relative z-10 flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 flex items-center justify-center border ${colors[type]} rounded-lg`}>
                    <Icon className={`w-5 h-5 ${iconColors[type]}`} />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{message}</p>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">
                        {labels[type]}
                    </span>
                </div>

                <button
                    onClick={() => onDismiss(id)}
                    className="p-2 text-white/30 hover:text-white/60 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Progress Bar */}
            <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 4, ease: 'linear' }}
                className={`absolute bottom-0 left-0 right-0 h-[2px] origin-left ${type === 'archive' ? 'bg-accent' : type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
            />
        </motion.div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto dismiss after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);

        return id;
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Convenience methods
    const toast = {
        success: (message) => addToast(message, 'success'),
        archive: (message) => addToast(message, 'archive'),
        error: (message) => addToast(message, 'error'),
        info: (message) => addToast(message, 'info'),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}

            {/* Toast Container - Bottom Right */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map(t => (
                        <div key={t.id} className="pointer-events-auto">
                            <Toast
                                id={t.id}
                                message={t.message}
                                type={t.type}
                                onDismiss={dismissToast}
                            />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
