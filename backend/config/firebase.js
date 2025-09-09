const admin = require('firebase-admin');

let db, auth;

// Initialize Firebase Admin SDK only if credentials are provided
const initializeFirebase = () => {
  try {
    const requiredEnvVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL'
    ];

    const hasValidConfig = requiredEnvVars.every(varName => 
      process.env[varName] && 
      !process.env[varName].includes('your_') && 
      process.env[varName].trim() !== ''
    );

    if (!hasValidConfig) {
      console.warn('⚠️ Firebase configuration missing. Auth features will be disabled.');
      console.warn('Please set up Firebase credentials in your .env file');
      return null;
    }

    const serviceAccount = {
      type: process.env.FIREBASE_TYPE || 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return {
      admin,
      db: admin.firestore(),
      auth: admin.auth()
    };
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.warn('Auth features will be disabled until Firebase is properly configured');
    return null;
  }
};

const firebaseApp = initializeFirebase();

// Export with fallbacks
module.exports = {
  admin: firebaseApp?.admin || null,
  db: firebaseApp?.db || null,
  auth: firebaseApp?.auth || null,
  isFirebaseEnabled: !!firebaseApp
};