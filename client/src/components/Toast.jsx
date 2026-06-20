import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, X, Check, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

const STYLES = {
    success: { icon: Check,        bg: 'bg-surface border-l-2 border-l-emerald-500', iconClass: 'text-emerald-600', label: 'Done'    },
    archive: { icon: Bookmark,     bg: 'bg-surface border-l-2 border-l-primary',     iconClass: 'text-primary',     label: 'Saved'   },
    error:   { icon: AlertCircle,  bg: 'bg-surface border-l-2 border-l-error',        iconClass: 'text-error',       label: 'Error'   },
    info:    { icon: Info,         bg: 'bg-surface border-l-2 border-l-secondary',    iconClass: 'text-secondary',   label: 'Info'    },
};

const Toast = ({ id, message, type, onDismiss }) => {
    const s = STYLES[type] || STYLES.info;
    const Icon = s.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: 48, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 48 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={`relative flex items-start gap-3 px-5 py-4 min-w-[280px] max-w-[380px] ${s.bg}`}
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}
        >
            <div className={`flex-shrink-0 mt-0.5 ${s.iconClass}`}>
                <Icon size={16} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-medium text-on-surface leading-snug">{message}</p>
                <p className="font-sans text-[11px] text-on-surface-variant/60 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
            <button
                onClick={() => onDismiss(id)}
                className="flex-shrink-0 p-1 text-on-surface-variant/40 hover:text-on-surface transition-colors"
            >
                <X size={14} strokeWidth={1.5} />
            </button>

            {/* Progress bar */}
            <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 4, ease: 'linear' }}
                className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-current opacity-20"
            />
        </motion.div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
        return id;
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        archive: (msg) => addToast(msg, 'archive'),
        error:   (msg) => addToast(msg, 'error'),
        info:    (msg) => addToast(msg, 'info'),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map(t => (
                        <div key={t.id} className="pointer-events-auto">
                            <Toast id={t.id} message={t.message} type={t.type} onDismiss={dismissToast} />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
