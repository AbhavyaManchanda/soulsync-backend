const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

exports.getChatResponse = async (history, newMessage) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Formatting history for Gemini's specific requirements
  const chat = model.startChat({
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    })),
  });

  const result = await chat.sendMessage(newMessage);
  const response = await result.response;
  return response.text();
};