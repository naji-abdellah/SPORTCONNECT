import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "sportconnect-demo-d5d71",
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBx34ei88o-bKLYWYdTSPTAiwtdpm_NOc4",
  authDomain: "sportconnect-demo-d5d71.firebaseapp.com",
  storageBucket: "sportconnect-demo-d5d71.firebasestorage.app",
  messagingSenderId: "680509527495",
  appId: "1:680509527495:web:6828a13f7376ee26e235e2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
