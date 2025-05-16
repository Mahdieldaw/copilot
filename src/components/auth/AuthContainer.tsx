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