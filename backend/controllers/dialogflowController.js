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
  const keyFilename = path.join(__dirname, '../credentials/ammachi-ai-KEY.json');
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

// Comprehensive farming knowledge base for predefined Q&A
const farmingKnowledgeBase = {
  // Crop-specific questions
  "how to grow rice": `**Rice Cultivation Guide:**

🌱 **Land Preparation:** Prepare well-leveled fields with good drainage
💧 **Water Management:** Maintain 2-5cm water level during growing season
🌾 **Planting:** Use quality seeds, direct seeding or transplanting method
🐛 **Pest Control:** Watch for stem borers, leaf folders, and brown planthoppers
🌾 **Harvesting:** Harvest when 80-85% of grains turn golden yellow`,
  
  "coconut farming tips": `**Coconut Farming Best Practices:**

🌴 **Planting:** Space trees 7-8 meters apart, dig 1m x 1m x 1m pits
💧 **Irrigation:** Deep watering twice a week, more in summer
🌿 **Fertilization:** Apply organic manure annually, NPK fertilizers quarterly
🐛 **Pest Management:** Watch for rhinoceros beetles, red palm weevils
🥥 **Harvesting:** Nuts ready in 11-12 months, harvest every 45 days`,
  
  "pepper cultivation": `**Black Pepper Growing Guide:**

🍃 **Climate:** Requires warm, humid climate with good rainfall
🌳 **Support:** Plant near trees or provide artificial support poles
💧 **Watering:** Regular watering but avoid waterlogging
🐛 **Diseases:** Watch for foot rot, anthracnose, and pollu beetle
🌾 **Harvesting:** Harvest when berries turn red, dry for black pepper`,
  
  // Disease and pest management
  "rice blast disease": `**Rice Blast Management:**

🌱 **Symptoms:** Brown spots on leaves, neck rot in severe cases
🚪 **Prevention:** Use resistant varieties, avoid excessive nitrogen
🌿 **Organic Control:** Neem oil spray, proper field sanitation
⚗️ **Chemical Control:** Carbendazim or Tricyclazole fungicides
💧 **Management:** Improve drainage, balanced fertilization`,
  
  "coconut red palm weevil": `**Red Palm Weevil Control:**

🔍 **Detection:** Look for holes in trunk, frass around base
🦅 **Prevention:** Regular inspection, avoid trunk injuries
🌿 **Biological Control:** Pheromone traps, beneficial nematodes
⚗️ **Chemical Control:** Systemic insecticides like Imidacloprid
🛠️ **Cultural:** Remove infected palms immediately`,
  
  "pepper foot rot": `**Pepper Foot Rot Management:**

🌱 **Symptoms:** Yellowing leaves, wilting, root blackening
💧 **Prevention:** Improve drainage, avoid waterlogging
🌿 **Organic Treatment:** Trichoderma application, neem cake
⚗️ **Chemical Treatment:** Copper oxychloride or Metalaxyl
🏞️ **Soil Management:** Add organic matter, proper spacing`,
  
  // Organic farming
  "organic pest control": `**Natural Pest Control Methods:**

🌿 **Neem Solutions:** Neem oil spray for aphids, whiteflies
🐞 **Beneficial Insects:** Encourage ladybugs, lacewings, spiders
🌱 **Companion Planting:** Marigolds, basil to repel pests
💨 **Soap Sprays:** Mild soap solution for soft-bodied insects
🥫 **Diatomaceous Earth:** For crawling insects like ants, beetles`,
  
  "crop prices": `**Current Market Information:**

📊 Check our Market section for real-time prices from Kerala mandis
🌾 **Rice:** ₹2,800-3,200 per quintal (varies by variety)
🥥 **Coconut:** ₹10-15 per piece (depending on size)
🌶️ **Pepper:** ₹550-650 per kg (seasonal variation)
📈 **Tip:** Track price trends before harvesting`,
  
  "soil testing": `**Soil Health Assessment:**

🧪 **Testing:** Test soil every 2-3 years for pH, nutrients
📊 **Parameters:** Check N, P, K levels and micronutrients
🌱 **pH Management:** Most crops prefer 6.0-7.5 pH range
🌿 **Amendments:** Add lime for acidic soil, sulfur for alkaline
📄 **Report:** Get detailed recommendations from soil lab`,
  
  "drip irrigation": `**Drip Irrigation Benefits:**

💧 **Water Saving:** 30-50% less water usage
🌱 **Better Growth:** Direct root zone watering
🐛 **Disease Reduction:** Less leaf wetness, fewer fungal issues
💰 **Cost Effective:** Long-term savings on water and labor
🛠️ **Maintenance:** Regular cleaning and filter replacement`
};

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

// Enhanced fallback response system with language support and shorter responses
const generateFallbackResponse = (message, language = 'en') => {
  const lowerMessage = message.toLowerCase();
  
  // Short responses based on language
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
      greeting: `ഹായ്! ഞാൻ അമ്മച്ചി AI 🌾\n• കൃഷി സഹായം\n• രോഗ ടിപ്സ്\n• വില\nഎന്തു വേണം?`,
      rice: `🌾 നെല്ല്:\n• നല്ല വിത്ത്\n• വെള്ളം maintain\n• കീടങ്ങൾ നോക്കുക`,
      coconut: `🥥 തെങ്:\n• 7m അന്തരം\n• ആഴ്ചയിൽ 2 വാര വെള്ളം\n• organic manure`,
      pepper: `🌶️ കുരുമുളക്:\n• സപ്പോർട്ട് വേണം\n• drainage നല്ലത്\n• ചുവന്നപ്പോൾ വെട്ടുക`,
      disease: `🐛 രോഗം:\n• leaf scanner use ചെയ്യുക\n• വേപ്പെണ്ണ ഇടുക\n• രോഗം ഉള്ള ഭാഗം മാറ്റുക`,
      market: `📊 വില:\n• നെല്ല്: ₹2,800/quintal\n• തെങ്ങ്: ₹12/piece\n• കുരുമുളക്: ₹600/kg`,
      general: `🌾 എങ്ങനെ സഹായിക്കാം?\n• വിളകൾ\n• രോഗങ്ങൾ\n• വില`
    }
  };
  
  const lang = responses[language] || responses.en;
  
  // Check for keywords and return appropriate short response
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

// Generate session path
const getSessionPath = (sessionId) => {
  if (!sessionClient || !projectId) return null;
  return sessionClient.projectAgentSessionPath(projectId, sessionId);
};

// Main chat function with Gemini AI integration and language support
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

    // Try Gemini AI first if available
    if (model && genAI) {
      try {
        console.log(`🤖 Using Gemini AI for response generation (${language})...`);
        
        // Create a farming-focused prompt for Gemini with language support and VERY SHORT responses
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
      // Fallback to predefined responses if Gemini is not available
      console.log('📚 Using predefined knowledge base responses...');
      reply = generateFallbackResponse(userMessage.text, userMessage.language);
    }

    // Log the conversation for debugging
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

// Enhanced health check for both Dialogflow and Gemini AI
const checkDialogflowHealth = async (req, res) => {
  try {
    const health = {
      dialogflowAvailable: Boolean(sessionClient && projectId),
      geminiAvailable: Boolean(model && genAI),
      projectId: projectId || 'Not configured',
      geminiModel: process.env.MODEL || 'gemini-1.5-flash',
      timestamp: new Date().toISOString()
    };
    
    // Test Dialogflow if available
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
    
    // Test Gemini AI if available
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