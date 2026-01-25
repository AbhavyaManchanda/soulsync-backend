const MoodLog = require('../models/moodLogModel');
const aiService = require('../services/aiService');// Sentiment API
const geminiService = require('../services/geminiService'); // Generative API

exports.createMoodLog = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    // 1. Snapshot Analysis (Google Natural Language API)
    const aiData = await aiService.analyzeText(content);
    
    // 2. Distressed Check logic
    const isDistressed = aiData.score <= -0.5;
    const isCrisis = aiData.score <= -0.85;

    // 3. OPTIONAL: Get a quick supportive line from Gemini
    // Agar Gemini se turant reply chahiye toh:
    const quickSupport = await geminiService.generateQuickReply(content);

    // 4. Save the log
    const newLog = await MoodLog.create({
      user: req.user.id,
      content,
      sentimentScore: aiData.score,
      emotionLabel: aiData.label,
      isCrisis,
      aiResponse: quickSupport || "I've noted your mood. I'm here if you want to talk." 
    });

    res.status(201).json({
      status: 'success',
      data: {
        log: newLog,
        suggestSession: isDistressed,
        message: isDistressed 
          ? "It sounds like you're having a tough time. Would you like to have a therapy session now?" 
          : "Thanks for checking in! Keep going."
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