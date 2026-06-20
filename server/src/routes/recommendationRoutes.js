const express = require('express');
const router = express.Router();
const { 
    getTopRated, 
    getPersonalizedRecs, 
    getTopRatedByGenre, 
    getPeopleAlsoLiked,
    unifiedSearch 
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/top-rated', getTopRated);
router.get('/genre/:genre', getTopRatedByGenre);
router.get('/personalized', protect, getPersonalizedRecs);
router.get('/similar/:movieId', getPeopleAlsoLiked);
router.get('/search', unifiedSearch);

module.exports = router;
