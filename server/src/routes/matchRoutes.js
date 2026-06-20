const express = require('express');
const router = express.Router();
const { getSwipeDeck, handleSwipe } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/deck', protect, getSwipeDeck);
router.post('/swipe', protect, handleSwipe);

module.exports = router;
