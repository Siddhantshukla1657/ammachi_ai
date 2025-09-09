const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testSimple() {
  console.log('🧪 Testing Simple Authentication...\n');

  try {
    // Test 1: Check database connections
    console.log('1️⃣ Testing database connections...');
    const testResponse = await axios.get(`${BASE_URL}/test`);
    console.log('✅ Database Status:', testResponse.data);
    console.log('');

    // Test 2: Test Firebase authentication directly
    console.log('2️⃣ Testing Firebase authentication...');
    const firebaseAuth = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBz5bfo2djYxt60UzyvNWQ9sAayGl-xC1s`,
      {
        email: 'test@example.com',
        password: 'password123',
        returnSecureToken: true
      }
    );
    console.log('✅ Firebase registration successful');
    console.log('User ID:', firebaseAuth.data.localId);
    console.log('Email:', firebaseAuth.data.email);
    console.log('');

    // Test 3: Test Firebase login
    console.log('3️⃣ Testing Firebase login...');
    const firebaseLogin = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBz5bfo2djYxt60UzyvNWQ9sAayGl-xC1s`,
      {
        email: 'test@example.com',
        password: 'password123',
        returnSecureToken: true
      }
    );
    console.log('✅ Firebase login successful');
    console.log('User ID:', firebaseLogin.data.localId);
    console.log('Email:', firebaseLogin.data.email);
    console.log('');

    console.log('🎉 Firebase authentication is working!');
    console.log('\n📋 Summary:');
    console.log('✅ Firebase authentication working');
    console.log('✅ MongoDB connection working');
    console.log('⚠️ Firestore API needs to be enabled for full backend integration');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Run the test
testSimple();
