import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWatchlist } from '../context/WatchlistContext';
import MovieCard from '../components/MovieCard';
import {
    Bookmark,
    Trash2,
    Grid3X3,
    List,
    Clock,
    Star,
    CalendarDays,
    Filter,
    Search,
    Layers
} from 'lucide-react';

const Watchlist = () => {
    const { watchlistData, loading, removeFromWatchlist } = useWatchlist();
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [sortBy, setSortBy] = useState('addedAt'); // 'addedAt' | 'rating' | 'title'
    const [filterText, setFilterText] = useState('');

    const sortedAndFilteredMovies = useMemo(() => {
        let movies = [...watchlistData];

        // Filter by search text
        if (filterText.trim()) {
            movies = movies.filter(m =>
                m.title?.toLowerCase().includes(filterText.toLowerCase())
            );
        }

        // Sort
        switch (sortBy) {
            case 'rating':
                movies.sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0));
                break;
            case 'title':
                movies.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case 'addedAt':
            default:
                // Keep original order (newest first)
                break;
        }

        return movies;
    }, [watchlistData, sortBy, filterText]);

    const handleRemove = async (movieId, e) => {
        e.preventDefault();
        e.stopPropagation();
        await removeFromWatchlist(movieId);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background pt-20">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
                    <span className="text-tiny font-black uppercase tracking-[0.8em] animate-pulse">
                        Loading your movies...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-40">
            {/* Hero Header */}
            <div className="container mx-auto px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-16 h-16 bg-accent/10 border border-accent/20 flex items-center justify-center">
                            <Bookmark className="w-8 h-8 text-accent" />
                        </div>
                        <div>
                            <span className="text-tiny text-accent uppercase tracking-[0.5em] block mb-2">
                                My Collection
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">
                                Saved Movies
                            </h1>
                        </div>
                    </div>
                    <p className="text-muted text-lg max-w-2xl border-l-2 border-accent/30 pl-8">
                        Your personal movie collection. {watchlistData.length} {watchlistData.length === 1 ? 'movie' : 'movies'} saved.
                    </p>
                </motion.div>

                {/* Controls Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-12 p-6 bg-surface/50 border border-white/5"
                >
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/40" />
                        <input
                            type="text"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            placeholder="Search your movies..."
                            className="w-full bg-background border border-white/10 pl-12 pr-4 py-3 text-white placeholder:text-muted/40 focus:outline-none focus:border-accent/50 transition-all"
                        />
                    </div>

                    <div className="flex gap-4 items-center">
                        {/* Sort Options */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted/60" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-background border border-white/10 px-4 py-2 text-tiny font-bold uppercase tracking-wider text-white focus:outline-none focus:border-accent/50 cursor-pointer"
                            >
                                <option value="addedAt">Newest First</option>
                                <option value="rating">Best Rated</option>
                                <option value="title">Name (A-Z)</option>
                            </select>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex border border-white/10">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 transition-all ${viewMode === 'grid' ? 'bg-accent text-white' : 'text-muted/60 hover:text-white'}`}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 transition-all ${viewMode === 'list' ? 'bg-accent text-white' : 'text-muted/60 hover:text-white'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Empty State */}
                {sortedAndFilteredMovies.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-32 text-center"
                    >
                        <div className="relative mb-8">
                            <div className="w-32 h-32 border-2 border-white/10 rounded-full flex items-center justify-center">
                                <Layers className="w-12 h-12 text-white/20" />
                            </div>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-t-2 border-accent/40 rounded-full"
                            />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
                            {filterText ? 'No Movies Found' : 'No Saved Movies Yet'}
                        </h2>
                        <p className="text-muted text-sm uppercase tracking-widest mb-8 max-w-md">
                            {filterText
                                ? 'No movies match your search. Try a different keyword.'
                                : 'Start exploring and save movies you want to watch later.'
                            }
                        </p>
                        {!filterText && (
                            <Link
                                to="/home"
                                className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-all"
                            >
                                Browse Movies
                            </Link>
                        )}
                    </motion.div>
                )}

                {/* Grid View */}
                {sortedAndFilteredMovies.length > 0 && viewMode === 'grid' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 md:gap-4"
                    >
                        <AnimatePresence mode="popLayout">
                            {sortedAndFilteredMovies.map((movie, i) => (
                                <motion.div
                                    key={movie.movieId}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="relative group"
                                >
                                    <MovieCard movie={{
                                        ...movie,
                                        id: movie.movieId,
                                        poster_path: movie.posterPath,
                                        vote_average: movie.voteAverage
                                    }} />

                                    {/* Remove Button Overlay */}
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        whileHover={{ scale: 1.1 }}
                                        onClick={(e) => handleRemove(movie.movieId, e)}
                                        className="absolute top-2 right-2 p-2 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-20 hover:bg-red-600"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </motion.button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* List View */}
                {sortedAndFilteredMovies.length > 0 && viewMode === 'list' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <AnimatePresence mode="popLayout">
                            {sortedAndFilteredMovies.map((movie, i) => (
                                <motion.div
                                    key={movie.movieId}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: i * 0.03 }}
                                >
                                    <Link
                                        to={`/movie/${movie.movieId}`}
                                        className="flex gap-6 p-4 bg-surface/30 border border-white/5 hover:border-accent/30 transition-all group"
                                    >
                                        {/* Poster */}
                                        <div className="w-20 h-28 flex-shrink-0 overflow-hidden bg-surface">
                                            <img
                                                src={movie.posterPath
                                                    ? `https://image.tmdb.org/t/p/w154${movie.posterPath}`
                                                    : 'https://via.placeholder.com/154x231?text=N/A'
                                                }
                                                alt={movie.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-accent transition-colors mb-2">
                                                {movie.title}
                                            </h3>
                                            <p className="text-sm text-muted/60 line-clamp-2 mb-3">
                                                {movie.overview || 'No description available.'}
                                            </p>
                                            <div className="flex items-center gap-6 text-tiny text-muted/40">
                                                <span className="flex items-center gap-2">
                                                    <Star className="w-3 h-3 text-accent" />
                                                    {movie.voteAverage?.toFixed(1) || 'N/A'}
                                                </span>
                                                {movie.releaseDate && (
                                                    <span className="flex items-center gap-2">
                                                        <CalendarDays className="w-3 h-3" />
                                                        {new Date(movie.releaseDate).getFullYear()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={(e) => handleRemove(movie.movieId, e)}
                                            className="self-center p-4 text-muted/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Stats Footer */}
                {watchlistData.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-24 pt-12 border-t border-white/5 flex items-center justify-between text-tiny text-muted/30"
                    >
                        <div className="flex items-center gap-8">
                            <span className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {watchlistData.length} {watchlistData.length === 1 ? 'Movie' : 'Movies'} Saved
                            </span>
                            <span className="flex items-center gap-2">
                                <Star className="w-3 h-3" />
                                Average Rating: {(watchlistData.reduce((acc, m) => acc + (m.voteAverage || 0), 0) / watchlistData.length).toFixed(1)}
                            </span>
                        </div>
                        <span>My Movie Collection</span>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Watchlist;
