const { GoogleGenerativeAI } = require('@google/generative-ai');
const apiKey = process.env.API_KEY;
const modelName = "gemini-2.5-flash"; // use this model name for requests

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: modelName });
