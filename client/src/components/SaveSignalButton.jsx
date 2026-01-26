import { memo } from 'react';
import { motion } from 'framer-motion';
import { useWatchlist } from '../context/WatchlistContext';
import { useToast } from './Toast';
import { Bookmark, Check, Loader2 } from 'lucide-react';

const SaveSignalButton = memo(({ movie, variant = 'default', className = '' }) => {
    const { isInWatchlist, addToWatchlist, removeFromWatchlist, loading } = useWatchlist();
    const toast = useToast();

    const movieId = movie?.id || movie?.movieId;
    const movieTitle = movie?.title || movie?.name || 'Movie';
    const isInList = isInWatchlist(movieId);

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!movieId) return;

        try {
            if (isInList) {
                await removeFromWatchlist(movieId);
                toast.info(`"${movieTitle}" removed from saved movies`);
            } else {
                const movieData = {
                    title: movieTitle,
                    posterPath: movie?.poster_path || movie?.posterPath,
                    voteAverage: movie?.vote_average || movie?.voteAverage,
                    releaseDate: movie?.release_date || movie?.releaseDate,
                    overview: movie?.overview
                };
                await addToWatchlist(movieId, movieData);
                toast.archive(`"${movieTitle}" saved to your list`);
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        }
    };

    // Different style variants
    const variants = {
        default: `
            ${isInList
                ? 'bg-accent text-white border-accent'
                : 'bg-surface/80 border-white/10 text-white/70 hover:border-accent/50 hover:text-accent'
            }
            w-9 h-9 rounded-lg border backdrop-blur-sm
        `,
        minimal: `
            ${isInList
                ? 'text-accent'
                : 'text-white/40 hover:text-accent'
            }
            w-8 h-8
        `,
        large: `
            ${isInList
                ? 'bg-accent text-white border-accent'
                : 'bg-white/5 border-white/10 text-white hover:border-accent/50'
            }
            px-6 py-3 border gap-3 font-bold uppercase tracking-widest text-tiny
        `,
        card: `
            ${isInList
                ? 'bg-accent'
                : 'bg-black/60 hover:bg-accent/80'
            }
            w-7 h-7 rounded-full backdrop-blur-sm
        `
    };

    return (
        <motion.button
            onClick={handleClick}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                flex items-center justify-center transition-all duration-300
                ${variants[variant]}
                ${className}
            `}
            title={isInList ? 'Remove from saved movies' : 'Save this movie'}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isInList ? (
                <Check className={variant === 'large' ? 'w-4 h-4' : variant === 'card' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
            ) : (
                <Bookmark className={variant === 'large' ? 'w-4 h-4' : variant === 'card' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
            )}
            {variant === 'large' && (
                <span>{isInList ? 'Saved' : 'Save Movie'}</span>
            )}
        </motion.button>
    );
});

SaveSignalButton.displayName = 'SaveSignalButton';

export default SaveSignalButton;
