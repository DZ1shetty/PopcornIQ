import { motion } from 'framer-motion';

const Skeleton = ({ className }) => (
    <div className={`relative overflow-hidden bg-surface-container rounded-sm ${className}`}>
        <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />
    </div>
);

export const MovieCardSkeleton = () => (
    <div className="w-[130px] md:w-[160px] flex-shrink-0 space-y-3">
        <Skeleton className="aspect-[2/3] w-full" />
        <div className="space-y-1.5">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
        </div>
    </div>
);

export const HeroSkeleton = () => (
    <div className="relative h-[420px] md:h-[500px] w-full bg-surface-container-high rounded-sm overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute bottom-10 left-10 space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-12 w-48" />
        </div>
    </div>
);

export default Skeleton;
