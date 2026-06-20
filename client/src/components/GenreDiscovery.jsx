import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const GENRE_IMAGES = {
    "Action":          "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&q=80",
    "Adventure":       "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    "Animation":       "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&q=80",
    "Comedy":          "https://images.unsplash.com/photo-1527228113244-84619d885834?w=800&q=80",
    "Crime":           "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&q=80",
    "Documentary":     "https://images.unsplash.com/photo-1559589689-577aabd1ce4c?w=800&q=80",
    "Drama":           "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&q=80",
    "Family":          "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80",
    "Fantasy":         "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
    "History":         "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&q=80",
    "Horror":          "https://images.unsplash.com/photo-1505635552518-3448ff116af3?w=800&q=80",
    "Music":           "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    "Mystery":         "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=800&q=80",
    "Romance":         "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80",
    "Science Fiction": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    "Thriller":        "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&q=80",
    "War":             "https://images.unsplash.com/photo-1503221043305-f7498f8b7888?w=800&q=80",
    "Western":         "https://images.unsplash.com/photo-1533167649158-6d508895b680?w=800&q=80",
};

const STATIC_GENRES = [
    { id: 28,    name: "Action" },        { id: 12,    name: "Adventure" },
    { id: 16,    name: "Animation" },     { id: 35,    name: "Comedy" },
    { id: 80,    name: "Crime" },         { id: 99,    name: "Documentary" },
    { id: 18,    name: "Drama" },         { id: 10751, name: "Family" },
    { id: 14,    name: "Fantasy" },       { id: 36,    name: "History" },
    { id: 27,    name: "Horror" },        { id: 10402, name: "Music" },
    { id: 9648,  name: "Mystery" },       { id: 10749, name: "Romance" },
    { id: 878,   name: "Science Fiction"},{ id: 53,    name: "Thriller" },
    { id: 10752, name: "War" },           { id: 37,    name: "Western" },
];

const TRENDING_IDS = new Set([28, 12, 10749, 35, 27]);

const GenreCard = ({ genre, onClick, isTrending, index }) => (
    <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.015, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={onClick}
        className="group relative h-28 md:h-32 overflow-hidden rounded-sm bg-surface-container-high cursor-pointer"
    >
        {/* Background image */}
        {GENRE_IMAGES[genre.name] && (
            <img
                src={GENRE_IMAGES[genre.name]}
                alt={genre.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-60"
                loading="lazy"
            />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Trending pip */}
        {isTrending && (
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-white/70" />
        )}

        {/* Label */}
        <div className="absolute inset-0 flex items-end p-4">
            <div className="flex items-center justify-between w-full">
                <h3 className="font-headline text-white text-base md:text-lg font-semibold leading-tight">
                    {genre.name}
                </h3>
                <ArrowRight
                    size={14}
                    className="text-white/0 group-hover:text-white/80 transition-all translate-x-2 group-hover:translate-x-0"
                />
            </div>
        </div>
    </motion.button>
);

const GenreDiscovery = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [genres, setGenres] = useState(STATIC_GENRES);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setIsLoading(true);
        api.get('/api/tmdb/genres')
            .then(res => { if (res.data.genres?.length) setGenres(res.data.genres); })
            .catch(() => setGenres(STATIC_GENRES))
            .finally(() => setIsLoading(false));
    }, [isOpen]);

    // Close on ESC
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        return q ? genres.filter(g => g.name.toLowerCase().includes(q)) : genres;
    }, [search, genres]);

    const handleClick = (id, name) => { onClose(); navigate(`/home?genre=${id}&genreName=${name}`); };

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
                        className="flex flex-col w-full max-w-container-max mx-auto flex-1 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-outline-variant/30 flex-shrink-0">
                            <div>
                                <p className="font-sans text-xs text-on-surface-variant tracking-[0.15em] uppercase mb-1">Browse</p>
                                <h2 className="font-headline text-2xl text-primary font-semibold">Genres</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="text"
                                    placeholder="Filter genres…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="input-minimal max-w-[200px] py-2 text-sm"
                                />
                                {isLoading && <span className="material-symbols-outlined text-on-surface-variant/50 text-[20px] animate-spin">sync</span>}
                                <span className="font-sans text-xs text-on-surface-variant">{filtered.length}</span>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 md:px-12 py-8" data-lenis-prevent="true">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                                {filtered.map((genre, i) => (
                                    <GenreCard
                                        key={genre.id}
                                        genre={genre}
                                        index={i}
                                        isTrending={TRENDING_IDS.has(genre.id)}
                                        onClick={() => handleClick(genre.id, genre.name)}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GenreDiscovery;
