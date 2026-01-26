const express = require('express');
const axios = require('axios');

const router = express.Router();
const TMDB_BASE = "https://api.themoviedb.org/3";

// Simple In-Memory Cache
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 60 minutes for peak velocity

const tmdb = axios.create({
    baseURL: TMDB_BASE,
    timeout: 15000, // Increased timeout for slower networks
    headers: {
        accept: "application/json",
    },
});

// Priority IPv4 resolution + KeepAlive - fixes most 'ECONNRESET' & 'ETIMEDOUT' issues
const https = require('https');
tmdb.defaults.httpsAgent = new https.Agent({
    family: 4,
    keepAlive: true,
    maxSockets: 100,
    maxFreeSockets: 10,
    timeout: 30000
});

// Robust Retry Logic for Network Instability
tmdb.interceptors.response.use(
    response => response,
    async (error) => {
        const config = error.config;

        // Only retry if it's a network error or a 5xx server error
        const isNetworkError = !error.response || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT';
        const isRetryableStatus = error.response?.status >= 500;

        if (config && (isNetworkError || isRetryableStatus) && !config._isRetry) {
            config._isRetry = true;
            config._retryCount = config._retryCount || 0;

            if (config._retryCount < 3) {
                config._retryCount++;
                console.warn(`[TMDB Retry] Attempt ${config._retryCount} for ${config.url} due to ${error.code || error.response?.status}`);

                // Exponential backoff
                const delay = Math.pow(2, config._retryCount) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));

                return tmdb(config);
            }
        }
        return Promise.reject(error);
    }
);

// Improved Interceptor: Priority to Bearer Token, fallback to API Key
tmdb.interceptors.request.use((config) => {
    const token = process.env.TMDB_ACCESS_TOKEN;
    const apiKey = process.env.TMDB_API_KEY;

    // Remove any existing auth to avoid confusion
    delete config.headers.Authorization;

    if (token && token.length > 30) {
        config.headers.Authorization = `Bearer ${token}`;
    } else if (apiKey) {
        config.params = { ...config.params, api_key: apiKey };
    }

    return config;
}, (error) => Promise.reject(error));

const getFromCache = (key) => {
    const entry = cache.get(key);
    if (entry && (Date.now() - entry.timestamp < CACHE_TTL)) {
        return entry.data;
    }
    return null;
};

const setCache = (key, data) => {
    cache.set(key, { data, timestamp: Date.now() });
};

const handleTmdbError = (err, res) => {
    const status = err?.response?.status || 500;
    const errorData = err?.response?.data || err.message;
    const errorCode = err?.code || "UNKNOWN_ERROR";

    console.error(`[TMDB Final Failure] ${status} [${errorCode}]:`, errorData);

    if (res.headersSent) return;

    res.status(status).json({
        error: "TMDB_FETCH_ERROR",
        code: errorCode,
        results: [],
        message: err.message
    });
};

// STATIC FALLBACK DATA (For when TMDB is completely unreachable)
const STATIC_MOVIES = {
    results: [
        { id: 27205, title: "Inception", poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", backdrop_path: "/s3TBrRGB1jav7sz4G4PyxrU0pMC.jpg", vote_average: 8.4, overview: "A skilled thief is the absolute best in the dangerous art of extraction.", release_date: "2010-07-15" },
        { id: 157336, title: "Interstellar", poster_path: "/gEU2QniL6E8ahDnMNatnZsUh8qU.jpg", backdrop_path: "/xJHokMBLkbke0umzhT5bCsDIKbh.jpg", vote_average: 8.4, overview: "The adventures of a group of explorers who make use of a newly discovered wormhole.", release_date: "2014-11-05" },
        { id: 155, title: "The Dark Knight", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", backdrop_path: "/1nscKF94UE56s4FN9x5D52k53B3.jpg", vote_average: 8.5, overview: "Batman raises the stakes in his war on crime.", release_date: "2008-07-16" },
        { id: 19995, title: "Avatar", poster_path: "/kyeqWdyUXW608qlYkRqosgbbJyK.jpg", backdrop_path: "/vL5LR6WdxWPjLPFRLe133jX9UAy.jpg", vote_average: 7.6, overview: "In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora.", release_date: "2009-12-15" },
        { id: 1726, title: "Iron Man", poster_path: "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg", backdrop_path: "/cyecB7godJ6kNHGONFjUyVN9X5k.jpg", vote_average: 7.6, overview: "After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.", release_date: "2008-04-30" },
        { id: 299534, title: "Avengers: Endgame", poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg", backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg", vote_average: 8.3, overview: "After the devastating events of Infinity War, the universe is in ruins.", release_date: "2019-04-24" }
    ]
};

const proxyRequest = async (path, params = {}, res, cacheKey) => {
    const key = cacheKey || path + JSON.stringify(params);
    const cached = getFromCache(key); // Fresh check

    // 1. Return Cache if Fresh
    if (cached) return res.json(cached);

    try {
        const { data } = await tmdb.get(path, { params });
        setCache(key, data);
        if (!res.headersSent) res.json(data);
    } catch (err) {
        // 2. Fallback: Return Stale Cache if available
        const staleEntry = cache.get(key);
        if (staleEntry && staleEntry.data) {
            console.warn(`[TMDB Fallback] Serving stale cache for ${path}`);
            if (!res.headersSent) return res.json(staleEntry.data);
        }

        // 3. Fallback: Return Static Data if specific endpoints fail
        if (path.includes('trending') || path.includes('popular') || path.includes('top_rated') || path.includes('discover')) {
            console.warn(`[TMDB Emergency] Serving static backup for ${path}`);
            if (!res.headersSent) return res.json(STATIC_MOVIES);
        }

        handleTmdbError(err, res);
    }
};

router.get("/trending/today", (req, res) => proxyRequest("/trending/movie/day", { page: req.query.page || 1 }, res));
router.get("/popular", (req, res) => proxyRequest("/movie/popular", { page: req.query.page || 1 }, res));
router.get("/top-rated", (req, res) => proxyRequest("/movie/top_rated", { page: req.query.page || 1 }, res));
router.get("/genres", (req, res) => proxyRequest("/genre/movie/list", {}, res, "tmdb-genres-list"));

router.get("/search", (req, res) => {
    const q = req.query.q || "";
    if (!q.trim()) return res.json({ results: [] });
    proxyRequest("/search/movie", { query: q, include_adult: false, page: req.query.page || 1 }, res);
});

router.get("/discover/genre/:id", (req, res) => {
    const { id } = req.params;
    proxyRequest("/discover/movie", { with_genres: id, sort_by: "popularity.desc", page: req.query.page || 1 }, res, `genre-${id}-pop-p${req.query.page || 1}`);
});

router.get("/discover/genre/:id/top", (req, res) => {
    const { id } = req.params;
    proxyRequest("/discover/movie", { with_genres: id, sort_by: "vote_average.desc", "vote_count.gte": 100, page: req.query.page || 1 }, res, `genre-${id}-top-p${req.query.page || 1}`);
});

router.get("/discover/genre/:id/new", (req, res) => {
    const { id } = req.params;
    proxyRequest("/discover/movie", { with_genres: id, sort_by: "release_date.desc", "vote_count.gte": 10, page: req.query.page || 1 }, res, `genre-${id}-new-p${req.query.page || 1}`);
});

// ✅ Discover by Country (Sorted Alphabetically)
router.get("/discover/country/:code", (req, res) => {
    const { code } = req.params;
    // Note: sorting by title is available but usually requires a vote count threshold to be useful
    proxyRequest("/discover/movie", {
        with_origin_country: code,
        sort_by: "original_title.asc",
        "vote_count.gte": 1,
        page: req.query.page || 1
    }, res, `country-${code}-alpha-p${req.query.page || 1}`);
});

// ✅ Get All Countries
router.get("/countries", (req, res) => {
    proxyRequest("/configuration/countries", {}, res, "tmdb-countries-list");
});

router.get("/:id", (req, res) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) return res.status(400).json({ error: "Invalid ID format" });
    proxyRequest(`/movie/${id}`, { append_to_response: "credits,similar" }, res);
});

// ✅ Get Movie Videos (Trailers, Teasers, etc.)
router.get("/:id/videos", (req, res) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) return res.status(400).json({ error: "Invalid ID format" });
    proxyRequest(`/movie/${id}/videos`, {}, res, `movie-${id}-videos`);
});

// ✅ Get Watch Providers (Streaming Platforms)
router.get("/:id/watch-providers", (req, res) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) return res.status(400).json({ error: "Invalid ID format" });
    proxyRequest(`/movie/${id}/watch/providers`, {}, res, `movie-${id}-providers`);
});

// ✅ Get Person Details (Actor/Director)
router.get("/person/:id", (req, res) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) return res.status(400).json({ error: "Invalid ID format" });
    proxyRequest(`/person/${id}`, { append_to_response: "movie_credits,images" }, res, `person-${id}`);
});

module.exports = router;
