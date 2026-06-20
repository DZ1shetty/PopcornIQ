const User = require('../models/User');
const Rating = require('../models/Rating');
const Movie = require('../models/Movie');
const tmdbClient = require('../services/tmdbService');

// @desc    Get swipe deck filtered by user interactions
// @route   GET /api/match/deck
// @access  Private
const getSwipeDeck = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { genre, type = 'popular', page = 1 } = req.query;

        // 1. Fetch user to get current watchlist and disliked movies
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const watchlistIds = user.preferences?.watchlist || [];
        const dislikedIds = user.preferences?.dislikedMovies || [];

        // 2. Fetch movies rated by the user in MovieLens dataset
        let ratedTmdbIds = [];
        const numericUserId = parseInt(req.query.mockUserId) || parseInt(req.user.id);
        if (!isNaN(numericUserId)) {
            const ratedMovies = await Rating.find({ userId: numericUserId }).select('movieId');
            if (ratedMovies.length > 0) {
                const ratedMovieIds = ratedMovies.map(r => r.movieId);
                const dbMovies = await Movie.find({ movieId: { $in: ratedMovieIds } }).select('tmdbId');
                ratedTmdbIds = dbMovies.map(m => m.tmdbId).filter(Boolean);
            }
        }

        // Combine all excluded IDs into a fast lookup Set
        const excludedIds = new Set([
            ...watchlistIds,
            ...dislikedIds,
            ...ratedTmdbIds
        ]);

        // 3. Query TMDB endpoint based on settings
        let tmdbPath = '/movie/popular';
        const tmdbParams = { page: Number(page) };

        if (genre) {
            tmdbPath = '/discover/movie';
            tmdbParams.with_genres = genre;
            tmdbParams.sort_by = 'popularity.desc';
        } else if (type === 'trending') {
            tmdbPath = '/trending/movie/day';
        } else if (type === 'top_rated') {
            tmdbPath = '/movie/top_rated';
        }

        let currentPage = Number(page);
        let accumulatedResults = [];
        const targetLimit = 20;
        let attempts = 0;
        const maxAttempts = 3; // Prevent infinite loops or excessive API calls

        while (accumulatedResults.length < targetLimit && attempts < maxAttempts) {
            attempts++;
            tmdbParams.page = currentPage;

            const response = await tmdbClient.get(tmdbPath, {
                params: tmdbParams
            });

            const rawMovies = response.data.results || [];
            if (rawMovies.length === 0) break;

            // Filter out already swiped/rated movies
            const newFiltered = rawMovies.filter(movie => !excludedIds.has(movie.id));
            accumulatedResults = [...accumulatedResults, ...newFiltered];

            currentPage++;
        }

        // Limit to target deck size
        const finalDeck = accumulatedResults.slice(0, targetLimit).map(movie => ({
            id: movie.id,
            title: movie.title,
            posterPath: movie.poster_path,
            backdropPath: movie.backdrop_path,
            voteAverage: movie.vote_average,
            releaseDate: movie.release_date,
            overview: movie.overview,
            genreIds: movie.genre_ids
        }));

        res.json({
            results: finalDeck,
            nextPage: currentPage
        });

    } catch (error) {
        console.error('Match deck generation error:', error);
        next(error);
    }
};

// @desc    Register a swipe (like or dislike)
// @route   POST /api/match/swipe
// @access  Private
const handleSwipe = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { movieId, action, movieData } = req.body;

        if (!movieId || !action) {
            return res.status(400).json({ error: 'Movie ID and Action are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Initialize lists if they don't exist
        if (!user.preferences) {
            user.preferences = { favoriteGenres: [], watchlist: [], watchlistData: [], dislikedMovies: [] };
        }
        if (!user.preferences.watchlist) user.preferences.watchlist = [];
        if (!user.preferences.watchlistData) user.preferences.watchlistData = [];
        if (!user.preferences.dislikedMovies) user.preferences.dislikedMovies = [];

        const movieIdNum = Number(movieId);

        if (action === 'like') {
            // Save to watchlist (equivalent to like/archiving)
            if (!user.preferences.watchlist.includes(movieIdNum)) {
                user.preferences.watchlist.push(movieIdNum);
                if (movieData) {
                    user.preferences.watchlistData.push({
                        movieId: movieIdNum,
                        title: movieData.title,
                        posterPath: movieData.posterPath || movieData.poster_path,
                        voteAverage: movieData.voteAverage || movieData.vote_average,
                        addedAt: new Date()
                    });
                }
            }
        } else if (action === 'dislike') {
            // Save to disliked movies list
            if (!user.preferences.dislikedMovies.includes(movieIdNum)) {
                user.preferences.dislikedMovies.push(movieIdNum);
            }
        } else {
            return res.status(400).json({ error: "Invalid action. Must be 'like' or 'dislike'" });
        }

        await user.save();
        res.json({
            message: `Swipe ${action} registered successfully`,
            watchlistCount: user.preferences.watchlist.length,
            dislikedCount: user.preferences.dislikedMovies.length
        });

    } catch (error) {
        console.error('Swipe registration error:', error);
        next(error);
    }
};

module.exports = {
    getSwipeDeck,
    handleSwipe
};
