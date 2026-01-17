const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    userId: { type: Number, required: true }, // User ID from MovieLens dataset (Numbers)
    movieId: { type: Number, required: true },
    rating: { type: Number, required: true },
    timestamp: { type: Number }
});

RatingSchema.index({ userId: 1, movieId: 1 }, { unique: true });
RatingSchema.index({ movieId: 1 });

module.exports = mongoose.model('Rating', RatingSchema);
