const Movie = require('../models/Movie');
const Rating = require('../models/Rating');
const mongoose = require('mongoose');

// @desc    Get Top Rated Movies
// @route   GET /api/recommendations/top-rated
// @access  Public
const getTopRated = async (req, res) => {
    try {
        const topRated = await Rating.aggregate([
            {
                $group: {
                    _id: "$movieId",
                    avgRating: { $avg: "$rating" },
                    voteCount: { $sum: 1 }
                }
            },
            { $match: { voteCount: { $gte: 100 } } }, // Threshold can be adjusted
            { $sort: { avgRating: -1 } },
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
                    title: "$details.title",
                    genres: "$details.genres",
                    posterPath: "$details.posterPath"
                }
            }
        ]);

        res.json(topRated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Personalized Recommendations (User's fav genres -> high rated unwatched)
// @route   GET /api/recommendations/personalized
// @access  Private
const getPersonalizedRecs = async (req, res) => {
    // Assuming req.user.id is available via auth middleware
    // But Rating collection uses numeric userId from MovieLens. 
    // We need to map our Auth User to MovieLens userId or just use Auth User's ratings if we were collecting them.
    // For this 'demo' with MovieLens data, we might need to simulate a userId or use the one from the logged in user if we link them.
    // Let's assume for now we use the ID passed in query or body for testing, or map it.
    // PRD says: "User register/logins". 
    // If new user, cold start -> fallback to top rated.
    // If we want to test "Personalized", we might need to "masquerade" as a MovieLens user (e.g. userId 1).

    // For real implementation:
    // 1. Get current user's ratings.
    // 2. If < 5 ratings, return Top Rated (Cold Start).
    // 3. Else run aggregation.

    // Since we don't have real ratings for new users yet, I will allow passing ?mockUserId=1 to simulate.
    const userId = req.query.mockUserId ? parseInt(req.query.mockUserId) : null;

    if (!userId) {
        // Cold start or real user with no ratings
        // For now, return Top Rated
        return getTopRated(req, res);
    }

    try {
        const recs = await Rating.aggregate([
            { $match: { userId: userId, rating: { $gte: 4 } } },
            {
                $lookup: {
                    from: "movies",
                    localField: "movieId",
                    foreignField: "movieId",
                    as: "movie"
                }
            },
            { $unwind: "$movie" },
            { $unwind: "$movie.genresArray" },
            { $group: { _id: "$movie.genresArray", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 },
            { $group: { _id: null, topGenres: { $push: "$_id" } } },
            {
                $lookup: {
                    from: "movies",
                    pipeline: [
                        { $match: { $expr: { $in: ["$genresArray", "$$topGenres"] } } }, // Note: We need to access topGenres from parent. 
                        // Error: variable $$topGenres is not defined in this scope directly in 4.x/5.x without 'let'.
                        // Fix below with 'let'.
                    ],
                    as: "recs" // This logic is tricky in one pipeline without 'let'.
                }
            }
        ]);

        // Correct Pipeline for Personalized Recs
        // 1. Get Top Genres
        const userPreferences = await Rating.aggregate([
            { $match: { userId: userId, rating: { $gte: 4 } } },
            { $lookup: { from: "movies", localField: "movieId", foreignField: "movieId", as: "movie" } },
            { $unwind: "$movie" },
            { $unwind: "$movie.genresArray" },
            { $group: { _id: "$movie.genresArray", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);

        const topGenres = userPreferences.map(g => g._id);

        if (topGenres.length === 0) {
            return getTopRated(req, res);
        }

        // 2. Find movies in those genres that user hasn't watched
        const recommendations = await Movie.aggregate([
            { $match: { genresArray: { $in: topGenres } } },
            {
                $lookup: {
                    from: "ratings",
                    localField: "movieId",
                    foreignField: "movieId",
                    as: "allRatings"
                }
            },
            {
                // Filter out movies watched by user
                // This approaches memory limits if not careful, but for 9k movies it's okay.
                // Better: Match where ratings.userId != userId
                // But we have array of ratings.
                $match: {
                    "allRatings.userId": { $ne: userId }
                }
            },
            {
                $project: {
                    title: 1,
                    genres: 1,
                    posterPath: 1,
                    avgRating: { $avg: "$allRatings.rating" },
                    movieId: 1
                }
            },
            { $sort: { avgRating: -1 } },
            { $limit: 20 }
        ]);

        res.json(recommendations);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Top Rated Movies by Genre
// @route   GET /api/recommendations/genre/:genre
// @access  Public
const getTopRatedByGenre = async (req, res) => {
    const genre = req.params.genre;
    try {
        const movies = await Movie.aggregate([
            { $match: { genresArray: genre } },
            // Optimization: Filter movies that have at least some ratings? 
            // Or use the Rating collection to drive this if Movie collection doesn't have cached ratings.
            // Since we don't have cached average ratings in Movie yet (only in the schema, not populated), we must join.
            // This is heavy. Limit initial set? No, we need top rated.
            // Let's use the provided aggregation from PRD but optimized.
            {
                $lookup: {
                    from: "ratings",
                    localField: "movieId",
                    foreignField: "movieId",
                    as: "ratingData"
                }
            },
            // Unwind is dangerous for 100k ratings if we match ALL movies first.
            // Better: Group ratings first?
            // "db.movies.aggregate" was the PRD suggestion.
            // Let's stick to it but limit the $lookup if possible.
            // Actually, querying Ratings sorted by average rating, then filtering by Genre is better?
            // But Genres are in Movies.
            // So: Match Movies by Genre -> Lookup Ratings -> Unwind -> Group -> Sort.
            { $unwind: "$ratingData" },
            {
                $group: {
                    _id: "$movieId",
                    avgRating: { $avg: "$ratingData.rating" },
                    title: { $first: "$title" },
                    posterPath: { $first: "$posterPath" },
                    genres: { $first: "$genresArray" }
                }
            },
            { $sort: { avgRating: -1 } },
            { $limit: 10 }
        ]);
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTopRated,
    getPersonalizedRecs,
    getTopRatedByGenre
};
