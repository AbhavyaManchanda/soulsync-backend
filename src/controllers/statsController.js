const MoodLog = require('../models/moodLogModel');
const Session = require('../models/sessionModel');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Get total mood entries and average sentiment score
    const moodStats = await MoodLog.aggregate([
      { $match: { user: req.user._id } },
      { 
        $group: { 
          _id: null, 
          avgScore: { $avg: "$sentimentScore" },
          totalEntries: { $sum: 1 }
        } 
      }
    ]);

    // 2. Count total therapy sessions and crisis alerts
    const sessionCount = await Session.countDocuments({ user: userId });
    const crisisCount = await MoodLog.countDocuments({ user: userId, isCrisis: true });

    // 3. Get the "Recent Vibe" (Latest 5 mood labels)
    const recentMoods = await MoodLog.find({ user: userId })
      .sort('-createdAt')
      .limit(5)
      .select('emotionLabel createdAt');

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          averageMood: moodStats[0]?.avgScore || 0,
          totalCheckIns: moodStats[0]?.totalEntries || 0,
          totalSessions: sessionCount,
          crisisAlertsTriggered: crisisCount
        },
        recentHistory: recentMoods
      }
    });
  } catch (err) {
    next(err);
  }
};