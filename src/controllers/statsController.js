const mongoose = require('mongoose');
const MoodLog = require('../models/moodLogModel');
const Session = require('../models/sessionModel');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid user' });
    }

    // 1. Get total mood entries and average sentiment score
    const moodStats = await MoodLog.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$sentimentScore' },
          totalEntries: { $sum: 1 }
        }
      }
    ]);

    // 2. Count total therapy sessions and crisis alerts
    const sessionCount = await Session.countDocuments({ user: userId });
    const crisisCount = await MoodLog.countDocuments({ user: userId, isCrisis: true });

    // 3. Latest 7 moods with sentimentScore + createdAt for chart & recent vibe
    const recentMoods = await MoodLog.find({ user: userId })
      .sort('-createdAt')
      .limit(7)
      .select('emotionLabel createdAt sentimentScore')
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          averageMood: moodStats[0]?.avgScore ?? 0,
          totalCheckIns: moodStats[0]?.totalEntries ?? 0,
          totalSessions: sessionCount,
          crisisAlertsTriggered: crisisCount
        },
        moods: recentMoods
      }
    });
  } catch (err) {
    next(err);
  }
};