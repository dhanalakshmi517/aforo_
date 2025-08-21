import React from 'react';
import SignIn from '../Landing/SignIn';
import './SignInOverlay.css';

const SignInOverlay: React.FC = () => (
  <div className="signin-backdrop">
    <SignIn />
  </div>
);

export default SignInOverlay;
