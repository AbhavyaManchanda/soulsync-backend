// src/controllers/blogController.js
const axios = require('axios');

exports.getMentalHealthBlogs = async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY; // newsapi.org se free key lein
    // Mental health aur wellness ke 10 articles mangwayein
    const response = await axios.get(`https://newsapi.org/v2/everything?q=mental-health+wellness&pageSize=10&language=en&apiKey=${apiKey}`);
    
    const articles = response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      image: article.urlToImage || 'https://via.placeholder.com/400x200', // Fallback image
      source: article.source.name
    }));

    res.status(200).json({ status: 'success', data: articles });
  } catch (error) {
    res.status(500).json({ message: "Blogs fetch nahi ho paye" });
  }
};