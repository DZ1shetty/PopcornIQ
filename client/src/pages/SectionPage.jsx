import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { Layers, ChevronLeft, Loader2, Plus } from 'lucide-react';

const SectionPage = () => {
    const { type } = useParams();
    const location = useLocation(); // Import this
    const query = new URLSearchParams(location.search);
    const contextName = query.get('name'); // e.g. "Action" or "India"

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [error, setError] = useState(null);

    // Map URL param to easier readable title and API endpoint
    const sectionConfig = {
        'trending': {
            title: 'Trending Today',
            subtitle: 'Live Global Data',
            endpoint: '/api/tmdb/trending/today'
        },
        'top-rated': {
            title: 'Top Rated',
            subtitle: 'Critically Acclaimed',
            endpoint: '/api/tmdb/top-rated'
        },
        'popular': {
            title: 'Popular Now',
            subtitle: 'Fan Favorites',
            endpoint: '/api/tmdb/popular'
        }
    };

    let config = sectionConfig[type];

    if (!config) {
        if (type.startsWith('genre-')) {
            const parts = type.split('-');
            // expected: genre-[id] or genre-[id]-[variant]
            const id = parts[1];
            const variant = parts[2]; // 'top', 'new' or undefined

            let suffix = '';
            let subtitle = 'Popular in Genre';
            let title = contextName || 'Genre';

            if (variant === 'top') {
                suffix = '/top';
                subtitle = 'Highest Rated';
                title = `${contextName} Top Rated`;
            } else if (variant === 'new') {
                suffix = '/new';
                subtitle = 'Latest Releases';
                title = `${contextName} New`;
            } else {
                title = contextName || 'Genre Browser';
            }

            config = {
                title: title,
                subtitle: subtitle,
                endpoint: `/api/tmdb/discover/genre/${id}${suffix}`
            };
        } else if (type.startsWith('country-')) {
            const parts = type.split('-');
            const code = parts[1]; // country-[code]
            config = {
                title: contextName ? `${contextName} Cinema` : `Region ${code.toUpperCase()}`,
                subtitle: `Regional Archive: ${code.toUpperCase()}`,
                endpoint: `/api/tmdb/discover/country/${code}`
            };
        } else {
            // General Fallback
            config = {
                title: type.replace(/-/g, ' '),
                subtitle: 'Section Archive',
                endpoint: `/api/tmdb/${type}`
            };
        }
    }

    // Initial Fetch
    useEffect(() => {
        let isMounted = true;

        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);
                setMovies([]);
                setPage(1);

                const res = await api.get(config.endpoint, { params: { page: 1 } });

                if (isMounted) {
                    setMovies(res.data.results || []);
                }
            } catch (err) {
                console.error("Section Data Load Failed:", err);
                if (isMounted) setError("Unable to load section data.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchInitialData();
        return () => { isMounted = false; };
    }, [type, config.endpoint]);

    // Load More Handler
    const handleLoadMore = async () => {
        try {
            setLoadingMore(true);
            const nextPage = page + 1;
            const res = await api.get(config.endpoint, { params: { page: nextPage } });
            const newMovies = res.data.results || [];

            if (newMovies.length > 0) {
                setMovies(prev => [...prev, ...newMovies]);
                setPage(nextPage);
            }
        } catch (err) {
            console.error("Load More Failed:", err);
        } finally {
            setLoadingMore(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 px-8 container mx-auto">
                <div className="flex flex-col items-center justify-center h-[50vh] gap-6">
                    <div className="w-12 h-12 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
                    <span className="text-tiny font-black uppercase tracking-[0.8em] animate-pulse">
                        Loading Archive...
                    </span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-32 px-8 container mx-auto text-center">
                <h2 className="text-4xl font-black uppercase tracking-tight mb-4">Connection Lost</h2>
                <p className="text-muted text-sm uppercase tracking-widest mb-8">{error}</p>
                <Link to="/home" className="inline-block px-12 py-5 border border-white/20 text-tiny font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    // 🧠 Smart Back Link Logic
    let backLink = '/home';
    let backText = 'Back to Dashboard';

    if (type.startsWith('genre-')) {
        const parts = type.split('-');
        const id = parts[1];
        backLink = `/home?genre=${id}&genreName=${contextName || 'Genre'}`;
        backText = contextName ? `Back to ${contextName} Category` : 'Back to Genre';
    } else if (type.startsWith('country-')) {
        const parts = type.split('-');
        const code = parts[1];
        backLink = `/home?country=${code}&countryName=${contextName || 'Country'}`;
        backText = contextName ? `Back to ${contextName}` : 'Back to Region';
    }

    return (
        <div className="min-h-screen bg-background pb-32 pt-28">

            {/* Header Section */}
            <div className="container mx-auto px-8 mb-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-white/5"
                >
                    <div className="space-y-4">
                        <Link to={backLink} className="inline-flex items-center gap-2 text-xs text-white uppercase tracking-[0.2em] font-black hover:text-accent transition-colors">
                            <ChevronLeft size={16} /> {backText}
                        </Link>

                        <div className="space-y-1">
                            <span className="text-[10px] text-accent/60 uppercase font-black tracking-[0.5em] block">
                                {config.subtitle}
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white italic leading-[0.9]">
                                {config.title}.
                            </h1>
                        </div>
                    </div>

                    {/* Stats / Meta - Aligned to bottom right of header */}
                    <div className="flex items-center gap-4 text-white/20">
                        <Layers size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                            {movies.length} Titles
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Content Grid */}
            <div className="container mx-auto px-8 space-y-20">
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 gap-3 md:gap-4">
                    {movies.map((movie, i) => (
                        <motion.div
                            key={`${movie.id}-${i}`} // Ensure uniqueness for dupes if API acts up
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: (i % 20) * 0.03, duration: 0.4 }}
                        >
                            <MovieCard movie={movie} />
                        </motion.div>
                    ))}
                </div>

                {/* Load More Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="group relative px-16 py-6 border border-white/10 hover:border-accent/40 bg-surface/50 hover:bg-accent/5 overflow-hidden transition-all disabled:opacity-50"
                    >
                        <div className="flex items-center gap-4 text-tiny font-black uppercase tracking-[0.3em] text-white/50 group-hover:text-accent transition-colors relative z-10">
                            {loadingMore ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            {loadingMore ? 'Retrieving Data...' : 'Load More Movies'}
                        </div>
                        <div className="absolute inset-0 bg-accent/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 will-change-transform" />
                    </button>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full h-px bg-white/10 z-50 overflow-hidden">
                <motion.div
                    className="h-full bg-accent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 1 }}
                />
            </div>
        </div>
    );
};

export default SectionPage;
