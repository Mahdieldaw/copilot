// src/firebase.ts

import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import type { Functions } from "firebase/functions";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const firestore: Firestore = getFirestore(app);
const functions: Functions = getFunctions(app);

// Connect to Firebase Emulators in development mode
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  try {
    // Connect to Auth Emulator
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('Connected to Firebase Auth Emulator');
    
    // Connect to Firestore Emulator
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    console.log('Connected to Firestore Emulator');
    
    // Connect to Functions Emulator
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('Connected to Firebase Functions Emulator');
    
    console.log('All Firebase Emulators connected successfully!');
  } catch (error) {
    console.error('Error connecting to Firebase Emulators:', error);
  }
}

// Export Firebase instances
export { app, auth, firestore, functions };
