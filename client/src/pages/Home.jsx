import { useState, useEffect, useMemo, memo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { HeroSkeleton, RowSkeleton } from '../components/Skeletons';
import { Layers, ChevronLeft, ChevronRight, Play, Star, Info } from 'lucide-react';

const Hero3D = memo(({ movies, heroIndex, setHeroIndex, loading }) => {
    // ⚡ PERFORMANCE: Use MotionValues instead of State to bypass React Render Cycle
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth physics-based spring interpolation for buttery transitions
    const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20, mass: 0.5 });
    const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20, mass: 0.5 });

    const rotateX = useTransform(smoothY, [-10, 10], [5, -5]); // Inverted tilt
    const rotateY = useTransform(smoothX, [-10, 10], [-5, 5]);

    // Parallax background movement
    const bgX = useTransform(smoothX, [-10, 10], [20, -20]);
    const bgY = useTransform(smoothY, [-10, 10], [20, -20]);

    // Active card movement (very subtle)
    const cardX = useTransform(smoothX, [-10, 10], [5, -5]);
    const cardY = useTransform(smoothY, [-10, 10], [5, -5]);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        // Calculate normalized position -10 to 10
        const x = (clientX / innerWidth - 0.5) * 20;
        const y = (clientY / innerHeight - 0.5) * 20;

        // DIRECT update - No React Commit Phase 🚀
        mouseX.set(x);
        mouseY.set(y);
    };

    // 🧲 Magnetic Button Component
    const MagneticButton = ({ children, className }) => {
        const ref = useRef(null);
        const x = useMotionValue(0);
        const y = useMotionValue(0);
        const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
        const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

        const handleMouse = (e) => {
            const { clientX, clientY } = e;
            const { left, top, width, height } = ref.current.getBoundingClientRect();
            const centerX = left + width / 2;
            const centerY = top + height / 2;
            x.set((clientX - centerX) * 0.3); // Pull strength
            y.set((clientY - centerY) * 0.3);
        };

        const reset = () => {
            x.set(0);
            y.set(0);
        };

        return (
            <motion.button
                ref={ref}
                onMouseMove={handleMouse}
                onMouseLeave={reset}
                style={{ x: springX, y: springY }}
                className={className}
            >
                {children}
            </motion.button>
        );
    };

    // 🚀 True Carousel Transition System
    const getMovieIndex = (idx) => (idx + movies.length) % movies.length;

    // We render a window of 3 movies: [Prev, Center, Next]
    const visibleIndices = [
        getMovieIndex(heroIndex - 1),
        heroIndex,
        getMovieIndex(heroIndex + 1)
    ];

    const cardVariants = {
        center: {
            x: "0%",
            scale: 1,
            zIndex: 30,
            opacity: 1,
            filter: "blur(0px) brightness(1)",
            rotateY: 0,
            transition: { duration: 0.7, type: "spring", bounce: 0.2 }
        },
        left: {
            x: "-60%",
            scale: 0.8,
            zIndex: 10,
            opacity: 0.4,
            filter: "blur(4px) brightness(0.5)",
            rotateY: 15,
            transition: { duration: 0.7, type: "spring", bounce: 0.2 }
        },
        right: {
            x: "60%",
            scale: 0.8,
            zIndex: 10,
            opacity: 0.4,
            filter: "blur(4px) brightness(0.5)",
            rotateY: -15,
            transition: { duration: 0.7, type: "spring", bounce: 0.2 }
        }
    };

    if (loading && !movies[heroIndex]) return <HeroSkeleton />;
    if (!movies[heroIndex]) return null;

    return (
        <section
            className="relative h-[110vh] w-full bg-[#050505] flex items-center justify-center overflow-hidden perspective-1000 will-change-transform"
            onMouseMove={handleMouseMove}
        >
            {/* 🌌 Dynamic Background */}
            <div className="absolute inset-0 bg-aurora opacity-30 blur-3xl z-0 pointer-events-none translate-z-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent z-10" />

            {/* 🎇 Parallax Particles */}
            <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0 z-[1] opacity-20 pointer-events-none will-change-transform">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
            </motion.div>

            {/* 🃏 3D Card Stack */}
            <div className="relative z-20 w-full h-full flex items-center justify-center perspective-1000 transform-style-3d">
                <AnimatePresence initial={false} mode="popLayout">
                    {visibleIndices.map((idx, i) => {
                        const movie = movies[idx];
                        if (!movie) return null;

                        let position = 'center';
                        if (i === 0) position = 'left';
                        else if (i === 2) position = 'right';

                        const isCenter = position === 'center';

                        return (
                            <motion.div
                                key={movie.id}
                                layoutId={movie.id}
                                variants={cardVariants}
                                initial={false}
                                animate={position}
                                style={isCenter ? { rotateX, rotateY: 0, x: cardX, y: cardY } : {}}
                                className={`absolute w-[90vw] md:w-[70vw] lg:w-[65vw] aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 group bg-[#0a0a0a] will-change-transform cursor-pointer ${isCenter ? 'z-30' : 'z-10'}`}
                                onClick={() => {
                                    if (position === 'left') setHeroIndex(getMovieIndex(heroIndex - 1));
                                    if (position === 'right') setHeroIndex(getMovieIndex(heroIndex + 1));
                                }}
                            >
                                <motion.img
                                    src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
                                    className="w-full h-full object-cover"
                                    alt={movie.title}
                                    style={{ scale: isCenter ? 1.05 : 1 }}
                                />

                                {/* Overlay & Content only for Center */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-500"
                                    animate={{ opacity: isCenter ? 0.9 : 0.4 }}
                                />

                                {isCenter && (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="absolute inset-x-0 bottom-0 p-8 md:p-16 lg:p-20 flex flex-col justify-end"
                                        >
                                            <div className="space-y-6 max-w-4xl relative z-30">
                                                <div className="flex flex-wrap gap-3">
                                                    <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest border border-white/20 text-white shadow-lg">
                                                        {movie.release_date?.split('-')[0] || '2026'}
                                                    </span>
                                                    <span className="px-4 py-1.5 bg-accent/90 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)] flex items-center gap-2">
                                                        <Star size={12} fill="currentColor" /> {movie.vote_average?.toFixed(1)}
                                                    </span>
                                                </div>
                                                <h1 className="relative text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
                                                    {movie.title}
                                                </h1>
                                                <p className="text-sm md:text-lg text-white/80 line-clamp-2 max-w-2xl font-medium leading-relaxed drop-shadow-md">
                                                    {movie.overview}
                                                </p>

                                                <div className="pt-6 flex flex-wrap gap-4">
                                                    <Link to={`/movie/${movie.id}`}>
                                                        <MagneticButton className="px-8 py-4 bg-white text-black text-sm font-black uppercase tracking-[0.2em] rounded-lg shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_rgba(255,255,255,0.5)] flex items-center gap-3">
                                                            <Play size={18} fill="currentColor" /> Watch Now
                                                        </MagneticButton>
                                                    </Link>
                                                    <Link to={`/movie/${movie.id}`}>
                                                        <MagneticButton className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-black uppercase tracking-[0.2em] rounded-lg hover:border-white hover:bg-white/20 flex items-center gap-3">
                                                            <Info size={18} /> Details
                                                        </MagneticButton>
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Manual Navigation */}
            <button
                onClick={() => setHeroIndex(prev => (prev - 1 + movies.length) % movies.length)}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 hover:border-white/40 backdrop-blur-md text-white transition-all group"
            >
                <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
            </button>

            <button
                onClick={() => setHeroIndex(prev => (prev + 1) % movies.length)}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 hover:border-white/40 backdrop-blur-md text-white transition-all group"
            >
                <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-12 z-30 flex gap-3">
                {movies.slice(0, 5).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setHeroIndex(idx)}
                        className={`h-1.5 transition-all duration-500 rounded-full ${idx === heroIndex ? 'w-12 bg-white shadow-[0_0_10px_white]' : 'w-2 bg-white/20 hover:bg-white/50'}`}
                    />
                ))}
            </div>
        </section>
    );
});

const Row = memo(({ title, movies, subtitle = "Movies", section: sectionKey, loading }) => {
    if (loading && (!movies || movies.length === 0)) return <RowSkeleton />;
    if (!movies || movies.length === 0) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.8 }}
            className="py-16 md:py-24 relative render-optimize"
        >
            <div className="container mx-auto px-8 mb-10 flex items-end justify-between border-b border-white/5 pb-6">
                <div className="space-y-2">
                    <motion.span
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        className="text-xs text-accent font-black tracking-[0.4em] uppercase"
                    >
                        {subtitle}
                    </motion.span>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                        {title}<span className="text-accent">.</span>
                    </h2>
                </div>
                <Link
                    to={sectionKey ? `/section/${sectionKey}` : `/home?search=${title}`}
                    className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                >
                    View All
                    <div className="w-8 h-[1px] bg-white/20 group-hover:w-16 group-hover:bg-accent transition-all duration-500" />
                </Link>
            </div>

            <div className="container mx-auto px-8">
                <div className="flex gap-6 overflow-x-auto pb-8 -mx-8 px-8 scrollbar-hide snap-x snap-mandatory">
                    {movies.slice(0, 10).map((m, i) => (
                        <div key={m.id || i} className="snap-center shrink-0 w-[140px] md:w-[200px]">
                            <MovieCard movie={m} />
                        </div>
                    ))}
                    <Link
                        to={sectionKey ? `/section/${sectionKey}` : `/home?search=${title}`}
                        className="snap-center shrink-0 w-[140px] md:w-[200px] aspect-[2/3] bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-4 group hover:bg-white/10 hover:border-accent/50 transition-all cursor-pointer"
                    >
                        <div className="p-4 rounded-full border border-white/20 text-white/40 group-hover:text-white group-hover:border-accent transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]">
                            <ChevronRight size={24} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-white/40 group-hover:text-white">View All</span>
                    </Link>
                </div>
            </div>
        </motion.section>
    );
});

const Home = () => {
    const { user } = useAuth();
    const location = useLocation();
    const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const genreId = query.get('genre');
    const genreName = query.get('genreName');
    const countryCode = query.get('country');
    const countryName = query.get('countryName');
    const searchQuery = query.get('search');
    const section = query.get('section');

    const [data, setData] = useState({
        genreMovies: [],
        genreTop: [],
        genreNew: [],
        countryMovies: [],
        trendingToday: [],
        popular: [],
        topRated: [],
        loading: true,
        error: null
    });

    const [heroIndex, setHeroIndex] = useState(0);

    // 🏎️ Data Stream Optimization
    useEffect(() => {
        let isMounted = true;
        const fetchHomeData = async () => {
            try {
                if (isMounted) setData(prev => ({ ...prev, loading: true, error: null }));

                if (genreId) {
                    const [popularRes, topRes, newRes] = await Promise.all([
                        api.get(`/api/tmdb/discover/genre/${genreId}`),
                        api.get(`/api/tmdb/discover/genre/${genreId}/top`),
                        api.get(`/api/tmdb/discover/genre/${genreId}/new`)
                    ]);

                    if (isMounted) {
                        setData(prev => ({
                            ...prev,
                            genreMovies: popularRes.data.results || [],
                            genreTop: topRes.data.results || [],
                            genreNew: newRes.data.results || [],
                            loading: false
                        }));
                    }
                } else if (countryCode) {
                    const res = await api.get(`/api/tmdb/discover/country/${countryCode}`);
                    if (isMounted) {
                        setData(prev => ({
                            ...prev,
                            countryMovies: res.data.results || [],
                            loading: false
                        }));
                    }
                } else if (section) {
                    let endpoint = '';
                    if (section === 'trending') endpoint = '/api/tmdb/trending/today';
                    else if (section === 'top-rated') endpoint = '/api/tmdb/top-rated';
                    else if (section === 'popular') endpoint = '/api/tmdb/popular';

                    const res = await api.get(endpoint);
                    if (isMounted) {
                        setData(prev => ({
                            ...prev,
                            genreMovies: res.data.results || [],
                            loading: false
                        }));
                    }
                } else if (searchQuery) {
                    const res = await api.get(`/api/tmdb/search?q=${searchQuery}`);
                    if (isMounted) {
                        setData(prev => ({
                            ...prev,
                            genreMovies: res.data.results || [],
                            loading: false
                        }));
                    }
                } else {
                    const [trendingRes, popularRes, topRatedRes] = await Promise.all([
                        api.get('/api/tmdb/trending/today'),
                        api.get('/api/tmdb/popular'),
                        api.get('/api/tmdb/top-rated')
                    ]);

                    if (isMounted) {
                        setData({
                            genreMovies: [],
                            genreTop: [],
                            genreNew: [],
                            countryMovies: [],
                            trendingToday: trendingRes.data.results || [],
                            popular: popularRes.data.results || [],
                            topRated: topRatedRes.data.results || [],
                            loading: false,
                            error: null
                        });
                    }
                }
            } catch (err) {
                console.error("Home Data Fetch Fail:", err);
                if (isMounted) {
                    setData(prev => ({ ...prev, loading: false, error: "Something went wrong. Please try again." }));
                }
            }
        };

        fetchHomeData();
        return () => { isMounted = false; };
    }, [genreId, searchQuery, countryCode, section]);

    const moviesForHero = useMemo(() => {
        if (genreId) return data.genreMovies;
        if (countryCode) return data.countryMovies;
        if (searchQuery || section) return data.genreMovies;
        return data.trendingToday;
    }, [genreId, countryCode, searchQuery, section, data.genreMovies, data.countryMovies, data.trendingToday]);

    // 🏎️ Hero Image Preloading
    useEffect(() => {
        if (!moviesForHero || moviesForHero.length === 0) return;
        const nextIndices = [(heroIndex + 1) % moviesForHero.length, (heroIndex + 2) % moviesForHero.length];
        nextIndices.forEach(idx => {
            const movie = moviesForHero[idx];
            if (movie?.backdrop_path) {
                const img = new Image();
                img.src = `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;
            }
        });
    }, [moviesForHero, heroIndex]);

    if (data.error) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center space-y-10">
                <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 blur-[100px] rounded-full" />
                    <Layers size={64} className="text-red-500 relative z-10" />
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-white z-10">System Malfunction</h1>
                <p className="text-white/40 font-mono z-10">{data.error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="z-10 px-8 py-3 bg-white text-black font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded-sm"
                >
                    Reboot System
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#050505] min-h-screen selection:bg-accent selection:text-white overflow-x-hidden">


            {/* Only show Hero on Main Dashboard */}
            {!genreId && !countryCode && !searchQuery && !section && (
                <Hero3D
                    movies={moviesForHero}
                    heroIndex={heroIndex}
                    setHeroIndex={setHeroIndex}
                    loading={data.loading}
                />
            )}

            <div className={`relative z-10 space-y-8 ${(!genreId && !countryCode && !searchQuery && !section) ? '-mt-32' : 'pt-32'}`}>
                {/* Content Routing Logic */}
                {genreId ? (
                    <div className="container mx-auto px-8 min-h-screen">
                        <div className="flex items-end gap-6 mb-16 border-b border-white/10 pb-8">
                            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
                                {genreName}
                            </h1>
                            <Link to="/home?trigger=genres" className="mb-4 text-xs font-black uppercase tracking-widest text-accent hover:text-white transition-colors">
                                ← Change Genre
                            </Link>
                        </div>
                        <Row title="Ready for You" subtitle={`Top ${genreName}`} movies={data.genreTop} section={`genre-${genreId}-top?name=${genreName}`} loading={data.loading} />
                        <Row title="Fresh Arrivals" subtitle="Just In" movies={data.genreNew} section={`genre-${genreId}-new?name=${genreName}`} loading={data.loading} />
                        <Row title="Entire Collection" subtitle="Explore" movies={data.genreMovies} section={`genre-${genreId}?name=${genreName}`} loading={data.loading} />
                    </div>
                ) : countryCode ? (
                    <div className="container mx-auto px-8 min-h-screen">
                        <div className="flex items-end gap-6 mb-16 border-b border-white/10 pb-8">
                            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
                                {countryName}
                            </h1>
                            <Link to="/home?trigger=countries" className="mb-4 text-xs font-black uppercase tracking-widest text-accent hover:text-white transition-colors">
                                ← Change Region
                            </Link>
                        </div>
                        <Row title="National Hits" subtitle={`Best of ${countryName}`} movies={data.countryMovies} section={`country-${countryCode}?name=${countryName}`} loading={data.loading} />
                    </div>
                ) : (searchQuery || section) ? (
                    <div className="container mx-auto px-8 min-h-screen">
                        <div className="flex items-end justify-between mb-16 border-b border-white/10 pb-8">
                            <div>
                                <span className="text-accent text-xs font-black uppercase tracking-[0.4em] block mb-2">{section ? 'Archive' : 'Search'}</span>
                                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white">
                                    {section === 'trending' ? 'Global Trending' :
                                        section === 'top-rated' ? 'Hall of Fame' :
                                            section === 'popular' ? 'Viral Now' :
                                                searchQuery}
                                </h1>
                            </div>
                            <Link to="/home" className="px-8 py-3 border border-white/20 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-full">
                                Clear
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
                            {data.genreMovies.map((m, i) => (
                                <MovieCard key={m.id || i} movie={m} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <Row title="Trending Now" subtitle="Global" section="trending" movies={data.trendingToday} loading={data.loading} />
                        <Row title="Critically Acclaimed" subtitle="Top Rated" section="top-rated" movies={data.topRated} loading={data.loading} />
                        <Row title="Crowd Favorites" subtitle="Popular" section="popular" movies={data.popular} loading={data.loading} />
                    </>
                )}
            </div>

            <div className="h-40 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
        </div>
    );
};

export default Home;
