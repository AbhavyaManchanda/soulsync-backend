const Session = require('../models/sessionModel');
const geminiService = require('../services/geminiService');
const aiService = require('../services/aiService'); // For sentiment check
const AppError = require('../utils/appError');

exports.chat = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) return next(new AppError('Please provide a message', 400));

    let session;

    // 1. If sessionId exists, find the session. Otherwise, create a new one.
    if (sessionId) {
      session = await Session.findOne({ _id: sessionId, user: req.user.id, isActive: true });
      if (!session) return next(new AppError('Active session not found', 404));
    } else {
      // First time sentiment check for the session entry
      const sentiment = await aiService.analyzeText(message);
      session = await Session.create({
        user: req.user.id,
        initialSentiment: sentiment.label,
        messages: [] // Start empty, will push below
      });
    }

    // 2. Get history for Gemini (Gemini needs a specific format)
    const history = session.messages.map(m => ({
      role: m.role,
      text: m.text
    }));

    // 3. Get AI Response from Gemini (with memory of the history)
    const aiResponseText = await geminiService.getChatResponse(history, message);

    // 4. Update the Session in Database
    session.messages.push({ role: 'user', text: message });
    session.messages.push({ role: 'model', text: aiResponseText });
    
    // Optional: Quick crisis check on every message
    if (message.toLowerCase().includes('kill') || message.toLowerCase().includes('suicide')) {
        session.isCrisis = true;
    }

    await session.save();

    res.status(200).json({
      status: 'success',
      sessionId: session._id,
      aiResponse: aiResponseText,
      isCrisis: session.isCrisis
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllSessions = async (req, res, next) => {
  try {
    // Fetch sessions, but only the summary and date for the sidebar
    const sessions = await Session.find({ user: req.user.id })
      .sort('-createdAt')
      .select('summary createdAt isActive initialSentiment');

    res.status(200).json({
      status: 'success',
      results: sessions.length,
      data: { sessions }
    });
  } catch (err) {
    next(err);
  }
};

exports.getSessionDetails = async (req, res, next) => {
  try {
    // Fetch a specific session with ALL messages
    const session = await Session.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!session) return next(new AppError('No session found with that ID', 404));

    res.status(200).json({
      status: 'success',
      data: { session }
    });
  } catch (err) {
    next(err);
  }
};

exports.endSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) return next(new AppError('Session not found', 404));

    // Ask Gemini to summarize the messages array
    const fullConversation = session.messages.map(m => `${m.role}: ${m.text}`).join('\n');
    const summaryPrompt = `Provide a short, 3-bullet point clinical summary of this therapy session: \n${fullConversation}`;
    
    const summary = await geminiService.getChatResponse([], summaryPrompt);

    session.summary = summary;
    session.isActive = false;
    await session.save();

    res.status(200).json({
      status: 'success',
      data: { summary }
    });
  } catch (err) {
    next(err);
  }
};