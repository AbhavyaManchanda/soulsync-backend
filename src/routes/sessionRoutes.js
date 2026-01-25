// serverside/src/routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

// 1. Sabhi routes ke liye common protection
router.use(protect);

// 2. Chat and History Routes
router.post('/chat', sessionController.chatWithAI);
router.get('/my-sessions', sessionController.getUserSessions);

// 3. Specific Session Detail (Must be at the bottom)
router.get('/:id', sessionController.getSingleSession);

module.exports = router;