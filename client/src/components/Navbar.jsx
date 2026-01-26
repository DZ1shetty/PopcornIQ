import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Compass, Layers, Globe, LogOut, User, Brain, Bookmark, Shuffle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

import api from '../services/api';

const Navbar = ({ onDiscoverClick, onSearchClick, onGenreClick, onCountryClick, onMoodClick, onArchiveClick, isSearchOpen, isGenreOpen, isCountryOpen, isMoodOpen, isArchiveOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [hoveredLink, setHoveredLink] = useState(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const currentScrollY = latest;
        const diff = currentScrollY - lastScrollY;
        const isScrollingUp = diff < 0;

        setScrolled(currentScrollY > 50);

        // 🧠 Intelligent Visibility Logic
        // Stay visible if: At top OR Scrolling up OR Overlay is active
        const isAtTop = currentScrollY < 10;
        const isOverlayOpen = isSearchOpen || isGenreOpen || isCountryOpen || isMoodOpen || isArchiveOpen;

        if (isAtTop || isScrollingUp || isOverlayOpen) {
            setVisible(true);
        } else if (currentScrollY > 100 && !isScrollingUp) {
            setVisible(false);
        }

        setLastScrollY(currentScrollY);

        // Calculate scroll progress for the cinematic indicator
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (currentScrollY / totalHeight) * 100;
        setScrollProgress(progress);
    });


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDiscoverClick = () => {
        onDiscoverClick?.();
        navigate('/home');
    };

    const navLinks = [
        {
            name: 'Discover',
            action: handleDiscoverClick,
            icon: Compass,
            key: '/',
            isActive: location.pathname === '/home' && !isGenreOpen && !isCountryOpen && !isSearchOpen && !isMoodOpen && !isArchiveOpen
        },
        {
            name: 'Genres',
            action: onGenreClick,
            icon: Layers,
            key: 'G',
            isActive: isGenreOpen
        },
        {
            name: 'Countries',
            action: onCountryClick,
            icon: Globe,
            key: 'C',
            isActive: isCountryOpen
        },
        {
            name: 'By Mood',
            action: onMoodClick,
            icon: Brain,
            key: 'M',
            isActive: isMoodOpen
        },
        {
            name: 'Watchlist',
            action: onArchiveClick,
            icon: Bookmark,
            key: 'W',
            isActive: isArchiveOpen
        },
        {
            name: 'Surprise Me',
            action: async () => {
                try {
                    // 🎲 Fetch a random page of popular movies (1-50)
                    const randomPage = Math.floor(Math.random() * 50) + 1;
                    const { data } = await api.get(`/api/tmdb/popular?page=${randomPage}`);

                    if (data.results?.length) {
                        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
                        navigate(`/movie/${randomMovie.id}`);
                    }
                } catch (err) {
                    console.error("Surprise Failed:", err);
                }
            },
            icon: Shuffle,
            key: 'R',
            isActive: location.pathname.startsWith('/movie/') && !isSearchOpen && !isGenreOpen && !isCountryOpen && !isMoodOpen && !isArchiveOpen
        }
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[2000] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                } ${scrolled
                    ? 'py-1.5 bg-background/60 backdrop-blur-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)]'
                    : 'py-3 bg-transparent'
                }`}
            style={{
                boxShadow: scrolled ? `0 10px 50px -15px rgba(0,0,0,0.7), 0 1px 0 0 rgba(255,255,255,${0.02 + (scrollProgress / 1000)})` : 'none'
            }}
        >
            {/* Dynamic Signal Aura (Replaces the static white line) */}
            <div
                className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-accent/20 to-transparent transition-all duration-1000"
                style={{
                    opacity: scrolled ? 1 : 0,
                    transform: `scaleX(${0.5 + (scrollProgress / 200)})`,
                    filter: `blur(${4 + (scrollProgress / 20)}px)`
                }}
            />

            <div className="container mx-auto px-8 flex justify-between items-center gap-6">

                {/* Logo Section */}
                <Link
                    to="/"
                    className="group flex items-center gap-2 transition-transform hover:scale-105"
                >
                    <div className="relative h-16 w-auto flex items-center justify-center">
                        <motion.img
                            src="/src/assets/popcorn-logo.png"
                            alt="PopcornIQ Logo"
                            className="h-full w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] filter brightness-125"
                            whileHover={{
                                rotate: [0, -10, 10, -5, 5, 0],
                                scale: 1.1,
                                filter: "brightness(1.5) drop-shadow(0 0 15px rgba(168, 85, 247, 0.6))"
                            }}
                            transition={{
                                duration: 0.6,
                                ease: "easeInOut"
                            }}
                        />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent group-hover:to-white transition-all duration-500">
                        Popcorn<span className="text-accent italic">IQ</span>
                    </span>
                </Link>

                {/* Main Navigation Bridge */}
                <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
                    {navLinks.map((link, idx) => {
                        const isActive = link.isActive;
                        const isHovered = hoveredLink === link.name;

                        return (
                            <motion.button
                                key={link.name}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + (idx * 0.05) }}
                                onClick={link.action || (() => navigate(link.path))}
                                onMouseEnter={() => setHoveredLink(link.name)}
                                onMouseLeave={() => setHoveredLink(null)}
                                className={`relative px-4 py-2 flex items-center gap-2 text-tiny font-black uppercase tracking-wider transition-all duration-500 rounded-full
                                    ${isActive || isHovered ? 'text-white' : 'text-muted/60'}
                                `}
                            >
                                <link.icon size={14} className={isActive || isHovered ? 'text-accent' : ''} />
                                {link.name}

                                {/* Hover/Active Background Pill */}
                                {(isHovered || isActive) && (
                                    <motion.div
                                        layoutId="navPill"
                                        className={`absolute inset-0 rounded-full -z-10 ${isActive ? 'bg-white/10' : 'bg-white/5'}`}
                                        initial={false}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </nav>

                {/* Meta & User Bridge */}
                <div className="flex items-center gap-8">
                    {/* Integrated Search Trigger */}
                    <button
                        onClick={onSearchClick}
                        className={`group flex items-center gap-3 text-tiny font-black uppercase tracking-widest transition-all ${isSearchOpen ? 'text-white' : 'text-muted/60 hover:text-white'}`}
                        title="Search movies"
                    >
                        <div className={`p-2 transition-all transform ${isSearchOpen ? 'rotate-90 text-accent' : 'group-hover:rotate-90 group-hover:text-accent'}`}>
                            <Search size={22} strokeWidth={2.5} />
                        </div>
                        <span className={`hidden xl:inline transition-all duration-500 font-bold uppercase tracking-widest text-xs ${isSearchOpen ? 'opacity-100 translate-x-0' : 'opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0'}`}>
                            Search
                        </span>
                    </button>

                    {/* Authenticated Zone */}
                    <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[9px] text-muted font-bold uppercase tracking-[0.2em] mb-1">Signed in as</span>
                            <span className="text-sm text-white font-extrabold tracking-tight">{user?.email?.split('@')[0]}</span>
                        </div>

                        <div className="relative group">
                            <button
                                onClick={handleLogout}
                                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-surface hover:bg-white hover:text-black transition-all duration-500 group"
                                title="Logout"
                            >
                                <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border border-accent/20 rounded-full scale-0 group-hover:scale-100 transition-all duration-700 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
