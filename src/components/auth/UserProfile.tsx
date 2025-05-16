import { useState } from 'react';

interface UserProfileProps {
  user?: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  } | null;
  onSignOut?: () => void;
}

export const UserProfile = ({ user, onSignOut }: UserProfileProps) => {
  const [loading, setLoading] = useState(false);

  // This is a placeholder function that will be replaced with actual Firebase auth
  // once Firebase is integrated into the project
  const handleSignOut = async () => {
    if (!onSignOut) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="user-profile">
      <div className="user-info">
        <div className="user-avatar">
          {user.photoURL ? (
            <img src={user.photoURL} alt="User avatar" />
          ) : (
            <div className="avatar-placeholder">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
            </div>
          )}
        </div>
        <div className="user-details">
          <div className="user-name">{user.displayName || 'User'}</div>
          <div className="user-email">{user.email}</div>
        </div>
      </div>
      <button 
        onClick={handleSignOut} 
        className="sign-out-button"
        disabled={loading}
      >
        {loading ? 'Signing Out...' : 'Sign Out'}
      </button>
    </div>
  );
};