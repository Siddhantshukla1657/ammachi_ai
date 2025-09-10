// Test script for Gemini AI chat integration
const axios = require('axios');

async function testChat() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing Gemini AI Chat Integration...\n');
  
  // Test cases
  const testQuestions = [
    "Hello, I'm a new farmer. Can you help me?",
    "How to grow rice in Kerala?",
    "What are the symptoms of rice blast disease?",
    "Organic pest control methods for coconut",
    "Best time to plant pepper",
    "Current market prices for crops"
  ];
  
  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    
    try {
      console.log(`\n📝 Test ${i + 1}: "${question}"`);
      console.log('=' .repeat(60));
      
      const response = await axios.post(`${baseURL}/api/chatbot/chat`, {
        message: question,
        sessionId: `test-session-${Date.now()}`
      });
      
      if (response.data.success) {
        console.log(`✅ Response Source: ${response.data.source || 'unknown'}`);
        console.log(`🤖 Bot Reply:\n${response.data.reply}`);
      } else {
        console.log('❌ Failed:', response.data.error);
      }
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log('❌ Request failed:', error.response?.data?.error || error.message);
    }
  }
  
  // Test health endpoint
  console.log('\n\n🔍 Testing Health Endpoint...');
  console.log('=' .repeat(60));
  
  try {
    const healthResponse = await axios.get(`${baseURL}/api/chatbot/health`);
    console.log('✅ Health Status:', JSON.stringify(healthResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
}

// Run the test
testChat().catch(console.error);