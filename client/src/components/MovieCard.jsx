import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';

const MovieCard = ({ movie }) => {
    if (!movie) return null;

    const id = movie.tmdbId || movie.id || movie.movieId;
    const poster = movie.posterPath || movie.poster_path;
    const imageUrl =
        poster && poster !== 'null' && poster !== ''
            ? poster.startsWith('http')
                ? poster
                : `https://image.tmdb.org/t/p/w342${poster.startsWith('/') ? '' : '/'}${poster}`
            : 'https://via.placeholder.com/342x513?text=N/A';

    const rating = movie.voteAverage || movie.vote_average || movie.avgRating;
    const year = movie.releaseDate?.split('-')[0] || movie.release_date?.split('-')[0];

    const handleMouseEnter = () => {
        if (id) api.get(`/api/tmdb/${id}`).catch(() => {});
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-[130px] md:w-[160px] flex-shrink-0"
        >
            <Link to={`/movie/${id}`} className="block group" onMouseEnter={handleMouseEnter}>
                <div className="flex flex-col gap-3">

                    {/* Poster Image */}
                    <div className="relative w-full aspect-[2/3] overflow-hidden rounded-sm poster-glow bg-surface-container-high">
                        <img
                            src={imageUrl}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt={movie.title}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/342x513?text=N/A';
                            }}
                        />

                        {/* Hover overlay with play icon */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all duration-300 flex items-center justify-center">
                            <span
                                className="material-symbols-outlined text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                play_circle
                            </span>
                        </div>

                        {/* Rating badge */}
                        {rating > 0 && (
                            <div className="absolute top-2 left-2 bg-background/90 text-primary px-2 py-0.5 rounded-sm text-label-sm font-semibold backdrop-blur-sm">
                                ★ {rating.toFixed(1)}
                            </div>
                        )}
                    </div>

                    {/* Metadata below */}
                    <div className="space-y-1">
                        <h4 className="font-sans text-label-md text-primary leading-snug truncate group-hover:opacity-70 transition-opacity">
                            {movie.title}
                        </h4>
                        {year && (
                            <span className="font-sans text-label-sm text-on-surface-variant">
                                {year}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default MovieCard;
