import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWatchlist } from '../context/WatchlistContext';
import MovieCard from './MovieCard';
import {
    X,
    ArrowRight,
    Bookmark,
    Trash2,
    Grid3X3,
    List,
    Clock,
    Star,
    Search,
    Layers,
    Filter
} from 'lucide-react';

const ArchiveDiscovery = ({ isOpen, onClose }) => {
    const { watchlistData, loading, removeFromWatchlist } = useWatchlist();
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('addedAt');
    const [filterText, setFilterText] = useState('');

    const sortedAndFilteredMovies = useMemo(() => {
        let movies = [...watchlistData];

        if (filterText.trim()) {
            movies = movies.filter(m =>
                m.title?.toLowerCase().includes(filterText.toLowerCase())
            );
        }

        switch (sortBy) {
            case 'rating':
                movies.sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0));
                break;
            case 'title':
                movies.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            default:
                break;
        }

        return movies;
    }, [watchlistData, sortBy, filterText]);

    const handleRemove = async (movieId, e) => {
        e.preventDefault();
        e.stopPropagation();
        await removeFromWatchlist(movieId);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1500] flex items-stretch justify-center pt-20">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/90 backdrop-blur-3xl"
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        className="relative w-full max-w-[1800px] flex flex-col p-4 md:p-6 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6 px-4 gap-8">
                            <div className="flex items-center gap-6">
                                <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
                                    <span className="w-6 h-px bg-accent" />
                                    My <span className="text-white/20">Saved Movies</span>
                                </h2>
                                <div className="h-4 w-px bg-white/10" />
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 border border-accent border-t-transparent animate-spin rounded-full" />
                                        <span className="text-[10px] font-black uppercase text-accent/50 tracking-widest">Loading...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Bookmark className="w-3 h-3 text-accent" />
                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
                                            {watchlistData.length} {watchlistData.length === 1 ? 'Movie' : 'Movies'} Saved
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={onClose}
                                className="flex items-center gap-3 text-white/40 hover:text-white transition-all group"
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">Close</span>
                                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white transition-all">
                                    <X size={14} className="group-hover:rotate-90 transition-transform" />
                                </div>
                            </button>
                        </div>

                        {/* Controls Bar */}
                        <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center mb-4 px-4">
                            {/* Search */}
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="text"
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    placeholder="Search your saved movies..."
                                    className="w-full bg-surface/50 border border-white/10 pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-all rounded-sm"
                                />
                            </div>

                            <div className="flex gap-2 items-center">
                                {/* Sort */}
                                <div className="flex items-center gap-2">
                                    <Filter className="w-3 h-3 text-white/30" />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-surface/50 border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white focus:outline-none focus:border-accent/50 cursor-pointer rounded-sm"
                                    >
                                        <option value="addedAt">Newest First</option>
                                        <option value="rating">Best Rated</option>
                                        <option value="title">Name (A-Z)</option>
                                    </select>
                                </div>

                                {/* View Mode */}
                                <div className="flex border border-white/10 rounded-sm overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-accent text-white' : 'text-white/40 hover:text-white'}`}
                                    >
                                        <Grid3X3 className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 transition-all ${viewMode === 'list' ? 'bg-accent text-white' : 'text-white/40 hover:text-white'}`}
                                    >
                                        <List className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide py-2 px-2">
                            {/* Empty State */}
                            {sortedAndFilteredMovies.length === 0 && !loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-24 text-center"
                                >
                                    <div className="relative mb-6">
                                        <div className="w-20 h-20 border border-white/10 rounded-full flex items-center justify-center">
                                            <Layers className="w-8 h-8 text-white/20" />
                                        </div>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 border-t border-accent/40 rounded-full"
                                        />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                                        {filterText ? 'No Matches Found' : 'No Saved Movies Yet'}
                                    </h3>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest max-w-xs">
                                        {filterText
                                            ? 'Try searching with a different movie name.'
                                            : 'When you find a movie you like, click the bookmark icon to save it here.'
                                        }
                                    </p>
                                    {!filterText && (
                                        <button
                                            onClick={onClose}
                                            className="mt-6 px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all"
                                        >
                                            Discover Movies
                                        </button>
                                    )}
                                </motion.div>
                            )}

                            {/* Grid View */}
                            {sortedAndFilteredMovies.length > 0 && viewMode === 'grid' && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5">
                                    <AnimatePresence mode="popLayout">
                                        {sortedAndFilteredMovies.map((movie, i) => (
                                            <motion.div
                                                key={movie.movieId}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: i * 0.01 }}
                                                className="relative group"
                                            >
                                                <MovieCard movie={{
                                                    ...movie,
                                                    id: movie.movieId,
                                                    poster_path: movie.posterPath,
                                                    vote_average: movie.voteAverage
                                                }} showSaveButton={false} />

                                                {/* Remove Button */}
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    onClick={(e) => handleRemove(movie.movieId, e)}
                                                    className="absolute top-1 right-1 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-20 hover:bg-red-600"
                                                    title="Remove from saved movies"
                                                >
                                                    <Trash2 className="w-2.5 h-2.5" />
                                                </motion.button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* List View */}
                            {sortedAndFilteredMovies.length > 0 && viewMode === 'list' && (
                                <div className="space-y-1.5">
                                    <AnimatePresence mode="popLayout">
                                        {sortedAndFilteredMovies.map((movie, i) => (
                                            <motion.div
                                                key={movie.movieId}
                                                layout
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                transition={{ delay: i * 0.02 }}
                                            >
                                                <Link
                                                    to={`/movie/${movie.movieId}`}
                                                    onClick={onClose}
                                                    className="flex gap-4 p-3 bg-surface/30 border border-white/5 hover:border-accent/30 transition-all group rounded-sm"
                                                >
                                                    {/* Poster */}
                                                    <div className="w-12 h-16 flex-shrink-0 overflow-hidden bg-surface">
                                                        <img
                                                            src={movie.posterPath
                                                                ? `https://image.tmdb.org/t/p/w92${movie.posterPath}`
                                                                : 'https://via.placeholder.com/92x138?text=N/A'
                                                            }
                                                            alt={movie.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 flex flex-col justify-center min-w-0">
                                                        <h3 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-accent transition-colors truncate">
                                                            {movie.title}
                                                        </h3>
                                                        <div className="flex items-center gap-4 text-[10px] text-white/30 mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Star className="w-2.5 h-2.5 text-accent" />
                                                                {movie.voteAverage?.toFixed(1) || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2">
                                                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                                        <button
                                                            onClick={(e) => handleRemove(movie.movieId, e)}
                                                            className="p-2 text-white/30 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-sm"
                                                            title="Remove from saved movies"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Footer Stats */}
                        {watchlistData.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-white/20 px-4">
                                <div className="flex items-center gap-6">
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        {watchlistData.length} {watchlistData.length === 1 ? 'Movie' : 'Movies'}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Star className="w-3 h-3" />
                                        Average Rating: {(watchlistData.reduce((acc, m) => acc + (m.voteAverage || 0), 0) / watchlistData.length).toFixed(1)}
                                    </span>
                                </div>
                                <span>Your Saved Collection</span>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ArchiveDiscovery;
