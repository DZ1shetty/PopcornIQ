const Movie = require('../models/Movie');
const Rating = require('../models/Rating');
const mongoose = require('mongoose');

// @desc    Get Top Rated Movies
// @route   GET /api/recommendations/top-rated
// @access  Public
const getTopRated = async (req, res, next) => {
    try {
        const topRated = await Rating.aggregate([
            {
                $group: {
                    _id: "$movieId",
                    avgRating: { $avg: "$rating" },
                    voteCount: { $sum: 1 }
                }
            },
            { $match: { voteCount: { $gte: 50 } } }, // Lowered threshold for better diversity
            { $sort: { avgRating: -1, voteCount: -1 } },
            { $limit: 20 },
            {
                $lookup: {
                    from: "movies",
                    localField: "_id",
                    foreignField: "movieId",
                    as: "details"
                }
            },
            { $unwind: "$details" },
            {
                $project: {
                    _id: 0,
                    avgRating: 1,
                    voteCount: 1,
                    movieId: "$_id",
                    tmdbId: "$details.tmdbId",
                    title: "$details.title",
                    genres: "$details.genresArray",
                    posterPath: "$details.posterPath",
                    backdropPath: "$details.backdropPath"
                }
            }
        ]);

        res.json(topRated);
    } catch (error) {
        next(error);
    }
};

// @desc    Get Personalized Recommendations (User's fav genres -> high rated unwatched)
// @route   GET /api/recommendations/personalized
// @access  Private
const getPersonalizedRecs = async (req, res, next) => {
    // For MovieLens demo data, allow mockUserId
    const userId = req.query.mockUserId ? parseInt(req.query.mockUserId) : (req.user ? parseInt(req.user.id) : null);

    if (!userId || isNaN(userId)) {
        return getTopRated(req, res, next);
    }

    try {
        // 1. Get user's top genres from their high ratings (4+)
        const userPreferences = await Rating.aggregate([
            { $match: { userId: userId, rating: { $gte: 4 } } },
            { $lookup: { from: "movies", localField: "movieId", foreignField: "movieId", as: "movie" } },
            { $unwind: "$movie" },
            { $unwind: "$movie.genresArray" },
            { $group: { _id: "$movie.genresArray", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const topGenres = userPreferences.map(g => g._id);

        // 2. Get IDs of movies the user has already rated
        const ratedMovies = await Rating.find({ userId }).select('movieId');
        const ratedMovieIds = ratedMovies.map(r => r.movieId);

        if (topGenres.length === 0) {
            return getTopRated(req, res, next);
        }

        // 3. Find top rated movies in those genres that user hasn't rated
        const recommendations = await Movie.aggregate([
            { $match: { 
                genresArray: { $in: topGenres },
                movieId: { $nin: ratedMovieIds }
            }},
            {
                $lookup: {
                    from: "ratings",
                    localField: "movieId",
                    foreignField: "movieId",
                    as: "ratingData"
                }
            },
            {
                $addFields: {
                    avgRating: { $avg: "$ratingData.rating" },
                    voteCount: { $size: "$ratingData" }
                }
            },
            { $match: { voteCount: { $gte: 1 } } },
            { $sort: { avgRating: -1, voteCount: -1 } },
            { $limit: 24 },
            {
                $project: {
                    _id: 0,
                    movieId: 1,
                    tmdbId: 1,
                    title: 1,
                    posterPath: 1,
                    backdropPath: 1,
                    genresArray: 1,
                    avgRating: 1,
                    voteCount: 1
                }
            }
        ]);

        res.json(recommendations);

    } catch (error) {
        next(error);
    }
};

// @desc    Get Top Rated Movies by Genre
// @route   GET /api/recommendations/genre/:genre
// @access  Public
const getTopRatedByGenre = async (req, res, next) => {
    const genre = req.params.genre;
    try {
        const movies = await Movie.aggregate([
            { $match: { genresArray: genre } },
            {
                $lookup: {
                    from: "ratings",
                    localField: "movieId",
                    foreignField: "movieId",
                    as: "ratingData"
                }
            },
            {
                $addFields: {
                    avgRating: { $avg: "$ratingData.rating" },
                    voteCount: { $size: "$ratingData" }
                }
            },
            { $match: { voteCount: { $gte: 1 } } },
            { $sort: { avgRating: -1, voteCount: -1 } },
            { $limit: 20 },
            {
                $project: {
                    _id: 0,
                    movieId: 1,
                    tmdbId: 1,
                    title: 1,
                    posterPath: 1,
                    genresArray: 1,
                    avgRating: 1
                }
            }
        ]);
        res.json(movies);
    } catch (error) {
        next(error);
    }
};

// @desc    Get "People Also Liked" (Collaborative Filtering)
// @route   GET /api/recommendations/similar/:movieId
// @access  Public
const getPeopleAlsoLiked = async (req, res, next) => {
    let { movieId } = req.params;
    movieId = parseInt(movieId);

    if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
    }

    try {
        // 1. Find users who liked this movie (rating >= 4)
        const topUsers = await Rating.find({ movieId, rating: { $gte: 4 } })
            .limit(100)
            .select('userId');
        
        const userIds = topUsers.map(u => u.userId);

        if (userIds.length === 0) {
            // Fallback: Just return generic similar movies based on genres if no ratings exist
            const movie = await Movie.findOne({ movieId });
            if (!movie) return res.json([]);
            
            const similar = await Movie.find({
                genresArray: { $in: movie.genresArray },
                movieId: { $ne: movieId }
            })
            .sort({ voteAverage: -1 })
            .limit(10);
            return res.json(similar);
        }

        // 2. Find other movies these users liked
        const recommendations = await Rating.aggregate([
            { $match: { userId: { $in: userIds }, movieId: { $ne: movieId }, rating: { $gte: 4 } } },
            { $group: { _id: "$movieId", score: { $sum: 1 } } },
            { $sort: { score: -1 } },
            { $limit: 12 },
            {
                $lookup: {
                    from: "movies",
                    localField: "_id",
                    foreignField: "movieId",
                    as: "details"
                }
            },
            { $unwind: "$details" },
            {
                $project: {
                    _id: 0,
                    movieId: "$_id",
                    tmdbId: "$details.tmdbId",
                    title: "$details.title",
                    posterPath: "$details.posterPath",
                    backdropPath: "$details.backdropPath",
                    avgRating: "$details.voteAverage"
                }
            }
        ]);

        res.json(recommendations);
    } catch (error) {
        next(error);
    }
};

// @desc    Unified Search (Local + TMDB)
// @route   GET /api/recommendations/search
// @access  Public
const unifiedSearch = async (req, res, next) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    try {
        // 1. Local Text Search
        const localResults = await Movie.find(
            { $text: { $search: q } },
            { score: { $meta: "textScore" } }
        )
        .sort({ score: { $meta: "textScore" } })
        .limit(5);

        // 2. We could also hit TMDB here, but usually the frontend does that separately.
        // If the user wants a TRULY unified search on the backend:
        res.json(localResults);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTopRated,
    getPersonalizedRecs,
    getTopRatedByGenre,
    getPeopleAlsoLiked,
    unifiedSearch
};
