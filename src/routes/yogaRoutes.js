const express = require('express');
const router = express.Router();
const yogaController = require('../controllers/yogaController');

// Mood-based yoga suggestion endpoint
router.post('/suggest', yogaController.getYogaSuggestion);

module.exports = router;