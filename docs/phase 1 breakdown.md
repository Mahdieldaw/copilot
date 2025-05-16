Phase 1: Firebase Project Setup & Authentication - Part 1
Objective: Lay the groundwork with Firebase project initialization, core Firebase services, and basic user authentication.

Here's a breakdown of the steps involved:

1. Initialize Firebase Project
Steps to Set Up a New Firebase Project in the Firebase Console:
Go to the Firebase Console: Open your web browser and navigate to https://console.firebase.google.com/. You'll need to sign in with your Google account.

Create a Project:

Click on "Add project" (or "Create a project").

Enter your project name: Choose a descriptive name, for example, HybridThinkingWorkflow. Firebase will generate a unique project ID (e.g., hybridthinkingworkflow-abcd). You can edit this ID if needed, but it must be globally unique.

Click "Continue".

Google Analytics (Optional but Recommended):

You'll be asked if you want to enable Google Analytics for your Firebase project. It's generally recommended for understanding app usage, but you can choose to disable it for now if you prefer.

If you enable it, you'll need to select or create a Google Analytics account.

Click "Continue" (or "Create project" if you disabled Analytics).

Project Creation: Firebase will provision your project. This might take a few moments.

Project Ready: Once ready, click "Continue". You'll be taken to your project's dashboard.

Explain How to Enable Firestore (Native Mode) and Firebase Authentication:
Once your Firebase project is created and you're on the project dashboard:

A. Enable Firestore (Native Mode):

Navigate to Firestore Database: In the left-hand navigation pane, under "Build", click on "Firestore Database".

Create Database: Click the "Create database" button.

Choose Mode (Production vs. Test):

You'll be prompted to start in Production mode or Test mode.

Production mode: Starts with secure rules, denying all reads and writes by default. You'll need to explicitly define rules for access. This is the recommended starting point for real applications.

Test mode: Starts with open rules, allowing all reads and writes for a limited time (usually 30 days). This is useful for quick prototyping but must be secured before launch.

For this project, let's start in Production mode.

Click "Next".

Choose Firestore Location:

Select a Cloud Firestore location. This is the region where your data will be stored. Choose a location that's close to your users for lower latency. This setting cannot be changed later.

Click "Enable".

Firestore will now be provisioned for your project.

B. Enable Firebase Authentication:

Navigate to Authentication: In the left-hand navigation pane, under "Build", click on "Authentication".

Get Started: Click the "Get started" button. This will take you to the "Sign-in method" tab.

Enable Email/Password Sign-in:

Under "Sign-in providers", find "Email/Password" and click on it.

Toggle the "Enable" switch to the on position.

You can leave "Email link (passwordless sign-in)" disabled for now unless you specifically want it.

Click "Save".

Email/Password authentication is now enabled for your project. You can enable other providers (like Google, Facebook, etc.) here later if needed.

2. Implement Firebase Auth in the Frontend App (React/Vite/TypeScript)
Here's how you can integrate Firebase Authentication into your existing React/Vite/TypeScript frontend.

A. Install the Firebase SDK:
Open your terminal in the root directory of your frontend project (e.g., mahdieldaw-copilot/) and run:

npm install firebase
# or
yarn add firebase

B. Initialize Firebase in the Frontend Application:
Get Firebase Configuration:

In the Firebase console, go to your project's dashboard.

Click on the Settings icon (gear icon) next to "Project Overview" and select "Project settings".

In the "General" tab, scroll down to the "Your apps" section.

Click on the Web icon </> to register a new web app (if you haven't already).

Enter an "App nickname" (e.g., "HybridThinking Web App").

Optionally, set up Firebase Hosting if you plan to use it.

Click "Register app".

Firebase will provide you with a firebaseConfig object. Copy this object. It will look something like this:

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional, if Analytics is enabled
};

Create a Firebase Initialization File:
It's good practice to initialize Firebase in a separate file. Create a file, for example, src/services/firebase.ts (or src/firebase.ts):

// src/services/firebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// IMPORTANT: Replace with your actual config values
// It's highly recommended to store these in environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Optional
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app); // Initialize Firestore

export { app, auth, db };

Environment Variables Setup (Vite):

Create a .env file in the root of your Vite project (e.g., mahdieldaw-copilot/.env).

Add your Firebase config values prefixed with VITE_:

VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
# VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID # Optional

Ensure .env is listed in your .gitignore file to avoid committing secrets.

Vite automatically loads these environment variables.

Import and Use in Your App:
You can import auth and db where needed, but typically you'd initialize Firebase once when your app starts, for example, in src/main.tsx (though just creating the firebase.ts file and importing it elsewhere is usually enough for initialization to occur).

C. Implement Email/Password Authentication:
You can create helper functions or hooks for these operations. Here are examples using the auth instance from src/services/firebase.ts.

Sign-up Function:

// Example usage within a React component or auth service file
import { createUserWithEmailAndPassword, UserCredential, updateProfile } from 'firebase/auth';
import { auth } from './services/firebase'; // Adjust path if necessary

interface SignUpResponse {
  success: boolean;
  userId?: string;
  error?: string;
}

export const signUpWithEmailPassword = async (email: string, password: string, displayName?: string): Promise<SignUpResponse> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Optionally, update the user's profile with a display name
    if (displayName && user) {
      await updateProfile(user, { displayName });
    }

    console.log('User signed up successfully:', user.uid);
    return { success: true, userId: user.uid };
  } catch (error: any) {
    console.error('Error signing up:', error.message);
    return { success: false, error: error.message };
  }
};

Sign-in Function:

// Example usage
import { signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { auth } from './services/firebase'; // Adjust path

interface SignInResponse {
  success: boolean;
  userId?: string;
  error?: string;
}

export const signInWithEmailPassword = async (email: string, password: string): Promise<SignInResponse> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('User signed in successfully:', user.uid);
    // Here you might also want to update `lastLogin` in Firestore (covered in Part 2)
    return { success: true, userId: user.uid };
  } catch (error: any) {
    console.error('Error signing in:', error.message);
    return { success: false, error: error.message };
  }
};

Sign-out Function:

// Example usage
import { signOut } from 'firebase/auth';
import { auth } from './services/firebase'; // Adjust path

interface SignOutResponse {
  success: boolean;
  error?: string;
}

export const signOutUser = async (): Promise<SignOutResponse> => {
  try {
    await signOut(auth);
    console.log('User signed out successfully.');
    return { success: true };
  } catch (error: any) {
    console.error('Error signing out:', error.message);
    return { success: false, error: error.message };
  }
};

D. Set up onAuthStateChanged Logic:
This observer listens for changes in the user's authentication state. It's crucial for updating your UI, managing protected routes, and knowing if a user is signed in or out.

You typically set this up in a top-level component of your application (e.g., App.tsx) or within a dedicated authentication context/provider.

Example in App.tsx or an Auth Context:

// src/App.tsx or a dedicated AuthContext.tsx

import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase'; // Adjust path

// Define a type for your auth context value
interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
}

// Create the context with a default undefined value to check if provider is used
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // To handle initial auth state loading

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
      if (user) {
        console.log('User is signed in:', user.uid);
        // You can fetch additional user profile data from Firestore here
      } else {
        console.log('User is signed out.');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    isLoading,
  };

  // Don't render children until loading is complete to avoid flicker or premature route access
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Then, wrap your application with AuthProvider in src/main.tsx or App.tsx
// Example in src/main.tsx:
/*
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext'; // Adjust path
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
*/

// Example usage of useAuth in a component:
/*
const MyComponent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <p>Loading authentication state...</p>;
  }

  if (currentUser) {
    return <p>Welcome, {currentUser.displayName || currentUser.email}!</p>;
  } else {
    return <p>Please sign in.</p>;
    // Potentially redirect to login page
  }
};
*/

This covers the initial setup of your Firebase project and the core client-side authentication mechanisms. Once you've reviewed this, we can proceed to Part 2 of Phase 1, which involves setting up Firestore collections and basic security rules.