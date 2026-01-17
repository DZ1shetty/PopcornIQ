import { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { Search } from 'lucide-react';

const Home = () => {
    const { user } = useAuth();
    const [movies, setMovies] = useState([]); // General/Search results
    const [topRated, setTopRated] = useState([]);
    const [personalized, setPersonalized] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true);
                // Fetch Top Rated
                const topRes = await axios.get('http://localhost:5000/api/recommendations/top-rated');
                setTopRated(topRes.data);

                // Fetch Personalized if user is logged in
                if (user) {
                    const token = localStorage.getItem('token');
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const persRes = await axios.get('http://localhost:5000/api/recommendations/personalized', config);
                    setPersonalized(persRes.data);
                }

                // Initial fetch of "all movies" (or popularly viewed)
                const allRes = await axios.get('http://localhost:5000/api/movies?page=1');
                setMovies(allRes.data.movies);

            } catch (error) {
                console.error("Error fetching home data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, [user]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!search.trim()) return;
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/api/movies?keyword=${search}`);
            setMovies(res.data.movies);
        } catch (error) {
            console.error("Search error", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12">
            {/* Hero / Search Section */}
            <section className="relative py-20 text-center space-y-6">
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Discover Your Next Favorite.
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Explore thousands of movies and TV shows with personalized recommendations powered by AI.
                </p>
                <form onSubmit={handleSearch} className="max-w-md mx-auto relative group">
                    <input
                        type="text"
                        placeholder="Search for movies, genres, or cast..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface border border-gray-700 rounded-full px-6 py-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                    <Search className="absolute left-4 top-3.5 text-gray-500 w-5 h-5 group-focus-within:text-primary transition" />
                </form>
            </section>

            {/* Personalized Section */}
            {user && personalized.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-6 border-l-4 border-secondary pl-3">Recommended For You</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {personalized.map(movie => (
                            <MovieCard key={movie.movieId} movie={movie} />
                        ))}
                    </div>
                </section>
            )}

            {/* Top Rated Section */}
            {topRated.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-6 border-l-4 border-accent pl-3">Top Rated Classics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {topRated.map(movie => (
                            <MovieCard key={movie.movieId} movie={movie} />
                        ))}
                    </div>
                </section>
            )}

            {/* Browse / Search Results Section */}
            <section>
                <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-3">
                    {search ? 'Search Results' : 'Trending Now'}
                </h2>
                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {movies.map(movie => (
                            <MovieCard key={movie._id} movie={movie} />
                        ))}
                    </div>
                )}
                {!loading && movies.length === 0 && <div className="text-center text-gray-400">No movies found.</div>}
            </section>

        </div>
    );
};

export default Home;
