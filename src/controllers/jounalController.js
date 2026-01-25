const Journal = require('../models/journalModel');
const aiService = require('../services/aiService'); // Google Sentiment API
const AppError = require('../utils/appError');

exports.createJournalEntry = async (req, res, next) => {
  try {
    const { title, body } = req.body;

    if (!body) return next(new AppError('Journal body cannot be empty', 400));

    // 1. Analyze Sentiment of the long-form text
    const aiData = await aiService.analyzeText(body);

    // 2. Create the entry
    const newEntry = await Journal.create({
      user: req.user.id,
      title: title || 'Untitled Entry',
      body,
      sentimentScore: aiData.score,
      moodTag: aiData.label
    });

    res.status(201).json({
      status: 'success',
      data: { entry: newEntry }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllJournals = async (req, res, next) => {
  try {
    const journals = await Journal.find({ user: req.user.id }).sort('-createdAt');
    
    res.status(200).json({
      status: 'success',
      results: journals.length,
      data: { journals }
    });
  } catch (err) {
    next(err);
  }
};