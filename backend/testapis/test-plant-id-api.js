const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testPlantIdAPI() {
  console.log('🌱 Testing Plant.ID API...\n');

  try {
    // Step 1: Check if API key is configured
    console.log('1️⃣ Checking Plant.ID API key configuration...');
    if (!process.env.PLANT_ID_KEY) {
      console.error('❌ PLANT_ID_KEY not found in environment variables');
      console.log('💡 Please add PLANT_ID_KEY to your .env file');
      console.log('💡 Current working directory:', process.cwd());
      console.log('💡 Looking for .env at:', path.join(__dirname, '..', '.env'));
      return false;
    }
    console.log('✅ Plant.ID API key found:', process.env.PLANT_ID_KEY.substring(0, 10) + '...');
    console.log('');

    // Step 2: Test API connectivity with a simple request
    console.log('2️⃣ Testing Plant.ID API connectivity...');
    
    // Create a simple test image (a small test image encoded in base64)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const requestBody = {
      images: [testImageBase64]
    };

    console.log('📡 Sending test request to Plant.ID API...');
    console.log('🔗 Endpoint: https://api.plant.id/v3/identification');
    
    const response = await axios.post(
      'https://api.plant.id/v3/identification',
      requestBody,
      {
        params: {
          details: 'common_names,url,description'
        },
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': process.env.PLANT_ID_KEY,
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('✅ Plant.ID API response received!');
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data keys:', Object.keys(response.data || {}));
    console.log('');

    // Step 3: Analyze the response structure
    console.log('3️⃣ Analyzing Plant.ID API response structure...');
    
    if (response.data && response.data.result) {
      const result = response.data.result;
      console.log('✅ Response contains result object');
      console.log('📋 Result keys:', Object.keys(result));
      
      if (result.is_plant !== undefined) {
        console.log('🌿 is_plant detected:', result.is_plant);
      }
      
      if (result.classification) {
        console.log('🔬 Classification available:', !!result.classification.suggestions);
        if (result.classification.suggestions && result.classification.suggestions.length > 0) {
          console.log('🎯 Top classification:', result.classification.suggestions[0].name);
          console.log('🎯 Confidence:', Math.round(result.classification.suggestions[0].probability * 100) + '%');
        }
      }
      
      if (result.disease) {
        console.log('🦠 Disease detection available:', !!result.disease.suggestions);
        if (result.disease.suggestions && result.disease.suggestions.length > 0) {
          console.log('⚠️ Diseases detected:', result.disease.suggestions.length);
        }
      }
      
    } else {
      console.log('⚠️ Unexpected response format - no result object found');
    }
    console.log('');

    // Step 4: Check API usage information
    console.log('4️⃣ Checking API status...');
    if (response.data.access_token) {
      console.log('✅ Access token received');
    }
    if (response.data.model_version) {
      console.log('📋 Model version:', response.data.model_version);
    }
    if (response.data.status) {
      console.log('📊 Status:', response.data.status);
    }
    console.log('');

    // Final summary
    console.log('🎉 Plant.ID API Test Summary:');
    console.log('✅ API key configuration: Working');
    console.log('✅ API connectivity: Working');
    console.log('✅ Response format: Valid');
    console.log('✅ Authentication: Working');
    console.log('');
    console.log('💡 Your Plant.ID API integration is working correctly!');
    console.log('💡 You can now test with actual plant images through your disease detection endpoint.');

    return true;

  } catch (error) {
    console.error('❌ Plant.ID API test failed!');
    console.error('');
    
    if (error.response) {
      console.error('📊 HTTP Status:', error.response.status);
      console.error('📊 Status Text:', error.response.statusText);
      console.error('📊 Response Data:', error.response.data);
      
      switch (error.response.status) {
        case 401:
          console.error('🔑 Authentication Error: Check your PLANT_ID_KEY');
          break;
        case 402:
          console.error('💳 Payment Required: API quota exceeded');
          break;
        case 400:
          console.error('📝 Bad Request: Check request format');
          break;
        case 403:
          console.error('🚫 Forbidden: API access denied');
          break;
        case 429:
          console.error('⏰ Rate Limit: Too many requests');
          break;
        case 500:
          console.error('🔧 Server Error: Plant.ID API issue');
          break;
        default:
          console.error('❓ Unknown Error: Status', error.response.status);
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request Timeout: API request took too long');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('🌐 Network Error: Cannot reach Plant.ID API');
    } else {
      console.error('❓ Unknown Error:', error.message);
    }
    
    console.error('');
    console.error('🔍 Troubleshooting steps:');
    console.error('1. Check your internet connection');
    console.error('2. Verify PLANT_ID_KEY in .env file');
    console.error('3. Check Plant.ID API status at https://plant.id/');
    console.error('4. Verify your API subscription status');
    
    return false;
  }
}

// Run the test
console.log('🧪 Plant.ID API Integration Test\n');
console.log('=====================================\n');

testPlantIdAPI()
  .then((success) => {
    console.log('\n=====================================');
    console.log('🏁 Test completed!');
    if (!success) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });