const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// exports.generateTherapyTalk = async (userInput, sentimentLabel) => {
//   const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//   // System Prompt taaki AI ek professional therapist ki tarah behave kare
//   const prompt = `You are a compassionate AI Therapist for the SoulSync app. 
//   The user is feeling ${sentimentLabel}. They said: "${userInput}". 
//   Provide a empathetic therapeutic response. 
//   If they are in crisis, suggest professional help immediately.`;

//   const result = await model.generateContent(prompt);
//   const response = await result.response;
//   return response.text();
// };

exports.getChatResponse = async (history, userMessage) => {
  try {
    // 1. History ko Gemini ke format mein convert karein
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // 2. Chat session start karein history ke saath
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: { maxOutputTokens: 500 },
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Gemini Service Error:", err);
    throw err;
  }
};

exports.generateQuickReply = async (userText) => {
  try {
    const prompt = `The user just shared their current mood: "${userText}". 
    Provide a very short, empathetic, and supportive one-sentence response 
    to acknowledge how they feel. Don't be too robotic.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Quick Reply Error:", error);
    return "I've noted how you're feeling. I'm here if you want to talk more.";
  }
};

exports.getTherapyResponse = async (userMessage, moodContext,chatHistoryFromDB) => {
  try {


    const formattedHistory = chatHistory.map(m => ({
      role: m.role === 'assistant' ? 'model' : m.role, 
      parts: [{ text: m.text }]
    }));

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `
            You are SoulSync AI, a warm and professional therapist. 
            CONTEXT: The user recently felt: ${moodContext}.
            STRICT RULES:
            1. Keep responses under 3-4 sentences.
            2. Don't give medical or clinicaladvice or long lists unless specifically asked.
            3. Use a soft, human tone. Ask ONE thoughtful follow-up question or a choice of two.
            4. Use simple formatting (bolding key words) but no long bullet points.
          ` }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I will provide compassionate support based on the user's emotional history." }],
        },
        ...formattedHistory
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Therapy Error:", error);
    return "I'm here for you. Tell me more about how you're feeling.";
  }
};






// You are SoulSync AI, a warm and professional therapist. 
//             CONTEXT: The user recently felt: ${moodContext}.
//             STRICT RULES:
//             1. Keep responses under 3-4 sentences.
//             2. Don't give medical or clinicaladvice or long lists unless specifically asked.
//             3. Use a soft, human tone. Ask ONE thoughtful follow-up question or a choice of two.
//             4. Use simple formatting (bolding key words) but no long bullet points.

