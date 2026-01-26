import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [watchlistData, setWatchlistData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch watchlist on user login
    useEffect(() => {
        const fetchWatchlist = async () => {
            if (!user) {
                setWatchlist([]);
                setWatchlistData([]);
                return;
            }

            try {
                setLoading(true);
                const { data } = await api.get('/api/watchlist');
                setWatchlist(data.watchlist || []);

                // Fetch full data for watchlist movies
                if (data.watchlist && data.watchlist.length > 0) {
                    const moviePromises = data.watchlist.slice(0, 50).map(id =>
                        api.get(`/api/tmdb/${id}`).then(res => ({
                            movieId: res.data.id,
                            title: res.data.title,
                            posterPath: res.data.poster_path,
                            backdropPath: res.data.backdrop_path,
                            voteAverage: res.data.vote_average,
                            releaseDate: res.data.release_date,
                            overview: res.data.overview
                        })).catch(() => null)
                    );
                    const movies = await Promise.all(moviePromises);
                    setWatchlistData(movies.filter(Boolean));
                }
            } catch (error) {
                console.error('Failed to fetch watchlist:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWatchlist();
    }, [user]);

    const isInWatchlist = useCallback((movieId) => {
        return watchlist.includes(Number(movieId));
    }, [watchlist]);

    const addToWatchlist = useCallback(async (movieId, movieData = null) => {
        if (!user) return { success: false, error: 'Not authenticated' };

        try {
            const { data } = await api.post(`/api/watchlist/${movieId}`, { movieData });
            setWatchlist(data.watchlist);

            // Add to local watchlistData
            if (movieData) {
                setWatchlistData(prev => [...prev, {
                    movieId: Number(movieId),
                    ...movieData
                }]);
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to add to watchlist:', error);
            return { success: false, error: error.response?.data?.error || 'Failed to add' };
        }
    }, [user]);

    const removeFromWatchlist = useCallback(async (movieId) => {
        if (!user) return { success: false, error: 'Not authenticated' };

        try {
            const { data } = await api.delete(`/api/watchlist/${movieId}`);
            setWatchlist(data.watchlist);
            setWatchlistData(prev => prev.filter(m => m.movieId !== Number(movieId)));
            return { success: true };
        } catch (error) {
            console.error('Failed to remove from watchlist:', error);
            return { success: false, error: error.response?.data?.error || 'Failed to remove' };
        }
    }, [user]);

    const toggleWatchlist = useCallback(async (movieId, movieData = null) => {
        if (isInWatchlist(movieId)) {
            return await removeFromWatchlist(movieId);
        } else {
            return await addToWatchlist(movieId, movieData);
        }
    }, [isInWatchlist, addToWatchlist, removeFromWatchlist]);

    return (
        <WatchlistContext.Provider value={{
            watchlist,
            watchlistData,
            loading,
            isInWatchlist,
            addToWatchlist,
            removeFromWatchlist,
            toggleWatchlist
        }}>
            {children}
        </WatchlistContext.Provider>
    );
};

export const useWatchlist = () => useContext(WatchlistContext);
