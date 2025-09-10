const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.detectDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Validate Plant.id API key
    if (!process.env.PLANT_ID_KEY) {
      return res.status(500).json({ error: 'Plant.id API key not configured' });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString('base64');

    // Plant.id API request for disease detection
    const requestBody = {
      images: [imageBase64],
      modifiers: ['crops_fast', 'similar_images', 'health_only'],
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
      ],
      health_details: [
        'description',
        'treatment',
        'classification',
        'cause',
        'common_names',
        'url'
      ]
    };

    console.log('Sending request to Plant.id API...');
    
    const response = await axios.post(
      'https://api.plant.id/v3/health_assessment',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': process.env.PLANT_ID_KEY,
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('Plant.id API response received');

    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      console.warn('Could not delete uploaded file:', e.message);
    }

    // Process the response
    const result = response.data;
    
    // Check if the response contains health assessment
    if (result && result.result) {
      const healthAssessment = result.result;
      
      // Check if any diseases are detected
      if (healthAssessment.disease && healthAssessment.disease.suggestions && healthAssessment.disease.suggestions.length > 0) {
        // Disease detected
        const diseases = healthAssessment.disease.suggestions.map(disease => ({
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
            is_plant: healthAssessment.is_plant,
            is_healthy: false
          }
        });
      } else {
        // No diseases detected - healthy plant
        res.json({
          success: true,
          is_healthy: true,
          result: {
            is_plant: healthAssessment.is_plant,
            is_healthy: true,
            classification: healthAssessment.classification || null
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

    console.error('Plant.id API error:', error.message);
    
    if (error.response) {
      console.error('API Response:', error.response.status, error.response.data);
      
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
