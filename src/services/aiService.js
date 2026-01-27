const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// exports.analyzeText = async (text) => {
//   try {
//     const chatCompletion = await groq.chat.completions.create({
//       messages: [
//         {
//           role: "system",
//           content: "You are a sentiment analyzer for a mental health app. Return ONLY a valid JSON object: { \"score\": number between -1 and 1, \"label\": \"Positive/Negative/Neutral\", \"reply\": \"A short, empathetic one-line response\" }"
//         },
//         {
//           role: "user",
//           content: text,
//         },
//       ],
//       model: "llama-3.3-70b-versatile", // Groq ka fast model
//       response_format: { type: "json_object" },
//     });
//       console.log("Groq Raw Response:", chatCompletion.choices[0].message.content);

//     return JSON.parse(chatCompletion.choices[0].message.content);
//   } catch (err) {
//     console.error("Groq Service Error:", err);
//     return { score: 0, label: "Neutral", reply: "I hear you. Thank you for sharing your thoughts with me." };
//   }
// };
exports.analyzeText = async (text) => {
   return { score: 0, label: "Neutral", reply: "Dummy testing response" };
}