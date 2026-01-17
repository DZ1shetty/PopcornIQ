# PopcornIQ

A full-stack Movie Recommendation engine using MongoDB Aggregation Pipelines and React.

## Setup Instructions

### 1. Data Preparation
1. Download the **MovieLens Latest Small** dataset (ml-latest-small.zip) from [GroupLens](https://grouplens.org/datasets/movielens/latest/).
2. Extract the zip file.
3. Create a folder named `data` in the root `PopcornIQ` directory.
4. Copy `movies.csv`, `ratings.csv`, `tags.csv`, and `links.csv` into `PopcornIQ/data`.

### 2. Backend Setup
```bash
cd server
npm install
# Create .env file with:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/moviedb
# JWT_SECRET=your_jwt_secret

# Run Data Import (After placing csv files)
npm run import-data

# Start Server
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Features
- **Authentication**: Secure Login/Register.
- **Top Rated**: Aggregation of highest rated movies (min 100 votes).
- **Personalized**: "Recommended For You" based on your favorite genres.
- **Search**: Full text search on titles.
- **Responsive UI**: Modern dark-themed design with Tailwind CSS.

## API Endpoints
- `GET /api/movies`
- `GET /api/movies/:id`
- `GET /api/recommendations/top-rated`
- `GET /api/recommendations/personalized` (Requires Auth)
- `GET /api/recommendations/genre/:genre`
