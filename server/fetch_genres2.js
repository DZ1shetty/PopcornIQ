const axios = require('axios');
const API_KEY = 'TMDB_API_KEY_PLACEHOLDER';

async function run() {
  try {
    const genresRes = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`);
    const mapping = {};
    for (const g of genresRes.data.genres) {
      const page = await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${g.id}&sort_by=popularity.desc`);
      const movie = page.data.results.find(m => m.backdrop_path);
      if (movie) {
        mapping[g.name] = `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`;
      }
    }
    console.log(JSON.stringify(mapping, null, 4));
  } catch(e) {
    console.error(e.message);
  }
}
run();
