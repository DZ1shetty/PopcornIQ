const express = require('express');
const router = express.Router();
const { getTopRated, getPersonalizedRecs, getTopRatedByGenre } = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/top-rated', getTopRated);
router.get('/genre/:genre', getTopRatedByGenre);
router.get('/personalized', protect, getPersonalizedRecs);

module.exports = router;
