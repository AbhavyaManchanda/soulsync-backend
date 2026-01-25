const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Session must belong to a user']
  },
  // This stores the actual dialogue exchange
  messages: [
    {
      role: { 
        type: String, 
        enum: ['user', 'model'], 
        required: true 
      },
      text: { 
        type: String, 
        required: true 
      },
      timestamp: { 
        type: Date, 
        default: Date.now 
      }
    }
  ],
  // The "Crux" - generated at the end of the session
  summary: {
    type: String,
    default: 'Session in progress...'
  },
  // Captured from the first message to categorize the session
  initialSentiment: {
    type: String
  },
  isCrisis: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;