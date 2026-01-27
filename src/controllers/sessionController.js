const Session = require('../models/sessionModel');
const geminiService = require('../services/geminiService');
const aiService = require('../services/aiService'); // For sentiment check
const AppError = require('../utils/appError');


// src/controllers/sessionController.js
// serverside/src/controllers/sessionController.js

// exports.chatWithAI = async (req, res, next) => {
//   try {
//     const { message, sessionId } = req.body;
//     const userId = req.user.id;

//     let chatHistory = [];
//     let session;

//     if (sessionId && sessionId !== 'null') {
//       session = await Session.findById(sessionId);
//       chatHistory = session ? session.messages : [];
//     }

//     // AI Call with Safety Catch
//     let aiReply;
//     try {
//       aiReply = await geminiService.getChatResponse(chatHistory, message);
//     } catch (aiErr) {
//       console.error("AI Error caught:", aiErr.message);
//       // Agar Quota limit hai (429), toh fallback message bhejien
//       aiReply = "I'm processing many thoughts right now. Can we continue in a minute?";
//     }

//     // Session update logic (Always runs even if AI fails)
//     if (session) {
//       session.messages.push({ role: 'user', text: message });
//       session.messages.push({ role: 'model', text: aiReply });
//       await session.save();
//     } else {
//       session = await Session.create({
//         user: userId,
//         messages: [
//           { role: 'user', text: message },
//           { role: 'model', text: aiReply }
//         ]
//       });
//     }

//     res.status(200).json({
//       status: 'success',
//       aiResponse: aiReply,
//       sessionId: session._id
//     });
//   } catch (err) {
//     console.error("CRITICAL CONTROLLER ERROR:", err);
//     res.status(500).json({ status: 'error', message: "Internal Server Error" });
//   }
// };


const axios = require('axios');

 



// src/controllers/sessionController.js
exports.chatWithAI = async (req, res) => {
  try {

    console.log("Current User from Token:", req.user);
    const { message, sessionId } = req.body;
    let session;

    // 1. Session Find ya Create karein
    if (sessionId) {
      session = await Session.findById(sessionId);
    } 
    
    // Agar session nahi mila ya naya banana hai
    if (!session) {
      // Pehle message se ek chota 3-4 words ka title generate karein
      const titleResponse = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            { 
              role: "system", 
              content: "Generate a very short 3-4 word title based on the user's first message. No quotes, no period." 
            },
            { role: "user", content: message }
          ]
        },
        {
          headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
        }
      );

      const generatedTitle = titleResponse.data.choices[0].message.content;

      session = await Session.create({ 
        user: req.user.id, 
        title: generatedTitle, // 👈 Model mein save ho raha hai
        messages: [] 
      });
    }

    const history = session.messages.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.text
    }));

    // ... Groq API Call Logic (Jo humne pehle likha tha) ...
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: "You are SoulSync AI, an empathetic and professional therapist. Provide supportive, non-judgmental advice. Keep responses concise but warm." 
          },
          ...history,
          { role: "user", content: message }
        ],
        temperature: 0.7, // Creativity level for empathy
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiReply = response.data.choices[0].message.content;

    // 2. Messages save karne se pehle userId check karein
    session.messages.push({ role: 'user', text: message });
    session.messages.push({ role: 'model', text: aiReply });
    
    await session.save(); // Ab yeh validation fail nahi karega

    res.status(200).json({
      status: 'success',
      aiResponse: aiReply,
      sessionId: session._id
    });

  } catch (error) {
    console.error("Groq Chat Error:", error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// exports.chat = async (req, res, next) => {
//   try {
//     const { message, sessionId } = req.body;

//     if (!message) return next(new AppError('Please provide a message', 400));

//     let session;

//     // 1. If sessionId exists, find the session. Otherwise, create a new one.
//     if (sessionId) {
//       session = await Session.findOne({ _id: sessionId, user: req.user.id, isActive: true });
//       if (!session) return next(new AppError('Active session not found', 404));
//     } else {
//       // First time sentiment check for the session entry
//       const sentiment = await aiService.analyzeText(message);
//       session = await Session.create({
//         user: req.user.id,
//         initialSentiment: sentiment.label,
//         messages: [] // Start empty, will push below
//       });
//     }

//     // 2. Get history for Gemini (Gemini needs a specific format)
//     const history = session.messages.map(m => ({
//       role: m.role,
//       text: m.text
//     }));

//     // 3. Get AI Response from Gemini (with memory of the history)
//     const aiResponseText = await geminiService.getChatResponse(history, message);

//     // 4. Update the Session in Database
//     session.messages.push({ role: 'user', text: message });
//     session.messages.push({ role: 'model', text: aiResponseText });
    
//     // Optional: Quick crisis check on every message
//     if (message.toLowerCase().includes('kill') || message.toLowerCase().includes('suicide')) {
//         session.isCrisis = true;
//     }

//     await session.save();

//     res.status(200).json({
//       status: 'success',
//       sessionId: session._id,
//       aiResponse: aiResponseText,
//       isCrisis: session.isCrisis
//     });
//   } catch (err) {
//     next(err);
//   }
// };

exports.getSingleSession = async (req, res, next) => {
  try {
    // URL se ID nikalna (e.g., /api/v1/sessions/12345)
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ status: 'fail', message: 'No session found' });
    }

    res.status(200).json({
      status: 'success',
      data: { session } // Frontend isi 'session.messages' ko map karega
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


// src/controllers/sessionController.js

exports.getUserSessions = async (req, res, next) => {
  try {
    // 1. Authenticated user check
    if (!req.user || !req.user.id) {
        return res.status(401).json({ status: 'fail', message: 'User not authenticated' });
    }

    // 2. Fetch sessions with ALL necessary fields for the sidebar
    const sessions = await Session.find({ user: req.user.id })
      .select('title createdAt messages summary isActive initialSentiment') // 'messages' is MUST here
      .sort({ createdAt: -1 });

    // 3. Robust Response structure
    res.status(200).json({
      status: 'success',
      results: sessions.length,
      data: { 
        sessions: sessions || [] 
      }
    });
  } catch (err) {
    console.error("SIDEBAR FETCH ERROR:", err.message);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to load chat history' 
    });
  }
};

// src/controllers/sessionController.js
// src/controllers/sessionController.js
exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // 1. Saari messages ko ek string mein convert karein
    const chatContent = session.messages.map(m => `${m.role}: ${m.text}`).join('\n');

    // 2. Groq se Summary maangein
    const aiSummary = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: "Summarize the following therapy session in one short, meaningful sentence." 
          },
          { role: "user", content: chatContent }
        ]
      },
      {
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
      }
    );

    const summaryText = aiSummary.data.choices[0].message.content;

    // 3. Database mein update karein
    session.summary = summaryText;
    session.isActive = false;
    session.isCompleted = true;
    await session.save();

    res.status(200).json({ status: 'success', summary: summaryText });
  } catch (error) {
    console.error("Summary Error:", error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};