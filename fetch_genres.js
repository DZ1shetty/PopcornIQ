const http = require('http');

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function run() {
  const genresRes = await fetchJson('http://localhost:5000/api/tmdb/genres');
  if (!genresRes.genres) {
    console.error('No genres found');
    return;
  }
  
  const mapping = {};
  for (const g of genresRes.genres) {
    try {
      const page = await fetchJson(`http://localhost:5000/api/tmdb/discover?with_genres=${g.id}&sort_by=popularity.desc`);
      if (page && page.results && page.results.length > 0) {
        // Find first movie with backdrop
        const movie = page.results.find(m => m.backdrop_path) || page.results[0];
        if (movie && movie.backdrop_path) {
          mapping[g.name] = `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`;
        }
      }
    } catch (e) {
      console.error('Failed for genre', g.name, e.message);
    }
  }
  
  console.log(JSON.stringify(mapping, null, 4));
}
run();
