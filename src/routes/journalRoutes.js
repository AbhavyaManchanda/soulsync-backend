const express = require('express');
const journalController = require('../controllers/journalController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect); // Security lock

router.post('/', journalController.createJournal);
router.get('/stats', journalController.getJournalStats);
router.get('/', journalController.getAllJournals);
router.delete('/:id', authMiddleware.protect, journalController.deleteJournal); //

module.exports = router;