# Firebase Authentication Implementation Guide

## 1. Firebase Project Setup

### 1.1 Create a New Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click on "Add project"
3. Enter a project name (e.g., "Hybrid Thinking Workflow")
4. Choose whether to enable Google Analytics (recommended)
5. Accept the terms and click "Create project"

### 1.2 Enable Firestore (Native Mode)

1. In the Firebase console, navigate to your project
2. In the left sidebar, click on "Firestore Database"
3. Click "Create database"
4. Choose "Start in production mode" (recommended for most applications)
5. Select a location closest to your users (this affects latency)
6. Click "Enable"

### 1.3 Enable Firebase Authentication

1. In the Firebase console, navigate to your project
2. In the left sidebar, click on "Authentication"
3. Click "Get started"
4. Under "Sign-in method", enable "Email/Password"
5. Toggle "Email/Password" to "Enabled"
6. Click "Save"

## 2. Frontend Integration

### 2.1 Install Firebase SDK

```bash
npm install firebase
```

### 2.2 Initialize Firebase in Your Application

Create a new file `src/services/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;
```

### 2.3 Create Authentication Service

Create a new file `src/services/auth.ts`:

```typescript
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from './firebase';

// Sign up with email and password
export const signUp = async (email: string, password: string, displayName: string): Promise<UserCredential> => {
  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    await setDoc(doc(firestore, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      displayName: displayName || email.split('@')[0], // Use part of email if no display name
      email: email,
      role: 'user',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      preferences: {
        defaultModelProvider: 'gemini',
        defaultTemperature: 0.7,
        uiTheme: 'light',
        notificationPreferences: {
          email: true,
          inApp: true
        }
      },
      subscriptionTier: 'free',
      usage: {
        promptCount: 0,
        tokensUsed: 0,
        lastResetDate: serverTimestamp()
      }
    });
    
    return userCredential;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign out
export const logOut = async (): Promise<void> => {
  try {
    return await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback: (user: User | null) => void): () => void => {
  return onAuthStateChanged(auth, callback);
};
```

## 3. Authentication UI Components

### 3.1 Create Authentication Context

Create a new file `src/context/AuthContext.tsx`:

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthChanges } from '../services/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

### 3.2 Create Sign Up Component

Create a new file `src/components/auth/SignUp.tsx`:

```typescript
import { useState } from 'react';
import { signUp } from '../../services/auth';

interface SignUpProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SignUp = ({ onSuccess, onCancel }: SignUpProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, displayName);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Create Account</h2>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="displayName">Name</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
          />
        </div>
        <div className="auth-actions">
          <button type="submit" disabled={loading} className="primary-button">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="secondary-button">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
```

### 3.3 Create Sign In Component

Create a new file `src/components/auth/SignIn.tsx`:

```typescript
import { useState } from 'react';
import { signIn } from '../../services/auth';

interface SignInProps {
  onSuccess?: () => void;
  onSignUpClick?: () => void;
}

export const SignIn = ({ onSuccess, onSignUpClick }: SignInProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Sign In</h2>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="auth-actions">
          <button type="submit" disabled={loading} className="primary-button">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </form>
      <div className="auth-alternate">
        <p>Don't have an account?</p>
        <button onClick={onSignUpClick} className="text-button">
          Create Account
        </button>
      </div>
    </div>
  );
};
```

### 3.4 Create Auth Container Component

Create a new file `src/components/auth/AuthContainer.tsx`:

```typescript
import { useState } from 'react';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

interface AuthContainerProps {
  onAuthSuccess?: () => void;
}

export const AuthContainer = ({ onAuthSuccess }: AuthContainerProps) => {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="auth-container">
      {showSignUp ? (
        <SignUp
          onSuccess={onAuthSuccess}
          onCancel={() => setShowSignUp(false)}
        />
      ) : (
        <SignIn
          onSuccess={onAuthSuccess}
          onSignUpClick={() => setShowSignUp(true)}
        />
      )}
    </div>
  );
};
```

### 3.5 Create User Profile Component

Create a new file `src/components/auth/UserProfile.tsx`:

```typescript
import { useAuth } from '../../context/AuthContext';
import { logOut } from '../../services/auth';

export const UserProfile = () => {
  const { currentUser } = useAuth();

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="user-profile">
      <div className="user-info">
        <div className="user-avatar">
          {currentUser.photoURL ? (
            <img src={currentUser.photoURL} alt="User avatar" />
          ) : (
            <div className="avatar-placeholder">
              {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || '?'}
            </div>
          )}
        </div>
        <div className="user-details">
          <div className="user-name">{currentUser.displayName || 'User'}</div>
          <div className="user-email">{currentUser.email}</div>
        </div>
      </div>
      <button onClick={handleSignOut} className="sign-out-button">
        Sign Out
      </button>
    </div>
  );
};
```

## 4. Protected Routes

Create a new file `src/components/auth/PrivateRoute.tsx`:

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PrivateRoute = ({ 
  children, 
  redirectTo = '/login' 
}: PrivateRouteProps) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to={redirectTo} />;
  }

  return <>{children}</>;
};
```

## 5. Integration with App Component

Update your main App component to use the AuthProvider and implement protected routes:

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { AuthContainer } from './components/auth/AuthContainer';
import { UserProfile } from './components/auth/UserProfile';
// Import your other components

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <header className="app-header">
            <h1>Hybrid Thinking Workflow</h1>
            <UserProfile />
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/login" element={<AuthContainer />} />
              <Route path="/" element={
                <PrivateRoute>
                  {/* Your main application component */}
                  <div>Main Application Content</div>
                </PrivateRoute>
              } />
              {/* Add other routes as needed */}
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

## 6. CSS Styling for Authentication Components

Create a new file `src/styles/auth.css`:

```css
/* Auth Container */
.auth-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Auth Form */
.auth-form-container h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #555;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.auth-error {
  background-color: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

/* Buttons */
.auth-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.primary-button {
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  flex: 1;
}

.primary-button:hover {
  background-color: #1976d2;
}

.primary-button:disabled {
  background-color: #bbdefb;
  cursor: not-allowed;
}

.secondary-button {
  background-color: transparent;
  color: #555;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.secondary-button:hover {
  background-color: #f5f5f5;
}

.text-button {
  background: none;
  border: none;
  color: #2196f3;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.text-button:hover {
  color: #1976d2;
}

/* Auth Alternate */
.auth-alternate {
  margin-top: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.auth-alternate p {
  margin: 0;
  color: #666;
}

/* User Profile */
.user-profile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 1.25rem;
  font-weight: bold;
  color: #757575;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.user-email {
  font-size: 0.875rem;
  color: #666;
}

.sign-out-button {
  background-color: transparent;
  color: #555;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sign-out-button:hover {
  background-color: #eeeeee;
}
```

## 7. Import CSS in Main File

Update your `src/main.tsx` or `src/index.tsx` to import the auth styles:

```typescript
import './styles/auth.css';
// Other imports
```

## 8. Environment Variables

Create a `.env` file in the root of your project to store Firebase configuration:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Then update your `firebase.ts` file to use these environment variables:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## 9. Testing Authentication

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Test the sign-up functionality by creating a new account
4. Verify that you can sign in with the created account
5. Test the sign-out functionality
6. Verify that protected routes redirect to the login page when not authenticated

## 10. Next Steps

1. Add password reset functionality
2. Implement social authentication (Google, GitHub, etc.)
3. Add email verification
4. Enhance user profile management
5. Implement role-based access control
6. Add account deletion functionality

This completes the basic setup for Firebase authentication in your Hybrid Thinking Workflow application. You now have a solid foundation for user management that you can build upon as your application grows.