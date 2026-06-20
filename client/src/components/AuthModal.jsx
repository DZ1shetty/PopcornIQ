import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, initialMode = 'login', onClose }) {
    const { login, register, loginWithGoogle } = useAuth();
    
    const [mode, setMode] = useState(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setEmail('');
            setPassword('');
            setUsername('');
            setError('');
        }
    }, [isOpen, initialMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
                onClose();
            } else {
                await register(username, email, password);
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
            onClose();
        } catch (err) {
            setError(err.message || 'Google Sign-In failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[2000] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-full max-w-md bg-background/95 backdrop-blur-2xl rounded-[24px] border border-outline-variant/20 overflow-hidden shadow-[0_8px_40px_rgb(0,0,0,0.08)]"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface bg-surface-variant/30 hover:bg-surface-variant/50 rounded-full p-1.5 transition-colors flex items-center justify-center"
                            aria-label="Close"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>

                        <div className="p-8 md:p-10">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h2 className="font-sans text-2xl font-bold tracking-tight text-primary mb-2">
                                    {mode === 'login' ? 'Welcome back' : 'Create an account'}
                                </h2>
                                <p className="font-sans text-sm text-on-surface-variant">
                                    {mode === 'login' 
                                        ? 'Enter your details to access your vault.' 
                                        : 'Join to track, discover, and analyze cinema.'}
                                </p>
                            </div>

                            {/* Error Message */}
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-6 bg-error/10 text-error rounded-xl p-3 text-sm text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                {mode === 'register' && (
                                    <div>
                                        <label className="block font-sans text-xs font-medium text-on-surface-variant/80 mb-1.5 ml-1">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required={mode === 'register'}
                                            className="w-full bg-surface-variant/30 border-none rounded-xl px-4 py-3.5 text-on-surface font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/50"
                                            placeholder="cinemaphile"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block font-sans text-xs font-medium text-on-surface-variant/80 mb-1.5 ml-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-surface-variant/30 border-none rounded-xl px-4 py-3.5 text-on-surface font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/50"
                                        placeholder="hello@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block font-sans text-xs font-medium text-on-surface-variant/80 mb-1.5 ml-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-surface-variant/30 border-none rounded-xl px-4 py-3.5 text-on-surface font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/50"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-2 w-full bg-primary text-on-primary rounded-xl py-3.5 font-sans text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                                >
                                    {loading && <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>}
                                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-[1px] bg-outline-variant/20" />
                                <span className="font-sans text-xs text-on-surface-variant/60 uppercase tracking-widest">or</span>
                                <div className="flex-1 h-[1px] bg-outline-variant/20" />
                            </div>

                            {/* Google Sign In */}
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full bg-transparent border border-outline-variant/30 text-on-surface rounded-xl py-3.5 font-sans text-sm font-medium hover:bg-surface-variant/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    <path d="M1 1h22v22H1z" fill="none" />
                                </svg>
                                Continue with Google
                            </button>

                            {/* Toggle Mode */}
                            <div className="mt-8 text-center font-sans text-sm text-on-surface-variant">
                                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    type="button"
                                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                                >
                                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
