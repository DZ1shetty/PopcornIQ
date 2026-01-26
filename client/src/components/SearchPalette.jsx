import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Star, TrendingUp, CornerDownLeft } from 'lucide-react';
import api from '../services/api';

const SearchPalette = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            fetchTrending();
            document.body.style.overflow = 'hidden';
        } else {
            setQuery('');
            setResults([]);
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const fetchTrending = async () => {
        try {
            const res = await api.get('/api/tmdb/trending/today');
            setTrending(res.data.results?.slice(0, 5) || []);
        } catch (err) {
            console.error("Trending scan failed:", err);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                performSearch();
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/tmdb/search?q=${query}`);
            setResults(res.data.results?.slice(0, 20) || []);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (movieId) => {
        onClose();
        navigate(`/movie/${movieId}`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/90 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-[95vw] h-[90vh] flex flex-col bg-[#0a0a0a] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden rounded-xl"
                    >
                        {/* Search Header */}
                        <div className="flex-none flex items-center gap-5 px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                            <div className="relative">
                                <Search className={loading ? "animate-spin text-accent" : "text-white/40"} size={32} />
                                {loading && <div className="absolute inset-0 blur-sm bg-accent/20 animate-pulse rounded-full" />}
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="SEARCH MOVIES..."
                                className="flex-1 bg-transparent text-3xl md:text-4xl font-black uppercase tracking-tighter placeholder-white/10 focus:outline-none text-white selection:bg-accent/30"
                            />
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={onClose}
                                    className="group flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-full transition-all"
                                >
                                    <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white transition-colors">Close</span>
                                    <div className="p-2 bg-white/5 group-hover:bg-white/10 rounded-full text-white/40 group-hover:text-white transition-all transform group-hover:rotate-90">
                                        <X size={20} />
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Content Area - Flex Grow to fill height */}
                        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                            {query ? (
                                <div className="min-h-full flex flex-col">
                                    <div className="flex-none px-8 py-4 border-b border-white/5 bg-accent/5 flex items-center justify-between sticky top-0 z-10 backdrop-blur-xl">
                                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Results</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{results.length} Found</span>
                                    </div>

                                    {results.length > 0 ? (
                                        <div className="flex-1 p-8">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-4">
                                                {results.map((movie, index) => (
                                                    <motion.button
                                                        key={movie.id || index}
                                                        initial={{ opacity: 0, scale: 0.5 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{
                                                            delay: index * 0.03,
                                                            type: "spring",
                                                            stiffness: 300,
                                                            damping: 20
                                                        }}
                                                        onClick={() => handleSelect(movie.id)}
                                                        className="group relative aspect-[2/3] w-full rounded-md overflow-hidden bg-white/5 ring-1 ring-white/10 hover:ring-accent/50 hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.2)] transition-all duration-500"
                                                    >
                                                        <img
                                                            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/342x513?text=N/A'}
                                                            alt={movie.title}
                                                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 grayscale group-hover:grayscale-0"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/342x513?text=No+Image'; }}
                                                        />

                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                                                        <div className="absolute inset-0 p-4 flex flex-col justify-end items-start opacity-100 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                            <div className="w-full flex justify-between items-end mb-1">
                                                                <div className="px-2 py-0.5 bg-accent text-black text-[10px] font-black rounded-sm transform scale-0 group-hover:scale-100 transition-transform duration-300 origin-bottom-left">
                                                                    {movie.vote_average?.toFixed(1) || '0.0'}
                                                                </div>
                                                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{movie.release_date?.split('-')[0]}</span>
                                                            </div>
                                                            <h4 className="w-full text-[11px] font-black uppercase leading-tight text-white/80 group-hover:text-white group-hover:tracking-wide transition-all text-left line-clamp-2">
                                                                {movie.title}
                                                            </h4>
                                                        </div>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : !loading && (
                                        <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-20">
                                            <Search size={64} strokeWidth={0.5} className="mb-8" />
                                            <p className="text-sm font-black uppercase tracking-[1em]">No Matches Found</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col">
                                    <div className="flex-1 p-8">
                                        <div className="w-full">
                                            <div className="flex items-center gap-4 text-accent mb-8">
                                                <TrendingUp size={20} />
                                                <span className="text-xs font-black uppercase tracking-[0.8em]">Trending Now</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {trending.map((movie, i) => (
                                                    <button
                                                        key={`trending-${movie.id}`}
                                                        onClick={() => handleSelect(movie.id)}
                                                        className="group flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all rounded-lg overflow-hidden relative"
                                                    >
                                                        <div className="w-12 h-16 bg-white/5 rounded-sm overflow-hidden flex-none">
                                                            <img
                                                                src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : ''}
                                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                            />
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <h4 className="text-xs font-black uppercase tracking-wider text-white/40 group-hover:text-white transition-colors line-clamp-1">
                                                                {movie.title}
                                                            </h4>
                                                            <span className="text-[10px] font-bold text-white/20 mt-1 block">
                                                                #{i + 1} Trending
                                                            </span>
                                                        </div>
                                                        <CornerDownLeft size={14} className="text-white/10 group-hover:text-accent -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-none px-8 py-8 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-white/10">
                                        <div className="flex items-center gap-8">
                                            <span className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" /> Live Search</span>
                                        </div>
                                        <span>PopcornIQ v2.0</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SearchPalette;
