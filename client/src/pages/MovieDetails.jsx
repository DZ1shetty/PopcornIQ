import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import SaveSignalButton from '../components/SaveSignalButton';
import TrailerOverlay from '../components/TrailerOverlay';
import WatchProviders from '../components/WatchProviders';
import { motion } from 'framer-motion';
import { 
    PlayCircle, 
    Star, 
    Users, 
    Clock, 
    Calendar, 
    DollarSign,
    Globe,
    Activity,
    Compass,
    Smile,
    Map as MapIcon,
    Settings,
    User,
    Loader2,
    AlertCircle,
    Info,
    X,
    Shuffle
} from 'lucide-react';
import { FastAverageColor } from 'fast-average-color';

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [genreRecs, setGenreRecs] = useState([]);
    const [communityRecs, setCommunityRecs] = useState([]);
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);
    const [showRandomTooltip, setShowRandomTooltip] = useState(true);
    const [dominantColor, setDominantColor] = useState(null);
    const [isDarkColor, setIsDarkColor] = useState(true);
    const [debugFac, setDebugFac] = useState("Initializing...");

    const handleRandomClick = async () => {
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
    };

    useEffect(() => {
        let isMounted = true;
        const fetchMovie = async () => {
            try {
                if (isMounted) setLoading(true);
                let data = null;
                let similar = [];
                let community = [];

                if (/^\d+$/.test(id)) {
                    // TMDB Movie
                    const res = await api.get(`/api/tmdb/${id}`);
                    const tmdbData = res.data;
                    data = {
                        movieId: tmdbData.id,
                        title: tmdbData.title || "Untitled Entry",
                        posterPath: tmdbData.poster_path,
                        backdropPath: tmdbData.backdrop_path,
                        genresArray: tmdbData.genres ? tmdbData.genres.map(g => g.name) : [],
                        voteAverage: tmdbData.vote_average || 0,
                        voteCount: tmdbData.vote_count || 0,
                        releaseDate: tmdbData.release_date,
                        overview: tmdbData.overview || "No description available.",
                        runtime: tmdbData.runtime || 0,
                        tagline: tmdbData.tagline,
                        status: tmdbData.status || "Released",
                        language: tmdbData.original_language?.toUpperCase() || "EN",
                        budget: tmdbData.budget || 0,
                        revenue: tmdbData.revenue || 0,
                        companies: tmdbData.production_companies?.slice(0, 2).map(c => c.name).join(', ') || 'Independent Preservation',
                        cast: tmdbData.credits?.cast?.slice(0, 8).map(c => ({
                            name: c.name,
                            profilePath: c.profile_path,
                            id: c.id,
                            character: c.character
                        })) || []
                    };
                    if (tmdbData.similar?.results) {
                        similar = tmdbData.similar.results.slice(0, 8).map(m => ({
                            movieId: m.id,
                            id: m.id,
                            title: m.title,
                            posterPath: m.poster_path,
                            voteAverage: m.vote_average,
                            releaseDate: m.release_date
                        }));
                    }

                    // Try fetching collaborative filtering from local DB
                    try {
                        const localRes = await api.get(`/api/recommendations/similar/${id}`);
                        community = localRes.data || [];
                    } catch (e) {
                        console.warn("Collaborative filtering not available for this ID.");
                    }
                } else {
                    // Local DB Movie
                    const res = await api.get(`/api/movies/${id}`);
                    data = res.data;
                    
                    if (data?.movieId) {
                        const recRes = await api.get(`/api/recommendations/similar/${data.movieId}`);
                        community = recRes.data || [];
                    }

                    if (data?.genresArray && data.genresArray.length > 0) {
                        const genre = data.genresArray[0];
                        const recRes = await api.get(`/api/recommendations/genre/${genre}`);
                        similar = recRes.data.filter(m => String(m.movieId) !== String(data.movieId)).slice(0, 8);
                    }
                }

                if (isMounted) {
                    setMovie(data);
                    setGenreRecs(similar);
                    setCommunityRecs(community);
                }

            } catch (error) {
                console.error("Critical Detail Access Failure:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchMovie();
        return () => { isMounted = false; };
    }, [id]);

    useEffect(() => {
        if (!movie || (!movie.backdropPath && !movie.posterPath)) {
            setDebugFac("No movie data yet");
            return;
        }
        let isMounted = true;
        
        const extractColor = async () => {
            try {
                setDebugFac("Starting extraction...");
                const imgUrl = `https://image.tmdb.org/t/p/w780${movie.backdropPath || movie.posterPath}`;
                
                // Fetch as blob to absolutely guarantee we avoid canvas tainting/CORS cache issues
                const response = await fetch(imgUrl);
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                
                const fac = new FastAverageColor();
                const color = await fac.getColorAsync(objectUrl);
                
                if (isMounted) {
                    setDominantColor(`${color.value[0]} ${color.value[1]} ${color.value[2]}`);
                    setIsDarkColor(color.isDark);
                    setDebugFac(`Success: ${color.value.join(',')}`);
                }
                fac.destroy();
                URL.revokeObjectURL(objectUrl);
            } catch (error) {
                if (isMounted) {
                    setDebugFac(`Error: ${error.message}`);
                }
                console.error("Color extraction failed:", error);
            }
        };
        extractColor();
        return () => { isMounted = false; };
    }, [movie]);

    const formatCurrency = (val) => {
        if (!val) return 'Undisclosed';
        if (val > 1e6) return `$${(val / 1e6).toFixed(1)}M`;
        return `$${val.toLocaleString()}`;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 text-on-surface-variant">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-medium">Loading details...</span>
            </div>
        </div>
    );

    if (!movie) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-6 max-w-md p-8 bg-surface rounded-3xl border border-surface-variant">
                <AlertCircle className="w-12 h-12 text-error mx-auto opacity-80" />
                <h2 className="text-2xl font-bold text-on-surface">Record Not Found</h2>
                <p className="text-sm text-on-surface-variant">We could not retrieve this movie from the registry.</p>
                <Link to="/home" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-on-primary rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
                    Go Back Home
                </Link>
            </div>
        </div>
    );

    const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A';
    const cineScore = movie.voteAverage > 0 ? (movie.voteAverage * 10).toFixed(0) : '85';
    const audienceScore = movie.voteCount > 0 ? Math.min(100, Math.floor(movie.voteAverage * 10 - 2)) : '80';

    return (
        <div className="bg-background text-on-background min-h-screen flex font-body pb-20">
            {/* Trailer Overlay */}
            <TrailerOverlay
                isOpen={isTrailerOpen}
                onClose={() => setIsTrailerOpen(false)}
                movieId={movie.movieId}
                movieTitle={movie.title}
            />



            {/* Main Details Canvas */}
            <main 
                className="flex-1 flex flex-col min-h-screen relative transition-colors duration-1000"
                style={dominantColor ? { '--dynamic-color': dominantColor } : {}}
            >
                {/* Ambient Page Wash */}
                {dominantColor && (
                    <div 
                        className="absolute top-0 left-0 right-0 h-[1200px] pointer-events-none z-0 opacity-15"
                        style={{ background: `linear-gradient(to bottom, rgb(var(--dynamic-color)) 0%, transparent 100%)` }}
                    />
                )}

                {/* Floating Random Widget */}
                {location.state?.from === 'random' && (
                    <div className="fixed top-24 left-4 md:left-8 z-[2000] flex items-center gap-3">
                        <button 
                            onClick={handleRandomClick}
                            className="bg-primary text-on-primary font-bold p-4 rounded-full hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-lg"
                            title="Fetch Another Random Movie"
                        >
                            <Shuffle className="w-5 h-5" />
                        </button>
                        {showRandomTooltip && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-surface/90 backdrop-blur border border-outline-variant/30 text-on-surface py-3 px-4 rounded-2xl shadow-xl flex items-start gap-3 max-w-[240px]"
                            >
                                <div className="text-sm">
                                    <span className="font-semibold block mb-1">Random Mode Active</span>
                                    <span className="text-on-surface-variant text-xs">Click the shuffle button to instantly discover another random movie!</span>
                                </div>
                                <button onClick={() => setShowRandomTooltip(false)} className="text-on-surface-variant hover:text-on-surface p-1 shrink-0">
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}
                    </div>
                )}
                
                {/* Hero Backdrop Panel */}
                <section className="relative w-full h-[65vh] min-h-[550px] border-b border-surface-variant overflow-hidden group bg-background">
                    
                    {/* Ambient Glow Background */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-50 scale-125 saturate-150"
                        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w780${movie.backdropPath || movie.posterPath})` }}
                    />
                    
                    {/* Uncropped Full Image (No cutting off) */}
                    <motion.div 
                        initial={{ scale: 1.02, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute inset-0 bg-contain bg-top md:bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdropPath || movie.posterPath})` }}
                    />
                    
                    {/* Gradients for smooth text legibility */}
                    <div 
                        className="absolute inset-0 transition-colors duration-1000"
                        style={{
                            background: dominantColor 
                                ? `linear-gradient(to top, rgb(var(--color-background)) 0%, rgb(var(--dynamic-color) / 0.5) 60%, transparent 100%)`
                                : undefined
                        }}
                    >
                        {!dominantColor && <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-60" />
                    
                    {/* Bottom overlay parameters */}
                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex flex-col md:flex-row justify-between items-end gap-6 z-10 text-on-surface">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl w-full"
                        >
                            <div className="flex gap-2 mb-4 flex-wrap">
                                <span className="bg-primary/90 backdrop-blur text-on-primary font-semibold px-3 py-1 rounded-full text-xs">
                                    {releaseYear}
                                </span>
                                <span className="bg-surface/80 backdrop-blur text-on-surface font-medium px-3 py-1 rounded-full text-xs border border-surface-variant">
                                    {movie.language}
                                </span>
                                <span className="bg-surface/80 backdrop-blur text-on-surface font-medium px-3 py-1 rounded-full text-xs border border-surface-variant flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {movie.runtime}m
                                </span>
                                {movie.genresArray.slice(0, 3).map(genre => (
                                    <span key={genre} className="bg-secondary/10 text-secondary font-medium px-3 py-1 rounded-full text-xs border border-secondary/20">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-3">
                                {movie.title}
                            </h1>
                            {movie.tagline && (
                                <p className="text-lg md:text-xl font-medium text-on-surface-variant max-w-xl italic">
                                    "{movie.tagline}"
                                </p>
                            )}
                        </motion.div>

                        {/* Action buttons */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col gap-3 w-full md:w-auto shrink-0 z-10"
                        >
                            <button 
                                onClick={() => setIsTrailerOpen(true)}
                                className="w-full md:w-auto font-bold text-sm px-8 py-4 rounded-full hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
                                style={dominantColor ? { 
                                    backgroundColor: `rgb(var(--dynamic-color))`,
                                    color: isDarkColor ? '#ffffff' : '#000000',
                                    boxShadow: `0 10px 25px -5px rgb(var(--dynamic-color) / 0.4)`
                                } : {
                                    backgroundColor: 'rgb(var(--color-on-surface))',
                                    color: 'rgb(var(--color-surface))'
                                }}
                            >
                                <PlayCircle className="w-5 h-5" />
                                Play Trailer
                            </button>
                            <SaveSignalButton
                                movie={movie}
                                className="w-full md:w-auto"
                            />
                        </motion.div>
                    </div>
                </section>

                {/* Details Content Grid */}
                <section className="p-6 md:p-12 max-w-container-max mx-auto w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* Main Narrative Column */}
                        <div className="lg:col-span-8 space-y-12">
                            
                            {/* Key Figures Cast Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <Users className="w-5 h-5 text-primary" />
                                    <h2 className="text-xl font-bold text-on-surface">Key Figures</h2>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {movie.cast && movie.cast.length > 0 ? movie.cast.slice(0, 4).map(c => (
                                        <Link
                                            key={c.id || c.name}
                                            to={`/person/${c.id}`}
                                            className="bg-surface border border-surface-variant rounded-2xl p-4 hover:shadow-md hover:border-primary/30 transition-all flex flex-col items-center text-center group"
                                        >
                                            <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-variant mb-3">
                                                <img 
                                                    src={c.profilePath ? `https://image.tmdb.org/t/p/w185${c.profilePath}` : 'https://via.placeholder.com/185x278?text=N/A'}
                                                    alt={c.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/185x278?text=N/A'; }}
                                                />
                                            </div>
                                            <h3 className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">{c.name}</h3>
                                            <p className="text-xs mt-1 text-on-surface-variant line-clamp-1">{c.character}</p>
                                        </Link>
                                    )) : (
                                        <p className="text-sm font-medium text-on-surface-variant col-span-full">No cast data registered.</p>
                                    )}
                                </div>
                            </section>

                            {/* Synopsis (The Narrative Box) */}
                            <section className="bg-surface rounded-3xl p-6 md:p-8 border border-surface-variant shadow-sm relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 text-primary/5">
                                    <Info className="w-40 h-40" />
                                </div>
                                <h2 className="text-xl font-bold mb-4 text-on-surface relative z-10">The Narrative Overview</h2>
                                <p className="text-base leading-relaxed text-on-surface-variant relative z-10">
                                    {movie.overview}
                                </p>
                            </section>

                            {/* Watch Providers Component */}
                            <WatchProviders movieId={movie.movieId} />
                        </div>

                        {/* Sidebar: AI Insights & Spec Details */}
                        <aside className="lg:col-span-4 flex flex-col gap-6">
                            
                            {/* AI Insights Indicator */}
                            <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-5 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-secondary flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    AI Insights
                                </h2>
                                <div className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--secondary),0.6)]"></div>
                            </div>

                            {/* Ratings Score Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-surface border border-surface-variant rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-semibold text-on-surface-variant mb-2 flex items-center gap-1.5">
                                        <Star className="w-3.5 h-3.5 text-primary" />
                                        Cine-Score
                                    </span>
                                    <span className="text-3xl font-bold text-on-surface">
                                        {cineScore}%
                                    </span>
                                </div>
                                <div className="bg-surface border border-surface-variant rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-semibold text-on-surface-variant mb-2 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-secondary" />
                                        Audience
                                    </span>
                                    <span className="text-3xl font-bold text-on-surface">
                                        {audienceScore}%
                                    </span>
                                </div>
                            </div>

                            {/* Dynamic AI Trivia Card */}
                            <div className="bg-gradient-to-br from-primary/10 to-surface border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl translate-x-8 -translate-y-8"></div>
                                <h3 className="text-sm font-bold mb-3 text-primary flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Cinematic Fact
                                </h3>
                                <p className="text-sm text-on-surface-variant leading-relaxed">
                                    Produced by <span className="font-semibold text-on-surface">{movie.companies}</span>. This film logs a {cineScore}% match index in the global movie clusters, aligning closely with typical top-rated presets.
                                </p>
                            </div>

                            {/* Technical Specs Bento */}
                            <div className="bg-surface border border-surface-variant rounded-2xl p-6">
                                <h3 className="text-sm font-bold mb-4 text-on-surface border-b border-surface-variant pb-3">Registry Details</h3>
                                <ul className="space-y-4 text-sm text-on-surface">
                                    <li className="flex justify-between items-center">
                                        <span className="text-on-surface-variant flex items-center gap-2">
                                            <Activity className="w-4 h-4" /> Status
                                        </span>
                                        <span className="font-medium">{movie.status}</span>
                                    </li>
                                    <li className="flex justify-between items-center">
                                        <span className="text-on-surface-variant flex items-center gap-2">
                                            <Globe className="w-4 h-4" /> Language
                                        </span>
                                        <span className="font-medium">{movie.language}</span>
                                    </li>
                                    <li className="flex justify-between items-center">
                                        <span className="text-on-surface-variant flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" /> Budget
                                        </span>
                                        <span className="font-medium">{formatCurrency(movie.budget)}</span>
                                    </li>
                                    <li className="flex justify-between items-center">
                                        <span className="text-on-surface-variant flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" /> Revenue
                                        </span>
                                        <span className="font-medium">{formatCurrency(movie.revenue)}</span>
                                    </li>
                                </ul>
                            </div>
                        </aside>
                    </div>
                </section>

                {/* Recommendations sections below */}
                <section className="p-6 md:p-12 bg-surface/50 border-t border-surface-variant">
                    <div className="max-w-container-max mx-auto w-full space-y-12">
                    {communityRecs.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-on-surface">
                                        People Also Liked
                                    </h3>
                                    <span className="px-2.5 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        Community Choice
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
                                {communityRecs.map((m, i) => (
                                    <div key={m.movieId || `comm-${i}`} className="snap-start shrink-0">
                                        <MovieCard movie={m} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {genreRecs.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-on-surface">
                                        Similar Movies
                                    </h3>
                                    <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        You Might Also Like
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
                                {genreRecs.map((m, i) => (
                                    <div key={m.movieId || `rec-${i}`} className="snap-start shrink-0">
                                        <MovieCard movie={m} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default MovieDetails;
