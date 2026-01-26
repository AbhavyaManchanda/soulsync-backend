const express = require('express');
const router = express.Router();
const dietController = require('../controllers/dietController');

router.post('/suggest', dietController.getDietSuggestion);

module.exports = router;