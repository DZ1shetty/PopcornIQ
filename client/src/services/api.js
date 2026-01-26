import axios from 'axios';

const api = axios.create({
    baseURL: '/',
    timeout: 20000,
});

// Request interceptor to attach bearer token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for global error handling and retries
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;

        // Handle 401 Unauthorized globally
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // We could redirect here if needed, but components usually handle user state
        }

        // Retry logic for connection issues (max 2 retries)
        if (!config || !config.retryCount) config.retryCount = 0;

        const isNetworkError = !error.response && error.code !== 'ECONNABORTED' && !error.message.includes('timeout');

        if (isNetworkError && config.retryCount < 2) {
            config.retryCount += 1;
            const delay = config.retryCount * 1000;
            console.warn(`Network glitch. Retrying in ${delay}ms... (Attempt ${config.retryCount})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return api(config);
        }

        return Promise.reject(error);
    }
);

export default api;
