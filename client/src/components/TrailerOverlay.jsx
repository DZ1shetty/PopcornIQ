import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Volume2, VolumeX, Maximize2, ExternalLink } from 'lucide-react';

const TrailerOverlay = ({ isOpen, onClose, movieId, movieTitle }) => {
    const [trailerKey, setTrailerKey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        if (!isOpen || !movieId) return;

        const fetchTrailer = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/tmdb/${movieId}/videos`);
                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    // Prioritize official trailers, then teasers, then any video
                    const trailer = data.results.find(v =>
                        v.type === 'Trailer' && v.site === 'YouTube' && v.official
                    ) || data.results.find(v =>
                        v.type === 'Trailer' && v.site === 'YouTube'
                    ) || data.results.find(v =>
                        v.type === 'Teaser' && v.site === 'YouTube'
                    ) || data.results.find(v =>
                        v.site === 'YouTube'
                    );

                    if (trailer) {
                        setTrailerKey(trailer.key);
                    } else {
                        setError('No trailer available');
                    }
                } else {
                    setError('No trailer available');
                }
            } catch (err) {
                console.error('Failed to fetch trailer:', err);
                setError('Failed to load trailer');
            } finally {
                setLoading(false);
            }
        };

        fetchTrailer();
    }, [isOpen, movieId]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={handleBackdropClick}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />

                    {/* Content Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-full max-w-6xl z-10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                                <span className="text-tiny text-accent uppercase tracking-[0.5em]">
                                    Satellite Transmission
                                </span>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                            >
                                <X className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                            </button>
                        </div>

                        {/* Movie Title */}
                        <motion.h2
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white mb-8"
                        >
                            {movieTitle || 'Loading...'}
                        </motion.h2>

                        {/* Video Container */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative aspect-video bg-black border-2 border-white/10 overflow-hidden"
                        >
                            {/* Corner Decorations */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent/50 z-20" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent/50 z-20" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent/50 z-20" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent/50 z-20" />

                            {loading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/50">
                                    <div className="relative mb-6">
                                        <div className="w-16 h-16 border-2 border-white/10 rounded-full flex items-center justify-center">
                                            <Play className="w-6 h-6 text-white/40" />
                                        </div>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            className="absolute inset-0 border-t-2 border-accent rounded-full"
                                        />
                                    </div>
                                    <span className="text-tiny text-muted uppercase tracking-[0.5em]">
                                        Establishing uplink...
                                    </span>
                                </div>
                            )}

                            {error && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/50">
                                    <div className="w-16 h-16 border-2 border-red-500/30 rounded-full flex items-center justify-center mb-6">
                                        <X className="w-6 h-6 text-red-500/60" />
                                    </div>
                                    <span className="text-sm text-muted uppercase tracking-widest mb-2">
                                        Signal Lost
                                    </span>
                                    <span className="text-tiny text-muted/50 uppercase tracking-widest">
                                        {error}
                                    </span>
                                </div>
                            )}

                            {trailerKey && !loading && !error && (
                                <iframe
                                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1&showinfo=0`}
                                    title={`${movieTitle} Trailer`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full"
                                />
                            )}

                            {/* Scanline Effect */}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/[0.02] to-transparent animate-pulse z-10" />
                        </motion.div>

                        {/* Controls Footer */}
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center justify-between mt-6"
                        >
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-tiny font-bold uppercase tracking-wider"
                                >
                                    {isMuted ? (
                                        <>
                                            <VolumeX className="w-4 h-4" />
                                            Unmute
                                        </>
                                    ) : (
                                        <>
                                            <Volume2 className="w-4 h-4" />
                                            Mute
                                        </>
                                    )}
                                </button>

                                {trailerKey && (
                                    <a
                                        href={`https://www.youtube.com/watch?v=${trailerKey}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-tiny font-bold uppercase tracking-wider"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Watch on YouTube
                                    </a>
                                )}
                            </div>

                            <div className="text-tiny text-muted/40 uppercase tracking-widest">
                                Press ESC to close
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Animated Border Glow */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute inset-0 pointer-events-none"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-5xl aspect-video">
                            <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-3xl" />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TrailerOverlay;
