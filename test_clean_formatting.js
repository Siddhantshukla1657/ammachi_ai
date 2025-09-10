// Test script for clean formatting without asterisks
const axios = require('axios');

async function testCleanFormatting() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing Clean Formatting (No Asterisks)...\n');
  
  // Test cases to check formatting
  const testQuestions = [
    "Hello, can you help me with farming?",
    "How to grow rice?",
    "What are organic pest control methods?",
    "Tell me about rice blast disease",
    "Current market prices",
    "Help with farming"
  ];
  
  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    
    try {
      console.log(`\n📝 Test ${i + 1}: "${question}"`);
      console.log('=' .repeat(60));
      
      const response = await axios.post(`${baseURL}/api/chatbot/chat`, {
        message: question,
        sessionId: `clean-test-${Date.now()}`
      });
      
      if (response.data.success) {
        console.log(`✅ Response Source: ${response.data.source}`);
        console.log(`🤖 Clean Reply:\n${response.data.reply}`);
        
        // Check for asterisks
        const hasAsterisks = response.data.reply.includes('*');
        if (hasAsterisks) {
          console.log('⚠️  WARNING: Response contains asterisks!');
        } else {
          console.log('✅ Clean formatting confirmed - no asterisks found');
        }
      } else {
        console.log('❌ Failed:', response.data.error);
      }
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.log('❌ Request failed:', error.response?.data?.error || error.message);
    }
  }
}

// Run the test
testCleanFormatting().catch(console.error);