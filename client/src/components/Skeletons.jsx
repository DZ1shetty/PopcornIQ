import { motion } from 'framer-motion';

export const MovieSkeleton = () => (
    <div className="space-y-4">
        <div className="aspect-[2/3] bg-white/5 animate-pulse rounded-sm" />
        <div className="space-y-2">
            <div className="h-2 w-12 bg-white/5 animate-pulse rounded-sm" />
            <div className="h-4 w-full bg-white/5 animate-pulse rounded-sm" />
        </div>
    </div>
);

export const RowSkeleton = () => (
    <div className="py-16">
        <div className="container mx-auto px-8 mb-12 flex items-end justify-between border-b border-white/5 pb-8">
            <div className="space-y-2">
                <div className="h-2 w-16 bg-white/5 animate-pulse rounded-sm" />
                <div className="h-10 w-48 bg-white/5 animate-pulse rounded-sm" />
            </div>
        </div>
        <div className="container mx-auto px-8">
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <MovieSkeleton key={i} />)}
            </div>
        </div>
    </div>
);

export const HeroSkeleton = () => (
    <div className="relative h-[80vh] w-full bg-background flex items-center overflow-hidden">
        <div className="container mx-auto px-8 relative z-10">
            <div className="max-w-4xl space-y-8 text-left">
                <div className="h-2 w-32 bg-white/5 animate-pulse rounded-full" />
                <div className="h-24 w-full bg-white/5 animate-pulse rounded-sm" />
                <div className="space-y-2">
                    <div className="h-4 w-2/3 bg-white/5 animate-pulse rounded-sm" />
                    <div className="h-4 w-1/2 bg-white/5 animate-pulse rounded-sm" />
                </div>
                <div className="h-12 w-40 bg-white/5 animate-pulse rounded-sm" />
            </div>
        </div>
    </div>
);
