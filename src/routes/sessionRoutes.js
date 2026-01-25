const express = require('express');
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect); // Security gate

router.post('/chat', sessionController.chat);
router.patch('/end/:id', sessionController.endSession);

router.get('/', sessionController.getAllSessions); // Sidebar: Get all sessions
router.get('/:id', sessionController.getSessionDetails); // Main Window: Get specific chat session details

module.exports = router;