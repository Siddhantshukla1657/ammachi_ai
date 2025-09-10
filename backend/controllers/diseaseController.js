const axios = require('axios');
const fs = require('fs');
const path = require('path');
const CropDiary = require('../models/CropDiary');

exports.detectDisease = async (req, res) => {
  console.log('🔍 Disease detection request received');
  console.log('📁 File info:', req.file ? {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path
  } : 'No file');
  
  try {
    if (!req.file) {
      console.log('❌ No file provided in request');
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Validate Plant.id API key
    if (!process.env.PLANT_ID_KEY) {
      console.log('❌ Plant.id API key not configured');
      return res.status(500).json({ error: 'Plant.id API key not configured' });
    }
    
    console.log('🔑 Plant.id API key found:', process.env.PLANT_ID_KEY.substring(0, 10) + '...');

    console.log('📦 Reading image file:', req.file.path);
    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString('base64');
    console.log('🖼️ Image converted to base64, size:', imageBase64.length, 'chars');

    // Plant.id API request for plant identification and disease detection
    const requestBody = {
      images: [imageBase64],
      modifiers: ['health=all', 'similar_images=true'],
      plant_language: 'en',
      plant_net: 'all',
      plant_details: [
        'common_names',
        'url', 
        'description',
        'taxonomy',
        'rank',
        'gbif_id',
        'observations',
        'synonyms'
      ]
    };

    console.log('📡 Sending request to Plant.id API...');
    console.log('📝 Request body keys:', Object.keys(requestBody));
    console.log('🖼️ Images array length:', requestBody.images.length);
    
    const response = await axios.post(
      'https://api.plant.id/v3/identification',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': process.env.PLANT_ID_KEY,
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('✅ Plant.id API response received, status:', response.status);
    console.log('📊 Response data keys:', Object.keys(response.data || {}));

    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      console.warn('Could not delete uploaded file:', e.message);
    }

    // Process the response
    const result = response.data;
    
    // Check if the response contains identification results
    if (result && result.result) {
      const identification = result.result;
      
      // Check if any diseases are detected in health assessment
      if (identification.disease && identification.disease.suggestions && identification.disease.suggestions.length > 0) {
        // Disease detected
        const diseases = identification.disease.suggestions.map(disease => ({
          name: disease.name,
          probability: disease.probability,
          description: disease.details?.description || 'No description available',
          treatment: disease.details?.treatment || 'Consult an agricultural expert for treatment options',
          common_names: disease.details?.common_names || [],
          url: disease.details?.url
        }));
        
        res.json({
          success: true,
          is_healthy: false,
          result: {
            disease: {
              suggestions: diseases
            },
            is_plant: identification.is_plant,
            is_healthy: false
          }
        });
        
        // Auto-save to crop diary if user info is available
        // Note: In a real implementation, you would get user ID from authentication
        // For now, we'll skip auto-save to avoid errors
        // saveToCropDiary(req, diseases[0]);
      } else if (identification.classification && identification.classification.suggestions && identification.classification.suggestions.length > 0) {
        // No diseases detected but plant identified - healthy plant
        const plantInfo = identification.classification.suggestions[0];
        res.json({
          success: true,
          is_healthy: true,
          result: {
            is_plant: identification.is_plant,
            is_healthy: true,
            classification: {
              suggestions: [{
                name: plantInfo.name,
                probability: plantInfo.probability,
                details: plantInfo.details || {}
              }]
            }
          }
        });
      } else {
        // No clear identification or health assessment
        res.json({
          success: true,
          is_healthy: true,
          result: {
            is_plant: identification.is_plant,
            is_healthy: true,
            classification: null
          }
        });
      }
    } else {
      res.status(500).json({ 
        error: 'Unexpected response format from Plant.id API',
        details: 'The API response did not contain expected result data'
      });
    }

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn('Could not delete uploaded file on error:', e.message);
      }
    }

    console.error('❌ Plant.id API error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'No response data',
      code: error.code
    });
    
    if (error.response) {
      console.error('API Response:', error.response.status, error.response.data);
      
      if (error.response.status === 400) {
        return res.status(400).json({ 
          error: 'Invalid image for plant analysis',
          details: 'The uploaded image cannot be analyzed. Please ensure you upload a clear, high-quality photo of a plant or crop leaf.'
        });
      }
      
      if (error.response.status === 402) {
        return res.status(402).json({ 
          error: 'Plant.id API quota exceeded',
          details: 'The API quota for disease detection has been exceeded. Please try again later.'
        });
      }
      
      if (error.response.status === 401) {
        return res.status(500).json({ 
          error: 'Plant.id API authentication failed',
          details: 'Invalid API key configuration'
        });
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        error: 'Request timeout',
        details: 'The disease detection request timed out. Please try again with a smaller image.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to identify plant disease',
      details: 'An error occurred while processing your image. Please try again with a clear photo of the affected plant.'
    });
  }
};
