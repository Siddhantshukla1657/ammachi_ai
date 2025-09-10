// Simple test for health endpoint
const axios = require('axios');

async function testGeminiHealth() {
  try {
    console.log('Testing Gemini Health...');
    const response = await axios.get('http://localhost:5000/api/chatbot/health');
    console.log('Health Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Health test failed:', error.message);
  }
}

testGeminiHealth();