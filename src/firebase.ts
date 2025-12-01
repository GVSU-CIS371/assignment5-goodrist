import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyC3W4V060V6LIQI5qPXUPfPC4eIGSKy3vc",
  authDomain: "cis371-9e5b2.firebaseapp.com",
  projectId: "cis371-9e5b2",
  storageBucket: "cis371-9e5b2.firebasestorage.app",
  messagingSenderId: "251984419526",
  appId: "1:251984419526:web:1d8867c1d835e31b3055c7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore
const db = getFirestore(app);

// Auth
export const auth = getAuth(app);

// DEFAULT EXPORT REQUIRED BY YOUR STORE
export default db;
