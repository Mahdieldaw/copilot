import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SignInProps {
  onSuccess?: () => void;
  onSignUpClick?: () => void;
}

export const SignIn = ({ onSuccess, onSignUpClick }: SignInProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
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
            placeholder="Enter your password"
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