const axios = require('axios');

const TMDB_BASE = "https://api.themoviedb.org/3";

// Create Axios client for TMDB
const tmdbClient = axios.create({
    baseURL: TMDB_BASE,
    timeout: 15000,
    headers: {
        accept: "application/json",
    },
});

// Request Interceptor: Prioritize TMDB_API_KEY (query parameter) to prevent ECONNRESET issues on Windows
tmdbClient.interceptors.request.use((config) => {
    const apiKey = process.env.TMDB_API_KEY;
    const token = process.env.TMDB_ACCESS_TOKEN;

    // Remove any existing auth to avoid confusion
    delete config.headers.Authorization;

    if (apiKey) {
        config.params = { ...config.params, api_key: apiKey };
    } else if (token && token.length > 30) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Robust retry logic for network instability (e.g. ECONNRESET on Windows)
tmdbClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;

        // Check if it's a transient network error or 5xx server error
        const isNetworkError = !error.response || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT';
        const isRetryableStatus = error.response?.status >= 500;

        if (config && (isNetworkError || isRetryableStatus)) {
            config._retryCount = config._retryCount || 0;

            if (config._retryCount < 4) {
                config._retryCount++;
                console.warn(`[TMDB Retry] Attempt ${config._retryCount} for ${config.url} due to ${error.code || error.response?.status}`);

                // Fast retry backoff: 300ms, 600ms, 900ms, 1200ms
                const delay = config._retryCount * 300;
                await new Promise((resolve) => setTimeout(resolve, delay));

                // Re-execute request with same config
                return tmdbClient(config);
            }
        }
        return Promise.reject(error);
    }
);

module.exports = tmdbClient;
