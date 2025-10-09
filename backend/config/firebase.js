const admin = require('firebase-admin');

let db, auth;

// Initialize Firebase Admin SDK using environment variables
const initializeFirebase = () => {
  try {
    // Check if required environment variables are present
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      console.warn('⚠️ Firebase environment variables not configured. Auth features will be disabled.');
      return null;
    }

    // Properly format the private key
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    // If it's a JSON string, parse it
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      // Remove surrounding quotes and unescape
      privateKey = privateKey.slice(1, -1).replace(/\\n/g, '\n');
    } else if (privateKey.includes('\\n')) {
      // Replace escaped newlines with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    // Ensure the private key has proper line breaks
    if (privateKey.includes('\n') === false && privateKey.includes('\\n') === false) {
      // If it looks like a single line key, we might need to format it
      console.log('Firebase private key may need formatting');
    }

    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
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
    console.error('Error stack:', error.stack);
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