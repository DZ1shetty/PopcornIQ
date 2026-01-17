import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import MovieCard from '../components/MovieCard';

const MovieDetails = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [genreRecs, setGenreRecs] = useState([]);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:5000/api/movies/${id}`);
                setMovie(res.data);

                // Fetch similar by genre if main genre exists
                if (res.data.genresArray && res.data.genresArray.length > 0) {
                    const genre = res.data.genresArray[0];
                    const recRes = await axios.get(`http://localhost:5000/api/recommendations/genre/${genre}`);
                    setGenreRecs(recRes.data.filter(m => m.movieId !== res.data.movieId));
                }
            } catch (error) {
                console.error("Error fetching detail", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovie();
    }, [id]);

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!movie) return <div className="text-center py-20">Movie not found</div>;

    return (
        <div className="space-y-12 animate-fade-in-up">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3 max-w-sm mx-auto">
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                        alt={movie.title}
                        className="rounded-xl shadow-2xl w-full h-auto"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster'; }}
                    />
                </div>
                <div className="w-full md:w-2/3 space-y-6">
                    <h1 className="text-4xl font-bold">{movie.title}</h1>

                    <div className="flex flex-wrap gap-2">
                        {movie.genresArray?.map(g => (
                            <span key={g} className="bg-surface border border-gray-600 px-3 py-1 rounded-full text-sm text-gray-300">
                                {g}
                            </span>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-y border-gray-700 py-4">
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-yellow-500">{movie.voteAverage || movie.avgRating || 'N/A'}</span>
                            <span className="text-xs text-gray-400">Rating</span>
                        </div>
                        <div className="text-center border-l border-gray-700">
                            <span className="block text-2xl font-bold">{movie.voteCount}</span>
                            <span className="text-xs text-gray-400">Votes</span>
                        </div>
                        <div className="text-center border-l border-gray-700">
                            <span className="block text-2xl font-bold">{new Date(movie.releaseDate || '2000').getFullYear()}</span>
                            <span className="text-xs text-gray-400">Year</span>
                        </div>
                    </div>

                    <p className="text-gray-300 leading-relaxed text-lg">
                        {movie.overview || 'No overview available for this movie.'}
                    </p>

                    {/* Cast Placeholders if we had them */}
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg">Cast</h3>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {movie.cast && movie.cast.length > 0 ? movie.cast.map(c => (
                                <div key={c.name} className="flex-shrink-0 w-24 text-center">
                                    <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-2 overflow-hidden">
                                        {/* Avatar */}
                                    </div>
                                    <p className="text-xs truncate">{c.name}</p>
                                </div>
                            )) : <span className="text-gray-500 text-sm">No cast info.</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Movies */}
            {genreRecs.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-6">Similar Movies</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {genreRecs.map(m => (
                            <MovieCard key={m.movieId} movie={m} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default MovieDetails;
