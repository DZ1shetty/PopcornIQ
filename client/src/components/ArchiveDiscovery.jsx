import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWatchlist } from '../context/WatchlistContext';
import MovieCard from './MovieCard';
import { X, Bookmark, Trash2, Grid3X3, List, Star, Search, Filter } from 'lucide-react';

const ArchiveDiscovery = ({ isOpen, onClose }) => {
    const { watchlistData, loading, removeFromWatchlist } = useWatchlist();
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('addedAt');
    const [filterText, setFilterText] = useState('');

    // ESC to close
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    const movies = useMemo(() => {
        let list = [...watchlistData];
        if (filterText.trim()) {
            list = list.filter(m => m.title?.toLowerCase().includes(filterText.toLowerCase()));
        }
        if (sortBy === 'rating') list.sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0));
        else if (sortBy === 'title') list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        return list;
    }, [watchlistData, sortBy, filterText]);

    const handleRemove = async (movieId, e) => {
        e.preventDefault();
        e.stopPropagation();
        await removeFromWatchlist(movieId);
    };

    const avgRating = watchlistData.length
        ? (watchlistData.reduce((acc, m) => acc + (m.voteAverage || 0), 0) / watchlistData.length).toFixed(1)
        : '—';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1500] flex flex-col pt-16 bg-background">
                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 24 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col w-full max-w-[1400px] mx-auto h-full"
                    >
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-6 border-b border-outline-variant/30 flex-shrink-0">
                            <div>
                                <p className="font-sans text-xs text-on-surface-variant tracking-[0.15em] uppercase mb-1">Your Collection</p>
                                <h2 className="font-headline text-2xl text-primary font-semibold flex items-center gap-3">
                                    <Bookmark size={20} strokeWidth={1.5} className="text-on-surface-variant/50" />
                                    Saved Films
                                    {!loading && <span className="font-sans text-sm font-normal text-on-surface-variant">({watchlistData.length})</span>}
                                </h2>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" strokeWidth={1.5} />
                                    <input
                                        type="text"
                                        value={filterText}
                                        onChange={e => setFilterText(e.target.value)}
                                        placeholder="Filter…"
                                        className="input-minimal pl-9 py-2 text-sm max-w-[180px]"
                                    />
                                </div>

                                {/* Sort */}
                                <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/30 px-3 py-2 rounded-sm">
                                    <Filter size={13} className="text-on-surface-variant/60" strokeWidth={1.5} />
                                    <select
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value)}
                                        className="bg-transparent font-sans text-xs text-on-surface focus:outline-none cursor-pointer"
                                    >
                                        <option value="addedAt">Newest</option>
                                        <option value="rating">Best Rated</option>
                                        <option value="title">A–Z</option>
                                    </select>
                                </div>

                                {/* View toggle */}
                                <div className="flex border border-outline-variant/30 rounded-sm overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface-variant hover:text-primary'}`}
                                        title="Grid view"
                                    >
                                        <Grid3X3 size={14} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface-variant hover:text-primary'}`}
                                        title="List view"
                                    >
                                        <List size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide p-8" data-lenis-prevent="true">
                            {/* Loading */}
                            {loading && (
                                <div className="flex justify-center py-16">
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}

                            {/* Empty state */}
                            {!loading && movies.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-24 text-center">
                                    <Bookmark size={36} strokeWidth={1} className="text-on-surface-variant/20 mb-6" />
                                    <h3 className="font-headline text-xl text-primary font-semibold mb-2">
                                        {filterText ? 'No matching films' : 'Nothing saved yet'}
                                    </h3>
                                    <p className="font-sans text-sm text-on-surface-variant max-w-sm mb-8">
                                        {filterText
                                            ? 'Try a different search term.'
                                            : 'Browse films and click the bookmark icon to save them here.'
                                        }
                                    </p>
                                    {!filterText && (
                                        <button onClick={onClose} className="btn-primary">
                                            Discover Films
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Grid view */}
                            {!loading && movies.length > 0 && viewMode === 'grid' && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-x-6 gap-y-10">
                                    <AnimatePresence mode="popLayout">
                                        {movies.map((movie, i) => (
                                            <motion.div
                                                key={movie.movieId}
                                                layout
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ delay: i * 0.02 }}
                                                className="relative group"
                                            >
                                                <MovieCard movie={{
                                                    ...movie,
                                                    id: movie.movieId,
                                                    poster_path: movie.posterPath,
                                                    vote_average: movie.voteAverage
                                                }} />
                                                <button
                                                    onClick={e => handleRemove(movie.movieId, e)}
                                                    className="absolute top-2 right-2 p-1.5 bg-white/90 text-error rounded-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-error hover:text-on-error z-20"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* List view */}
                            {!loading && movies.length > 0 && viewMode === 'list' && (
                                <div className="space-y-2">
                                    <AnimatePresence mode="popLayout">
                                        {movies.map((movie, i) => (
                                            <motion.div
                                                key={movie.movieId}
                                                layout
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: i * 0.015 }}
                                            >
                                                <Link
                                                    to={`/movie/${movie.movieId}`}
                                                    onClick={onClose}
                                                    className="group flex items-center gap-4 p-3 bg-surface-container-low hover:bg-surface-container rounded-sm transition-all"
                                                >
                                                    <div className="w-10 h-14 flex-shrink-0 overflow-hidden rounded-sm bg-surface-container-high">
                                                        <img
                                                            src={movie.posterPath
                                                                ? `https://image.tmdb.org/t/p/w92${movie.posterPath}`
                                                                : 'https://via.placeholder.com/92x138?text=N%2FA'}
                                                            alt={movie.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-sans text-sm font-medium text-on-surface group-hover:text-primary transition-colors truncate">
                                                            {movie.title}
                                                        </p>
                                                        <p className="font-sans text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                                                            <Star size={11} className="text-on-surface-variant/60" />
                                                            {movie.voteAverage?.toFixed(1) || '—'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={e => handleRemove(movie.movieId, e)}
                                                        className="p-2 text-on-surface-variant/40 hover:text-error transition-colors flex-shrink-0"
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Footer stats */}
                        {watchlistData.length > 0 && (
                            <div className="flex items-center justify-between px-8 py-4 border-t border-outline-variant/30 flex-shrink-0">
                                <div className="flex items-center gap-6 font-sans text-xs text-on-surface-variant">
                                    <span>{watchlistData.length} {watchlistData.length === 1 ? 'film' : 'films'}</span>
                                    <span className="flex items-center gap-1.5">
                                        <Star size={12} strokeWidth={1.5} />
                                        Avg {avgRating}
                                    </span>
                                </div>
                                <span className="font-sans text-xs text-on-surface-variant/50">Your saved collection</span>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ArchiveDiscovery;
