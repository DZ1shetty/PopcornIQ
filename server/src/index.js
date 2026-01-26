require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./db');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/tmdb', require('./routes/tmdbRoutes'));
app.use('/api/watchlist', require('./routes/watchlistRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.send('PopcornIQ API is running');
});

// Error Handler
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

// Start Server
if (require.main === module) {
  const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
  });
}

module.exports = app;
