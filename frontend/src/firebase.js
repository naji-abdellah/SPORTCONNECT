import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "sportconnect-818cd",
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyPlaceholderKey",
  authDomain: "sportconnect-818cd.firebaseapp.com",
  storageBucket: "sportconnect-818cd.appspot.com",
  messagingSenderId: "114916117615480984770",
  appId: "1:114916117615480984770:web:sportconnect"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
