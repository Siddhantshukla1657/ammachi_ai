// Simple chat test
const axios = require('axios');

async function testGeminiChat() {
  try {
    console.log('Testing Gemini Chat...');
    const response = await axios.post('http://localhost:5000/api/chatbot/chat', {
      message: 'Hello, I need help with farming.',
      sessionId: 'test-session'
    });
    
    console.log('Chat Response:', JSON.stringify(response.data, null, 2));
    
    // Test health endpoint
    console.log('\nTesting Health...');
    const healthResponse = await axios.get('http://localhost:5000/api/chatbot/health');
    console.log('Health Response:', JSON.stringify(healthResponse.data, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testGeminiChat();