import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import TrailerOverlay from '../components/TrailerOverlay';

// Slideshow config
const SLIDE_DURATION = 6000;

const FADE_UP = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Section Row component ────────────────────────────────────
const SectionRow = ({ title, movies, viewAllLink, onViewAll }) => (
    <section className="py-8">
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
            <div>
                <h2 className="font-sans text-2xl md:text-3xl font-bold tracking-tight text-primary">{title}</h2>
            </div>
            {(viewAllLink || onViewAll) && (
                <button
                    onClick={onViewAll ? onViewAll : undefined}
                    className="font-sans text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5"
                >
                    {viewAllLink ? (
                        <Link to={viewAllLink} className="flex items-center gap-1.5">
                            View All
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </Link>
                    ) : (
                        <>
                            View All
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </>
                    )}
                </button>
            )}
        </div>
        {/* Scrollable row */}
        <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x">
            {movies.map((m, i) => (
                <div key={m.id || i} className="snap-start shrink-0">
                    <MovieCard movie={m} />
                </div>
            ))}
        </div>
    </section>
);

// ─── Skeleton row ────────────────────────────────────────────
const SkeletonRow = ({ count = 6 }) => (
    <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="w-[130px] md:w-[160px] flex-shrink-0">
                <div className="w-full aspect-[2/3] skeleton mb-3" />
                <div className="w-3/4 h-3 skeleton mb-1.5" />
                <div className="w-1/2 h-2.5 skeleton" />
            </div>
        ))}
    </div>
);

// ─── Main Component ──────────────────────────────────────────
const Home = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const genreId = query.get('genre'), genreName = query.get('genreName');
    const countryCode = query.get('country'), countryName = query.get('countryName');
    const searchQuery = query.get('search'), section = query.get('section');

    const [data, setData] = useState({
        trendingToday: [], popular: [], topRated: [], genreMovies: [], countryMovies: [],
        personalized: [], loading: true, error: null,
    });

    const [activeHeroIndex, setActiveHeroIndex] = useState(0);

    const [activeTrailerId, setActiveTrailerId] = useState(null);
    const [activeTrailerTitle, setActiveTrailerTitle] = useState('');
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchHomeData = async () => {
            try {
                if (isMounted) setData((prev) => ({ ...prev, loading: true, error: null }));
                if (genreId) {
                    const res = await api.get(`/api/tmdb/discover/genre/${genreId}`);
                    if (isMounted) setData((prev) => ({ ...prev, genreMovies: res.data.results || [], loading: false }));
                } else if (countryCode) {
                    const res = await api.get(`/api/tmdb/discover/country/${countryCode}`);
                    if (isMounted) setData((prev) => ({ ...prev, countryMovies: res.data.results || [], loading: false }));
                } else if (searchQuery || section) {
                    const ep = searchQuery ? `/api/tmdb/search?q=${searchQuery}`
                        : section === 'trending' ? '/api/tmdb/trending/today'
                        : section === 'top-rated' ? '/api/tmdb/top-rated'
                        : '/api/tmdb/popular';
                    const res = await api.get(ep);
                    if (isMounted) setData((prev) => ({ ...prev, genreMovies: res.data.results || [], loading: false }));
                } else {
                    const requests = [
                        api.get('/api/tmdb/trending/today'),
                        api.get('/api/tmdb/popular'),
                        api.get('/api/tmdb/top-rated'),
                    ];
                    if (user) requests.push(api.get('/api/recommendations/personalized'));
                    const responses = await Promise.all(requests);
                    if (isMounted) {
                        setData({
                            trendingToday: responses[0].data.results || [],
                            popular: responses[1].data.results || [],
                            topRated: responses[2].data.results || [],
                            personalized: responses[3]?.data || [],
                            genreMovies: [], countryMovies: [],
                            loading: false, error: null,
                        });
                    }
                }
            } catch (err) {
                console.error('Home fetch error:', err);
                if (isMounted) setData((prev) => ({ ...prev, loading: false, error: 'Failed to load films.' }));
            }
        };
        fetchHomeData();
        return () => { isMounted = false; };
    }, [genreId, searchQuery, countryCode, section, user]);

    // Auto-advance hero slideshow
    useEffect(() => {
        if (data.loading || data.trendingToday.length <= 1) return;
        const interval = setInterval(() => {
            setActiveHeroIndex((prev) => (prev + 1) % Math.min(5, data.trendingToday.length));
        }, SLIDE_DURATION);
        return () => clearInterval(interval);
    }, [data.loading, data.trendingToday.length]);

    const triggerTrailer = (id, title) => {
        setActiveTrailerId(id);
        setActiveTrailerTitle(title);
        setIsTrailerOpen(true);
    };

    const heroMovies = useMemo(() => {
        return data.trendingToday.slice(0, 5).map(m => ({
            id: m.id, movieId: m.id,
            title: m.title, backdropPath: m.backdrop_path,
            posterPath: m.poster_path, voteAverage: m.vote_average,
            overview: m.overview, releaseDate: m.release_date,
        }));
    }, [data.trendingToday]);

    const currentHero = heroMovies[activeHeroIndex];

    return (
        <div className="bg-background text-on-surface min-h-screen font-sans">

            <TrailerOverlay
                isOpen={isTrailerOpen}
                onClose={() => setIsTrailerOpen(false)}
                movieId={activeTrailerId}
                movieTitle={activeTrailerTitle}
            />

            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-20 pb-20">

                {/* ─── Loading State ──────────────────────── */}
                {data.loading && !genreId && !countryCode && !searchQuery && !section && (
                    <div className="py-20 space-y-16">
                        {['Trending Today', 'Most Popular', 'Top Rated'].map((title) => (
                            <section key={title} className="border-t border-outline-variant/30 pt-10">
                                <div className="mb-8">
                                    <div className="w-48 h-7 skeleton mb-2" />
                                    <div className="w-10 h-[2px] skeleton" />
                                </div>
                                <SkeletonRow count={7} />
                            </section>
                        ))}
                    </div>
                )}

                {/* ─── Category / Search Results ──────────── */}
                {!data.loading && (genreId || countryCode || searchQuery || section) && (
                    <div className="py-8">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                        >
                            <motion.div variants={FADE_UP} className="flex justify-between items-end mb-12 border-b border-outline-variant/30 pb-8">
                                <div>
                                    <p className="font-sans text-sm font-semibold text-on-surface-variant tracking-[0.15em] uppercase mb-2">
                                        Browse
                                    </p>
                                    <h1 className="font-sans text-4xl md:text-5xl font-bold tracking-tight text-primary">
                                        {searchQuery ? `"${searchQuery}"`
                                            : genreName || countryName
                                            || (section === 'trending' ? 'Trending Today'
                                            : section === 'top-rated' ? 'Top Rated'
                                            : 'Most Popular')}
                                    </h1>
                                </div>
                                <button
                                    onClick={() => navigate('/home')}
                                    className="btn-ghost flex items-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                    Back
                                </button>
                            </motion.div>

                            {data.loading ? (
                                <SkeletonRow count={10} />
                            ) : (data.genreMovies.length > 0 || data.countryMovies.length > 0) ? (
                                <motion.div variants={FADE_UP} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-gutter gap-y-10 justify-items-center">
                                    {(data.genreMovies.length > 0 ? data.genreMovies : data.countryMovies).map((m, i) => (
                                        <MovieCard key={m.id || i} movie={m} />
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="py-24 text-center">
                                    <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">search_off</span>
                                    <p className="font-sans text-body-md text-on-surface-variant">No films found.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}

                {/* ─── Default Discover Feed ──────────────── */}
                {!data.loading && !genreId && !countryCode && !searchQuery && !section && (
                    <div>
                        {/* ─── Hero Feature Slideshow ─── */}
                        {heroMovies.length > 0 && currentHero && (
                            <motion.section
                                initial="hidden"
                                animate="visible"
                                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                                className="py-8 relative"
                            >
                                <div className="relative overflow-hidden rounded-[24px] md:rounded-[32px] bg-black shadow-2xl min-h-[450px] md:min-h-[550px] group">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentHero.id}
                                            initial={{ opacity: 0, scale: 1.05 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{
                                                backgroundImage: `url(https://image.tmdb.org/t/p/original${currentHero.backdropPath || currentHero.posterPath})`,
                                            }}
                                        />
                                    </AnimatePresence>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                                    {/* Content */}
                                    <div className="relative z-10 flex flex-col justify-end h-full min-h-[450px] md:min-h-[550px] p-8 md:p-14 pb-16">
                                        <AnimatePresence mode="wait">
                                            <motion.div 
                                                key={currentHero.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                            >
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="font-sans text-xs font-bold text-white/90 tracking-widest uppercase bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                                                        Trending Today
                                                    </span>
                                                    {currentHero.voteAverage > 0 && (
                                                        <span className="font-sans text-sm font-semibold text-white/90 flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[16px] text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                            {currentHero.voteAverage.toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                                <h2 className="font-sans text-4xl md:text-6xl text-white font-extrabold tracking-tight mb-5 max-w-3xl leading-[1.1]">
                                                    {currentHero.title}
                                                </h2>
                                                {currentHero.overview && (
                                                    <p className="font-sans text-lg text-white/80 mb-8 max-w-2xl hidden md:line-clamp-3 leading-relaxed font-medium">
                                                        {currentHero.overview}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-4">
                                                    <button
                                                        onClick={() => triggerTrailer(currentHero.id, currentHero.title)}
                                                        className="bg-white text-black px-8 py-4 rounded-full font-sans font-bold text-sm tracking-wide transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                                        Watch Trailer
                                                    </button>
                                                    <Link
                                                        to={`/movie/${currentHero.id}`}
                                                        className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full font-sans font-bold text-sm tracking-wide transition-all hover:bg-white/30 flex items-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">info</span>
                                                        More Info
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                    
                                    {/* Slideshow Dots */}
                                    {heroMovies.length > 1 && (
                                        <div className="absolute bottom-8 right-8 md:right-14 flex items-center gap-2 z-20">
                                            {heroMovies.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setActiveHeroIndex(idx)}
                                                    className={`h-2 rounded-full transition-all duration-500 ${activeHeroIndex === idx ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-2 bg-white/40 hover:bg-white/70'}`}
                                                    aria-label={`Go to slide ${idx + 1}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.section>
                        )}



                        {/* ─── Trending Today ─────────────────────── */}
                        {data.trendingToday.length > 0 && (
                            <SectionRow
                                title="Trending Today"
                                movies={data.trendingToday}
                                viewAllLink="/home?section=trending"
                            />
                        )}

                        {/* ─── Top Rated ──────────────────────────── */}
                        {data.topRated.length > 0 && (
                            <SectionRow
                                title="Top Rated"
                                movies={data.topRated}
                                viewAllLink="/home?section=top-rated"
                            />
                        )}

                        {/* ─── Most Popular ───────────────────────── */}
                        {data.popular.length > 0 && (
                            <SectionRow
                                title="Most Popular"
                                movies={data.popular}
                                viewAllLink="/home?section=popular"
                            />
                        )}
                    </div>
                )}

                {/* ─── Error State ────────────────────────── */}
                {data.error && (
                    <div className="py-20 text-center">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">error_outline</span>
                        <p className="font-sans text-body-md text-on-surface-variant">{data.error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 btn-primary"
                        >
                            RETRY
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
