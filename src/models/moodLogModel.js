const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
    user: {
        // Reference to the User model
        // Each mood log is associated with a specific user
        // we get objectId from MongoDB to reference the user
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Mood log must belong to a user.']
  },
  content: {
    type: String,
    required: [true, 'Journal entry cannot be empty.'],
    trim: true
  },
  sentimentScore: {
    type: Number, // Value between -1 and 1
    default: 0
  },
  emotionLabel: {
    type: String, // e.g., "Anxious", "Neutral", "Happy"
    default: 'Neutral'
  },
  isCrisis: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  aiResponse: {
  type: String,
  required: true
}
});


const MoodLog = mongoose.model('MoodLog', moodLogSchema);
module.exports = MoodLog;