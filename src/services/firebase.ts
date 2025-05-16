// src/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace the following with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB0GH-IzFy47-NwIg4uruyoUzHhel2xOd4",
  authDomain: "hybrid-thinking.firebaseapp.com",
  projectId: "hybrid-thinking",
  storageBucket: "hybrid-thinking.appspot.com",
  messagingSenderId: "429161076249",
  appId: "1:429161076249:web" // Replace with full App ID if available
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore instances
export const auth = getAuth(app);
export const firestore = getFirestore(app);
