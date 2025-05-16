import { useState } from 'react';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

interface AuthContainerProps {}

export const AuthContainer = ({}: AuthContainerProps) => {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="auth-container">
      {showSignUp ? (
        <SignUp
          onCancel={() => setShowSignUp(false)}
        />
      ) : (
        <SignIn
          onSignUpClick={() => setShowSignUp(true)}
        />
      )}
    </div>
  );

};