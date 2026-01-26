const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getYogaSuggestion = async (req, res) => {
  try {
    const { moodScore } = req.body; // Dashboard graph se -1 to +1 score
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `User's current mood score is ${moodScore} (where -1 is highly stressed/sad and +1 is very happy). 
    Suggest one specific Yoga Pose. 
    Provide the response strictly in this JSON format:
    {
      "poseName": "Name of Pose",
      "benefits": "One short sentence on how it helps this specific mood",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "emoji": "🧘"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON parse karke bhejenge taaki frontend pe styling aasaan ho
    const cleanedJson = JSON.parse(text.replace(/```json|```/g, ""));
    res.status(200).json(cleanedJson);
  } catch (error) {
    console.error("Yoga Gemini Error:", error);
    res.status(500).json({ error: "Failed to fetch yoga suggestion" });
  }
};