require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const apiKey = process.env.API_KEY;
const modelName = process.env.MODEL;

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: modelName });

app.post('/api/translate', async (req, res) => {
  const { text, targetLanguage, sourceLanguage = 'English' } = req.body;

  try {
    // Skip translation if source and target languages are the same
    if (sourceLanguage === targetLanguage) {
      return res.json({ translatedText: text });
    }

    // Determine translation direction
    let prompt;
    if (sourceLanguage === 'English' && targetLanguage === 'Malayalam') {
      prompt = `Translate this English text to Malayalam:\n${text}`;
    } else if (sourceLanguage === 'Malayalam' && targetLanguage === 'English') {
      prompt = `Translate this Malayalam text to English:\n${text}`;
    } else {
      // Default to English to Malayalam if not specified correctly
      prompt = `Translate this English text to Malayalam:\n${text}`;
    }

    // Using Gemini model for translation
    const response = await model.generateText({ prompt, temperature: 0.7 });

    res.json({
      translatedText: response.candidates[0].content,
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});



