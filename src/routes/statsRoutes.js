// src/routes/statsRoutes.js
const express = require('express');
const moodController = require('../controllers/moodController'); // Ya statsController agar alag banaya hai
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware.protect, moodController.getAllMoods); // Ensure this matches your controller function

module.exports = router;