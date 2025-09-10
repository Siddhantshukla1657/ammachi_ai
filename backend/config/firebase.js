const admin = require('firebase-admin');
const serviceAccount = require('../credentials/amaachiai-f879ccf99f8e.json');

let db, auth;

// Initialize Firebase Admin SDK using service account key
const initializeFirebase = () => {
  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
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