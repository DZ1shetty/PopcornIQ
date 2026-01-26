import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import SaveSignalButton from '../components/SaveSignalButton';
import TrailerOverlay from '../components/TrailerOverlay';
import WatchProviders from '../components/WatchProviders';
import { motion } from 'framer-motion';
import { Play, Bookmark, Tv } from 'lucide-react';

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [genreRecs, setGenreRecs] = useState([]);
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchMovie = async () => {
            try {
                if (isMounted) setLoading(true);
                let data = null;
                let similar = [];

                if (/^\d+$/.test(id)) {
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
                        cast: tmdbData.credits?.cast?.slice(0, 10).map(c => ({
                            name: c.name,
                            profilePath: c.profile_path,
                            id: c.id,
                            character: c.character
                        })) || []
                    };
                    if (tmdbData.similar?.results) {
                        similar = tmdbData.similar.results.slice(0, 10).map(m => ({
                            movieId: m.id,
                            id: m.id,
                            title: m.title,
                            posterPath: m.poster_path,
                            voteAverage: m.vote_average,
                            releaseDate: m.release_date
                        }));
                    }
                } else {
                    const res = await api.get(`/api/movies/${id}`);
                    data = res.data;
                    if (data?.genresArray && data.genresArray.length > 0) {
                        const genre = data.genresArray[0];
                        const recRes = await api.get(`/api/recommendations/genre/${genre}`);
                        similar = recRes.data.filter(m => String(m.movieId) !== String(data.movieId)).slice(0, 10);
                    }
                }

                if (isMounted) {
                    setMovie(data);
                    setGenreRecs(similar);
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

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-6">
                <div className="w-12 h-12 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
                <span className="text-tiny font-black uppercase tracking-[0.8em] animate-pulse">Loading Movie...</span>
            </div>
        </div>
    );

    if (!movie) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-10">
                <div className="w-24 h-px bg-accent/30 mx-auto" />
                <h2 className="text-7xl font-black italic uppercase tracking-tighter">Movie Not Found</h2>
                <p className="text-tiny uppercase tracking-[0.3em] text-muted">We couldn't find this movie. It may have been removed.</p>
                <Link to="/home" className="inline-block px-12 py-5 border border-white/20 text-tiny font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Go Back Home</Link>
            </div>
        </div>
    );

    const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A';

    return (
        <div className="min-h-screen bg-background pb-60 font-sans">
            {/* Trailer Overlay */}
            <TrailerOverlay
                isOpen={isTrailerOpen}
                onClose={() => setIsTrailerOpen(false)}
                movieId={movie.movieId}
                movieTitle={movie.title}
            />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                className="absolute top-0 left-0 w-full h-[85vh] z-0 pointer-events-none"
            >
                <img
                    src={`https://image.tmdb.org/t/p/w1280${movie.backdropPath || movie.posterPath}`}
                    className="w-full h-full object-cover"
                    alt=""
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-background to-transparent" />
            </motion.div>

            <div className="container mx-auto px-8 relative z-10 pt-56">
                <div className="flex flex-col lg:flex-row gap-28 items-start">

                    <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className="lg:w-[45%] space-y-20 sticky top-40"
                    >
                        <div className="space-y-6">
                            <span className="text-tiny font-black uppercase tracking-[0.5em] text-accent block bg-accent/5 px-4 py-1.5 border border-accent/20 w-fit">{movie.tagline || 'Experience'}</span>
                            <h1 className="text-7xl lg:text-8xl font-black tracking-tighter uppercase text-white leading-[0.9] italic drop-shadow-2xl">
                                {movie.title}
                            </h1>
                        </div>

                        <div className="grid grid-cols-2 gap-16 border-t border-white/10 pt-16">
                            <div className="space-y-2">
                                <span className="text-tiny font-black uppercase tracking-widest text-muted/60">Rating</span>
                                <div className="text-5xl font-black italic">{movie.voteAverage?.toFixed(1)}</div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-tiny font-black uppercase tracking-widest text-muted/60">Runtime</span>
                                <div className="text-5xl font-black italic">{movie.runtime} min</div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-tiny font-black uppercase tracking-widest text-muted/60">Year</span>
                                <div className="text-5xl font-black italic">{releaseYear}</div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-tiny font-black uppercase tracking-widest text-muted/60">Genre</span>
                                <div className="text-2xl font-black italic truncate">{movie.genresArray?.[0] || 'Unknown'}</div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h3 className="text-tiny font-black uppercase tracking-[0.5em] text-muted/40">Synopsis</h3>
                            <p className="text-2xl text-muted/90 font-medium leading-relaxed italic border-l-4 border-accent/30 pl-12 line-clamp-6">
                                "{movie.overview}"
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsTrailerOpen(true)}
                                className="flex items-center gap-4 px-10 py-5 bg-white text-black font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                <span className="text-tiny">Play Trailer</span>
                            </motion.button>

                            <SaveSignalButton
                                movie={movie}
                                size="lg"
                                showLabel={true}
                                variant="outline"
                            />
                        </div>
                    </motion.div>

                    <div className="lg:w-[55%] space-y-20">
                        {/* Main Backdrop Image */}
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="aspect-video transition-all duration-700 bg-surface overflow-hidden group shadow-2xl relative border-2 border-white/5 cursor-pointer"
                            onClick={() => setIsTrailerOpen(true)}
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/w1280${movie.backdropPath || movie.posterPath}`}
                                alt={movie.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[2s]"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/1280x720?text=No+Image+Available'; }}
                            />
                            <div className="absolute inset-0 bg-accent/5 mix-blend-overlay group-hover:opacity-0 transition-opacity" />

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center"
                                >
                                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Watch Providers Section */}
                        <WatchProviders movieId={movie.movieId} />

                        {/* Cast Section - Now Clickable */}
                        <div className="space-y-16">
                            <div className="flex items-center gap-6">
                                <h3 className="text-tiny font-black uppercase tracking-[0.5em] text-muted/40 whitespace-nowrap">Cast</h3>
                                <div className="flex-1 h-px bg-white/5" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-16">
                                {movie.cast && movie.cast.length > 0 ? movie.cast.slice(0, 8).map(c => (
                                    <Link
                                        key={String(c.id || c.name)}
                                        to={`/person/${c.id}`}
                                        className="space-y-4 group cursor-pointer"
                                    >
                                        <div className="aspect-[4/5] group-hover:grayscale-0 transition-all duration-700 overflow-hidden bg-surface relative">
                                            <img
                                                src={c.profilePath ? `https://image.tmdb.org/t/p/w185${c.profilePath}` : 'https://via.placeholder.com/185x278?text=N/A'}
                                                alt={c.name}
                                                className="w-full h-full object-cover transform translate-y-0 group-hover:scale-110 transition-transform duration-1000"
                                                loading="lazy"
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/185x278?text=N/A'; }}
                                            />
                                            <div className="absolute inset-0 border border-white/0 group-hover:border-accent/40 transition-all" />

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="absolute bottom-2 left-2 right-2 text-center">
                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-accent">View Profile</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-tiny font-black uppercase tracking-tight truncate mb-1 group-hover:text-accent transition-colors">{c.name}</p>
                                            <p className="text-[10px] font-bold text-muted/40 uppercase tracking-widest italic truncate">
                                                {c.character || 'Role'}
                                            </p>
                                        </div>
                                    </Link>
                                )) : <span className="text-muted text-tiny font-black uppercase italic">Cast information not available.</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {genreRecs.length > 0 && (
                    <div className="mt-80 space-y-24 pt-40 border-t border-white/5">
                        <div className="flex items-end justify-between">
                            <div className="space-y-4">
                                <span className="text-tiny text-accent uppercase font-black tracking-[0.5em] italic">You Might Also Like</span>
                                <h2 className="text-7xl font-black uppercase tracking-tighter italic">Similar Movies</h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 gap-3 md:gap-4">
                            {genreRecs.map((m, i) => (
                                <MovieCard key={m.movieId || `rec-${i}`} movie={m} />
                            ))}
                        </div>
                    </div>
                )}
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

export default MovieDetails;
