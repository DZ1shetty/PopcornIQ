const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    movieId: { type: Number, required: true },
    tag: { type: String, required: true },
    timestamp: { type: Number }
});

TagSchema.index({ movieId: 1 });
TagSchema.index({ tag: 'text' });

module.exports = mongoose.model('Tag', TagSchema);
