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
    
    // Check if file exists before reading
    if (!fs.existsSync(req.file.path)) {
      console.log('❌ File does not exist at path:', req.file.path);
      return res.status(400).json({ 
        error: 'Uploaded file not found',
        details: 'The image file was not properly uploaded. Please try again.'
      });
    }
    
    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString('base64');
    console.log('🖼 Image converted to base64, size:', imageBase64.length, 'chars');

    // Plant.id API request for plant health assessment and disease detection
    const requestBody = {
      images: [imageBase64]
    };

    console.log('📡 Sending request to Plant.id API...');
    console.log('📝 Request body keys:', Object.keys(requestBody));
    console.log('🖼 Images array length:', requestBody.images.length);
    
    const response = await axios.post(
      'https://api.plant.id/v3/identification',
      requestBody,
      {
        params: {
          'health': 'all',
          'classification_level': 'all',
          'symptoms': 'true',
          'similar_images': 'true',
          'plant_language': 'en'
        },
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': process.env.PLANT_ID_KEY,
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Process the response
    const result = response.data;
    
    console.log('✅ Plant.id API response received, status:', response.status);
    console.log('📊 Response data keys:', Object.keys(response.data || {}));
    console.log('🔍 Full API response:', JSON.stringify(result, null, 2));

    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
      console.log('🗑️ Cleaned up uploaded file');
    } catch (e) {
      console.warn('Could not delete uploaded file:', e.message);
    }
    
    // Check if the response contains identification results
    if (result && result.result) {
      const identification = result.result;
      
      // Check if the image contains a plant with better threshold handling
      if (identification.is_plant) {
        const plantProbability = identification.is_plant.probability || 0;
        const isPlantDetected = identification.is_plant.binary;
        
        console.log('🌱 Plant detection - Probability:', plantProbability, 'Binary:', isPlantDetected);
        
        // More lenient plant detection - allow lower probability plants
        if (!isPlantDetected && plantProbability < 0.1) {
          return res.status(400).json({
            success: false,
            error: 'No plant detected in the image',
            details: `Plant detection confidence is too low (${(plantProbability * 100).toFixed(1)}%). Please upload a clear image of a plant or crop leaf for analysis.`
          });
        }
      }
      
      // Extract plant classification information first
      let plantClassification = null;
      if (identification.classification && identification.classification.suggestions && identification.classification.suggestions.length > 0) {
        const topPlant = identification.classification.suggestions[0];
        plantClassification = {
          scientific_name: topPlant.name,
          common_names: topPlant.details?.common_names || [],
          probability: topPlant.probability,
          details: topPlant.details || {}
        };
        console.log('🌿 Plant identified:', topPlant.name, 'with probability:', topPlant.probability);
      }
      
      // Check if any diseases are detected in health assessment
      let hasDisease = false;
      let diseases = [];
      
      // Check multiple disease detection paths
      if (identification.disease && identification.disease.suggestions && identification.disease.suggestions.length > 0) {
        hasDisease = true;
        diseases = identification.disease.suggestions;
        console.log('🦠 Disease detected via disease.suggestions, count:', diseases.length);
      } else if (identification.health_assessment && identification.health_assessment.diseases && identification.health_assessment.diseases.length > 0) {
        hasDisease = true;
        diseases = identification.health_assessment.diseases;
        console.log('🦠 Disease detected via health_assessment.diseases, count:', diseases.length);
      } else if (identification.suggestions && identification.suggestions.some(s => s.disease && s.disease.suggestions && s.disease.suggestions.length > 0)) {
        // Check if any suggestion contains disease information
        const diseaseInfo = identification.suggestions.find(s => s.disease && s.disease.suggestions && s.disease.suggestions.length > 0);
        if (diseaseInfo) {
          hasDisease = true;
          diseases = diseaseInfo.disease.suggestions;
          console.log('🦠 Disease detected via suggestions.disease, count:', diseases.length);
        }
      }
      
      console.log('🔍 Disease detection summary:');
      console.log('  - hasDisease:', hasDisease);
      console.log('  - diseases count:', diseases.length);
      console.log('  - available keys in identification:', Object.keys(identification));
      
      if (hasDisease && diseases.length > 0) {
        
        // Disease detected
        const processedDiseases = diseases.map(disease => ({
          name: disease.name,
          probability: disease.probability,
          description: disease.details?.description || disease.description || 'No description available',
          treatment: disease.details?.treatment || disease.treatment || 'Consult an agricultural expert for treatment options',
          common_names: disease.details?.common_names || disease.common_names || [],
          url: disease.details?.url || disease.url
        }));
        
        console.log('🦠 Processed diseases:', processedDiseases.map(d => d.name).join(', '));
        
        res.json({
          success: true,
          is_healthy: false,
          result: {
            plant_identification: plantClassification,
            disease: {
              suggestions: processedDiseases
            },
            is_plant: identification.is_plant,
            is_healthy: false,
            health_status: 'Disease detected - requires attention'
          }
        });
      } else {
        console.log('✅ No diseases detected');
        
        // No diseases detected
        if (plantClassification) {
          // Plant identified and appears healthy
          res.json({
            success: true,
            is_healthy: true,
            result: {
              plant_identification: plantClassification,
              is_plant: identification.is_plant,
              is_healthy: true,
              health_status: 'Plant appears healthy - no diseases detected'
            }
          });
        } else {
          // Plant detected but no clear identification
          console.log('⚠️ Plant detected but no clear identification');
          
          res.json({
            success: true,
            is_healthy: true,
            result: {
              plant_identification: null,
              is_plant: identification.is_plant,
              is_healthy: true,
              health_status: 'Plant detected but species could not be identified - no diseases detected'
            }
          });
        }
      }
    } else {
      console.log('❌ Unexpected response format');
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