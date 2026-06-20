import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { X, Heart, Info, RotateCcw, Sparkles, Film, Compass, Flame, Star, ChevronLeft, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useWatchlist } from '../context/WatchlistContext';
import { useToast } from '../components/Toast';

const STATIC_GENRES = [
    { id: 28, name: "Action" }, { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" }, { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" }, { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" }, { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" }, { id: 36, name: "History" },
    { id: 27, name: "Horror" }, { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" }, { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" }, { id: 53, name: "Thriller" },
    { id: 10752, name: "War" }, { id: 37, name: "Western" }
];

const getImageUrl = (path, size = 'w500') => {
    if (!path || path === 'null' || path === '') return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `https://image.tmdb.org/t/p/${size}${cleanPath}`;
};

export default function SwipeMatcher() {
    const navigate = useNavigate();
    const toast = useToast();
    const { addToWatchlist, removeFromWatchlist } = useWatchlist();

    // Setup State
    const [step, setStep] = useState('setup'); // 'setup' | 'swiping' | 'results'
    const [deckType, setDeckType] = useState('popular'); // 'popular' | 'trending' | 'top_rated'
    const [selectedGenre, setSelectedGenre] = useState(null);

    // Swiper State
    const [deck, setDeck] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]); // Array of { movie, action }
    const [likedMovies, setLikedMovies] = useState([]);

    // Results State
    const [perfectMatch, setPerfectMatch] = useState(null);
    const [loadingMatch, setLoadingMatch] = useState(false);

    // Framer Motion Values for dragging
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const likeOpacity = useTransform(x, [0, 100], [0, 1]);
    const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

    // Keyboard controls handler
    useEffect(() => {
        if (step !== 'swiping' || loading || currentIndex >= deck.length) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                e.preventDefault();
                swipeLeft();
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                e.preventDefault();
                swipeRight();
            } else if (e.key === 'ArrowUp' || e.key === 'w') {
                e.preventDefault();
                openDetails();
            } else if (e.key === 'Backspace' || e.key === 'z') {
                e.preventDefault();
                handleUndo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [step, currentIndex, deck, loading]);

    // Fetch Deck
    const startSwiping = async () => {
        setLoading(true);
        try {
            const params = {
                type: deckType,
                page: 1
            };
            if (selectedGenre) {
                params.genre = selectedGenre;
            }

            const { data } = await api.get('/api/match/deck', { params });
            if (data.results && data.results.length > 0) {
                setDeck(data.results);
                setCurrentIndex(0);
                setHistory([]);
                setLikedMovies([]);
                setPage(data.nextPage || 2);
                setStep('swiping');
            } else {
                toast.info("No fresh movies found with these filters! Try changing settings.");
            }
        } catch (err) {
            console.error('Failed to get deck:', err);
            toast.error("Failed to load movie deck. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Load more movies if running low
    const loadMoreMovies = async () => {
        try {
            const params = {
                type: deckType,
                page
            };
            if (selectedGenre) {
                params.genre = selectedGenre;
            }

            const { data } = await api.get('/api/match/deck', { params });
            if (data.results && data.results.length > 0) {
                setDeck(prev => [...prev, ...data.results]);
                setPage(data.nextPage || (page + 1));
            }
        } catch (err) {
            console.warn('Silent failure loading next page:', err);
        }
    };

    // Register Swipe on Backend
    const registerSwipe = async (movie, action) => {
        try {
            await api.post('/api/match/swipe', {
                movieId: movie.id,
                action,
                movieData: {
                    title: movie.title,
                    posterPath: movie.posterPath,
                    voteAverage: movie.voteAverage
                }
            });
        } catch (err) {
            console.error('Failed to save swipe to database:', err);
        }
    };

    // Core swipe handler
    const handleSwipe = async (action) => {
        if (currentIndex >= deck.length) return;

        const movie = deck[currentIndex];
        
        // Update local state history for undo functionality
        setHistory(prev => [...prev, { movie, action }]);
        
        if (action === 'like') {
            setLikedMovies(prev => [...prev, movie]);
            toast.archive(`Saved "${movie.title}"`);
            registerSwipe(movie, 'like');
            
            // Explicitly sync watchlist context
            addToWatchlist(movie.id, {
                title: movie.title,
                posterPath: movie.posterPath,
                voteAverage: movie.voteAverage
            }).catch(() => {});
        } else {
            registerSwipe(movie, 'dislike');
        }

        setCurrentIndex(prev => prev + 1);

        // Pre-fetch next page when close to end
        if (deck.length - currentIndex < 5) {
            loadMoreMovies();
        }

        // Check if finished
        if (currentIndex + 1 >= deck.length) {
            finishSession([...likedMovies, ...(action === 'like' ? [movie] : [])]);
        }
    };

    // Swipe buttons (with animation)
    const swipeRight = async () => {
        if (currentIndex >= deck.length) return;
        await animate(x, 500, { duration: 0.3 });
        x.set(0);
        handleSwipe('like');
    };

    const swipeLeft = async () => {
        if (currentIndex >= deck.length) return;
        await animate(x, -500, { duration: 0.3 });
        x.set(0);
        handleSwipe('dislike');
    };

    const openDetails = () => {
        if (currentIndex >= deck.length) return;
        const movie = deck[currentIndex];
        window.open(`/movie/${movie.id}`, '_blank');
    };

    // Undo action
    const handleUndo = async () => {
        if (history.length === 0) {
            toast.info("Nothing to undo!");
            return;
        }

        const lastSwipe = history[history.length - 1];
        const { movie, action } = lastSwipe;

        // Pop last item from history
        setHistory(prev => prev.slice(0, -1));
        setCurrentIndex(prev => prev - 1);

        if (action === 'like') {
            setLikedMovies(prev => prev.filter(m => m.id !== movie.id));
            try {
                await api.delete(`/api/watchlist/${movie.id}`);
                // Explicitly sync watchlist context
                removeFromWatchlist(movie.id).catch(() => {});
            } catch (err) {
                console.error('Failed to remove from watchlist during undo:', err);
            }
        }
    };

    // Finish swiping and show results
    const finishSession = async (sessionLikes) => {
        setStep('results');
        if (sessionLikes.length === 0) return;

        setLoadingMatch(true);
        try {
            // Find a perfect match by fetching TMDB recommendations for the first liked movie
            const firstLiked = sessionLikes[0];
            const { data } = await api.get(`/api/tmdb/${firstLiked.id}`);
            
            // Get similar movies from result
            const similar = data.similar?.results || [];
            
            // Pick a high-rated movie from recommendations that isn't already liked in this session
            const matchCandidate = similar.find(m => 
                m.vote_average > 7.0 && 
                !sessionLikes.some(sl => sl.id === m.id)
            ) || similar[0];

            if (matchCandidate) {
                setPerfectMatch({
                    id: matchCandidate.id,
                    title: matchCandidate.title,
                    posterPath: matchCandidate.poster_path,
                    backdropPath: matchCandidate.backdrop_path,
                    voteAverage: matchCandidate.vote_average,
                    releaseDate: matchCandidate.release_date,
                    overview: matchCandidate.overview
                });
            }
        } catch (err) {
            console.error('Failed to get perfect match recommendations:', err);
        } finally {
            setLoadingMatch(false);
        }
    };

    // Active Card View Render Helper
    const activeCards = useMemo(() => {
        return deck.slice(currentIndex, currentIndex + 3).reverse();
    }, [deck, currentIndex]);

    return (
        <div className="min-h-screen pt-20 pb-12 flex flex-col items-center justify-center px-4 relative overflow-hidden bg-background">
            
            {/* Setup View */}
            {step === 'setup' && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full max-w-xl bg-surface-container/60 border border-outline-variant/30 rounded-sm p-6 md:p-10 nav-blur relative"
                >
                    <div className="flex flex-col items-center mb-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-4 text-on-primary shadow-md">
                            <Sparkles size={24} className="animate-pulse" />
                        </div>
                        <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">PopcornMatch</h1>
                        <p className="font-sans text-sm text-on-surface-variant mt-2 max-w-sm">
                            Swipe right to save movies you want to watch. Swipe left to pass. We'll find your perfect match!
                        </p>
                    </div>

                    {/* Deck Type Selection */}
                    <div className="mb-6">
                        <label className="font-sans text-xs font-semibold tracking-wider text-on-surface-variant uppercase block mb-3">
                            1. Select Movie Deck
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setDeckType('popular')}
                                className={`flex flex-col items-center justify-center p-4 border rounded-sm transition-all ${
                                    deckType === 'popular'
                                        ? 'border-primary bg-surface-container-high text-primary'
                                        : 'border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container text-on-surface-variant'
                                }`}
                            >
                                <Compass size={20} className="mb-2" />
                                <span className="font-sans text-xs font-semibold">Popular</span>
                            </button>

                            <button
                                onClick={() => setDeckType('trending')}
                                className={`flex flex-col items-center justify-center p-4 border rounded-sm transition-all ${
                                    deckType === 'trending'
                                        ? 'border-primary bg-surface-container-high text-primary'
                                        : 'border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container text-on-surface-variant'
                                }`}
                            >
                                <Flame size={20} className="mb-2" />
                                <span className="font-sans text-xs font-semibold">Trending</span>
                            </button>

                            <button
                                onClick={() => setDeckType('top_rated')}
                                className={`flex flex-col items-center justify-center p-4 border rounded-sm transition-all ${
                                    deckType === 'top_rated'
                                        ? 'border-primary bg-surface-container-high text-primary'
                                        : 'border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container text-on-surface-variant'
                                }`}
                            >
                                <Star size={20} className="mb-2" />
                                <span className="font-sans text-xs font-semibold">Top Rated</span>
                            </button>
                        </div>
                    </div>

                    {/* Genre Filters */}
                    <div className="mb-8">
                        <label className="font-sans text-xs font-semibold tracking-wider text-on-surface-variant uppercase block mb-3">
                            2. Filter by Genre (Optional)
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto scrollbar-hide p-1 border border-outline-variant/20 rounded-sm">
                            <button
                                onClick={() => setSelectedGenre(null)}
                                className={`px-3 py-1.5 rounded-full font-sans text-xs transition-all ${
                                    selectedGenre === null
                                        ? 'bg-primary text-on-primary'
                                        : 'bg-surface-container-high text-on-surface-variant hover:text-primary'
                                }`}
                            >
                                All Genres
                            </button>
                            {STATIC_GENRES.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => setSelectedGenre(g.id)}
                                    className={`px-3 py-1.5 rounded-full font-sans text-xs transition-all ${
                                        selectedGenre === g.id
                                            ? 'bg-primary text-on-primary'
                                            : 'bg-surface-container-high text-on-surface-variant hover:text-primary'
                                    }`}
                                >
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Play Button */}
                    <button
                        onClick={startSwiping}
                        disabled={loading}
                        className="w-full py-4 bg-primary text-on-primary hover:opacity-90 active:scale-[0.99] font-sans font-bold tracking-widest text-sm uppercase rounded-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                        ) : (
                            <>
                                <span>Start Swiping</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </motion.div>
            )}

            {/* Deck Swiping View */}
            {step === 'swiping' && (
                <div className="flex flex-col items-center justify-center w-full max-w-sm flex-1">
                    
                    {/* Return back header */}
                    <div className="w-full flex items-center justify-between mb-4 px-2">
                        <button
                            onClick={() => setStep('setup')}
                            className="flex items-center gap-1.5 font-sans text-xs text-on-surface-variant hover:text-primary transition-colors"
                        >
                            <ChevronLeft size={16} />
                            <span>Exit Session</span>
                        </button>
                        <div className="font-sans text-xs font-semibold text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-sm">
                            Liked: {likedMovies.length}
                        </div>
                    </div>

                    {/* Card Container Stack */}
                    <div className="relative w-full aspect-[2/3] max-w-xs md:max-w-sm mb-6 flex justify-center items-center">
                        <AnimatePresence>
                            {currentIndex < deck.length ? (
                                activeCards.map((movie, index) => {
                                    const actualIndex = currentIndex + (activeCards.length - 1 - index);
                                    const isTop = actualIndex === currentIndex;

                                    const posterUrl = getImageUrl(movie.posterPath, 'w500');

                                    return (
                                        <motion.div
                                            key={movie.id}
                                            drag={isTop && !loading}
                                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                            onDragEnd={(event, info) => {
                                                if (info.offset.x > 150) {
                                                    swipeRight();
                                                } else if (info.offset.x < -150) {
                                                    swipeLeft();
                                                }
                                            }}
                                            style={{
                                                x: isTop ? x : 0,
                                                rotate: isTop ? rotate : 0,
                                                scale: isTop ? 1 : 0.95 - (actualIndex - currentIndex) * 0.02,
                                                y: isTop ? 0 : (actualIndex - currentIndex) * 8,
                                                zIndex: deck.length - actualIndex,
                                            }}
                                            transition={isTop ? { type: 'spring', stiffness: 300, damping: 20 } : { duration: 0.3 }}
                                            className="absolute w-full h-full bg-surface-container border border-outline-variant/30 rounded-sm overflow-hidden flex flex-col shadow-2xl cursor-grab active:cursor-grabbing origin-bottom"
                                        >
                                            
                                            {/* Poster Image */}
                                            <div className="relative flex-1 bg-surface-container-high overflow-hidden select-none">
                                                {/* High-fidelity local background fallback */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-highest text-on-surface-variant/40 p-6 text-center">
                                                    <Film size={48} className="stroke-[1.5] mb-2 opacity-35" />
                                                    <span className="font-sans text-xs font-semibold">{movie.title}</span>
                                                    <span className="font-sans text-[10px] opacity-60 mt-1">Poster unavailable</span>
                                                </div>

                                                {posterUrl && (
                                                    <img 
                                                        src={posterUrl} 
                                                        alt={movie.title}
                                                        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none z-10"
                                                        loading="eager"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                                
                                                {/* Gradient Fade */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent pointer-events-none" />

                                                {/* Stamp Indicators */}
                                                {isTop && (
                                                    <>
                                                        <motion.div 
                                                            style={{ opacity: likeOpacity }}
                                                            className="absolute top-8 left-8 border-[3px] border-emerald-500 text-emerald-500 rounded-sm px-4 py-1.5 text-xl font-bold tracking-[0.2em] uppercase rotate-[-12deg] pointer-events-none"
                                                        >
                                                            LIKE
                                                        </motion.div>
                                                        <motion.div 
                                                            style={{ opacity: nopeOpacity }}
                                                            className="absolute top-8 right-8 border-[3px] border-rose-500 text-rose-500 rounded-sm px-4 py-1.5 text-xl font-bold tracking-[0.2em] uppercase rotate-[12deg] pointer-events-none"
                                                        >
                                                            NOPE
                                                        </motion.div>
                                                    </>
                                                )}
                                                
                                                {/* Movie Rating Badge */}
                                                {movie.voteAverage > 0 && (
                                                    <div className="absolute top-4 left-4 bg-background/90 text-primary px-2.5 py-1 rounded-sm text-xs font-semibold backdrop-blur-sm shadow-md pointer-events-none">
                                                        ★ {movie.voteAverage.toFixed(1)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details Section */}
                                            <div className="p-5 flex flex-col justify-end bg-black text-white pointer-events-none">
                                                <h2 className="font-headline text-lg font-bold truncate leading-none mb-1.5">
                                                    {movie.title}
                                                </h2>
                                                <div className="flex items-center gap-2 mb-2.5">
                                                    <span className="font-sans text-xs opacity-60">
                                                        {movie.releaseDate ? movie.releaseDate.split('-')[0] : 'N/A'}
                                                    </span>
                                                    {movie.genreIds && movie.genreIds.length > 0 && (
                                                        <>
                                                            <div className="w-1 h-1 rounded-full bg-white/40" />
                                                            <span className="font-sans text-xs opacity-60 truncate">
                                                                {movie.genreIds.slice(0, 2).map(id => STATIC_GENRES.find(g => g.id === id)?.name || '').filter(Boolean).join(', ')}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <p className="font-sans text-xs opacity-75 line-clamp-2 leading-relaxed">
                                                    {movie.overview || 'No description available for this movie.'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center text-center justify-center p-6 bg-surface-container/60 border border-outline-variant/30 rounded-sm w-full h-full">
                                    <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 animate-spin mb-4">sync</span>
                                    <h3 className="font-headline text-lg font-semibold text-primary">Generating Deck</h3>
                                    <p className="font-sans text-xs text-on-surface-variant mt-2 max-w-[200px]">
                                        We are fetching some more movies matching your settings...
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Controller Buttons */}
                    <div className="flex justify-center items-center gap-4 w-full">
                        {/* Undo button */}
                        <button
                            onClick={handleUndo}
                            disabled={history.length === 0}
                            className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-primary disabled:opacity-30 disabled:hover:text-on-surface-variant transition-all shadow-md active:scale-95"
                            title="Undo Last Swipe"
                        >
                            <RotateCcw size={16} />
                        </button>

                        {/* Dislike button */}
                        <button
                            onClick={swipeLeft}
                            disabled={currentIndex >= deck.length}
                            className="w-14 h-14 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 flex items-center justify-center transition-all shadow-md active:scale-95"
                            title="Pass"
                        >
                            <X size={24} />
                        </button>

                        {/* Info button */}
                        <button
                            onClick={openDetails}
                            disabled={currentIndex >= deck.length}
                            className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all shadow-md active:scale-95"
                            title="More Info"
                        >
                            <Info size={16} />
                        </button>

                        {/* Like button */}
                        <button
                            onClick={swipeRight}
                            disabled={currentIndex >= deck.length}
                            className="w-14 h-14 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 flex items-center justify-center transition-all shadow-md active:scale-95"
                            title="Archive Movie"
                        >
                            <Heart size={24} style={{ fill: 'currentColor' }} />
                        </button>
                    </div>

                    {/* Hotkey guides */}
                    <div className="hidden sm:flex items-center gap-4 justify-center mt-6 text-on-surface-variant/40 font-sans text-[10px] uppercase tracking-wider">
                        <span>[A] Nope</span>
                        <div className="w-1 h-1 rounded-full bg-outline-variant/40" />
                        <span>[W] Info</span>
                        <div className="w-1 h-1 rounded-full bg-outline-variant/40" />
                        <span>[D] Like</span>
                        <div className="w-1 h-1 rounded-full bg-outline-variant/40" />
                        <span>[Z] Undo</span>
                    </div>
                </div>
            )}

            {/* Results Screen */}
            {step === 'results' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl bg-surface-container/60 border border-outline-variant/30 rounded-sm p-6 md:p-8 nav-blur flex flex-col md:flex-row gap-6 md:gap-8 shadow-2xl relative"
                >
                    
                    {/* Left Column: Liked movies list */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={18} className="text-primary animate-pulse" />
                            <h2 className="font-headline text-lg font-bold text-primary">Your Swiped Likes ({likedMovies.length})</h2>
                        </div>

                        {likedMovies.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-outline-variant/30 rounded-sm bg-surface-container-high/30">
                                <Film size={32} className="text-on-surface-variant/30 mb-3" />
                                <span className="font-sans text-xs font-semibold text-primary">No Liked Movies</span>
                                <span className="font-sans text-[10px] text-on-surface-variant mt-1">
                                    You swiped left on everything! Give it another try.
                                </span>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto max-h-[300px] scrollbar-hide space-y-2.5 pr-2">
                                {likedMovies.map(movie => (
                                    <div 
                                        key={movie.id}
                                        onClick={() => window.open(`/movie/${movie.id}`, '_blank')}
                                        className="flex items-center gap-3 p-2 rounded-sm bg-surface-container-high hover:bg-surface-container-highest cursor-pointer border border-outline-variant/20 hover:border-outline-variant/50 transition-all"
                                    >
                                        <div className="w-9 aspect-[2/3] relative rounded-sm overflow-hidden bg-surface-container-highest flex-shrink-0">
                                             <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant/40">
                                                 <Film size={14} />
                                             </div>
                                             {getImageUrl(movie.posterPath, 'w92') && (
                                                 <img 
                                                     src={getImageUrl(movie.posterPath, 'w92')} 
                                                     alt={movie.title}
                                                     className="absolute inset-0 w-full h-full object-cover z-10"
                                                     onError={(e) => {
                                                         e.target.style.display = 'none';
                                                     }}
                                                 />
                                             )}
                                         </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-headline text-xs font-semibold text-primary truncate">{movie.title}</h4>
                                            <p className="font-sans text-[10px] text-on-surface-variant mt-0.5">
                                                {movie.releaseDate ? movie.releaseDate.split('-')[0] : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 space-y-2 flex-shrink-0">
                            <button
                                onClick={() => setStep('setup')}
                                className="w-full py-3 border border-outline text-primary hover:bg-surface-container-high font-sans font-bold tracking-widest text-xs uppercase rounded-sm transition-all"
                            >
                                Start New Deck
                            </button>
                            <button
                                onClick={() => navigate('/home')}
                                className="w-full py-3 bg-primary text-on-primary hover:opacity-90 font-sans font-bold tracking-widest text-xs uppercase rounded-sm transition-all text-center"
                            >
                                Back to Vault
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Perfect Match recommendation */}
                    <div className="flex-1 flex flex-col border-t md:border-t-0 md:border-l border-outline-variant/30 pt-6 md:pt-0 md:pl-8 min-w-0 justify-center">
                        <div className="mb-4">
                            <p className="font-sans text-[10px] tracking-[0.2em] font-bold text-on-surface-variant uppercase">Your Perfect Pick</p>
                            <h2 className="font-headline text-2xl font-bold text-primary mt-1">Match for Tonight!</h2>
                        </div>

                        {loadingMatch ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-12">
                                <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40 animate-spin mb-3">sync</span>
                                <span className="font-sans text-xs text-on-surface-variant">Finding recommendations...</span>
                            </div>
                        ) : perfectMatch ? (
                            <div 
                                onClick={() => window.open(`/movie/${perfectMatch.id}`, '_blank')}
                                className="group relative w-full aspect-[16/10] rounded-sm overflow-hidden bg-surface-container-high shadow-lg border border-outline-variant/30 hover:border-outline cursor-pointer transition-all flex flex-col"
                            >
                                {/* Backdrop Image */}
                                 <div className="absolute inset-0 bg-surface-container-highest flex-1">
                                     <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant/40">
                                         <Film size={32} />
                                     </div>
                                     {(perfectMatch.backdropPath || perfectMatch.posterPath) && (
                                         <img 
                                             src={getImageUrl(perfectMatch.backdropPath || perfectMatch.posterPath, 'w780')} 
                                             alt={perfectMatch.title}
                                             className="absolute inset-0 w-full h-full object-cover transition-transform duration-750 group-hover:scale-105 z-10"
                                             onError={(e) => {
                                                 e.target.style.display = 'none';
                                             }}
                                         />
                                     )}
                                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-20" />
                                 </div>

                                {/* Match content */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end text-white pointer-events-none z-30">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-primary text-on-primary text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm">
                                            {perfectMatch.voteAverage > 0 ? `★ ${perfectMatch.voteAverage.toFixed(1)}` : 'Recommended'}
                                        </span>
                                    </div>
                                    <h3 className="font-headline text-sm font-bold truncate group-hover:opacity-80 transition-opacity">
                                        {perfectMatch.title}
                                    </h3>
                                    <p className="font-sans text-[10px] opacity-75 mt-1 line-clamp-2">
                                        {perfectMatch.overview || 'A curated pick recommended based on your swipes.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center bg-surface-container-high/30 border border-dashed border-outline-variant/30 rounded-sm">
                                <Sparkles size={24} className="text-on-surface-variant/30 mb-2" />
                                <span className="font-sans text-xs text-on-surface-variant">Swipe on movies to discover matches</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
