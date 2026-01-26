import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import {
    User,
    Calendar,
    MapPin,
    Film,
    Star,
    ChevronDown,
    ChevronUp,
    Sparkles
} from 'lucide-react';

const PersonDetails = () => {
    const { id } = useParams();
    const [person, setPerson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFullBio, setShowFullBio] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'cast' | 'crew'

    useEffect(() => {
        let isMounted = true;

        const fetchPerson = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data } = await api.get(`/api/tmdb/person/${id}`);

                if (isMounted) {
                    setPerson(data);
                }
            } catch (err) {
                console.error('Failed to fetch person:', err);
                if (isMounted) {
                    setError('Failed to load person details');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchPerson();
        return () => { isMounted = false; };
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background pt-20">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
                    <span className="text-tiny font-black uppercase tracking-[0.8em] animate-pulse">
                        Loading...
                    </span>
                </div>
            </div>
        );
    }

    if (error || !person) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background pt-20">
                <div className="text-center space-y-8">
                    <div className="w-24 h-px bg-accent/30 mx-auto" />
                    <h2 className="text-5xl font-black uppercase tracking-tight">Person Not Found</h2>
                    <p className="text-muted text-sm uppercase tracking-widest">
                        We couldn't find this person in our database.
                    </p>
                    <Link
                        to="/home"
                        className="inline-block px-12 py-5 border border-white/20 text-tiny font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    const castMovies = person.movie_credits?.cast || [];
    const crewMovies = person.movie_credits?.crew || [];

    // Deduplicate and sort by popularity
    const allMovies = [...castMovies, ...crewMovies]
        .filter((movie, index, self) =>
            index === self.findIndex(m => m.id === movie.id)
        )
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    const displayMovies = activeTab === 'cast' ? castMovies
        : activeTab === 'crew' ? crewMovies
            : allMovies;

    const age = person.birthday
        ? Math.floor((new Date() - new Date(person.birthday)) / (365.25 * 24 * 60 * 60 * 1000))
        : null;

    return (
        <div className="min-h-screen bg-background pt-32 pb-40">
            {/* Background Image */}
            {person.profile_path && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    className="fixed top-0 left-0 w-full h-screen pointer-events-none z-0"
                >
                    <img
                        src={`https://image.tmdb.org/t/p/w780${person.profile_path}`}
                        className="w-full h-full object-cover object-top blur-3xl"
                        alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
                </motion.div>
            )}

            <div className="container mx-auto px-8 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row gap-16 mb-24">
                    {/* Profile Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-80 flex-shrink-0"
                    >
                        <div className="relative aspect-[3/4] overflow-hidden bg-surface border-2 border-white/10 shadow-2xl group">
                            <img
                                src={person.profile_path
                                    ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                                    : 'https://via.placeholder.com/500x750?text=No+Image'
                                }
                                alt={person.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-60" />

                            {/* ID Badge */}
                            <div className="absolute bottom-4 left-4 right-4 p-3 bg-background/80 backdrop-blur-md border border-white/10">
                                <span className="text-tiny text-accent uppercase tracking-[0.3em]">ID</span>
                                <div className="font-mono text-lg text-white/80">#{person.id}</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Info Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="flex-1 space-y-10"
                    >
                        {/* Name & Known For */}
                        <div>
                            <span className="text-tiny text-accent uppercase tracking-[0.5em] block mb-4 bg-accent/5 px-4 py-1.5 border border-accent/20 w-fit">
                                {person.known_for_department || 'Unknown Department'}
                            </span>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase text-white leading-[0.9] italic">
                                {person.name}
                            </h1>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-10">
                            {person.birthday && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-muted/60">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-tiny uppercase tracking-widest">Born</span>
                                    </div>
                                    <div className="text-xl font-bold">
                                        {new Date(person.birthday).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    {age && <div className="text-tiny text-muted/40">{age} years</div>}
                                </div>
                            )}
                            {person.place_of_birth && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-muted/60">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-tiny uppercase tracking-widest">Birthplace</span>
                                    </div>
                                    <div className="text-md font-bold line-clamp-2">{person.place_of_birth}</div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-muted/60">
                                    <Film className="w-4 h-4" />
                                    <span className="text-tiny uppercase tracking-widest">Movies</span>
                                </div>
                                <div className="text-3xl font-black">{allMovies.length}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-muted/60">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-tiny uppercase tracking-widest">Popularity</span>
                                </div>
                                <div className="text-3xl font-black">{person.popularity?.toFixed(0) || 'N/A'}</div>
                            </div>
                        </div>

                        {/* Biography */}
                        {person.biography && (
                            <div className="space-y-4">
                                <h3 className="text-tiny font-black uppercase tracking-[0.5em] text-muted/40">
                                    Biography
                                </h3>
                                <div className="relative">
                                    <p className={`text-lg text-muted/80 leading-relaxed italic border-l-4 border-accent/30 pl-8 ${!showFullBio ? 'line-clamp-4' : ''}`}>
                                        "{person.biography}"
                                    </p>
                                    {person.biography.length > 300 && (
                                        <button
                                            onClick={() => setShowFullBio(!showFullBio)}
                                            className="mt-4 flex items-center gap-2 text-tiny text-accent uppercase tracking-widest hover:text-white transition-colors"
                                        >
                                            {showFullBio ? (
                                                <>
                                                    <ChevronUp className="w-4 h-4" />
                                                    Show Less
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-4 h-4" />
                                                    Read More
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Filmography Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-12"
                >
                    {/* Section Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
                        <div className="space-y-4">
                            <span className="text-tiny text-accent uppercase tracking-[0.5em] italic">
                                Movies
                            </span>
                            <h2 className="text-5xl font-black uppercase tracking-tighter">Filmography</h2>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex gap-2 bg-surface/50 p-1 border border-white/10">
                            {[
                                { id: 'all', label: 'All', count: allMovies.length },
                                { id: 'cast', label: 'Acting', count: castMovies.length },
                                { id: 'crew', label: 'Crew', count: crewMovies.length }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-3 text-tiny font-black uppercase tracking-wider transition-all ${activeTab === tab.id
                                        ? 'bg-accent text-white'
                                        : 'text-muted/60 hover:text-white'
                                        }`}
                                >
                                    {tab.label}
                                    <span className="ml-2 opacity-50">({tab.count})</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Movies Grid */}
                    {displayMovies.length > 0 ? (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 gap-3 md:gap-4"
                        >
                            {displayMovies.slice(0, 30).map((movie, i) => (
                                <MovieCard
                                    key={`${movie.id}-${i}`}
                                    movie={{
                                        ...movie,
                                        movieId: movie.id,
                                        posterPath: movie.poster_path,
                                        voteAverage: movie.vote_average
                                    }}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-muted text-tiny uppercase tracking-widest">
                                No movies found in this category.
                            </p>
                        </div>
                    )}

                    {displayMovies.length > 30 && (
                        <div className="text-center pt-8">
                            <span className="text-tiny text-muted/40 uppercase tracking-widest">
                                Showing 30 of {displayMovies.length} movies
                            </span>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Bottom Accent Line */}
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

export default PersonDetails;
