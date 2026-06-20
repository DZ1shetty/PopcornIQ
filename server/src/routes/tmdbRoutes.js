const express = require('express');
const axios = require('axios');

const router = express.Router();
const TMDB_BASE = "https://api.themoviedb.org/3";

// Simple In-Memory Cache with shorter TTL for fresher data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes - fresher data for better user experience

const tmdb = require('../services/tmdbService');

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

// Main Section Routes with Unique Cache Keys
router.get("/trending/today", (req, res) => proxyRequest("/trending/movie/day", { page: req.query.page || 1 }, res, `trending-day-p${req.query.page || 1}`));
router.get("/popular", (req, res) => proxyRequest("/movie/popular", { page: req.query.page || 1 }, res, `popular-p${req.query.page || 1}`));
router.get("/top-rated", (req, res) => proxyRequest("/movie/top_rated", { page: req.query.page || 1 }, res, `top-rated-p${req.query.page || 1}`));
router.get("/genres", (req, res) => proxyRequest("/genre/movie/list", {}, res, "tmdb-genres-list"));

// Clear Cache Endpoint (for testing/debugging)
router.post("/clear-cache", (req, res) => {
    cache.clear();
    res.json({ success: true, message: "Cache cleared successfully" });
});

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

// ✅ Discover Anime
router.get("/discover/anime", (req, res) => {
    const subGenre = req.query.sub_genre;
    const genres = subGenre ? `16,${subGenre}` : "16";
    
    proxyRequest("/discover/tv", { 
        with_genres: genres, 
        with_original_language: "ja", 
        sort_by: "popularity.desc",
        include_adult: false,
        "vote_count.gte": 50, // Ensures reputable/popular shows
        page: req.query.page || 1 
    }, res, `anime-tv-${subGenre || 'all'}-pop-p${req.query.page || 1}`);
});

// ✅ Discover by Country (Latest Movies)
router.get("/discover/country/:code", (req, res) => {
    const { code } = req.params;
    const today = new Date().toISOString().split('T')[0];
    proxyRequest("/discover/movie", {
        with_origin_country: code,
        sort_by: "primary_release_date.desc",
        "primary_release_date.lte": today,
        "vote_count.gte": 1,
        page: req.query.page || 1
    }, res, `country-${code}-latest-p${req.query.page || 1}`);
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
