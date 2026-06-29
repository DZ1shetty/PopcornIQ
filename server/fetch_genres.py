import urllib.request
import json
import time

import os

API_KEY = os.environ.get('TMDB_API_KEY')
base = 'https://api.themoviedb.org/3'

def get_json(url):
    for i in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as res:
                return json.loads(res.read().decode('utf-8'))
        except Exception as e:
            time.sleep(1)
    return {}

data = get_json(f'{base}/genre/movie/list?api_key={API_KEY}')
mapping = {}
for g in data.get('genres', []):
    page = get_json(f'{base}/discover/movie?api_key={API_KEY}&with_genres={g["id"]}&sort_by=popularity.desc')
    for m in page.get('results', []):
        if m.get('backdrop_path'):
            mapping[g['name']] = f'https://image.tmdb.org/t/p/w780{m["backdrop_path"]}'
            break

print(json.dumps(mapping, indent=4))
