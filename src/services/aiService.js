const language = require('@google-cloud/language');
const path = require('path');

// Service Account Key ka sahi path
const keyPath = path.join(__dirname, '../config/google-key.json');

const client = new language.LanguageServiceClient({
  keyFilename: keyPath
});

exports.analyzeText = async (text) => {
  try {
    const document = {
      content: text,
      type: 'PLAIN_TEXT',
    };

    // Google API call
    const [result] = await client.analyzeSentiment({ document });
    const sentiment = result.documentSentiment;

    // Hum return wahi format karenge jo humne pehle socha tha
    return {
      score: sentiment.score,   // -1.0 se 1.0 ke beech
      magnitude: sentiment.magnitude,
      label: sentiment.score >= 0.25 ? 'Positive' : (sentiment.score <= -0.25 ? 'Negative' : 'Neutral')
    };
  } catch (err) {
    console.error("Google AI Service Error:", err.message);
    throw err; 
  }
};