import { useState } from 'react';
import { AuthContainer } from '../components/auth/AuthContainer';
import { UserProfile } from '../components/auth/UserProfile';
import '../styles/auth.css';
import '../styles/user-profile.css';

export const AuthDemo = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  } | null>(null);

  const handleAuthSuccess = () => {
    // Simulate successful authentication
    setIsAuthenticated(true);
    setUser({
      displayName: 'Demo User',
      email: 'user@example.com',
      photoURL: null
    });
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="auth-demo-container">
      <div className="auth-demo-header">
        <h1>Hybrid Thinking Workflow</h1>
        {isAuthenticated && user && (
          <UserProfile user={user} onSignOut={handleSignOut} />
        )}
      </div>

      <div className="auth-demo-content">
        {!isAuthenticated ? (
          <>
            <div className="auth-demo-welcome">
              <h2>Welcome to Hybrid Thinking Workflow</h2>
              <p>Sign in to access your workflows and templates</p>
            </div>
            <AuthContainer onAuthSuccess={handleAuthSuccess} />
          </>
        ) : (
          <div className="auth-demo-dashboard">
            <h2>Dashboard</h2>
            <p>Welcome, {user?.displayName || 'User'}! You are now signed in.</p>
            <p>This is a placeholder for the main application content.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .auth-demo-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .auth-demo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }
        
        .auth-demo-header h1 {
          margin: 0;
          color: #333;
          font-size: 1.75rem;
        }
        
        .auth-demo-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .auth-demo-welcome {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .auth-demo-welcome h2 {
          margin-top: 0;
          color: #333;
        }
        
        .auth-demo-welcome p {
          color: #666;
          margin-bottom: 2rem;
        }
        
        .auth-demo-dashboard {
          width: 100%;
          max-width: 800px;
          padding: 2rem;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .auth-demo-dashboard h2 {
          margin-top: 0;
          color: #333;
        }
      `}</style>
    </div>
  );
};