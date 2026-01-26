const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    default: 'Untitled Entry' 
  }, // Gemini se aayega
  content: { 
    type: String, 
    required: true 
  }, // Aapki diary entry
  moodEmoji: { 
    type: String, 
    default: '📝' 
  }, // Gemini analyze karega
  sentimentScore: { 
    type: Number, 
    default: 0 
  }, // -1 (Sad) to 1 (Happy)
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Journal', journalSchema);