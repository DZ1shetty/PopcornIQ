const mongoose = require('mongoose');
const axios = require('axios');
const Movie = require('../models/Movie');
const Link = require('../models/Link');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const TMDB_API_KEY = process.env.TMDB_API_KEY; // User needs to set this

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const fetchMetadata = async () => {
    if (!TMDB_API_KEY) {
        console.error("TMDB_API_KEY is missing in .env");
        process.exit(1);
    }

    const links = await Link.find({ tmdbId: { $ne: null } });
    console.log(`Found ${links.length} links to process.`);

    let count = 0;
    for (const link of links) {
        try {
            // Check if movie already has poster (optional optimization)
            const movie = await Movie.findOne({ movieId: link.movieId });
            if (!movie) continue;
            if (movie.posterPath) continue; // Skip if already populated

            const res = await axios.get(`https://api.themoviedb.org/3/movie/${link.tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
            const data = res.data;

            movie.tmdbId = link.tmdbId; // Ensure it's set
            movie.imdbId = link.imdbId;
            movie.posterPath = data.poster_path;
            movie.overview = data.overview;
            movie.voteAverage = data.vote_average;
            movie.voteCount = data.vote_count;
            movie.releaseDate = data.release_date;

            if (data.credits && data.credits.cast) {
                movie.cast = data.credits.cast.slice(0, 5).map(c => ({
                    name: c.name,
                    character: c.character,
                    profilePath: c.profile_path
                }));
            }

            await movie.save();
            count++;
            if (count % 100 === 0) console.log(`Updated ${count} movies...`);

            // Rate limiting
            await new Promise(r => setTimeout(r, 250)); // 4 requests per second approx

        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`TMDB ID ${link.tmdbId} not found.`);
            } else {
                console.error(`Error fetching for movieId ${link.movieId}:`, error.message);
            }
        }
    }
    console.log("Metadata fetch complete.");
    process.exit();
};

const run = async () => {
    await connectDB();
    await fetchMetadata();
};

run();
