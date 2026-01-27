const express = require('express');
const moodController = require('../controllers/moodController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Sabhi routes jo iske niche hain wo protect ho jayenge
router.use(authMiddleware.protect); 

router.get('/', moodController.getAllMoods);
router.post('/', moodController.createMoodLog);

// router.get('/', moodController.getAllMoods); // Baad mein add karenge

module.exports = router;