const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
    movieId: { type: Number, required: true, unique: true },
    imdbId: { type: String },
    tmdbId: { type: Number }
});

module.exports = mongoose.model('Link', LinkSchema);
