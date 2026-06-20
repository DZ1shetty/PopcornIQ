/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { ChevronLeft } from 'lucide-react';
import { MovieCardSkeleton } from '../components/Skeleton';

const SectionPage = () => {
    const { type } = useParams();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const contextName = query.get('name');

    const [movies,      setMovies]      = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page,        setPage]        = useState(1);
    const [error,       setError]       = useState(null);

    /* ── Infinite scroll sentinel ── */
    const observer = useRef();
    const lastRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) handleLoadMore();
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore]);

    /* ── Section config ── */
    const SECTIONS = {
        'trending':  { title: 'Trending Today',  subtitle: 'Live global data',        endpoint: '/api/tmdb/trending/today' },
        'top-rated': { title: 'Top Rated',       subtitle: 'Critically acclaimed',    endpoint: '/api/tmdb/top-rated' },
        'popular':   { title: 'Popular Now',     subtitle: 'Fan favourites',          endpoint: '/api/tmdb/popular' },
    };

    let config = SECTIONS[type];
    let backLink = '/home';
    let backText = 'Home';

    if (!config) {
        if (type.startsWith('genre-')) {
            const [, id, variant] = type.split('-');
            const suffix    = variant === 'top' ? '/top' : variant === 'new' ? '/new' : '';
            const titleBase = contextName || 'Genre';
            config = {
                title:    variant === 'top' ? `${titleBase} — Top Rated` : variant === 'new' ? `${titleBase} — New` : titleBase,
                subtitle: variant === 'top' ? 'Highest rated' : variant === 'new' ? 'Latest releases' : 'Popular in genre',
                endpoint: `/api/tmdb/discover/genre/${id}${suffix}`,
            };
            backLink = `/home?genre=${id}&genreName=${titleBase}`;
            backText = titleBase;
        } else if (type.startsWith('country-')) {
            const [, code] = type.split('-');
            config = {
                title:    contextName ? `${contextName} Cinema` : `Region ${code.toUpperCase()}`,
                subtitle: `Regional cinema · ${code.toUpperCase()}`,
                endpoint: `/api/tmdb/discover/country/${code}`,
            };
            backLink = `/home?country=${code}&countryName=${contextName || 'Country'}`;
            backText = contextName || 'Region';
        } else {
            config = {
                title:    type.replace(/-/g, ' '),
                subtitle: 'Section',
                endpoint: `/api/tmdb/${type}`,
            };
        }
    }

    /* ── Data fetching ── */
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                setMovies([]);
                setPage(1);
                const res = await api.get(config.endpoint, { params: { page: 1 } });
                if (mounted) setMovies(res.data.results || []);
            } catch {
                if (mounted) setError('Unable to load section data. Please try again.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [type, contextName]);

    const handleLoadMore = async () => {
        try {
            setLoadingMore(true);
            const next = page + 1;
            const res = await api.get(config.endpoint, { params: { page: next } });
            const newMovies = res.data.results || [];
            if (newMovies.length > 0) { setMovies(prev => [...prev, ...newMovies]); setPage(next); }
        } catch { /* silent */ }
        finally { setLoadingMore(false); }
    };

    /* ── Loading state ── */
    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-28 pb-20">
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                    {/* Header skeleton */}
                    <div className="mb-12 space-y-3">
                        <div className="h-3 w-24 bg-surface-container rounded-sm animate-pulse" />
                        <div className="h-10 w-64 bg-surface-container rounded-sm animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    /* ── Error state ── */
    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-sm px-6 space-y-6">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">wifi_off</span>
                    <h2 className="font-headline text-2xl text-primary font-semibold">Connection lost</h2>
                    <p className="font-sans text-sm text-on-surface-variant">{error}</p>
                    <Link to="/home" className="btn-primary inline-flex">Back to Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32 pt-28">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">

                {/* Page header */}
                <div className="mb-12">
                    <Link
                        to={backLink}
                        className="inline-flex items-center gap-1.5 font-sans text-xs text-on-surface-variant hover:text-primary transition-colors mb-6"
                    >
                        <ChevronLeft size={14} strokeWidth={1.5} />
                        {backText}
                    </Link>

                    <div className="flex items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
                        <div>
                            <p className="font-sans text-xs text-on-surface-variant tracking-[0.12em] uppercase mb-2">
                                {config.subtitle}
                            </p>
                            <h1 className="font-headline text-4xl md:text-5xl text-primary font-semibold">
                                {config.title}
                            </h1>
                        </div>
                        <span className="font-sans text-sm text-on-surface-variant flex-shrink-0">
                            {movies.length} titles
                        </span>
                    </div>
                </div>

                {/* Movie grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {movies.map((movie, i) => (
                        <motion.div
                            key={`${movie.id}-${i}`}
                            ref={movies.length === i + 1 ? lastRef : null}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(i * 0.02, 0.3) }}
                        >
                            <MovieCard movie={movie} />
                        </motion.div>
                    ))}

                    {/* Load more skeletons */}
                    {loadingMore && Array.from({ length: 6 }).map((_, i) => (
                        <MovieCardSkeleton key={`lm-${i}`} />
                    ))}
                </div>

                {/* Bottom padding sentinel */}
                {!loadingMore && movies.length > 0 && (
                    <p className="text-center font-sans text-xs text-on-surface-variant/30 mt-16">
                        Scroll for more
                    </p>
                )}
            </div>
        </div>
    );
};

export default SectionPage;
