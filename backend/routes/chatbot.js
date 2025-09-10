const express = require('express');
const router = express.Router();
const { chatWithBot, checkDialogflowHealth } = require('../controllers/dialogflowController');

// Main chat endpoint
router.post('/chat', chatWithBot);

// Health check endpoint
router.get('/health', checkDialogflowHealth);

// Remedies endpoint for disease treatment
router.post('/remedies', async (req, res) => {
  try {
    const { disease, query } = req.body;
    
    if (!disease) {
      return res.status(400).json({
        error: 'Disease name is required'
      });
    }
    
    // Create a specific query for disease remedies
    const remedyQuery = query || `What are the best treatment and prevention methods for ${disease} in crops? Please provide specific organic and chemical treatment options.`;
    
    // Use the chatWithBot function to get remedies
    const chatRequest = {
      body: {
        message: remedyQuery,
        sessionId: `disease-${Date.now()}`
      }
    };
    
    // Create a mock response object
    let botResponse;
    const mockRes = {
      json: (data) => { botResponse = data; },
      status: (code) => ({ json: (data) => { botResponse = { ...data, statusCode: code }; } })
    };
    
    await chatWithBot(chatRequest, mockRes);
    
    if (botResponse && botResponse.success) {
      res.json({
        success: true,
        disease: disease,
        response: botResponse.reply,
        timestamp: new Date().toISOString()
      });
    } else {
      // Fallback response for disease remedies
      const fallbackRemedy = generateDiseaseRemedy(disease);
      res.json({
        success: true,
        disease: disease,
        response: fallbackRemedy,
        fallback: true,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Remedies error:', error);
    
    // Provide fallback remedy
    const fallbackRemedy = generateDiseaseRemedy(req.body.disease);
    res.json({
      success: true,
      disease: req.body.disease,
      response: fallbackRemedy,
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
});

// Generate fallback remedy based on common disease patterns
function generateDiseaseRemedy(diseaseName) {
  const diseaseKeywords = diseaseName.toLowerCase();
  
  // Common disease remedies
  const remedyDatabase = {
    'leaf spot': {
      prevention: 'Ensure proper air circulation, avoid overhead watering, remove infected leaves',
      organic: 'Apply neem oil spray, use copper-based fungicides, maintain soil drainage',
      chemical: 'Use fungicides containing copper sulfate or mancozeb as per label instructions'
    },
    'blight': {
      prevention: 'Crop rotation, proper spacing, avoid working in wet conditions',
      organic: 'Baking soda spray (1 tsp per liter), compost tea application',
      chemical: 'Apply chlorothalonil or copper-based fungicides'
    },
    'rust': {
      prevention: 'Good air circulation, morning watering, resistant varieties',
      organic: 'Neem oil, milk spray (1:10 ratio with water), sulfur dust',
      chemical: 'Propiconazole or tebuconazole-based fungicides'
    },
    'wilt': {
      prevention: 'Well-draining soil, avoid overwatering, soil solarization',
      organic: 'Beneficial microorganisms, compost application, proper drainage',
      chemical: 'Soil drenching with carbendazim or copper oxychloride'
    },
    'mildew': {
      prevention: 'Adequate spacing, morning watering, proper ventilation',
      organic: 'Baking soda solution, milk spray, neem oil',
      chemical: 'Sulfur-based fungicides, propiconazole'
    }
  };
  
  // Find matching remedy
  let remedy = null;
  for (const [key, value] of Object.entries(remedyDatabase)) {
    if (diseaseKeywords.includes(key)) {
      remedy = value;
      break;
    }
  }
  
  if (remedy) {
    return `**Treatment for ${diseaseName}:**\n\n` +
           `🛡️ **Prevention:**\n${remedy.prevention}\n\n` +
           `🌿 **Organic Treatment:**\n${remedy.organic}\n\n` +
           `⚗️ **Chemical Treatment:**\n${remedy.chemical}\n\n` +
           `⚠️ **Important:** Always follow label instructions when using chemical treatments and consider organic methods first for sustainable farming.`;
  }
  
  // Generic remedy if no specific match found
  return `**General Treatment Recommendations for ${diseaseName}:**\n\n` +
         `🛡️ **Prevention:**\n` +
         `• Ensure proper plant spacing for air circulation\n` +
         `• Water at soil level, avoid wetting leaves\n` +
         `• Remove and destroy infected plant material\n` +
         `• Practice crop rotation\n\n` +
         `🌿 **Organic Treatments:**\n` +
         `• Neem oil spray (follow label directions)\n` +
         `• Copper-based organic fungicides\n` +
         `• Compost tea application\n` +
         `• Beneficial microorganism applications\n\n` +
         `⚗️ **Chemical Treatments:**\n` +
         `• Consult local agricultural extension office\n` +
         `• Use registered fungicides as per label\n` +
         `• Follow proper application timing\n\n` +
         `⚠️ **Important:** This is general guidance. For specific treatment, consult with a local agricultural expert or plant pathologist who can examine your crop directly.`;
}

module.exports = router;
