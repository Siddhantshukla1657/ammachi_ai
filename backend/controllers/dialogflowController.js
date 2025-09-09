const dialogflow = require('@google-cloud/dialogflow');
const path = require('path');

// Initialize Dialogflow client
let sessionClient;
let projectId;

try {
  // Use service account key from credentials folder
  const keyFilename = path.join(__dirname, '../credentials/ammachi-ai-KEY.json');
  
  // Read the service account key to get project ID
  const serviceAccount = require(keyFilename);
  projectId = serviceAccount.project_id;
  
  sessionClient = new dialogflow.SessionsClient({
    keyFilename: keyFilename
  });
  
  console.log('✅ Dialogflow client initialized successfully');
} catch (error) {
  console.warn('⚠️ Dialogflow initialization failed:', error.message);
  console.log('   Chatbot will use fallback responses');
}

// Fallback responses for when Dialogflow is not available
const fallbackResponses = [
  "Thank you for your question! I'm currently learning to help farmers better. Could you try asking about weather, crops, or farming techniques?",
  "I'm here to help with farming questions! Try asking about plant diseases, weather forecasts, or market prices.",
  "As your farming assistant, I can help with crop care, disease identification, and agricultural advice. What would you like to know?",
  "നമസ്കാരം! I'm here to assist with farming questions. Ask me about crops, weather, or agricultural practices.",
  "I understand you're seeking farming guidance. Feel free to ask about irrigation, pest control, or crop management."
];

// Simple keyword-based responses
const keywordResponses = {
  weather: "For detailed weather information, please check the Weather section of the app where you can get 7-day forecasts for your district.",
  rice: "Rice farming requires proper water management. Ensure adequate drainage during monsoon and maintain consistent water levels during growing season.",
  coconut: "Coconut trees need well-drained soil and regular watering. Watch for signs of pests like rhinoceros beetles and red palm weevils.",
  pepper: "Black pepper requires shade and support. Ensure good drainage and watch for diseases like foot rot and anthracnose.",
  disease: "For plant disease identification, use our Disease Detection feature where you can upload photos of affected plants for analysis.",
  market: "Check the Market section for current crop prices and trends from various mandis across Kerala.",
  irrigation: "Proper irrigation timing depends on crop type and season. Generally, early morning watering is most effective.",
  pest: "Common organic pest control methods include neem oil spray, companion planting, and encouraging beneficial insects."
};

// Generate session path
const getSessionPath = (sessionId) => {
  if (!sessionClient || !projectId) return null;
  return sessionClient.projectAgentSessionPath(projectId, sessionId);
};

// Main chat function
const chatWithBot = async (req, res) => {
  try {
    const { message, sessionId = 'default-session' } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required',
        reply: 'Please provide a message to chat with the bot.'
      });
    }

    let reply;

    // Try Dialogflow first if available
    if (sessionClient && projectId) {
      try {
        const sessionPath = getSessionPath(sessionId);
        
        const request = {
          session: sessionPath,
          queryInput: {
            text: {
              text: message.trim(),
              languageCode: 'en', // You can also support 'ml' for Malayalam
            },
          },
        };

        const [response] = await sessionClient.detectIntent(request);
        const result = response.queryResult;
        
        if (result.fulfillmentText && result.fulfillmentText.trim()) {
          reply = result.fulfillmentText;
        } else {
          // If Dialogflow returns empty response, use keyword matching
          reply = generateKeywordResponse(message);
        }
        
        console.log('✅ Dialogflow response generated');
      } catch (dialogflowError) {
        console.warn('Dialogflow request failed:', dialogflowError.message);
        reply = generateKeywordResponse(message);
      }
    } else {
      // Use fallback keyword matching
      reply = generateKeywordResponse(message);
    }

    // Log the conversation for debugging
    console.log(`Chat - User: ${message.substring(0, 50)}... | Bot: ${reply.substring(0, 50)}...`);

    res.json({
      success: true,
      reply: reply,
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      reply: 'I apologize, but I encountered an error. Please try again later or contact support if the issue persists.'
    });
  }
};

// Generate response based on keywords when Dialogflow is not available
const generateKeywordResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Check for keywords
  for (const [keyword, response] of Object.entries(keywordResponses)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }
  
  // Check for common greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('namaste') || lowerMessage.includes('നമസ്കാരം')) {
    return "Hello! I'm Ammachi AI, your farming assistant. I can help you with questions about crops, weather, diseases, and agricultural practices. How can I assist you today?\n\nസ്വാഗതം! എനിക്ക് കൃഷിയെ കുറിച്ച് സഹായിക്കാൻ കഴിയും।";
  }
  
  // Check for Malayalam keywords
  if (lowerMessage.includes('കൃഷി') || lowerMessage.includes('വിളകൾ')) {
    return "കൃഷിയെ കുറിച്ചുള്ള ചോദ്യങ്ങൾക്ക് ഞാൻ സഹായിക്കാം। വിളകൾ, കീടനാശിനികൾ, കാലാവസ്ഥ എന്നിവയെ കുറിച്ച് ചോദിക്കാം।";
  }
  
  // Return random fallback response
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
};

// Health check for Dialogflow connection
const checkDialogflowHealth = async (req, res) => {
  try {
    const health = {
      dialogflowAvailable: Boolean(sessionClient && projectId),
      projectId: projectId || 'Not configured',
      timestamp: new Date().toISOString()
    };
    
    if (health.dialogflowAvailable) {
      // Test a simple query
      try {
        const sessionPath = getSessionPath('health-check');
        const request = {
          session: sessionPath,
          queryInput: {
            text: {
              text: 'hello',
              languageCode: 'en',
            },
          },
        };
        
        await sessionClient.detectIntent(request);
        health.connectionTest = 'Success';
      } catch (error) {
        health.connectionTest = `Failed: ${error.message}`;
        health.dialogflowAvailable = false;
      }
    }
    
    res.json(health);
  } catch (error) {
    res.status(500).json({
      error: 'Health check failed',
      message: error.message
    });
  }
};

module.exports = {
  chatWithBot,
  checkDialogflowHealth
};