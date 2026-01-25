const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  title: { type: String, default: "Untitled Entry" },
  body: { type: String, required: true },
  sentimentScore: Number, // Post-writing analysis
  moodTag: String, // e.g., "Grateful", "Productive"
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Journal', journalSchema);