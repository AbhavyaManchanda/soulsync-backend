const express = require('express');
const journalController = require('../controllers/journalController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect); // Security lock

router.post('/', journalController.createJournalEntry);
router.get('/', journalController.getAllJournals);

module.exports = router;