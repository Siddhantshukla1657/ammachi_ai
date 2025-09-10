// Quick test for asterisk cleaning
const axios = require('axios');

async function testAsteriskCleaning() {
  try {
    console.log('🧪 Testing Asterisk Cleaning...\n');
    
    const response = await axios.post('http://localhost:5000/api/chatbot/chat', {
      message: 'How to grow rice step by step?',
      sessionId: 'asterisk-test'
    });
    
    if (response.data.success) {
      console.log(`Response Source: ${response.data.source}`);
      console.log(`Reply:\n${response.data.reply}`);
      
      // Check for asterisks
      const asteriskCount = (response.data.reply.match(/\*/g) || []).length;
      const bulletCount = (response.data.reply.match(/•/g) || []).length;
      
      console.log(`\n📊 Analysis:`);
      console.log(`Asterisks found: ${asteriskCount}`);
      console.log(`Bullet points found: ${bulletCount}`);
      
      if (asteriskCount === 0) {
        console.log('✅ SUCCESS: No asterisks found - clean formatting achieved!');
      } else {
        console.log('⚠️ WARNING: Asterisks still present in response');
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAsteriskCleaning();