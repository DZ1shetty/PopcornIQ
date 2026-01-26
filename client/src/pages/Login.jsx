import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your email and password.');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            navigate('/home');
        } catch (error) {
            console.error(error);
            setError("Google login failed. Please try again.");
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-[420px] space-y-12 relative z-10 bg-white/[0.02] border border-white/10 backdrop-blur-3xl p-10 rounded-3xl shadow-2xl"
            >
                <div className="text-center space-y-4">
                    <motion.div variants={itemVariants} className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl border border-accent/30 flex items-center justify-center bg-accent/5 backdrop-blur-xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
                            <div className="w-3 h-3 bg-accent rounded-full animate-pulse shadow-[0_0_20px_rgba(79,70,229,0.8)]" />
                        </div>
                    </motion.div>
                    <motion.span variants={itemVariants} className="text-sm font-bold uppercase tracking-[0.4em] text-accent/60 block">Welcome Back</motion.span>
                    <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-black tracking-tighter uppercase text-white">Sign In.</motion.h1>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-5 bg-red-500/10 border border-red-500/20 text-sm font-bold uppercase tracking-widest text-red-500 text-center rounded-xl"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    <motion.div variants={itemVariants} className="space-y-4 group">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within:text-accent transition-colors">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="w-full bg-white/5 border border-white/5 px-6 py-5 text-lg font-bold placeholder-white/10 focus:outline-none focus:border-accent transition-all rounded-2xl peer"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent transition-all duration-700 peer-focus:w-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-4 group">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within:text-accent transition-colors">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/5 px-6 py-5 text-lg font-bold placeholder-white/10 focus:outline-none focus:border-accent transition-all rounded-2xl peer"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent transition-all duration-700 peer-focus:w-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                        </div>
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-6 bg-white text-black text-sm font-black uppercase tracking-widest transition-all shadow-2xl relative group overflow-hidden rounded-2xl"
                    >
                        <span className="relative z-10 font-black group-hover:text-white transition-colors duration-500">Sign In</span>
                        <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                    </motion.button>
                </form>

                <div className="space-y-10 pt-4">
                    <motion.div variants={itemVariants} className="relative py-4 flex items-center justify-center">
                        <div className="absolute inset-x-0 h-px bg-white/5"></div>
                        <span className="relative z-10 bg-[#080808] px-6 text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">OR</span>
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGoogleLogin}
                        className="w-full py-5 border border-white/10 flex items-center justify-center gap-6 text-[11px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all rounded-2xl group"
                    >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.153-1.859 4.104-1.191 1.191-3.055 2.39-6.46 2.39-5.203 0-9.255-4.212-9.255-9.414s4.052-9.414 9.255-9.414c2.822 0 4.973 1.111 6.505 2.503l2.31-2.31C18.667 1.258 15.908 0 12.48 0 6.136 0 1.144 4.992 1.144 11.336s4.992 11.336 11.336 11.336c3.42 0 6.002-1.125 8.164-3.391 2.105-2.105 2.768-5.048 2.768-7.399 0-.693-.061-1.341-.177-1.956H12.48z" />
                        </svg>
                        Continue with Google
                    </motion.button>

                    <motion.p variants={itemVariants} className="text-center text-white/20 text-xs font-bold uppercase tracking-widest">
                        New here? <Link to="/register" className="text-white hover:text-accent transition-colors underline decoration-accent/30 underline-offset-8 decoration-2">Create an Account</Link>
                    </motion.p>
                </div>
            </motion.div>

            {/* Background accents */}
            <div className="absolute top-20 right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-20 left-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
        </div>
    );
};

export default Login;
