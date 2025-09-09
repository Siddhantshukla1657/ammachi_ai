const axios = require('axios');
require('dotenv').config(); // Add dotenv configuration

// Test with a sample API key (this is a sample key, not a real one)
const TEST_API_KEY = '5707d2e3c4c4a4f9b2814c5e7ae997a4'; // Sample test key

async function testApiKey() {
  console.log('Testing with sample API key...');
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: 12.9716,
        lon: 77.5946,
        appid: TEST_API_KEY,
        units: 'metric'
      }
    });
    
    console.log('✅ API call successful!');
    console.log('City:', response.data.name);
    console.log('Weather:', response.data.weather[0].main);
    console.log('Temperature:', response.data.main.temp, '°C');
    return true;
  } catch (error) {
    console.error('❌ API call failed:', error.message);
    if (error.response) {
      console.error('Error data:', error.response.data);
    }
    return false;
  }
}

// Now test with the API key from environment variables
async function testProvidedApiKey() {
  console.log('\nTesting with provided API key from environment variables...');
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: 12.9716,
        lon: 77.5946,
        appid: process.env.OPENWEATHER_API_KEY, // Using API key from environment variable
        units: 'metric'
      }
    });
    
    console.log('✅ API call successful!');
    console.log('City:', response.data.name);
    console.log('Weather:', response.data.weather[0].main);
    console.log('Temperature:', response.data.main.temp, '°C');
    return true;
  } catch (error) {
    console.error('❌ API call failed:', error.message);
    if (error.response) {
      console.error('Error data:', error.response.data);
      console.error('Status code:', error.response.status);
    }
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(50));
  console.log('OPENWEATHER API KEY TEST');
  console.log('='.repeat(50));
  
  const testResult = await testApiKey();
  const providedResult = await testProvidedApiKey();
  
  console.log('\n='.repeat(50));
  console.log('TEST RESULTS');
  console.log('='.repeat(50));
  console.log('Sample API key test:', testResult ? '✅ PASS' : '❌ FAIL');
  console.log('Provided API key test:', providedResult ? '✅ PASS' : '❌ FAIL');
  
  if (!providedResult) {
    console.log('\n⚠️ The provided API key appears to be invalid or inactive.');
    console.log('Possible reasons:');
    console.log('1. The API key may be incorrect in your .env file');
    console.log('2. The API key may not be activated yet (can take up to 2 hours after registration)');
    console.log('3. The API key may have been deactivated or reached its usage limit');
    console.log('\nPlease verify the API key at https://home.openweathermap.org/api_keys');
  }
}

runTests();