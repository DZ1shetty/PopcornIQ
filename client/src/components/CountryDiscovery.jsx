import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, ArrowRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const ACTIVE_FILM_HUBS = new Set([
    'US', 'IN', 'FR', 'GB', 'DE', 'JP', 'KR', 'CN', 'ES', 'IT', 'CA', 'AU', 'BR', 'MX', 'RU',
    'HK', 'TW', 'SE', 'DK', 'NO', 'FI', 'NL', 'BE', 'PL', 'CZ', 'HU', 'TR', 'IR', 'PH', 'TH',
    'VN', 'ID', 'AR', 'CO', 'CL', 'PE', 'ZA', 'NG', 'EG', 'IL', 'GR', 'PT', 'IE', 'AT', 'CH',
    'NZ', 'PK', 'MY', 'SG', 'MA', 'DZ', 'TN', 'SN', 'KE', 'GH', 'UA', 'RO', 'IS', 'IR', 'CU',
    'UY', 'VE', 'KZ', 'BG', 'HR', 'RS', 'EE', 'LV', 'LT'
]);

// High-Fidelity Fallback Grid for total signal loss
const STATIC_HUB_FALLBACK = [
    { iso_3166_1: 'US', english_name: 'United States' },
    { iso_3166_1: 'IN', english_name: 'India' },
    { iso_3166_1: 'KR', english_name: 'South Korea' },
    { iso_3166_1: 'JP', english_name: 'Japan' },
    { iso_3166_1: 'FR', english_name: 'France' },
    { iso_3166_1: 'GB', english_name: 'United Kingdom' },
    { iso_3166_1: 'TR', english_name: 'Turkey' },
    { iso_3166_1: 'ES', english_name: 'Spain' },
    { iso_3166_1: 'DE', english_name: 'Germany' },
    { iso_3166_1: 'IT', english_name: 'Italy' }
];

// Region Mapping for Organized Discovery
const REGION_MAP = {
    'Americas': ['US', 'CA', 'MX', 'BR', 'AR', 'CO', 'CL', 'PE', 'CU', 'UY', 'VE'],
    'Europe': ['FR', 'GB', 'DE', 'ES', 'IT', 'SE', 'DK', 'NO', 'FI', 'NL', 'BE', 'PL', 'CZ', 'HU', 'TR', 'GR', 'PT', 'IE', 'AT', 'CH', 'IS', 'UA', 'RO', 'BG', 'HR', 'RS', 'EE', 'LV', 'LT', 'RU'],
    'Asia': ['IN', 'JP', 'KR', 'CN', 'HK', 'TW', 'TH', 'VN', 'ID', 'PH', 'PK', 'MY', 'SG', 'KZ', 'IR'],
    'World': ['AU', 'NZ', 'ZA', 'NG', 'EG', 'MA', 'DZ', 'TN', 'SN', 'KE', 'GH', 'IL']
};

const CountryDiscovery = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [countries, setCountries] = useState(STATIC_HUB_FALLBACK);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [activeRegion, setActiveRegion] = useState('All');

    // ... (fetchCountries remains practically same) ...
    const fetchCountries = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get('/api/tmdb/countries');
            const allCountries = res.data || [];
            const activeOnly = allCountries.filter(c => ACTIVE_FILM_HUBS.has(c.iso_3166_1));

            if (activeOnly.length > 0) {
                const sorted = activeOnly.sort((a, b) => a.english_name.localeCompare(b.english_name));
                setCountries(sorted);
            }
        } catch (err) {
            console.error("Geographical Link Failure:", err);
            setError("Unable to load all countries.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCountries();
        }
    }, [isOpen]);

    const filteredCountries = useMemo(() => {
        let result = countries;

        // 1. Filter by Region
        if (activeRegion !== 'All') {
            const allowedCodes = new Set(REGION_MAP[activeRegion]);
            result = result.filter(c => allowedCodes.has(c.iso_3166_1));
        }

        // 2. Filter by Search
        const query = search.toLowerCase().trim();
        if (query) {
            result = result.filter(c =>
                c.english_name.toLowerCase().includes(query) ||
                c.iso_3166_1.toLowerCase().includes(query)
            );
        }
        return result;
    }, [search, countries, activeRegion]);

    const handleCountryClick = (code, name) => {
        onClose();
        navigate(`/home?country=${code}&countryName=${name}`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1500] flex items-stretch justify-center pt-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/90 backdrop-blur-3xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        className="relative w-full max-w-[1800px] flex flex-col p-4 md:p-6 overflow-hidden"
                    >
                        {/* Ultra Compact Header */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-4 gap-6">
                            <div className="flex flex-col gap-4 w-full md:w-auto">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
                                        <span className="w-6 h-px bg-accent" />
                                        Browse by <span className="text-white/20">Country</span>
                                    </h2>
                                    <div className="h-4 w-px bg-white/10 hidden sm:block" />

                                    {/* Region Tabs - Desktop */}
                                    <div className="hidden sm:flex items-center gap-2">
                                        {['All', 'Americas', 'Europe', 'Asia', 'World'].map(region => (
                                            <button
                                                key={region}
                                                onClick={() => setActiveRegion(region)}
                                                className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all rounded-sm border ${activeRegion === region
                                                    ? 'bg-accent text-black border-accent'
                                                    : 'bg-transparent text-muted border-transparent hover:border-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {region}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                <div className="flex items-center gap-3 text-white/30 hidden lg:flex">
                                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{filteredCountries.length} Regions Active</span>
                                </div>

                                <div className="relative group ml-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={12} />

                                    <input
                                        type="text"
                                        placeholder="Search countries..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="bg-white/5 border border-white/5 pl-8 pr-4 py-1.5 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-accent/40 w-48 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="flex items-center gap-3 text-white/40 hover:text-white transition-all group"
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">Close</span>
                                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white transition-all">
                                    <X size={14} className="group-hover:rotate-90 transition-transform" />
                                </div>
                            </button>
                        </div>

                        {/* Ultra Modern Flag Matrix */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 flex-1 overflow-y-auto scrollbar-hide py-2 px-2">
                            {filteredCountries.map((country, i) => (
                                <motion.button
                                    key={country.iso_3166_1}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.005 }}
                                    onClick={() => handleCountryClick(country.iso_3166_1, country.english_name)}
                                    className="group relative h-24 bg-surface border border-white/5 hover:border-accent/40 transition-all overflow-hidden flex flex-col items-center justify-center gap-2 p-2"
                                >
                                    {/* Flag Identification Circle */}
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-accent/50 transition-all p-[1px] bg-background">
                                            <img
                                                src={`https://flagsapi.com/${country.iso_3166_1}/flat/64.png`}
                                                alt={country.english_name}
                                                className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-all duration-500"
                                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&q=80&w=100'; }}
                                            />
                                        </div>
                                        {/* Status Dot */}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-background rounded-full flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-accent/40 group-hover:bg-accent rounded-full transition-colors" />
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <span className="text-[8px] font-black text-white/20 group-hover:text-accent transition-colors tracking-[0.2em] uppercase block mb-0.5">
                                            {country.iso_3166_1}
                                        </span>
                                        <h4 className="text-[9px] font-black uppercase tracking-tight leading-none group-hover:text-white transition-colors truncate max-w-[80px]">
                                            {country.english_name}
                                        </h4>
                                    </div>

                                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/[0.02]" />
                                    <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent group-hover:w-full transition-all duration-500" />
                                </motion.button>
                            ))}
                        </div>

                        {/* Bottom Status Bar */}
                        <div className="mt-4 px-4 py-2 border-t border-white/5 flex justify-between items-center opacity-30">
                            <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-widest">
                                <span className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rounded-full" /> Online</span>
                                <span>All Countries Available</span>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Browse by Country</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CountryDiscovery;
