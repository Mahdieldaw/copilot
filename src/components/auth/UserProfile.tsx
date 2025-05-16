import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfileProps {
  onSignOut?: () => void;
}

export const UserProfile = ({ onSignOut }: UserProfileProps) => {
  const [loading, setLoading] = useState(false);
  const { currentUser, logOut } = useAuth();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logOut();
      if (onSignOut) onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
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