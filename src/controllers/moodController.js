const MoodLog = require('../models/moodLogModel');
const aiService = require('../services/aiService'); // Groq powered

// 1. Naya Mood create karne ke liye
exports.createMoodLog = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    let aiData;
    try {
      // Groq ko call karo
      aiData = await aiService.analyzeText(content);
    } catch (apiErr) {
      console.error("Groq Fail, using fallback:", apiErr.message);
      // Fallback data agar Groq mar jaye
      aiData = { score: 0, label: 'Neutral', reply: "I've noted your mood. Stay strong!" };
    }

    // DB mein save
    const newLog = await MoodLog.create({
      user: req.user.id,
      content,
      sentimentScore: aiData.score || 0,
      emotionLabel: aiData.label || 'Neutral',
      isCrisis: (aiData.score || 0) <= -0.85,
      aiResponse: aiData.reply || "I'm here for you." // 👈 Kabhi khali nahi jayega
    });

    res.status(201).json({
      status: 'success',
      data: {
        log: newLog,
        suggestSession: !!newLog.isCrisis || (aiData?.score ?? 0) <= -0.5
      }
    });
  } catch (err) {
    // Agar yahan tak pahuncha toh ye pakka DB connectivity ya Auth issue hai
    next(err);
  }
};
// 2. Dashboard ke liye saare moods fetch karne ke liye (Ye wala miss ho gaya tha!)
exports.getAllMoods = async (req, res, next) => {
  try {
    // Sirf us user ke logs jo logged in hai
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