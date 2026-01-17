const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    movieId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    genres: { type: String }, // Original string from CSV
    genresArray: [String],    // Parsed array
    tmdbId: { type: Number },
    imdbId: { type: String },
    posterPath: { type: String },
    overview: { type: String },
    voteAverage: { type: Number },
    voteCount: { type: Number },
    releaseDate: { type: Date },
    cast: [{
        name: String,
        character: String,
        profilePath: String
    }],
    similarMovies: { type: Map, of: Number } // For ML recommendations
});

MovieSchema.index({ title: 'text', genres: 'text' });
MovieSchema.index({ movieId: 1 });

module.exports = mongoose.model('Movie', MovieSchema);
