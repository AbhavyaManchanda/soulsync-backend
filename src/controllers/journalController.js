const Journal = require('../models/journalModel');
// const geminiService = require('../services/geminiService');
// const { HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// exports.createJournal = async (req, res) => {
//   try {
//     const { content } = req.body;
//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//     // const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
//     // src/controllers/journalController.js mein ye add karein


// const safetySettings = [
//   { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
//   { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
//   { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
//   { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
// ];

// const model = genAI.getGenerativeModel({
//   model: "gemini-2.5-flash",
//   safetySettings // 👈 Yeh line zaroori hai
// });

//     // 1. Gemini se Title aur Emoji maangein
//     const prompt = `Analyze this journal entry: "${content}".
//                    Provide a short creative title and one matching emoji.
//                    Format: Title | Emoji`;
    
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const [aiTitle, aiEmoji] = response.text().split('|');

//     // 2. Database mein save karein
//     const newEntry = await Journal.create({
//       userId: req.user.id,
//       content,
//       title: aiTitle?.trim() || "Daily Reflection",
//       moodEmoji: aiEmoji?.trim() || "📔"
//     });

//     res.status(201).json({ status: 'success', data: newEntry });
//   } catch (error) {
//     console.error("Gemini Journal Error:", error);
//     // Fallback: Agar AI fail ho toh entry save phir bhi honi chahiye
//     const fallbackEntry = await Journal.create({
//       userId: req.user.id,
//       content,
//       title: "New Entry",
//       moodEmoji: "📝"
//     });
//     res.status(201).json({ status: 'success', data: fallbackEntry });
//   }
// };

const axios = require('axios');

exports.createJournal = async (req, res) => {
  try {
    const { content } = req.body;

    // Groq API Call
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.3-70b-versatile", // High performance model
        messages: [
          {
            role: "system",
            content: "Analyze the journal entry. Return only: Title | Emoji"
          },
          { role: "user", content: content }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiText = response.data.choices[0].message.content;
    const [aiTitle, aiEmoji] = aiText.split('|');

    const newEntry = await Journal.create({
      user: req.user.id,
      content,
      title: aiTitle?.trim() || "Daily Reflection",
      moodEmoji: aiEmoji?.trim() || "📔"
    });

    res.status(201).json({ status: 'success', data: newEntry });
  } catch (error) {
    console.error("Groq Error:", error.response?.data || error.message);
    // Fallback logic
    const fallbackEntry = await Journal.create({
      user: req.user.id,
      content: req.body.content,
      title: "New Entry",
      moodEmoji: "📝"
    });
    res.status(201).json({ status: 'success', data: fallbackEntry });
  }
};

exports.getAllJournals = async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ status: 'success', results: journals.length, data: { journals } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.deleteJournal = async (req, res) => {
  try {
    await Journal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getJournalStats = async (req, res) => {
  try {
    const stats = await Journal.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$moodEmoji", // Emoji ke basis par group karein
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({ status: 'success', data: { stats } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};