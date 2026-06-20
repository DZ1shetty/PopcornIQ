const Movie = require('../models/Movie');
const asyncHandler = require('express-async-handler'); // Or use try-catch blocks like before

// @desc    Get all movies with pagination and search
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
    const pageSize = 20;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.keyword
        ? {
            title: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        }
        : {};

    // If searching by genre
    const genre = req.query.genre
        ? { genresArray: req.query.genre }
        : {};

    try {
        const count = await Movie.countDocuments({ ...keyword, ...genre });
        const movies = await Movie.find({ ...keyword, ...genre })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ movies, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        next(error);
    }
};

// @desc    Get movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
    try {
        // Try finding by movieId (custom ID) first, then fallback to _id
        let movie = await Movie.findOne({ movieId: req.params.id });

        // If not found by custom ID and the ID looks like an ObjectId, try finding by _id
        if (!movie && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            movie = await Movie.findById(req.params.id);
        }

        if (movie) {
            res.json(movie);
        } else {
            res.status(404);
            throw new Error('Movie not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMovies,
    getMovieById,
};
