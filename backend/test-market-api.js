const axios = require('axios');
require('dotenv').config();

// Test configuration
const BASE_URL = 'http://localhost:5000/api/market';
const MARKET_API_KEY = process.env.MARKET_API_KEY;

// Test cases
const testCases = [
  {
    name: 'Test Market Prices API - Kerala Rice',
    endpoint: `${BASE_URL}/prices`,
    params: {
      state: 'Kerala',
      market: 'Ernakulam',
      commodity: 'Rice'
    }
  },
  {
    name: 'Test Market Prices API - Kerala Coconut',
    endpoint: `${BASE_URL}/prices`,
    params: {
      state: 'Kerala',
      market: 'Kozhikode',
      commodity: 'Coconut'
    }
  },
  {
    name: 'Test Get Commodities API',
    endpoint: `${BASE_URL}/commodities`,
    params: {
      state: 'Kerala'
    }
  },
  {
    name: 'Test Get Markets API',
    endpoint: `${BASE_URL}/markets`,
    params: {
      state: 'Kerala'
    }
  },
  {
    name: 'Test Get Districts API',
    endpoint: `${BASE_URL}/districts`,
    params: {
      state: 'Kerala'
    }
  }
];

// Direct API test (bypassing our backend)
const testDirectAPI = async () => {
  console.log('=== Testing Direct Data.gov.in API ===\n');
  
  if (!MARKET_API_KEY) {
    console.log('❌ MARKET_API_KEY not found in environment variables');
    console.log('Please add your API key to the .env file');
    return;
  }
  
  const directApiUrl = `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=${MARKET_API_KEY}&format=json&limit=5&filters[state]=Kerala&filters[commodity]=Rice`;
  
  try {
    console.log('Making direct API request to:', directApiUrl);
    
    const response = await axios.get(directApiUrl, {
      headers: {
        'X-API-Key': MARKET_API_KEY,
        'Accept': 'application/json',
        'User-Agent': 'Ammachi-AI-Test/1.0'
      },
      timeout: 15000
    });
    
    console.log('✅ Direct API Response Status:', response.status);
    console.log('✅ Response Data Keys:', Object.keys(response.data));
    
    if (response.data.records && response.data.records.length > 0) {
      console.log('✅ Sample Record Structure:');
      console.log(JSON.stringify(response.data.records[0], null, 2));
      console.log(`✅ Total Records: ${response.data.records.length}`);
    } else {
      console.log('❌ No records found in response');
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Direct API Error:', error.message);
    if (error.response) {
      console.log('❌ Error Status:', error.response.status);
      console.log('❌ Error Data:', error.response.data);
    }
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
};

// Test our backend endpoints
const testBackendEndpoints = async () => {
  console.log('=== Testing Backend Endpoints ===\n');
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Endpoint: ${testCase.endpoint}`);
    console.log(`Parameters:`, testCase.params);
    
    try {
      const response = await axios.get(testCase.endpoint, {
        params: testCase.params,
        timeout: 15000
      });
      
      console.log('✅ Status:', response.status);
      console.log('✅ Response Structure:', {
        hasSuccess: 'success' in response.data,
        hasCount: 'count' in response.data,
        hasData: 'data' in response.data,
        dataLength: Array.isArray(response.data.data) ? response.data.data.length : 'Not array'
      });
      
      if (testCase.endpoint.includes('/prices') && response.data.data && response.data.data.length > 0) {
        console.log('✅ Sample Price Record:');
        console.log(JSON.stringify(response.data.data[0], null, 2));
      }
      
    } catch (error) {
      console.log('❌ Error:', error.message);
      if (error.response) {
        console.log('❌ Status:', error.response.status);
        console.log('❌ Data:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    console.log('\n' + '-'.repeat(40) + '\n');
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Market API Tests\n');
  console.log('Environment Check:');
  console.log('- Node.js Version:', process.version);
  console.log('- API Key Available:', !!MARKET_API_KEY);
  console.log('- API Key Length:', MARKET_API_KEY ? MARKET_API_KEY.length : 0);
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test direct API first
  await testDirectAPI();
  
  // Test our backend endpoints
  await testBackendEndpoints();
  
  console.log('✅ All tests completed!');
  console.log('\n📝 Notes:');
  console.log('- If direct API works but backend fails, check your backend server is running on port 5000');
  console.log('- If no records found, try different state/market/commodity combinations');
  console.log('- Check the data.gov.in API documentation for valid parameter values');
};

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.log('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run the tests
runTests().catch(console.error);
