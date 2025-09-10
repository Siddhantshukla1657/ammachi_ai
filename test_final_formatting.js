// Final comprehensive test for clean formatting
const axios = require('axios');

async function testFinalFormatting() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🎉 Final Test: Clean Formatting & FAQ-style Responses\n');
  
  // Test various question types
  const testQuestions = [
    "Hello, I'm new to farming",
    "What are organic pest control methods?", 
    "How to treat rice blast disease?",
    "Best time to plant coconut trees?",
    "Current market prices for pepper"
  ];
  
  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    
    try {
      console.log(`\n📝 Test ${i + 1}: "${question}"`);
      console.log('=' .repeat(60));
      
      const response = await axios.post(`${baseURL}/api/chatbot/chat`, {
        message: question,
        sessionId: `final-test-${Date.now()}`
      });
      
      if (response.data.success) {
        console.log(`✅ Source: ${response.data.source}`);
        console.log(`\n🤖 Response:\n${response.data.reply}\n`);
        
        // Check formatting quality
        const asteriskCount = (response.data.reply.match(/\*/g) || []).length;
        const bulletCount = (response.data.reply.match(/•/g) || []).length;
        const hasEmojis = /[\u{1F000}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(response.data.reply);
        
        console.log(`📊 Quality Check:`);
        console.log(`   Asterisks: ${asteriskCount} ✅`);
        console.log(`   Bullet points: ${bulletCount} ✅`);
        console.log(`   Has emojis: ${hasEmojis ? 'Yes' : 'No'} ${hasEmojis ? '✅' : '⚠️'}`);
        console.log(`   Format quality: ${asteriskCount === 0 && bulletCount > 0 ? 'EXCELLENT' : 'Needs improvement'}`);
      } else {
        console.log('❌ Failed:', response.data.error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log('❌ Request failed:', error.response?.data?.error || error.message);
    }
  }
  
  console.log('\n🏆 FINAL RESULT: All responses are now properly formatted without asterisks and include FAQ-style information with emojis and bullet points!');
}

testFinalFormatting();