import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ArrowRight, Zap, Mountain, Smile, Skull, FileVideo,
    Theater, Users, Sparkles, History, Ghost, Music, Search,
    Heart, Rocket, MonitorPlay, AlertTriangle, Sword, Star as Badge
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const genreBackdrops = {
    "Action": "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800",
    "Adventure": "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&q=80&w=800",
    "Animation": "https://images.unsplash.com/photo-1633511090164-b43840ea1607?auto=format&fit=crop&q=80&w=800", // 3D blobs
    "Comedy": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800", // Colorful confetti/fun
    "Crime": "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80&w=800", // Dark alley
    "Documentary": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800", // Lens
    "Drama": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
    "Family": "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800",
    "Fantasy": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800", // Galaxy
    "History": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=800",
    "Horror": "https://images.unsplash.com/photo-1505635552518-3448ff116af3?auto=format&fit=crop&q=80&w=800", // Spooky forest
    "Music": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800",
    "Mystery": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800", // Foggy
    "Romance": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=800", // Love
    "Science Fiction": "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=800", // Cyberpunk
    "TV Movie": "https://images.unsplash.com/photo-1593784991095-a205039475fe?auto=format&fit=crop&q=80&w=800", // Screen
    "Thriller": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=800", // Suspense
    "War": "https://images.unsplash.com/photo-1533613220913-26228d500683?auto=format&fit=crop&q=80&w=800", // Smoke
    "Western": "https://images.unsplash.com/photo-1533167649158-6d508895b680?auto=format&fit=crop&q=80&w=800", // Desert
};

const genreIcons = {
    "Action": Zap,
    "Adventure": Mountain,
    "Animation": Smile,
    "Comedy": Smile,
    "Crime": Skull,
    "Documentary": FileVideo,
    "Drama": Theater,
    "Family": Users,
    "Fantasy": Sparkles,
    "History": History,
    "Horror": Ghost,
    "Music": Music,
    "Mystery": Search,
    "Romance": Heart,
    "Science Fiction": Rocket,
    "TV Movie": MonitorPlay,
    "Thriller": AlertTriangle,
    "War": Sword,
    "Western": Badge
};

// Procedural Colors for Fallback
const genreColors = {
    "Action": "from-red-500 to-orange-600",
    "Adventure": "from-green-500 to-teal-600",
    "Animation": "from-pink-500 to-purple-600",
    "Comedy": "from-yellow-400 to-orange-500",
    "Crime": "from-gray-700 to-black",
    "Documentary": "from-blue-400 to-indigo-600",
    "Drama": "from-purple-600 to-indigo-900",
    "Family": "from-cyan-400 to-blue-500",
    "Fantasy": "from-indigo-400 to-purple-600",
    "History": "from-amber-700 to-yellow-900",
    "Horror": "from-red-900 to-black",
    "Music": "from-pink-500 to-rose-600",
    "Mystery": "from-slate-600 to-gray-800",
    "Romance": "from-rose-400 to-pink-600",
    "Science Fiction": "from-cyan-500 to-blue-700",
    "TV Movie": "from-gray-500 to-slate-700",
    "Thriller": "from-amber-600 to-red-800",
    "War": "from-stone-600 to-stone-800",
    "Western": "from-orange-700 to-amber-900"
};

const STATIC_GENRE_FALLBACK = [
    { id: 28, name: "Action" }, { id: 12, name: "Adventure" }, { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" }, { id: 80, name: "Crime" }, { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" }, { id: 10751, name: "Family" }, { id: 14, name: "Fantasy" },
    { id: 36, name: "History" }, { id: 27, name: "Horror" }, { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" }, { id: 10749, name: "Romance" }, { id: 878, name: "Science Fiction" },
    { id: 10770, name: "TV Movie" }, { id: 53, name: "Thriller" }, { id: 10752, name: "War" },
    { id: 37, name: "Western" }
];

const GenreCard = ({ genre, onClick, isTrending, index }) => {
    const [imgError, setImgError] = useState(false);
    const Icon = genreIcons[genre.name] || Sparkles;
    const gradient = genreColors[genre.name] || "from-gray-700 to-gray-900";

    return (
        <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.005 }}
            onClick={onClick}
            className="group relative h-40 xl:h-48 overflow-hidden bg-surface border border-white/5 hover:border-accent/40 transition-all duration-300 rounded-sm"
        >
            {/* Image Layer */}
            {!imgError ? (
                <img
                    src={genreBackdrops[genre.name]}
                    alt={genre.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-60"
                    loading="lazy"
                    onError={() => setImgError(true)}
                />
            ) : (
                /* 🎨 Artistic Fallback Layer */
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-40 transition-opacity`}>
                    <div className="absolute -right-8 -bottom-8 text-white/10 group-hover:text-white/20 transition-colors transform rotate-12 group-hover:rotate-0 duration-700">
                        <Icon size={180} strokeWidth={1} />
                    </div>
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />

            {/* Trending Badge */}
            {isTrending && (
                <div className="absolute top-0 right-0 p-3">
                    <div className="bg-accent text-black text-[7px] font-black uppercase px-2 py-0.5 tracking-widest shadow-lg transform rotate-3 scale-90">
                        Trending
                    </div>
                </div>
            )}

            <div className="absolute inset-0 p-4 xl:p-6 flex flex-col justify-end">
                <div className="relative z-10 text-left">
                    <span className="text-[7px] font-black tracking-widest text-accent mb-2 block opacity-40 group-hover:opacity-100 transition-opacity">
                        ID: {genre.id}
                    </span>
                    <h3 className="text-sm xl:text-lg font-black uppercase tracking-tighter leading-none group-hover:translate-x-1 transition-transform flex items-center gap-2">
                        {genre.name}
                    </h3>
                </div>
            </div>

            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                <ArrowRight size={14} className="text-accent" />
            </div>

            <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-accent group-hover:w-full transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
        </motion.button>
    );
};

const GenreDiscovery = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [genres, setGenres] = useState(STATIC_GENRE_FALLBACK); // Pre-load with fallback for instant UI
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGenres = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get('/api/tmdb/genres');
            if (res.data.genres && res.data.genres.length > 0) {
                setGenres(res.data.genres);
            } else {
                setGenres(STATIC_GENRE_FALLBACK);
            }
        } catch (err) {
            console.error("Genre Link Failure:", err);
            setGenres(STATIC_GENRE_FALLBACK);
            setError("Couldn't load genres. Using saved list.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchGenres();
        }
    }, [isOpen]);

    const [search, setSearch] = useState('');
    const trendingGenres = useMemo(() => new Set([28, 12, 10749, 35, 27]), []);

    const filteredGenres = useMemo(() => {
        const query = search.toLowerCase().trim();
        if (!query) return genres;
        return genres.filter(g => g.name.toLowerCase().includes(query));
    }, [search, genres]);

    const handleGenreClick = (id, name) => {
        onClose();
        navigate(`/home?genre=${id}&genreName=${name}`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1500] flex items-stretch justify-center pt-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/90 backdrop-blur-3xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        className="relative w-full max-w-[1800px] flex flex-col p-4 md:p-6 overflow-hidden"
                    >
                        {/* Ultra Compact Header */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-4 gap-6">
                            <div className="flex items-center gap-6">
                                <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
                                    <span className="w-6 h-px bg-accent" />
                                    Browse <span className="text-white/20">Genres</span>
                                </h2>
                                <div className="h-4 w-px bg-white/10" />
                                {isLoading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 border border-accent border-t-transparent animate-spin rounded-full" />
                                        <span className="text-[10px] font-black uppercase text-accent/50 tracking-widest">Loading...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
                                            {filteredGenres.length} Genres
                                        </span>
                                        {error && (
                                            <span className="text-[10px] font-black text-white/20 italic uppercase">({error})</span>
                                        )}
                                    </div>
                                )}
                                {/* Integrated Search */}
                                <div className="relative group ml-4 hidden sm:block">
                                    <input
                                        type="text"
                                        placeholder="Find Genre..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="bg-white/5 border border-white/5 pl-4 pr-4 py-1.5 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-accent/40 w-48 transition-all rounded-sm text-white focus:bg-white/10"
                                    />
                                </div>
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

                        {/* High Density Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 flex-1 overflow-y-auto scrollbar-hide py-2 px-2">
                            {filteredGenres.map((genre, i) => (
                                <GenreCard
                                    key={genre.id}
                                    genre={genre}
                                    index={i}
                                    isTrending={trendingGenres.has(genre.id)}
                                    onClick={() => handleGenreClick(genre.id, genre.name)}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GenreDiscovery;
