import { useState } from 'react';

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

  // This is a placeholder function that will be replaced with actual Firebase auth
  // once Firebase is integrated into the project
  const handleSignUp = async (email: string, password: string, displayName: string) => {
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email && password.length >= 6) {
          resolve();
        } else {
          reject(new Error('Invalid email or password (must be at least 6 characters)'));
        }
      }, 1000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await handleSignUp(email, password, displayName);
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
            placeholder="Enter your name"
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
            placeholder="Enter your email"
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
            placeholder="Enter your password (min 6 characters)"
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