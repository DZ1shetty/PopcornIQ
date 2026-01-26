import React from 'react';
import { motion } from 'framer-motion';

const CinematicBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-background">
            {/* Optimized Moving Gradients (CSS Only) */}
            <div
                className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-accent/20 blur-[150px] rounded-full opacity-20 animate-pulse"
                style={{ animationDuration: '8s' }}
            />
            <div
                className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] bg-purple-900/20 blur-[120px] rounded-full opacity-20 animate-pulse"
                style={{ animationDuration: '12s', animationDelay: '2s' }}
            />

            {/* Static Noise Overlay (GPU Accelerated) */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    transform: 'translateZ(0)',
                }}
            />

            {/* Subtle Grid */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '100px 100px'
                }}
            />
        </div>
    );
};

export default CinematicBackground;
