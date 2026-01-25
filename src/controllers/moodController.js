const MoodLog = require('../models/moodLogModel');
const aiService = require('../services/aiService');// Sentiment API
const geminiService = require('../services/geminiService'); // Generative API

exports.createMoodLog = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    // 1. Analyze sentiment (The Snapshot)
    const aiData = await aiService.analyzeText(content);
    
    // 2. Determine if the user is distressed
    const isDistressed = aiData.score <= -0.5;
    const isCrisis = aiData.score <= -0.85; // Your high-risk threshold

    // 3. Save the log separately (Mood Log)
    const newLog = await MoodLog.create({
      user: req.user.id,
      content,
      sentimentScore: aiData.score,
      emotionLabel: aiData.label,
      isCrisis
    });

    // 4. Send back the response with a suggestion if needed
    res.status(201).json({
      status: 'success',
      data: {
        log: newLog,
        suggestSession: isDistressed, // Frontend will use this to show a "Talk to SoulSync" button
        message: isDistressed 
          ? "It sounds like you're having a tough time. Would you like to have a therapy session now?" 
          : "Thanks for checking in!"
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllMoods = async (req, res, next) => {
  try {
    // Sirf us user ke logs find karo jo logged in hai (req.user.id humein protect middleware se mila)
    const moods = await MoodLog.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: moods.length,
      data: {
        moods
      }
    });
  } catch (err) {
    next(err);
  }
};