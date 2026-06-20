import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import api from '../services/api';

const Navbar = ({
    onDiscoverClick,
    onSearchClick,
    onGenreClick,
    onCountryClick,
    onArchiveClick,
    isSearchOpen,
    isGenreOpen,
    isCountryOpen,
    isArchiveOpen,
}) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, 'change', (latest) => {
        requestAnimationFrame(() => {
            const diff = latest - lastScrollY;
            const isScrollingUp = diff < 0;
            const isOverlayOpen = isSearchOpen || isGenreOpen || isCountryOpen || isArchiveOpen;

            setScrolled(latest > 50);
            if (latest < 10 || isScrollingUp || isOverlayOpen) setVisible(true);
            else if (latest > 100 && !isScrollingUp) setVisible(false);

            setLastScrollY(latest);
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            setScrollProgress(totalHeight > 0 ? (latest / totalHeight) * 100 : 0);
        });
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDiscoverClick = () => {
        onDiscoverClick?.();
        navigate('/home');
        setMobileOpen(false);
    };

    const navLinks = [
        {
            name: 'Discover',
            action: handleDiscoverClick,
            isActive: (location.pathname === '/home' || (location.pathname.startsWith('/movie/') && location.state?.from !== 'random')) && !isGenreOpen && !isCountryOpen && !isSearchOpen && !isArchiveOpen,
        },
        { name: 'Genres', action: () => { onGenreClick(); setMobileOpen(false); }, isActive: isGenreOpen },
        { name: 'Countries', action: () => { onCountryClick(); setMobileOpen(false); }, isActive: isCountryOpen },
        { name: 'Vault', action: () => { onArchiveClick(); setMobileOpen(false); }, isActive: isArchiveOpen },
        {
            name: 'PopcornMatch',
            action: () => {
                navigate('/match');
                setMobileOpen(false);
            },
            isActive: location.pathname === '/match',
        },
        {
            name: 'Random',
            action: async () => {
                setMobileOpen(false);
                try {
                    const randomPage = Math.floor(Math.random() * 50) + 1;
                    const { data } = await api.get(`/api/tmdb/popular?page=${randomPage}`);
                    if (data.results?.length) {
                        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
                        navigate(`/movie/${randomMovie.id}`, { state: { from: 'random' } });
                    }
                } catch (err) {
                    console.error('Random failed:', err);
                }
            },
            isActive: location.pathname.startsWith('/movie/') && location.state?.from === 'random',
        },
    ];

    return (
        <motion.header
            animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed top-0 left-0 right-0 z-[2000] transition-all duration-300 ${
                scrolled
                    ? 'bg-background/90 nav-blur border-b border-outline-variant/40 shadow-sm'
                    : 'bg-background/80 nav-blur border-b border-outline-variant/20'
            }`}
        >
            <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">

                {/* Wordmark */}
                <Link
                    to="/home"
                    onClick={onDiscoverClick}
                    className="font-headline text-xl md:text-2xl font-bold tracking-tight text-primary hover:opacity-70 transition-opacity"
                >
                    PopcornIQ
                </Link>

                {/* Desktop Nav Links */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <button
                            key={link.name}
                            onClick={link.action}
                            className={`font-sans text-body-md transition-all py-1 relative group ${
                                link.isActive
                                    ? 'text-primary font-semibold'
                                    : 'text-on-surface-variant hover:text-primary'
                            }`}
                        >
                            {link.name}
                            {/* Animated underline */}
                            <span className={`absolute -bottom-0.5 left-0 h-[2px] bg-primary transition-all duration-300 ${
                                link.isActive ? 'w-full' : 'w-0 group-hover:w-full'
                            }`} />
                        </button>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-sm text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all flex items-center justify-center"
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        <motion.span
                            key={theme}
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="material-symbols-outlined text-[20px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            {theme === 'light' ? 'dark_mode' : 'light_mode'}
                        </motion.span>
                    </button>

                    {/* Search */}
                    <button
                        onClick={onSearchClick}
                        className={`p-2 rounded-sm transition-all hover:bg-surface-container ${
                            isSearchOpen ? 'bg-surface-container text-primary' : 'text-on-surface-variant hover:text-primary'
                        }`}
                        title="Search (Ctrl+K)"
                    >
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </button>

                    {/* Divider */}
                    <div className="hidden sm:block w-px h-5 bg-outline-variant/50" />

                    {/* User identity + logout */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="font-sans text-label-sm text-on-surface-variant leading-none">{user?.email?.split('@')[0]}</span>
                        </div>

                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/40 bg-surface-container-high flex-shrink-0">
                            <div className="w-full h-full flex items-center justify-center bg-primary text-on-primary text-label-sm font-semibold">
                                {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            title="Sign out"
                            className="hidden sm:flex p-2 rounded-sm text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                        </button>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="flex lg:hidden p-2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">{mobileOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>
            </div>

            {/* Scroll Progress Line */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-outline-variant/20 overflow-hidden">
                <motion.div
                    className="h-full bg-primary origin-left"
                    style={{ scaleX: scrollProgress / 100 }}
                />
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="lg:hidden bg-background border-b border-outline-variant/30 px-margin-mobile py-4 space-y-1"
                >
                    {navLinks.map((link) => (
                        <button
                            key={link.name}
                            onClick={link.action}
                            className={`w-full text-left py-3 font-sans text-body-md border-b border-outline-variant/20 last:border-0 transition-colors ${
                                link.isActive ? 'text-primary font-semibold' : 'text-on-surface-variant'
                            }`}
                        >
                            {link.name}
                        </button>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="w-full text-left py-3 font-sans text-body-md text-on-surface-variant transition-colors"
                    >
                        Sign out
                    </button>
                </motion.div>
            )}
        </motion.header>
    );
};

export default Navbar;
