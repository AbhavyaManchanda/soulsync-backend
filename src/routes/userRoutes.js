const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Define the route and link it to the controller function
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;