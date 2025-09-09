// Firebase initialization and exports for auth + firestore
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBz5bfo2djYxt60UzyvNWQ9sAayGl-xC1s",
  authDomain: "amaachiai.firebaseapp.com",
  projectId: "amaachiai",
  storageBucket: "amaachiai.firebasestorage.app",
  messagingSenderId: "581124131964",
  appId: "1:581124131964:web:6c28232b19e64d682d0df9",
  measurementId: "G-QFT1JVRS6V"
};

const app = initializeApp(firebaseConfig);
try { getAnalytics(app); } catch (e) { /* analytics may fail in some environments */ }

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
