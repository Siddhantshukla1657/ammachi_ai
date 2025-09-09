const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testDataFlow() {
  console.log('🧪 Testing Data Flow...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    const testResponse = await axios.get(`${BASE_URL}/test`);
    console.log('✅ Server is running');
    console.log('Database Status:', testResponse.data);
    console.log('');

    // Test 2: Test user registration
    console.log('2️⃣ Testing user registration...');
    const registerData = {
      email: 'testuser@example.com',
      password: 'password123',
      displayName: 'Test User'
    };

    const registerResponse = await axios.post(`${BASE_URL}/register`, registerData);
    console.log('✅ Registration successful');
    console.log('Response:', registerResponse.data);
    console.log('');

    // Test 3: Test user login
    console.log('3️⃣ Testing user login...');
    const loginData = {
      email: 'testuser@example.com',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${BASE_URL}/login`, loginData);
    console.log('✅ Login successful');
    console.log('User:', loginResponse.data.user);
    console.log('Token received:', !!loginResponse.data.token);
    console.log('');

    console.log('🎉 Data flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Server connection working');
    console.log('✅ User registration working');
    console.log('✅ User login working');
    console.log('✅ Data is flowing between frontend and backend');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Full error:', error.message);
  }
}

// Run the test
testDataFlow();
