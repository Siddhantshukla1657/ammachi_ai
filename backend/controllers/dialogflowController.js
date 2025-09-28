const dialogflow = require('@google-cloud/dialogflow');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

let genAI;
let model;

try {
  const apiKey = process.env.API_KEY;
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: process.env.MODEL || 'gemini-1.5-flash' });
    console.log('✅ Gemini AI initialized successfully');
  } else {
    console.warn('⚠️ Gemini API key not found in environment variables');
  }
} catch (error) {
  console.warn('⚠️ Gemini AI initialization failed:', error.message);
}

let sessionClient;
let projectId;

try {
  // Check if we have the required environment variables for Dialogflow
  if (process.env.DIALOGFLOW_PROJECT_ID && process.env.DIALOGFLOW_PRIVATE_KEY && process.env.DIALOGFLOW_CLIENT_EMAIL) {
    // Use environment variables instead of credential file
    const serviceAccount = {
      project_id: process.env.DIALOGFLOW_PROJECT_ID,
      private_key: process.env.DIALOGFLOW_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.DIALOGFLOW_CLIENT_EMAIL
    };
    
    projectId = serviceAccount.project_id;
    
    sessionClient = new dialogflow.SessionsClient({
      credentials: serviceAccount,
      projectId: projectId
    });
    
    console.log('✅ Dialogflow client initialized successfully using environment variables');
  } else {
    // Try to use credential file as fallback
    const keyFilename = path.join(__dirname, '../credentials/amaachiai-f879ccf99f8e.json');
    const serviceAccount = require(keyFilename);
    projectId = serviceAccount.project_id;
    
    sessionClient = new dialogflow.SessionsClient({
      keyFilename: keyFilename
    });
    
    console.log('✅ Dialogflow client initialized successfully using credential file');
  }
} catch (error) {
  console.warn('⚠️ Dialogflow initialization failed:', error.message);
  console.log('   Chatbot will use fallback responses');
}

const cleanAIResponse = (text) => {
  if (!text) return text;
  
  let cleaned = text;
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/^\s*\*\s+/gm, '• ');
  cleaned = cleaned.replace(/\n\s*\*\s+/g, '\n• ');
  cleaned = cleaned.replace(/\*/g, '');
  cleaned = cleaned.replace(/•([^ ])/g, '• $1');
  cleaned = cleaned.replace(/•+/g, '•');
  cleaned = cleaned.replace(/([^\n])•/g, '$1\n•');
  
  return cleaned.trim();
};

const generateFallbackResponse = (message, language = 'en') => {
  const lowerMessage = message.toLowerCase();
  
  const responses = {
    en: {
      greeting: `Hi! I'm Ammachi AI 🌾\n• Crop help\n• Disease tips\n• Market prices\nWhat do you need?`,
      rice: `🌾 Rice:\n• Quality seeds\n• Keep water level\n• Watch pests`,
      coconut: `🥥 Coconut:\n• 7m spacing\n• Water twice/week\n• Organic manure`,
      pepper: `🌶️ Pepper:\n• Needs support\n• Good drainage\n• Harvest when red`,
      disease: `🐛 Disease:\n• Use leaf scanner\n• Apply neem oil\n• Remove infected parts`,
      market: `📊 Prices:\n• Rice: ₹2,800/quintal\n• Coconut: ₹12/piece\n• Pepper: ₹600/kg`,
      general: `🌾 How can I help?\n• Crops\n• Diseases\n• Prices`
    },
    ml: {
      greeting: `ഹായ്! ഞാൻ അമ്മച്ചി AI 🌾
• കൃഷി സഹായം
• രോഗ ടിപ്സ്
• വില
എന്തു വേണം?`,
      rice: `🌾 നെല്ല്:\n• നല്ല വിത്ത്\n• വെള്ളം maintain\n• കീടങ്ങൾ നോക്കുക`,
      coconut: `🥥 തെങ്ങ്:\n• 7m അന്തരം\n• ആഴ്ചയിൽ 2 വാര വെള്ളം\n• organic manure`,
      pepper: `🌶️ കുരുമുളക്:\n• സപ്പോർട്ട് വേണം\n• drainage നല്ലത്\n• ചുവന്നപ്പോൾ വെട്ടുക`,
      disease: `🐛 രോഗം:\n• leaf scanner use ചെയ്യുക\n• വേപ്പെണ്ണ ഇടുക\n• രോഗം ഉള്ള ഭാഗം മാറ്റുക`,
      market: `📊 വില:\n• നെല്ല്: ₹2,800/quintal\n• തെങ്ങ്: ₹12/piece\n• കുരുമുളക്: ₹600/kg`,
      general: `🌾 എങ്ങനെ സഹായിക്കാം?\n• വിളകൾ\n• രോഗങ്ങൾ\n• വില`
    }
  };
  
  const lang = responses[language] || responses.en;
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('namaste') || lowerMessage.includes('നമസ്കാരം')) {
    return lang.greeting;
  }
  
  if (lowerMessage.includes('rice') || lowerMessage.includes('നെല്ല്')) {
    return lang.rice;
  }
  
  if (lowerMessage.includes('coconut') || lowerMessage.includes('തെങ്ങിന്')) {
    return lang.coconut;
  }
  
  if (lowerMessage.includes('pepper') || lowerMessage.includes('കുർവർ')) {
    return lang.pepper;
  }
  
  if (lowerMessage.includes('disease') || lowerMessage.includes('രോഗം')) {
    return lang.disease;
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('market') || lowerMessage.includes('വില')) {
    return lang.market;
  }
  
  return lang.general;
};

const getSessionPath = (sessionId) => {
  if (!sessionClient || !projectId) return null;
  return sessionClient.projectAgentSessionPath(projectId, sessionId);
};

const chatWithBot = async (req, res) => {
  try {
    const { message, sessionId = 'default-session', language = 'en' } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required',
        reply: 'Please provide a message to chat with the bot.'
      });
    }

    let reply;
    let source = 'fallback';
    const userMessage = {
      text: message.trim(),
      language: language
    };

    if (model && genAI) {
      try {
        console.log(`🤖 Using Gemini AI for response generation (${language})...`);
        
        const farmingPrompt = `You are Ammachi AI, an expert farming assistant for Kerala farmers.

CRITICAL RULES:
• Keep responses EXTREMELY SHORT (maximum 2-3 bullet points)
• NO asterisks (*) - use bullet points (•) only  
• Maximum 3 lines total
• Language: ${userMessage.language === 'ml' ? 'Respond ONLY in Malayalam' : 'Respond in English'}
• For Malayalam: Use Malayalam script only

Format Example:
🌱 Rice:
• Good seeds
• Water level maintain

Topics: Crop cultivation, pest control, weather advice, market prices

User Question: ${userMessage.text}

Give VERY SHORT answer in ${userMessage.language === 'ml' ? 'Malayalam' : 'English'}.`;

        const result = await model.generateContent(farmingPrompt);
        const response = await result.response;
        const geminiReply = response.text();
        
        if (geminiReply && geminiReply.trim()) {
          reply = cleanAIResponse(geminiReply.trim());
          source = 'gemini';
          console.log('✅ Gemini AI response generated successfully');
        } else {
          console.log('⚠️ Gemini returned empty response, using fallback');
          reply = generateFallbackResponse(userMessage.text, userMessage.language);
        }
        
      } catch (geminiError) {
        console.warn('Gemini AI request failed:', geminiError.message);
        reply = generateFallbackResponse(userMessage.text, userMessage.language);
      }
    } else {
      console.log('📚 Using predefined knowledge base responses...');
      reply = generateFallbackResponse(userMessage.text, userMessage.language);
    }

    console.log(`Chat - User: ${userMessage.text.substring(0, 50)}... | Bot: ${reply.substring(0, 50)}...`);

    res.json({
      success: true,
      reply: reply,
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      source: source,
      language: userMessage.language
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      reply: 'I apologize, but I encountered an error. Please try again later or contact support if the issue persists.'
    });
  }
};

const checkDialogflowHealth = async (req, res) => {
  try {
    const health = {
      dialogflowAvailable: Boolean(sessionClient && projectId),
      geminiAvailable: Boolean(model && genAI),
      projectId: projectId || 'Not configured',
      geminiModel: process.env.MODEL || 'gemini-1.5-flash',
      timestamp: new Date().toISOString()
    };
    
    if (health.dialogflowAvailable) {
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
        health.dialogflowTest = 'Success';
      } catch (error) {
        health.dialogflowTest = `Failed: ${error.message}`;
        health.dialogflowAvailable = false;
      }
    }
    
    if (health.geminiAvailable) {
      try {
        const testResult = await model.generateContent('Hello, this is a test.');
        const response = await testResult.response;
        if (response.text()) {
          health.geminiTest = 'Success';
        } else {
          health.geminiTest = 'Failed: Empty response';
          health.geminiAvailable = false;
        }
      } catch (error) {
        health.geminiTest = `Failed: ${error.message}`;
        health.geminiAvailable = false;
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