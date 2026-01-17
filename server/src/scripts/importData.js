const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const csv = require('csv-parser');
const Movie = require('../models/Movie');
const Rating = require('../models/Rating');
const Tag = require('../models/Tag');
const Link = require('../models/Link');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const DATA_DIR = path.join(__dirname, '../../../data');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const importMovies = () => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(path.join(DATA_DIR, 'movies.csv'))
            .pipe(csv())
            .on('data', (data) => {
                results.push({
                    movieId: parseInt(data.movieId),
                    title: data.title,
                    genres: data.genres,
                    genresArray: data.genres ? data.genres.split('|') : []
                });
            })
            .on('end', async () => {
                try {
                    // Use insertMany with unordered: false (default) or ordered: false to continue?
                    // We'll clean first or just insert.
                    await Movie.insertMany(results);
                    console.log('Movies imported successfully');
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
            .on('error', reject);
    });
};

const importRatings = () => {
    return new Promise((resolve, reject) => {
        const results = [];
        const BATCH_SIZE = 10000;

        fs.createReadStream(path.join(DATA_DIR, 'ratings.csv'))
            .pipe(csv())
            .on('data', (data) => {
                results.push({
                    userId: parseInt(data.userId),
                    movieId: parseInt(data.movieId),
                    rating: parseFloat(data.rating),
                    timestamp: parseInt(data.timestamp)
                });
            })
            .on('end', async () => {
                try {
                    console.log(`Starting Ratings import. Total: ${results.length}`);
                    for (let i = 0; i < results.length; i += BATCH_SIZE) {
                        await Rating.insertMany(results.slice(i, i + BATCH_SIZE));
                        console.log(`Imported ratings batch ${i / BATCH_SIZE + 1}`);
                    }
                    console.log('Ratings imported successfully');
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
            .on('error', reject);
    });
};

const importTags = () => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(path.join(DATA_DIR, 'tags.csv'))
            .pipe(csv())
            .on('data', (data) => {
                results.push({
                    userId: parseInt(data.userId),
                    movieId: parseInt(data.movieId),
                    tag: data.tag,
                    timestamp: parseInt(data.timestamp)
                });
            })
            .on('end', async () => {
                try {
                    await Tag.insertMany(results);
                    console.log('Tags imported successfully');
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
            .on('error', reject);
    });
};

const importLinks = () => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(path.join(DATA_DIR, 'links.csv'))
            .pipe(csv())
            .on('data', (data) => {
                results.push({
                    movieId: parseInt(data.movieId),
                    imdbId: data.imdbId,
                    tmdbId: data.tmdbId ? parseInt(data.tmdbId) : null
                });
            })
            .on('end', async () => {
                try {
                    await Link.insertMany(results);
                    console.log('Links imported successfully');
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
            .on('error', reject);
    });
}

const run = async () => {
    await connectDB();

    try {
        // Optional: Clear existing data
        // await Movie.deleteMany({});
        // await Rating.deleteMany({});
        // await Tag.deleteMany({});
        // await Link.deleteMany({});

        await importMovies();
        await importLinks();
        await importTags();
        await importRatings();

        console.log('All data imported!');
        process.exit();
    } catch (error) {
        console.error('Import Error:', error);
        process.exit(1);
    }
};

run();
