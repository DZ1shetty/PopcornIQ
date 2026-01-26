import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

import SaveSignalButton from './SaveSignalButton';

const MovieCard = ({ movie, showSaveButton = true }) => {
    if (!movie) return null;

    const poster = movie.posterPath || movie.poster_path;
    const title = movie.title || "Unknown Title";
    const rating = movie.voteAverage || movie.vote_average;
    const movieId = movie.movieId || movie.id;

    const imageUrl = poster
        ? `https://image.tmdb.org/t/p/w342${poster}`
        : 'https://via.placeholder.com/342x513?text=Poster+Missing';

    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXVal = e.clientX - rect.left;
        const mouseYVal = e.clientY - rect.top;
        const xPct = mouseXVal / width - 0.5;
        const yPct = mouseYVal / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }} // Faster transition
            className="group relative h-full perspective-1000"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: 1000 }}
        >
            <Link to={`/movie/${movieId}`}>
                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d",
                    }}
                    whileHover={{ scale: 1.02 }} // Reduced scale for performance
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative aspect-[2/3] w-full rounded-xl bg-[#1a1a1a] shadow-lg hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300 will-change-transform"
                >
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover rounded-xl"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/342x513?text=Network+Error';
                        }}
                    />

                    {/* Cinematic Overlay - Simplified */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 rounded-xl" />

                    {/* Save Signal Button - Top Right */}
                    {showSaveButton && (
                        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <SaveSignalButton movie={movie} variant="card" />
                        </div>
                    )}

                    {/* Content Reveal - Optimized */}
                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black bg-white text-black px-2 py-0.5 tracking-tighter shadow-sm">
                                    {typeof rating === 'number' ? rating.toFixed(1) : '0.0'}
                                </span>
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-tight leading-none text-white line-clamp-1">
                                {title}
                            </h3>
                        </div>
                    </div>

                    {/* Holographic Shine - Simplified for Performance */}
                    <motion.div
                        style={{
                            x: useTransform(mouseX, [-0.5, 0.5], ["-20%", "20%"]), // Reduced range
                            y: useTransform(mouseY, [-0.5, 0.5], ["-20%", "20%"]),
                            opacity: useTransform(mouseX, [-0.5, 0, 0.5], [0, 0.2, 0])
                        }}
                        className="absolute inset-0 z-30 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none rounded-xl"
                    />

                    {/* Border Accent - CSS only */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-t-xl" />
                </motion.div>
            </Link>
        </motion.div>
    );
};

export default MovieCard;


