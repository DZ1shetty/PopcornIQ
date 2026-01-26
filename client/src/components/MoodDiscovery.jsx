import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import MovieCard from './MovieCard';
import {
    X,
    ArrowRight,
    Brain,
    Zap,
    Moon,
    Sun,
    Heart,
    Skull,
    Laugh,
    Sparkles,
    RefreshCw,
    Flame,
    Ghost,
    Smile,
    CloudRain,
    Swords
} from 'lucide-react';

// Pre-defined Mood Presets for quick selection
const moodPresets = [
    {
        id: 'thriller',
        name: 'Thrilling',
        icon: Skull,
        mood: 20,
        intensity: 15,
        color: 'from-red-600 to-red-900',
        genres: [53, 27, 80],
        description: 'Dark & Suspenseful'
    },
    {
        id: 'action',
        name: 'Action-Packed',
        icon: Flame,
        mood: 60,
        intensity: 10,
        color: 'from-orange-500 to-orange-800',
        genres: [28, 12, 878],
        description: 'Explosive & Exciting'
    },
    {
        id: 'romance',
        name: 'Romantic',
        icon: Heart,
        mood: 80,
        intensity: 70,
        color: 'from-pink-500 to-rose-800',
        genres: [10749, 35, 18],
        description: 'Sweet & Heartwarming'
    },
    {
        id: 'comedy',
        name: 'Funny',
        icon: Laugh,
        mood: 90,
        intensity: 50,
        color: 'from-yellow-400 to-yellow-700',
        genres: [35, 10751, 16],
        description: 'Light & Hilarious'
    },
    {
        id: 'mystery',
        name: 'Mysterious',
        icon: Ghost,
        mood: 35,
        intensity: 55,
        color: 'from-purple-600 to-purple-900',
        genres: [9648, 53, 878],
        description: 'Puzzling & Intriguing'
    },
    {
        id: 'epic',
        name: 'Epic Adventure',
        icon: Swords,
        mood: 50,
        intensity: 30,
        color: 'from-amber-600 to-amber-900',
        genres: [14, 12, 10752],
        description: 'Grand & Sweeping'
    },
    {
        id: 'feelgood',
        name: 'Feel Good',
        icon: Smile,
        mood: 85,
        intensity: 80,
        color: 'from-emerald-500 to-emerald-800',
        genres: [35, 10751, 16, 10402],
        description: 'Uplifting & Happy'
    },
    {
        id: 'melancholy',
        name: 'Emotional',
        icon: CloudRain,
        mood: 30,
        intensity: 85,
        color: 'from-slate-500 to-slate-800',
        genres: [18, 10749, 10752],
        description: 'Deep & Moving'
    }
];

const MoodDiscovery = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [moodValue, setMoodValue] = useState(50);
    const [intensityValue, setIntensityValue] = useState(50);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activePreset, setActivePreset] = useState(null);

    // Determine current mood based on slider values
    const currentMood = useMemo(() => {
        if (moodValue < 30 && intensityValue < 30) {
            return { text: "Scary & Thrilling", icon: Skull, color: "text-red-500", genres: [27, 53, 80] };
        } else if (moodValue < 30 && intensityValue > 70) {
            return { text: "Thought-Provoking", icon: Moon, color: "text-purple-400", genres: [9648, 18, 10752] };
        } else if (moodValue > 70 && intensityValue < 30) {
            return { text: "Action-Packed", icon: Zap, color: "text-yellow-400", genres: [28, 12, 878] };
        } else if (moodValue > 70 && intensityValue > 70) {
            return { text: "Light & Fun", icon: Sun, color: "text-green-400", genres: [35, 10749, 16, 10751] };
        } else if (moodValue > 50 && intensityValue > 50) {
            return { text: "Feel Good", icon: Heart, color: "text-pink-400", genres: [35, 10749, 10751] };
        } else if (moodValue < 50 && intensityValue < 50) {
            return { text: "Tense & Exciting", icon: Flame, color: "text-orange-400", genres: [53, 28, 80] };
        } else {
            return { text: "A Bit of Everything", icon: Sparkles, color: "text-accent", genres: [14, 18, 12] };
        }
    }, [moodValue, intensityValue]);

    const MoodIcon = currentMood.icon;

    // Fetch movies
    const fetchMoodMovies = useCallback(async (genreOverride = null) => {
        setLoading(true);
        try {
            const genres = genreOverride || currentMood.genres;
            const { data } = await api.get(`/api/tmdb/discover/genre/${genres[0]}`);

            if (data.results) {
                let filtered = data.results.filter(m => m.vote_average >= 5.5);
                if (intensityValue < 40) {
                    filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                } else {
                    filtered.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
                }
                setMovies(filtered.slice(0, 12));
            }
        } catch (err) {
            console.error('Failed to fetch mood movies:', err);
            setMovies([]);
        } finally {
            setLoading(false);
        }
    }, [currentMood.genres, intensityValue]);

    useEffect(() => {
        if (isOpen && !activePreset) {
            const debounce = setTimeout(() => fetchMoodMovies(), 500);
            return () => clearTimeout(debounce);
        }
    }, [isOpen, moodValue, intensityValue, fetchMoodMovies, activePreset]);

    const handlePresetClick = (preset) => {
        setActivePreset(preset.id);
        setMoodValue(preset.mood);
        setIntensityValue(preset.intensity);
        fetchMoodMovies(preset.genres);
    };

    const handleSliderChange = (type, value) => {
        setActivePreset(null);
        if (type === 'mood') setMoodValue(value);
        else setIntensityValue(value);
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
                                    Find Movies by <span className="text-white/20">Your Mood</span>
                                </h2>
                                <div className="h-4 w-px bg-white/10" />
                                <div className="flex items-center gap-3">
                                    <MoodIcon className={`w-4 h-4 ${currentMood.color}`} />
                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
                                        {currentMood.text}
                                    </span>
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

                        {/* Main Content Area */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide py-2 px-2 space-y-8">

                            {/* Quick Mood Selection */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-1.5">
                                {moodPresets.map((preset, i) => {
                                    const PresetIcon = preset.icon;
                                    return (
                                        <motion.button
                                            key={preset.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.02 }}
                                            onClick={() => handlePresetClick(preset)}
                                            className={`group relative h-28 overflow-hidden bg-surface border transition-all duration-300 rounded-sm ${activePreset === preset.id
                                                ? 'border-accent/60'
                                                : 'border-white/5 hover:border-accent/40'
                                                }`}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${preset.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />

                                            <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                                <div className="relative z-10 text-left">
                                                    <PresetIcon className="w-5 h-5 mb-2 opacity-60 group-hover:opacity-100 transition-opacity" />
                                                    <h3 className="text-xs font-black uppercase tracking-tight leading-none group-hover:translate-x-1 transition-transform">
                                                        {preset.name}
                                                    </h3>
                                                    <span className="text-[8px] text-white/40 uppercase tracking-wider">
                                                        {preset.description}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all">
                                                <ArrowRight size={12} className="text-accent" />
                                            </div>

                                            <div className={`absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-500 ${activePreset === preset.id ? 'w-full' : 'w-0 group-hover:w-full'
                                                }`} />
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Sliders Section */}
                            <div className="grid md:grid-cols-2 gap-6 p-6 bg-surface/30 border border-white/5 rounded-sm">
                                {/* Mood Tone Slider */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                                        <span className="flex items-center gap-2"><Moon className="w-3 h-3" /> Serious</span>
                                        <span className="flex items-center gap-2">Cheerful <Sun className="w-3 h-3" /></span>
                                    </div>
                                    <div className="relative h-2 rounded-full bg-gradient-to-r from-purple-900 via-indigo-500 to-yellow-400">
                                        <input
                                            type="range" min="0" max="100" value={moodValue}
                                            onChange={(e) => handleSliderChange('mood', Number(e.target.value))}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-accent"
                                            style={{ left: `calc(${moodValue}% - 8px)` }}
                                        />
                                    </div>
                                    <div className="text-center text-[10px] text-white/30">{moodValue}%</div>
                                </div>

                                {/* Pace Slider */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                                        <span className="flex items-center gap-2"><Zap className="w-3 h-3" /> Fast-Paced</span>
                                        <span className="flex items-center gap-2">Relaxed <Heart className="w-3 h-3" /></span>
                                    </div>
                                    <div className="relative h-2 rounded-full bg-gradient-to-r from-red-600 via-orange-400 to-pink-400">
                                        <input
                                            type="range" min="0" max="100" value={intensityValue}
                                            onChange={(e) => handleSliderChange('intensity', Number(e.target.value))}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-accent"
                                            style={{ left: `calc(${intensityValue}% - 8px)` }}
                                        />
                                    </div>
                                    <div className="text-center text-[10px] text-white/30">{intensityValue}%</div>
                                </div>
                            </div>

                            {/* Results Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
                                        Recommended Movies ({movies.length})
                                    </span>
                                    <button
                                        onClick={() => fetchMoodMovies()}
                                        disabled={loading}
                                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-accent transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                        Show More
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <div className="flex items-center gap-4">
                                            <div className="w-4 h-4 border border-accent border-t-transparent animate-spin rounded-full" />
                                            <span className="text-[10px] font-black uppercase text-accent/50 tracking-widest">
                                                Loading movies...
                                            </span>
                                        </div>
                                    </div>
                                ) : movies.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-1.5">
                                        {movies.map((movie, i) => (
                                            <motion.div
                                                key={movie.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.02 }}
                                            >
                                                <MovieCard
                                                    movie={{
                                                        ...movie,
                                                        movieId: movie.id,
                                                        posterPath: movie.poster_path,
                                                        voteAverage: movie.vote_average
                                                    }}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <Ghost className="w-8 h-8 mx-auto mb-4 text-white/20" />
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest">
                                            No movies found. Try adjusting the sliders above.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MoodDiscovery;
