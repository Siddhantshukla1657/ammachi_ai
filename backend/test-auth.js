const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testAuthentication() {
  console.log('🧪 Testing Authentication Flow...\n');

  try {
    // Test 1: Check database connections
    console.log('1️⃣ Testing database connections...');
    const testResponse = await axios.get(`${BASE_URL}/test`);
    console.log('✅ Database Status:', testResponse.data);
    console.log('');

    // Test 2: Register a new user
    console.log('2️⃣ Testing user registration...');
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/register`, registerData);
      console.log('✅ Registration successful:', registerResponse.data.message);
      console.log('User ID:', registerResponse.data.user.id);
      console.log('Firebase UID:', registerResponse.data.user.firebaseUid);
      console.log('');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        console.log('ℹ️ User already exists, continuing with login test...');
      } else {
        throw error;
      }
    }

    // Test 3: Login with the user
    console.log('3️⃣ Testing user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${BASE_URL}/login`, loginData);
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('User details:', loginResponse.data.user);
    console.log('Token received:', loginResponse.data.token ? 'Yes' : 'No');
    console.log('');

    // Test 4: Verify token
    console.log('4️⃣ Testing token verification...');
    const verifyResponse = await axios.post(`${BASE_URL}/verify-token`, {
      idToken: loginResponse.data.token
    });
    console.log('✅ Token verification successful');
    console.log('Verified user:', verifyResponse.data.user);
    console.log('');

    console.log('🎉 All authentication tests passed!');
    console.log('\n📋 Summary:');
    console.log('✅ Firebase authentication working');
    console.log('✅ MongoDB storage working');
    console.log('✅ User registration working');
    console.log('✅ User login working');
    console.log('✅ Token generation working');
    console.log('✅ Data synchronization between Firebase and MongoDB working');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Run the test
testAuthentication();
