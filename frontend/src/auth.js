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

// Determine the backend URL based on environment
export const getBackendUrl = () => {
  // In production, you'll need to set your actual backend URL
  // For now, we're defaulting to localhost for development
  // You should replace this with your actual deployed backend URL
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  // Default to localhost for development
  return 'http://localhost:5000';
};

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);