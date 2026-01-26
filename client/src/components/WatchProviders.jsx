import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import {
    Tv,
    ShoppingCart,
    Download,
    Globe,
    ChevronDown,
    ExternalLink,
    Loader2
} from 'lucide-react';

const WatchProviders = ({ movieId }) => {
    const [providers, setProviders] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState('US');
    const [showRegionPicker, setShowRegionPicker] = useState(false);

    const regions = [
        { code: 'US', name: 'United States' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'CA', name: 'Canada' },
        { code: 'AU', name: 'Australia' },
        { code: 'DE', name: 'Germany' },
        { code: 'FR', name: 'France' },
        { code: 'IN', name: 'India' },
        { code: 'JP', name: 'Japan' },
        { code: 'BR', name: 'Brazil' },
        { code: 'MX', name: 'Mexico' },
        { code: 'ES', name: 'Spain' },
        { code: 'IT', name: 'Italy' }
    ];

    useEffect(() => {
        if (!movieId) return;

        const fetchProviders = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data } = await api.get(`/api/tmdb/${movieId}/watch-providers`);
                setProviders(data);
            } catch (err) {
                console.error('Failed to fetch watch providers:', err);
                setError('Failed to load providers');
            } finally {
                setLoading(false);
            }
        };

        fetchProviders();
    }, [movieId]);

    const regionData = providers?.results?.[selectedRegion];

    const ProviderSection = ({ title, items, icon: Icon, type }) => {
        if (!items || items.length === 0) return null;

        const typeLabels = {
            flatrate: 'Stream',
            rent: 'Rent',
            buy: 'Buy',
            free: 'Free'
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-tiny font-black uppercase tracking-widest text-muted/60">
                        {title}
                    </span>
                </div>

                <div className="flex flex-wrap gap-3">
                    {items.map((provider) => (
                        <motion.div
                            key={provider.provider_id}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className="relative group"
                        >
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface border border-white/10 group-hover:border-accent/40 transition-all shadow-lg">
                                <img
                                    src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-background/95 border border-white/10 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {provider.provider_name}
                                <span className="block text-accent/60 font-normal normal-case">
                                    {typeLabels[type]}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className="p-8 bg-surface/30 border border-white/5">
                <div className="flex items-center gap-4">
                    <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    <span className="text-tiny text-muted uppercase tracking-widest">
                        Scanning streaming uplinks...
                    </span>
                </div>
            </div>
        );
    }

    if (error || !providers?.results) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-surface/30 border border-white/5 space-y-8"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center">
                        <Tv className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Streaming Uplink</h3>
                        <p className="text-tiny text-muted/50 uppercase tracking-widest">Where to watch</p>
                    </div>
                </div>

                {/* Region Picker */}
                <div className="relative">
                    <button
                        onClick={() => setShowRegionPicker(!showRegionPicker)}
                        className="flex items-center gap-3 px-4 py-2 bg-background border border-white/10 hover:border-white/20 transition-all text-tiny font-bold uppercase tracking-wider"
                    >
                        <Globe className="w-4 h-4 text-accent" />
                        {selectedRegion}
                        <ChevronDown className={`w-4 h-4 transition-transform ${showRegionPicker ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showRegionPicker && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 top-full mt-2 bg-background border border-white/10 shadow-2xl z-20 max-h-60 overflow-y-auto scrollbar-hide"
                            >
                                {regions.map((region) => (
                                    <button
                                        key={region.code}
                                        onClick={() => {
                                            setSelectedRegion(region.code);
                                            setShowRegionPicker(false);
                                        }}
                                        className={`w-full px-6 py-3 text-left text-tiny font-bold uppercase tracking-wider hover:bg-accent/10 transition-all flex items-center justify-between gap-8 ${selectedRegion === region.code ? 'bg-accent/5 text-accent' : 'text-white/70'
                                            }`}
                                    >
                                        <span>{region.name}</span>
                                        <span className="text-muted/40">{region.code}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Providers */}
            {regionData ? (
                <div className="space-y-8">
                    <ProviderSection
                        title="Stream"
                        items={regionData.flatrate}
                        icon={Tv}
                        type="flatrate"
                    />
                    <ProviderSection
                        title="Rent"
                        items={regionData.rent}
                        icon={ShoppingCart}
                        type="rent"
                    />
                    <ProviderSection
                        title="Buy"
                        items={regionData.buy}
                        icon={Download}
                        type="buy"
                    />
                    <ProviderSection
                        title="Free with Ads"
                        items={regionData.ads}
                        icon={Tv}
                        type="free"
                    />

                    {/* JustWatch Attribution */}
                    {regionData.link && (
                        <motion.a
                            href={regionData.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ x: 5 }}
                            className="inline-flex items-center gap-3 text-tiny text-muted/40 hover:text-accent transition-colors uppercase tracking-widest group"
                        >
                            <span>Powered by JustWatch</span>
                            <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </motion.a>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 border-2 border-white/10 rounded-full flex items-center justify-center">
                        <Tv className="w-6 h-6 text-muted/30" />
                    </div>
                    <p className="text-muted/50 text-tiny uppercase tracking-widest mb-2">
                        No streaming data available
                    </p>
                    <p className="text-muted/30 text-[10px] uppercase tracking-widest">
                        Try selecting a different region
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default WatchProviders;
