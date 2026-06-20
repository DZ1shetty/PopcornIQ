require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./db');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://image.tmdb.org", "https://dummyimage.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      }
    }
  })
);

// Strict CORS whitelisting
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true
}));

app.use(express.json());

// Custom NoSQL Injection Prevention Middleware (Express 5 compatible)
const sanitizeNoSQL = (req, res, next) => {
  const hasInjection = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    for (const key in obj) {
      if (key.startsWith('$') || key.includes('.')) {
        return true;
      }
      if (typeof obj[key] === 'object' && hasInjection(obj[key])) {
        return true;
      }
    }
    return false;
  };

  if (hasInjection(req.body) || hasInjection(req.query) || hasInjection(req.params)) {
    return res.status(400).json({ error: 'Prohibited characters detected in request parameters.' });
  }
  next();
};

app.use(sanitizeNoSQL);

// API Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200,
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15,
  message: { error: 'Too many login or registration attempts. Please try again in 15 minutes.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);

// Database Connection
connectDB();

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', server_time: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/tmdb', require('./routes/tmdbRoutes'));
app.use('/api/watchlist', require('./routes/watchlistRoutes'));
app.use('/api/match', require('./routes/matchRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.send('PopcornIQ API is running');
});


// Error Handler
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

// Start Server
let server;
if (require.main === module) {
  server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
  });

  // Graceful Shutdown Handler
  const gracefulShutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    if (server) {
      server.close(() => {
        console.log('HTTP server closed.');
        mongoose.connection.close(false)
          .then(() => {
            console.log('MongoDB connection closed.');
            process.exit(0);
          })
          .catch(err => {
            console.error('Error closing MongoDB connection:', err);
            process.exit(1);
          });
      });
    } else {
      process.exit(0);
    }

    // Force exit after timeout
    setTimeout(() => {
      console.error('Forceful shutdown triggered after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;
