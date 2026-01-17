const express = require('express');
const router = express.Router();
const { getMovies, getMovieById } = require('../controllers/movieController');

router.route('/').get(getMovies);
router.route('/:id').get(getMovieById);

module.exports = router;
