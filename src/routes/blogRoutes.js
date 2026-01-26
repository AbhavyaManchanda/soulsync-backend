const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

router.get('/', blogController.getMentalHealthBlogs); // Dashboard se isi route par request jayegi

module.exports = router;