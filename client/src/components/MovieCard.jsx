import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
    return (
        <Link to={`/movie/${movie.movieId}`} className="block group">
            <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-surface">
                {movie.posterPath ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                        alt={movie.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                        No Poster
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4">
                    <span className="text-white font-bold">{movie.title}</span>
                    <span className="text-sm text-gray-300">{movie.genresArray ? movie.genresArray.slice(0, 2).join(', ') : 'Movie'}</span>
                    <div className="flex items-center space-x-1 text-yellow-500 mt-1">
                        <span>★</span>
                        <span>{movie.avgRating ? movie.avgRating.toFixed(1) : (movie.voteAverage || 'N/A')}</span>
                    </div>
                </div>
            </div>
            <div className="mt-2">
                <h3 className="text-white font-medium truncate group-hover:text-primary transition">{movie.title}</h3>
                <p className="text-xs text-gray-400">{new Date(movie.releaseDate || '2000-01-01').getFullYear()}</p>
            </div>
        </Link>
    );
};

export default MovieCard;
