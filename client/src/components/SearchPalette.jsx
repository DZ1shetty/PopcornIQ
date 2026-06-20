import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CornerDownLeft, Clock } from 'lucide-react';
import api from '../services/api';

const SearchPalette = ({ isOpen, onClose }) => {
    const [query,         setQuery]         = useState('');
    const [results,       setResults]       = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [loading,       setLoading]       = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) setRecentSearches(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 80);
            setSelectedIndex(0);
        } else {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const t = setTimeout(() => {
            if (query.trim()) performSearch();
            else setResults([]);
        }, 300);
        return () => clearTimeout(t);
    }, [query]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const [tmdbRes, localRes] = await Promise.allSettled([
                api.get(`/api/tmdb/search?q=${query}`),
                api.get(`/api/recommendations/search?q=${query}`)
            ]);
            const tmdb  = tmdbRes.status  === 'fulfilled' ? tmdbRes.value.data.results?.slice(0, 6) || [] : [];
            const local = localRes.status === 'fulfilled' ? localRes.value.data?.slice(0, 3) || [] : [];
            const combined = [...tmdb];
            local.forEach(m => {
                if (!combined.some(x => x.id === m.tmdbId || x.title === m.title)) {
                    combined.push({ id: m.tmdbId || m.movieId, isLocal: true, title: m.title, poster_path: m.posterPath, release_date: m.releaseDate?.toString() });
                }
            });
            setResults(combined.slice(0, 8));
            setSelectedIndex(0);
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (movie) => {
        const entry = { id: movie.id, title: movie.title, year: movie.release_date?.split('-')[0] };
        const updated = [entry, ...recentSearches.filter(s => s.id !== movie.id)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
        onClose();
        navigate(`/movie/${movie.id}`);
    };

    const handleKeyDown = (e) => {
        const items = results.length > 0 ? results : (query === '' ? recentSearches : []);
        const total = items.length;
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(p => (p + 1) % total); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(p => (p - 1 + total) % total); }
        else if (e.key === 'Enter' && total > 0) { handleSelect(items[selectedIndex]); }
        else if (e.key === 'Escape') onClose();
    };

    const clearRecent = () => { setRecentSearches([]); localStorage.removeItem('recentSearches'); };

    const displayList = results.length > 0 ? results : (query === '' ? recentSearches : []);
    const isRecent    = results.length === 0 && query === '';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[3000] flex items-start justify-center px-4 pt-24 sm:pt-32">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-md"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: -8 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-full max-w-[640px] bg-surface overflow-hidden flex flex-col"
                        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}
                    >
                        {/* Input Row */}
                        <div className="flex items-center gap-4 px-6 py-4 border-b border-outline-variant/30">
                            <Search
                                size={18}
                                strokeWidth={1.5}
                                className={`flex-shrink-0 transition-colors ${loading ? 'text-primary animate-pulse' : 'text-on-surface-variant/50'}`}
                            />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search films, genres, moods…"
                                className="flex-1 bg-transparent font-sans text-base text-on-surface placeholder:text-on-surface-variant/40 outline-none"
                            />
                            <div className="flex items-center gap-2">
                                <kbd className="font-sans text-[10px] text-on-surface-variant/40 border border-outline-variant/30 px-1.5 py-0.5 rounded-sm">ESC</kbd>
                                <button onClick={onClose} className="p-1 text-on-surface-variant/50 hover:text-on-surface transition-colors">
                                    <X size={16} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="max-h-[60vh] overflow-y-auto scrollbar-hide">

                            {/* Section label */}
                            {displayList.length > 0 && (
                                <div className="flex items-center justify-between px-6 py-3 border-b border-outline-variant/20">
                                    <span className="font-sans text-[10px] text-on-surface-variant/60 uppercase tracking-[0.12em]">
                                        {isRecent ? 'Recent' : 'Results'}
                                    </span>
                                    {isRecent && (
                                        <button onClick={clearRecent} className="font-sans text-[10px] text-on-surface-variant/50 hover:text-primary transition-colors">
                                            Clear
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Item list */}
                            {displayList.map((movie, i) => (
                                <button
                                    key={movie.id ?? `recent-${i}`}
                                    onClick={() => handleSelect(movie)}
                                    onMouseEnter={() => setSelectedIndex(i)}
                                    className={`w-full flex items-center gap-4 px-6 py-3.5 transition-colors text-left cursor-pointer border-b border-outline-variant/10 last:border-0 ${
                                        selectedIndex === i ? 'bg-surface-container' : 'hover:bg-surface-container-low'
                                    }`}
                                >
                                    {/* Poster thumbnail */}
                                    <div className="w-9 h-12 bg-surface-container-high rounded-sm overflow-hidden flex-shrink-0">
                                        {movie.poster_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                                className="w-full h-full object-cover"
                                                alt=""
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                {isRecent
                                                    ? <Clock size={14} className="text-on-surface-variant/40" />
                                                    : <Search size={12} className="text-on-surface-variant/30" />
                                                }
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-sans text-sm font-medium text-on-surface truncate">
                                            {movie.title}
                                        </p>
                                        <p className="font-sans text-xs text-on-surface-variant/60 mt-0.5">
                                            {movie.release_date?.split('-')[0] || movie.year || '—'}
                                            {movie.isLocal && <span className="ml-2 text-[9px] uppercase tracking-wider text-primary/60">Local</span>}
                                        </p>
                                    </div>

                                    {/* Enter hint */}
                                    {selectedIndex === i && (
                                        <CornerDownLeft size={13} className="text-on-surface-variant/40 flex-shrink-0" />
                                    )}
                                </button>
                            ))}

                            {/* Empty state */}
                            {query && !loading && results.length === 0 && (
                                <div className="py-14 flex flex-col items-center gap-3">
                                    <Search size={24} strokeWidth={1} className="text-on-surface-variant/20" />
                                    <p className="font-sans text-sm text-on-surface-variant/50">No results for "{query}"</p>
                                </div>
                            )}

                            {/* Initial empty */}
                            {!query && recentSearches.length === 0 && (
                                <div className="py-12 text-center">
                                    <p className="font-sans text-sm text-on-surface-variant/40">Start typing to search…</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3 border-t border-outline-variant/20 flex items-center gap-6">
                            <div className="flex items-center gap-2 text-on-surface-variant/40">
                                <kbd className="font-sans text-[10px] border border-outline-variant/30 px-1.5 py-0.5 rounded-sm">↑↓</kbd>
                                <span className="font-sans text-[10px]">Navigate</span>
                            </div>
                            <div className="flex items-center gap-2 text-on-surface-variant/40">
                                <kbd className="font-sans text-[10px] border border-outline-variant/30 px-1.5 py-0.5 rounded-sm">↵</kbd>
                                <span className="font-sans text-[10px]">Select</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SearchPalette;
