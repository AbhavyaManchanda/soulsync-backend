const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getDietSuggestion = async (req, res) => {
  try {
    const { moodScore } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); //

    const prompt = `Suggest 3 healthy snacks for mood score ${moodScore} (-1 to +1).
    Response MUST be ONLY the JSON object, no markdown, no explanation:
    {
      "category": "Mood Booster",
      "items": [
        {"name": "Food", "reason": "Why", "emoji": "🍎"},
        {"name": "Food", "reason": "Why", "emoji": "🥜"},
        {"name": "Food", "reason": "Why", "emoji": "🍵"}
      ],
      "tip": "Eat mindfully."
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // ✅ JSON Cleaning Logic: Sirf { } ke beech ka content uthao
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    
    const cleanedJson = JSON.parse(jsonString);
    res.status(200).json(cleanedJson);
  } catch (error) {
    console.error("Diet API Error:", error); // Terminal mein asli error check karein
    res.status(500).json({ error: "Gemini response was invalid or API limit reached" });
  }
};