import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import {
    Calendar,
    MapPin,
    Film,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Loader2,
    AlertCircle
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
                <div className="flex flex-col items-center gap-4 text-on-surface-variant">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-sm font-medium">Loading details...</span>
                </div>
            </div>
        );
    }

    if (error || !person) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background pt-20">
                <div className="text-center space-y-6 max-w-md p-8 bg-surface rounded-3xl border border-surface-variant">
                    <AlertCircle className="w-12 h-12 text-error mx-auto opacity-80" />
                    <h2 className="text-2xl font-bold text-on-surface">Person Not Found</h2>
                    <p className="text-sm text-on-surface-variant">We couldn't find this person in our database.</p>
                    <Link
                        to="/home"
                        className="inline-flex items-center justify-center px-6 py-3 bg-primary text-on-primary rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
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
            {/* Background Gradient */}
            <div className="fixed top-0 left-0 w-full h-screen pointer-events-none z-0 opacity-40">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
            </div>

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row gap-12 mb-20">
                    {/* Profile Image */}
                    <div className="lg:w-80 flex-shrink-0">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-surface shadow-lg"
                        >
                            <img
                                src={person.profile_path
                                    ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                                    : 'https://via.placeholder.com/500x750?text=No+Image'
                                }
                                alt={person.name}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                        </motion.div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <span className="inline-block px-3 py-1 bg-surface rounded-full text-xs font-medium text-on-surface-variant mb-4">
                                {person.known_for_department || 'Unknown Department'}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-on-surface mb-8">
                                {person.name}
                            </h1>
                        </motion.div>

                        {/* Stats Grid */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
                        >
                            {person.birthday && (
                                <div className="bg-surface rounded-2xl p-5 border border-surface-variant">
                                    <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span className="text-xs font-medium uppercase tracking-wider">Born</span>
                                    </div>
                                    <div className="text-base font-semibold text-on-surface">
                                        {new Date(person.birthday).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    {age && <div className="text-xs text-on-surface-variant mt-1">{age} years old</div>}
                                </div>
                            )}
                            {person.place_of_birth && (
                                <div className="bg-surface rounded-2xl p-5 border border-surface-variant">
                                    <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                                        <MapPin className="w-4 h-4 text-secondary" />
                                        <span className="text-xs font-medium uppercase tracking-wider">Birthplace</span>
                                    </div>
                                    <div className="text-sm font-semibold text-on-surface line-clamp-2">
                                        {person.place_of_birth}
                                    </div>
                                </div>
                            )}
                            <div className="bg-surface rounded-2xl p-5 border border-surface-variant">
                                <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                                    <Film className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-medium uppercase tracking-wider">Movies</span>
                                </div>
                                <div className="text-2xl font-bold text-on-surface">{allMovies.length}</div>
                            </div>
                            <div className="bg-surface rounded-2xl p-5 border border-surface-variant">
                                <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                                    <Sparkles className="w-4 h-4 text-secondary" />
                                    <span className="text-xs font-medium uppercase tracking-wider">Popularity</span>
                                </div>
                                <div className="text-2xl font-bold text-on-surface">{person.popularity?.toFixed(0) || 'N/A'}</div>
                            </div>
                        </motion.div>

                        {/* Biography */}
                        {person.biography && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-4"
                            >
                                <h3 className="text-sm font-medium text-on-surface">Biography</h3>
                                <div className="bg-surface rounded-3xl p-6 border border-surface-variant">
                                    <p className={`text-base leading-relaxed text-on-surface-variant ${!showFullBio ? 'line-clamp-4' : ''}`}>
                                        {person.biography}
                                    </p>
                                    {person.biography.length > 300 && (
                                        <button
                                            onClick={() => setShowFullBio(!showFullBio)}
                                            className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
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
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Filmography Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-8"
                >
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-surface-variant">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-on-surface">
                                Filmography
                            </h2>
                            <span className="px-2.5 py-1 bg-surface-variant rounded-full text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
                                Registry Credits
                            </span>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex gap-2 bg-surface p-1.5 rounded-full border border-surface-variant">
                            {[
                                { id: 'all', label: 'All', count: allMovies.length },
                                { id: 'cast', label: 'Acting', count: castMovies.length },
                                { id: 'crew', label: 'Crew', count: crewMovies.length }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-on-surface text-surface shadow-sm'
                                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
                                        }`}
                                >
                                    {tab.label}
                                    <span className="ml-1.5 opacity-60 text-xs">({tab.count})</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Movies Grid */}
                    {displayMovies.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
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
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-surface-variant">
                            <p className="text-on-surface-variant font-medium">
                                No movies found in this category.
                            </p>
                        </div>
                    )}

                    {displayMovies.length > 30 && (
                        <div className="text-center pt-8">
                            <span className="inline-block px-4 py-2 bg-surface rounded-full border border-surface-variant text-xs font-medium text-on-surface-variant">
                                Showing 30 of {displayMovies.length} movies
                            </span>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default PersonDetails;
