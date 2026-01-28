// src/routes/statsRoutes.js
const express = require('express');
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware.protect, statsController.getDashboardStats);

module.exports = router;