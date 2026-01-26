const mongoose = require('mongoose');

const WatchlistItemSchema = new mongoose.Schema({
    movieId: { type: Number, required: true },
    title: { type: String },
    posterPath: { type: String },
    voteAverage: { type: Number },
    addedAt: { type: Date, default: Date.now }
}, { _id: false });

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    preferences: {
        favoriteGenres: [String],
        watchlist: [Number], // movieIds for quick lookups
        watchlistData: [WatchlistItemSchema] // Rich movie data
    },
    googleId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
