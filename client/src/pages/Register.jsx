import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(username, email, password);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                        <div className="w-16 h-16 rounded-2xl border border-accent/30 flex items-center justify-center bg-accent/5 backdrop-blur-xl -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                            <div className="w-3 h-3 bg-accent rounded-full animate-pulse shadow-[0_0_20px_rgba(79,70,229,0.8)]" />
                        </div>
                    </motion.div>
                    <motion.span variants={itemVariants} className="text-sm font-bold uppercase tracking-[0.4em] text-accent/60 block">Join the Cinema</motion.span>
                    <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-black tracking-tighter uppercase text-white">Sign Up.</motion.h1>
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

                <form onSubmit={handleSubmit} className="space-y-8">
                    <motion.div variants={itemVariants} className="space-y-4 group">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within:text-accent transition-colors">Username</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="What should we call you?"
                                className="w-full bg-white/5 border border-white/5 px-6 py-5 text-lg font-bold placeholder-white/10 focus:outline-none focus:border-accent transition-all rounded-2xl peer"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent transition-all duration-700 peer-focus:w-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                        </div>
                    </motion.div>

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
                        <span className="relative z-10 font-black group-hover:text-white transition-colors duration-500">Create Account</span>
                        <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                    </motion.button>
                </form>

                <div className="pt-8 space-y-6 text-center">
                    <motion.p variants={itemVariants} className="text-white/20 text-xs font-bold uppercase tracking-widest">
                        Already have an account? <Link to="/login" className="text-white hover:text-accent transition-colors underline decoration-accent/30 underline-offset-8 decoration-2">Sign In</Link>
                    </motion.p>
                </div>
            </motion.div>

            {/* Background accents */}
            <div className="absolute top-20 left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-20 right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
        </div>
    );
};

export default Register;
