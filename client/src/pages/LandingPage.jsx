import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

// 🎬 Expanded High-Res Poster Collection
const ALL_POSTERS = [
    "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHkjPoBPO86.jpg", // Spirited Away
    "https://image.tmdb.org/t/p/w500/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg", // Pulp Fiction
    "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", // Interstellar
    "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", // Shawshank
    "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOtrC.jpg", // LOTR
    "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", // Fight Club
    "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", // Matrix
    "https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg", // Forrest Gump
    "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", // Spiderverse
    "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", // Dark Knight
    "https://image.tmdb.org/t/p/w500/ccWzA5qkHzpKbTvphyvJ50cZ2S3.jpg", // Goodfellas
    "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", // Parasite
    "https://image.tmdb.org/t/p/w500/3bhkrj072XJqQdvcaPZh691cn2.jpg", // City of God
    "https://image.tmdb.org/t/p/w500/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg", // Whiplash
    "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGOtFeqh.jpg", // Dune
    "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", // LOTR: Fellowship
    "https://image.tmdb.org/t/p/w500/bMV85a4X0c3d97u8l9f7J5i5x8.jpg", // Godfather
    "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyScyJ6fFpp2n.jpg", // Infinity War
    "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", // Pulp Fiction (Alt)
    "https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg", // Forrest Gump (Alt)
    "https://image.tmdb.org/t/p/w500/5KCVkau1HEl7ZzfPsKAPM0sMiKc.jpg", // Eternal Sunshine
    "https://image.tmdb.org/t/p/w500/iCvjmXz8O45H2fFZB1FjM4U8D.jpg", // Pirates
    "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOtrC.jpg", // LOTR: Return
    "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyLXw3e06BCiduvTu.jpg", // Fight Club (Alt)
    "https://image.tmdb.org/t/p/w500/8kOWDBK6XlPUzckuHDoKLMNSJ64.jpg", // 12 Angry Men
    "https://image.tmdb.org/t/p/w500/w7EmzbGYgrG4VeX0gOM2M353.jpg", // Seven Samurai
    "https://image.tmdb.org/t/p/w500/u3bZgnGQ9TWAkHiFAkYUi9z48.jpg", // Spirited Away (Alt)
    "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOtrC.jpg", // Lord of the Rings
    "https://image.tmdb.org/t/p/w500/2LqaLgk4Z226KkgPJuiOQ58.jpg", // Good, Bad, Ugly
    "https://image.tmdb.org/t/p/w500/3bhkrj072XJqQdvcaPZh691cn2.jpg", // Matrix (Alt)
    "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", // Shawshank
    "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", // Inception
    "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", // Interstellar (Alt)
    "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", // Parasite (Alt)
    "https://image.tmdb.org/t/p/w500/lIVE4V7LZt1B3wFz0BgV8D9.jpg", // Green Mile
    "https://image.tmdb.org/t/p/w500/c8Ass7acuOe4za6FyQHbuWglD0k.jpg", // Pianist
    "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", // Dark Knight (Alt)
    "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", // Spider-Man
    "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", // Fight Club
    "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyScyJ6fFpp2n.jpg", // Avengers
];

// Helper to shuffle array
const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

// 🎞️ Custom Hook: Cipher Text Effect
const useScrambleText = (targetText, speed = 30) => {
    const [text, setText] = useState(targetText);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

    useEffect(() => {
        let iteration = 0;
        let interval = null;

        const startScramble = () => {
            interval = setInterval(() => {
                setText(prev =>
                    targetText.split("").map((letter, index) => {
                        if (index < iteration) return targetText[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    }).join("")
                );

                if (iteration >= targetText.length) clearInterval(interval);
                iteration += 1 / 3;
            }, speed);
        };

        const timeout = setTimeout(startScramble, 500); // Slight delay before start

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [targetText, speed]);

    return text;
};

// 🎥 Film Grain Overlay
const FilmGrain = () => (
    <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.07] mix-blend-overlay">
        <svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'>
            <filter id='noise'>
                <feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch' />
            </filter>
            <rect width='100%' height='100%' filter='url(#noise)' />
        </svg>
    </div>
);

const CinemaColumn = ({ duration, posterSet }) => (
    <motion.div
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
        className="flex flex-col gap-6 w-full"
    >
        {[...posterSet, ...posterSet].map((src, i) => (
            <div key={i} className="w-full aspect-[2/3] rounded-xl overflow-hidden relative">
                <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
        ))}
    </motion.div>
);

const CinemaWallLayer = ({ opacity = 1, grayscale = 0, blur = 0, mask = false }) => {
    // Distribute posters uniquely across columns using useMemo to avoid re-shuffling on every render
    const columns = useMemo(() => {
        const shuffled = shuffle(ALL_POSTERS);
        return [
            shuffled.slice(0, 8),
            shuffled.slice(8, 16),
            shuffled.slice(16, 24),
            shuffled.slice(24, 32),
            shuffled.slice(32, 40)
        ];
    }, []);

    return (
        <div
            className="absolute inset-0 overflow-hidden flex gap-4 md:gap-8 justify-center min-w-[120%] -translate-x-[10%] rotate-6 scale-110 pointer-events-none"
            style={{
                opacity,
                filter: `grayscale(${grayscale}%) blur(${blur}px)`,
                maskImage: mask ? 'radial-gradient(circle 350px at var(--mouse-x) var(--mouse-y), black 0%, transparent 100%)' : 'none',
                WebkitMaskImage: mask ? 'radial-gradient(circle 350px at var(--mouse-x) var(--mouse-y), black 0%, transparent 100%)' : 'none',
            }}
        >
            <div className="w-1/4 md:w-1/5 lg:w-1/6 pt-[20%]"><CinemaColumn duration={55} posterSet={columns[0]} /></div>
            <div className="w-1/4 md:w-1/5 lg:w-1/6"><CinemaColumn duration={45} posterSet={columns[1]} /></div>
            <div className="w-1/4 md:w-1/5 lg:w-1/6 pt-[40%]"><CinemaColumn duration={65} posterSet={columns[2]} /></div>
            <div className="w-1/4 md:w-1/5 lg:w-1/6 hidden md:block"><CinemaColumn duration={50} posterSet={columns[3]} /></div>
            <div className="w-1/4 md:w-1/5 lg:w-1/6 hidden lg:block pt-[10%]"><CinemaColumn duration={60} posterSet={columns[4]} /></div>
        </div>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, login, loginWithGoogle, register } = useAuth();
    const [mode, setMode] = useState('hero');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ email: '', password: '', username: '' });

    // Cipher Text
    const popcornText = useScrambleText("POPCORN");
    const iqText = useScrambleText("IQ");

    useEffect(() => {
        if (location.pathname === '/login') setMode('login');
        else if (location.pathname === '/register') setMode('register');
        else setMode('hero');
    }, [location.pathname]);

    // Enhanced Mouse Tracking for Lens
    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        document.documentElement.style.setProperty('--mouse-x', `${clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${clientY}px`);
    };

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (mode === 'login') await login(formData.email, formData.password);
            else await register(formData.username, formData.email, formData.password);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed.');
        }
    };

    const handleGoogle = async () => {
        try {
            await loginWithGoogle();
            navigate('/home');
        } catch (err) {
            setError("Google login failed.");
        }
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            className="min-h-screen bg-black text-white overflow-hidden relative flex flex-col font-sans"
        >
            <FilmGrain />

            {/* LAYER 1: The 'Archive' - Ghostly, blurred, monochromatic */}
            <div className="absolute inset-0 z-0 opacity-40">
                <CinemaWallLayer grayscale={100} blur={3} />
            </div>

            {/* LAYER 2: The 'Reveal' - Sharp, vibrant, revealed by flashlight */}
            <div className="absolute inset-0 z-10 transition-opacity duration-700">
                <CinemaWallLayer mask={true} />
            </div>

            {/* Vignette Overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

            <main className="flex-1 relative z-30 flex flex-col items-center justify-center min-h-screen px-4">
                <AnimatePresence mode="wait">
                    {mode === 'hero' ? (
                        <motion.div
                            key="hero"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="text-center space-y-10 max-w-5xl"
                        >
                            <div className="space-y-4 mix-blend-screen">
                                <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black uppercase tracking-tighter leading-[0.85] text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] select-none whitespace-nowrap">
                                    <span className="inline-block mr-1 md:mr-4">{popcornText}</span>
                                    <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">{iqText}</span>
                                </h1>
                            </div>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 1 }}
                                className="text-xl md:text-2xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed tracking-wide"
                            >
                                UNLEASH CINEMA. <span className="text-white">REDEFINE DISCOVERY.</span><br />
                                <span className="text-sm opacity-50 block mt-4 font-normal tracking-widest">THE ULTIMATE MOVIE EXPERIENCE AWAITS.</span>
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                                className="flex flex-wrap justify-center gap-8 pt-6"
                            >
                                <button
                                    onClick={() => navigate(user ? '/home' : '/register')}
                                    className="group relative px-12 py-6 bg-white text-black overflow-hidden rounded-full shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_80px_-20px_rgba(255,255,255,0.6)] transition-all transform hover:scale-105"
                                >
                                    <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.83,0,0.17,1)]" />
                                    <span className="relative z-10 flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                                        {user ? 'Go to Dashboard' : 'Get Started'}
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </span>
                                </button>

                                {!user && (
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="px-12 py-6 rounded-full border border-white/10 hover:bg-white/5 text-sm font-bold uppercase tracking-[0.2em] transition-all text-white/50 hover:text-white backdrop-blur-md"
                                    >
                                        Log In
                                    </button>
                                )}
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="auth"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4 }}
                            className="w-full max-w-[380px]"
                        >
                            <div className="bg-black/60 border border-white/10 backdrop-blur-2xl p-8 rounded-3xl relative overflow-hidden shadow-2xl">
                                <form onSubmit={handleAuthAction} className="space-y-6 relative z-10">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-xl font-black uppercase tracking-widest">{mode === 'register' ? 'Sign Up' : 'Welcome Back'}</h3>
                                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Secure Login</p>
                                        </div>
                                        <button type="button" onClick={() => navigate('/')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors">✕</button>
                                    </div>

                                    <div className="space-y-4">
                                        {mode === 'register' && (
                                            <div className="group space-y-2">
                                                <label className="text-[9px] font-bold uppercase tracking-widest text-accent/80">Username</label>
                                                <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full bg-transparent border-b border-white/10 py-2 text-sm font-bold focus:border-accent outline-none transition-all placeholder-white/10 text-white" placeholder="Display Name" />
                                            </div>
                                        )}
                                        <div className="group space-y-2">
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-accent/80">Email Address</label>
                                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-transparent border-b border-white/10 py-2 text-sm font-bold focus:border-accent outline-none transition-all placeholder-white/10 text-white" placeholder="name@example.com" />
                                        </div>
                                        <div className="group space-y-2">
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-accent/80">Password</label>
                                            <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-transparent border-b border-white/10 py-2 text-sm font-bold focus:border-accent outline-none transition-all placeholder-white/10 text-white" placeholder="••••••••" />
                                        </div>
                                    </div>

                                    {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider text-center border border-red-500/20 py-2 rounded bg-red-500/5">{error}</p>}

                                    <div className="pt-4 space-y-4">
                                        <button type="submit" className="w-full py-4 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded-sm hover:bg-accent hover:text-white transition-all">
                                            {mode === 'register' ? 'Create Account' : 'Sign In'}
                                        </button>
                                        <div className="flex items-center gap-4 opacity-30"><div className="h-px bg-white flex-1" /> <span className="text-[9px] font-bold uppercase">OR</span> <div className="h-px bg-white flex-1" /></div>
                                        <button type="button" onClick={handleGoogle} className="w-full py-3 border border-white/10 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-white/60">
                                            Continue with Google
                                        </button>
                                    </div>

                                    <div className="text-center pt-2">
                                        <button type="button" onClick={() => navigate(mode === 'login' ? '/register' : '/login')} className="text-[9px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors">
                                            {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default LandingPage;
