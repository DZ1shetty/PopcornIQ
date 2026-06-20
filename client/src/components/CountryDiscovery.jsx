import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const ACTIVE_FILM_HUBS = new Set([
    'US','IN','FR','GB','DE','JP','KR','CN','ES','IT','CA','AU','BR','MX','RU',
    'HK','TW','SE','DK','NO','FI','NL','BE','PL','CZ','HU','TR','IR','PH','TH',
    'VN','ID','AR','CO','CL','PE','ZA','NG','EG','IL','GR','PT','IE','AT','CH',
    'NZ','PK','MY','SG','MA','DZ','TN','SN','KE','GH','UA','RO','IS','CU',
    'UY','VE','KZ','BG','HR','RS','EE','LV','LT'
]);

const STATIC_HUBS = [
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

const REGION_MAP = {
    'Americas': ['US','CA','MX','BR','AR','CO','CL','PE','CU','UY','VE'],
    'Europe':   ['FR','GB','DE','ES','IT','SE','DK','NO','FI','NL','BE','PL','CZ','HU','TR','GR','PT','IE','AT','CH','IS','UA','RO','BG','HR','RS','EE','LV','LT','RU'],
    'Asia':     ['IN','JP','KR','CN','HK','TW','TH','VN','ID','PH','PK','MY','SG','KZ','IR'],
    'Africa':   ['ZA','NG','EG','MA','DZ','TN','SN','KE','GH','IL'],
};

const REGIONS = ['All', ...Object.keys(REGION_MAP)];

const CountryDiscovery = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [countries, setCountries]     = useState(STATIC_HUBS);
    const [isLoading, setIsLoading]     = useState(false);
    const [search, setSearch]           = useState('');
    const [activeRegion, setActiveRegion] = useState('All');

    useEffect(() => {
        if (!isOpen) return;
        setIsLoading(true);
        api.get('/api/tmdb/countries')
            .then(res => {
                const active = (res.data || []).filter(c => ACTIVE_FILM_HUBS.has(c.iso_3166_1));
                if (active.length) setCountries(active.sort((a, b) => a.english_name.localeCompare(b.english_name)));
            })
            .catch(() => setCountries(STATIC_HUBS))
            .finally(() => setIsLoading(false));
    }, [isOpen]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    const filtered = useMemo(() => {
        let result = countries;
        if (activeRegion !== 'All') {
            const allowed = new Set(REGION_MAP[activeRegion]);
            result = result.filter(c => allowed.has(c.iso_3166_1));
        }
        const q = search.toLowerCase().trim();
        if (q) result = result.filter(c => c.english_name.toLowerCase().includes(q) || c.iso_3166_1.toLowerCase().includes(q));
        return result;
    }, [search, countries, activeRegion]);

    const handleClick = (code, name) => { onClose(); navigate(`/home?country=${code}&countryName=${name}`); };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1500] flex flex-col pt-16 bg-background">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 24 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col w-full max-w-container-max mx-auto flex-1 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 px-6 md:px-12 py-6 border-b border-outline-variant/30 flex-shrink-0">
                            <div>
                                <p className="font-sans text-xs text-on-surface-variant tracking-[0.15em] uppercase mb-1">Browse</p>
                                <h2 className="font-headline text-2xl text-primary font-semibold">Countries</h2>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Region tabs */}
                                <div className="flex items-center gap-1.5">
                                    {REGIONS.map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setActiveRegion(r)}
                                            className={`px-3 py-1 font-sans text-xs font-medium rounded-sm transition-all ${
                                                activeRegion === r
                                                    ? 'bg-primary text-on-primary'
                                                    : 'bg-surface-container text-on-surface-variant hover:text-primary'
                                            }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="input-minimal max-w-[160px] py-1.5 text-sm"
                                />
                                {isLoading && <span className="material-symbols-outlined text-on-surface-variant/50 text-[20px] animate-spin">sync</span>}
                                <span className="font-sans text-xs text-on-surface-variant">{filtered.length}</span>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 md:px-12 py-8" data-lenis-prevent="true">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                                {filtered.map((country, i) => (
                                    <motion.button
                                        key={country.iso_3166_1}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.012, duration: 0.35 }}
                                        onClick={() => handleClick(country.iso_3166_1, country.english_name)}
                                        className="group flex items-center gap-3 p-4 bg-surface-container-low hover:bg-surface-container rounded-sm transition-all cursor-pointer"
                                    >
                                        <img
                                            src={`https://flagsapi.com/${country.iso_3166_1}/flat/48.png`}
                                            alt={country.english_name}
                                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                            onError={e => { e.target.style.display = 'none'; }}
                                        />
                                        <span className="font-sans text-sm text-on-surface group-hover:text-primary transition-colors text-left leading-tight font-medium">
                                            {country.english_name}
                                        </span>
                                        <ArrowRight size={12} className="ml-auto text-on-surface-variant/0 group-hover:text-on-surface-variant/60 transition-all flex-shrink-0" />
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CountryDiscovery;
