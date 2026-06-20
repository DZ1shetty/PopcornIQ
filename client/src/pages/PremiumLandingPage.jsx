import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

// ─── Stitch Modern Minimalist Landing Page ──────────────────
// Based on Google Stitch Project 14561224589255632075

const HERO_IMAGE =
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=85';



const COLLECTIONS = [
    {
        label: "The Archivist's Selection",
        desc: 'Explore the greatest cinematic achievements of the decade, remastered in Dolby Vision.',
        img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&q=80',
        size: 'large',
    },
    {
        label: 'Quiet Stories',
        img: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=600&q=80',
        size: 'small',
    },
    {
        label: 'Urban Pulse',
        img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80',
        size: 'small',
    },
];

const FADE_UP = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const STAGGER = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Sub-components ──────────────────────────────────────────

const TopNav = ({ onGetStarted, user, onEnter }) => {
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
            scrolled ? 'bg-background/90 nav-blur border-b border-outline-variant/40 shadow-sm' : 'bg-transparent'
        }`}>
            <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                <span className="font-headline text-xl md:text-2xl font-bold tracking-tight text-primary">
                    PopcornIQ
                </span>
                <div className="flex items-center gap-6">
                    <button
                        onClick={user ? onEnter : () => navigate('/login')}
                        className="font-sans text-label-md text-on-surface-variant hover:text-primary transition-colors py-1"
                    >
                        {user ? 'Discover' : 'Sign In'}
                    </button>
                    <button
                        onClick={user ? onEnter : onGetStarted}
                        className="bg-primary text-on-primary px-6 py-2.5 font-sans text-label-md font-semibold tracking-wider transition-all hover:opacity-90"
                    >
                        {user ? 'Open App' : 'GET STARTED'}
                    </button>
                </div>
            </div>
        </nav>
    );
};

// ─── Main Component ───────────────────────────────────────────

const PremiumLandingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const heroRef = useRef(null);

    const isAuthModalOpen = location.pathname === '/login' || location.pathname === '/register';
    const initialAuthMode = location.pathname === '/register' ? 'register' : 'login';

    const handleCloseAuth = () => {
        navigate('/');
    };

    // Subtle parallax on hero image
    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;
        const onScroll = () => {
            hero.style.transform = `translateY(${window.scrollY * 0.08}px) scale(1.05)`;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleGetStarted = () => navigate('/register');
    const handleEnter = () => navigate('/home');

    return (
        <div className="bg-background text-on-surface min-h-screen overflow-x-hidden">

            <AuthModal 
                isOpen={isAuthModalOpen} 
                initialMode={initialAuthMode} 
                onClose={handleCloseAuth} 
            />

            {/* ─── Navigation ─────────────────────────────── */}
            <TopNav onGetStarted={handleGetStarted} user={user} onEnter={handleEnter} />

            {/* ─── Hero Section ────────────────────────────── */}
            <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden">
                {/* Background image */}
                <img
                    ref={heroRef}
                    src={HERO_IMAGE}
                    alt="Cinema"
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                    style={{ transformOrigin: 'center top' }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 hero-gradient" />

                {/* Content */}
                <div className="relative h-full flex items-end pb-24 md:pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={STAGGER}
                        className="max-w-2xl"
                    >

                        <motion.h1 variants={FADE_UP} className="font-headline text-display-lg-mobile md:text-display-lg text-primary mb-6 leading-none font-bold">
                            {user ? 'Your Cinema,\nRediscovered.' : 'Cinema Without\nCompromise.'}
                        </motion.h1>
                        <motion.p variants={FADE_UP} className="font-sans text-body-lg text-on-surface-variant mb-10 max-w-lg font-semibold">
                            Discover, track, and analyse films with intelligence. A cinematic experience designed for those who truly see.
                        </motion.p>
                        <motion.div variants={FADE_UP} className="flex flex-wrap gap-4">
                            <button
                                onClick={user ? handleEnter : handleGetStarted}
                                className="btn-primary"
                            >
                                {user ? 'EXPLORE NOW' : 'BEGIN JOURNEY'}
                            </button>
                            {!user && (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="btn-outline"
                                >
                                    SIGN IN
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </section>



            {/* ─── Featured Collections (Bento) ──────────────── */}
            <section className="py-24">
                <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={STAGGER}
                        className="mb-12"
                    >
                        <motion.h2 variants={FADE_UP} className="font-headline text-headline-lg text-primary mb-2">
                            Featured Collections
                        </motion.h2>
                        <motion.p variants={FADE_UP} className="font-sans text-body-md text-on-surface-variant">
                            Curated cinematic experiences for the true enthusiast.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-60px' }}
                        variants={STAGGER}
                        className="grid grid-cols-1 md:grid-cols-12 gap-gutter h-auto md:h-[560px]"
                    >
                        {/* Large feature card */}
                        <motion.div
                            variants={FADE_UP}
                            className="md:col-span-8 relative group overflow-hidden rounded-sm cursor-pointer"
                            onClick={user ? handleEnter : handleGetStarted}
                        >
                            <img
                                src={COLLECTIONS[0].img}
                                alt={COLLECTIONS[0].label}
                                className="w-full h-64 md:h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-10">
                                <h4 className="font-headline text-headline-md text-white mb-2">{COLLECTIONS[0].label}</h4>
                                <p className="text-white/80 font-sans text-body-md max-w-md mb-6 hidden md:block">
                                    {COLLECTIONS[0].desc}
                                </p>
                                <button className="w-fit bg-white text-black px-6 py-2.5 font-sans text-label-md font-semibold tracking-wider hover:bg-surface-container-highest transition-colors">
                                    EXPLORE COLLECTION
                                </button>
                            </div>
                        </motion.div>

                        {/* Side cards */}
                        <motion.div variants={FADE_UP} className="md:col-span-4 grid grid-rows-2 gap-gutter">
                            {COLLECTIONS.slice(1).map((col) => (
                                <div
                                    key={col.label}
                                    className="relative group overflow-hidden rounded-sm cursor-pointer"
                                    onClick={user ? handleEnter : handleGetStarted}
                                >
                                    <img
                                        src={col.img}
                                        alt={col.label}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 min-h-[180px]"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 text-center">
                                        <h4 className="font-headline text-headline-md text-white">{col.label}</h4>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>


            {/* ─── Premium CTA ─────────────────────────────────── */}
            <section className="py-32 text-center">
                <div className="px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={STAGGER}
                    >
                        <motion.span variants={FADE_UP} className="font-sans text-label-md text-on-surface-variant tracking-[0.3em] mb-6 block uppercase">
                            Beyond the Frame
                        </motion.span>
                        <motion.h2 variants={FADE_UP} className="font-headline text-3xl md:text-5xl text-primary mb-8 font-semibold leading-tight">
                            Unrivaled Discovery.<br />Unmatched Intelligence.
                        </motion.h2>
                        <motion.p variants={FADE_UP} className="font-sans text-body-lg text-on-surface-variant mb-12 max-w-xl mx-auto">
                            PopcornIQ is more than a catalogue — it's a dedication to the art of cinema. Experience every film as it was meant to be found.
                        </motion.p>
                        <motion.div variants={FADE_UP} className="flex flex-col md:flex-row justify-center gap-6">
                            <button
                                onClick={user ? handleEnter : handleGetStarted}
                                className="btn-primary mx-auto md:mx-0"
                            >
                                {user ? 'OPEN APP' : 'START FOR FREE'}
                            </button>
                            {!user && (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="btn-outline mx-auto md:mx-0"
                                >
                                    SIGN IN
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ─── Footer ──────────────────────────────────────── */}
            <footer className="py-12">
                <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto gap-gutter">
                    <div className="flex flex-col items-center md:items-start gap-3">
                        <span className="font-headline text-headline-md text-primary">PopcornIQ</span>
                        <p className="font-sans text-label-sm text-secondary">
                            © {new Date().getFullYear()} PopcornIQ. All rights reserved.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8">
                        {['Privacy Policy', 'Terms of Service', 'Help Center', 'Contact'].map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="font-sans text-label-sm text-secondary hover:text-primary transition-colors"
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <span className="material-symbols-outlined text-secondary hover:text-primary transition-colors cursor-pointer text-[20px]">public</span>
                        <span className="material-symbols-outlined text-secondary hover:text-primary transition-colors cursor-pointer text-[20px]">rss_feed</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PremiumLandingPage;
