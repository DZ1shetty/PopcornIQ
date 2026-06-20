import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWatchlist } from '../context/WatchlistContext';
import { useToast } from './Toast';
import { Bookmark, Check, Loader2 } from 'lucide-react';

/**
 * SaveSignalButton — Minimalist watchlist toggle.
 * Variants:
 *   'icon'    — small square icon button (default)
 *   'pill'    — icon + label, rounded pill
 *   'outline' — full outlined button for detail pages
 */
const SaveSignalButton = memo(({ movie, variant = 'icon', className = '' }) => {
    const { isInWatchlist, addToWatchlist, removeFromWatchlist, loading } = useWatchlist();
    const toast = useToast();

    const movieId    = movie?.id || movie?.movieId;
    const movieTitle = movie?.title || movie?.name || 'Film';
    const isInList   = isInWatchlist(movieId);

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!movieId) return;
        try {
            if (isInList) {
                await removeFromWatchlist(movieId);
                toast.info(`"${movieTitle}" removed`);
            } else {
                await addToWatchlist(movieId, {
                    title:       movieTitle,
                    posterPath:  movie?.poster_path   || movie?.posterPath,
                    voteAverage: movie?.vote_average  || movie?.voteAverage,
                    releaseDate: movie?.release_date  || movie?.releaseDate,
                    overview:    movie?.overview
                });
                toast.archive(`"${movieTitle}" saved`);
            }
        } catch {
            toast.error('Something went wrong. Please try again.');
        }
    };

    /* ── Icon sizes ── */
    const iconSize = variant === 'outline' ? 16 : 14;

    /* ── Style sets ── */
    const styleMap = {
        icon: `w-8 h-8 rounded-sm ${isInList
            ? 'bg-primary text-on-primary'
            : 'bg-surface-container text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`,

        pill: `px-4 py-2 gap-2 rounded-sm font-sans text-xs font-medium ${isInList
            ? 'bg-primary text-on-primary'
            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-primary'}`,

        outline: `px-6 py-3 gap-2 border font-sans text-sm font-semibold tracking-widest ${isInList
            ? 'bg-primary text-on-primary border-primary'
            : 'border-outline text-primary hover:bg-surface-container'}`,
    };

    const wrapStyle = styleMap[variant] || styleMap.icon;

    return (
        <motion.button
            onClick={handleClick}
            disabled={loading}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center justify-center transition-all duration-200 ${wrapStyle} ${className}`}
            title={isInList ? 'Remove from saved films' : 'Save this film'}
        >
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Loader2 size={iconSize} className="animate-spin" />
                    </motion.div>
                ) : isInList ? (
                    <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        className="flex items-center gap-2"
                    >
                        <Check size={iconSize} strokeWidth={2} />
                        {(variant === 'pill' || variant === 'outline') && <span>Saved</span>}
                    </motion.div>
                ) : (
                    <motion.div
                        key="bookmark"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex items-center gap-2"
                    >
                        <Bookmark size={iconSize} strokeWidth={1.5} />
                        {(variant === 'pill' || variant === 'outline') && <span>Save Film</span>}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
});

SaveSignalButton.displayName = 'SaveSignalButton';
export default SaveSignalButton;
