const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ watchlist: user.preferences?.watchlist || [] });
    } catch (error) {
        console.error('Watchlist fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

// @desc    Add movie to watchlist
// @route   POST /api/watchlist/:movieId
// @access  Private
router.post('/:movieId', protect, async (req, res) => {
    try {
        const { movieId } = req.params;
        const { movieData } = req.body; // Optional: store movie metadata

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Initialize preferences if not exists
        if (!user.preferences) {
            user.preferences = { favoriteGenres: [], watchlist: [], watchlistData: [] };
        }
        if (!user.preferences.watchlist) {
            user.preferences.watchlist = [];
        }
        if (!user.preferences.watchlistData) {
            user.preferences.watchlistData = [];
        }

        const movieIdNum = Number(movieId);

        // Check if already in watchlist
        if (user.preferences.watchlist.includes(movieIdNum)) {
            return res.status(400).json({ error: 'Movie already in watchlist' });
        }

        // Add to watchlist
        user.preferences.watchlist.push(movieIdNum);

        // Store movie data if provided
        if (movieData) {
            user.preferences.watchlistData.push({
                movieId: movieIdNum,
                title: movieData.title,
                posterPath: movieData.posterPath,
                voteAverage: movieData.voteAverage,
                addedAt: new Date()
            });
        }

        await user.save();
        res.json({
            message: 'Signal archived successfully',
            watchlist: user.preferences.watchlist
        });
    } catch (error) {
        console.error('Watchlist add error:', error);
        res.status(500).json({ error: 'Failed to archive signal' });
    }
});

// @desc    Remove movie from watchlist
// @route   DELETE /api/watchlist/:movieId
// @access  Private
router.delete('/:movieId', protect, async (req, res) => {
    try {
        const { movieId } = req.params;
        const movieIdNum = Number(movieId);

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.preferences?.watchlist) {
            return res.status(400).json({ error: 'Watchlist is empty' });
        }

        // Remove from watchlist
        user.preferences.watchlist = user.preferences.watchlist.filter(id => id !== movieIdNum);

        // Remove from watchlistData if exists
        if (user.preferences.watchlistData) {
            user.preferences.watchlistData = user.preferences.watchlistData.filter(
                item => item.movieId !== movieIdNum
            );
        }

        await user.save();
        res.json({
            message: 'Signal removed from archive',
            watchlist: user.preferences.watchlist
        });
    } catch (error) {
        console.error('Watchlist remove error:', error);
        res.status(500).json({ error: 'Failed to remove signal' });
    }
});

// @desc    Check if movie is in watchlist
// @route   GET /api/watchlist/check/:movieId
// @access  Private
router.get('/check/:movieId', protect, async (req, res) => {
    try {
        const { movieId } = req.params;
        const movieIdNum = Number(movieId);

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isInWatchlist = user.preferences?.watchlist?.includes(movieIdNum) || false;
        res.json({ isInWatchlist });
    } catch (error) {
        console.error('Watchlist check error:', error);
        res.status(500).json({ error: 'Failed to check watchlist' });
    }
});

module.exports = router;
