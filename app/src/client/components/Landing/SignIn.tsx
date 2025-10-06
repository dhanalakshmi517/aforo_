import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api';
import { setAuthData, type LoginResponse } from '../../utils/auth';
import './SignIn.css';
import SigninLogo from './signin.svg';

const PERSONAL_DOMAINS = new Set([
  'gmail.com','googlemail.com','yahoo.com','yahoo.co.in','outlook.com','hotmail.com',
  'live.com','msn.com','icloud.com','me.com','mac.com','proton.me','protonmail.com',
  'pm.me','aol.com','gmx.com','mail.com','yandex.com','zoho.com','fastmail.com'
]);

const isValidEmailFormat = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isBusinessEmail = (v: string) => {
  const domain = v.split('@')[1]?.toLowerCase();
  return !!domain && !PERSONAL_DOMAINS.has(domain);
};

const validateEmail = (value: string): string | null => {
  const v = value.trim();
  if (!v) return 'Email is required';
  if (!isValidEmailFormat(v)) return 'Enter a valid business Email';
  if (!isBusinessEmail(v)) return 'Enter a valid business Email';
  return null;
};

const validatePassword = (value: string): string | null => {
  if (!value) return 'Password is required';
  // Optional: enforce strength — uncomment if needed
  // if (value.length < 8) return 'Password must be at least 8 characters';
  return null;
};

interface SignInProps { onSuccess?: () => void; }

const SignIn: React.FC<SignInProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runValidation = () => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    return !eErr && !pErr;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!runValidation()) return;

    const payload = { businessEmail: email.trim(), password };

    try {
      setIsSubmitting(true);
      const loginResponse: LoginResponse = await login(payload);
      if (!loginResponse || !('token' in loginResponse) || !loginResponse.token) {
        throw new Error((loginResponse as any)?.message || 'No authentication token received');
      }
      if (!('success' in (loginResponse as any)) || !(loginResponse as any).success) {
        throw new Error((loginResponse as any).message || 'Login failed');
      }
      setAuthData(loginResponse, email.trim());
      const redirectTo = '/get-started/products';
      navigate(redirectTo);
      onSuccess?.();
    } catch (err: any) {
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      if (err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (err.message?.includes('401') || err.message?.toLowerCase?.().includes('invalid credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <div className="signin-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="37" viewBox="0 0 40 37" fill="none">
  <path d="M18.366 0.845861C16.5503 1.36461 13.5027 5.81718 12.2058 7.97863C16.0964 10.2481 19.6628 15.7598 23.2292 19.3262C26.7956 22.8926 28.0925 22.5684 30.0378 22.5684C31.594 22.5684 34.1445 21.2715 35.2252 20.6231C33.2799 17.1648 28.7409 9.27549 26.1472 5.38489C22.905 0.521645 20.6355 0.197428 18.366 0.845861Z" fill="url(#paint0_linear_8295_41437)"/>
  <path d="M39.44 29.7011C39.1807 28.6636 37.0351 24.0267 36.4947 22.8379C34.9385 24.3941 33.388 25.8639 32.3073 26.4043C24.5261 30.2949 17.0691 24.7832 12.5301 21.2168C8.89884 18.3637 7.47802 17.2181 6.72151 17.002C6.28922 17.7585 3.9059 22.309 1.83092 26.459C-0.762816 31.6464 0.53405 33.916 2.80357 35.2128C5.07308 36.5097 9.93633 36.8339 18.6902 36.8339H18.6903C27.4441 36.8339 32.9557 36.8339 36.5221 35.537C40.0885 34.2402 39.7643 30.998 39.44 29.7011Z" fill="url(#paint1_linear_8295_41437)"/>
  <defs>
    <linearGradient id="paint0_linear_8295_41437" x1="37.7611" y1="36.8339" x2="14.7529" y2="44.1875" gradientUnits="userSpaceOnUse">
      <stop stopColor="#025A94"/>
      <stop offset="1" stopColor="#00365A"/>
    </linearGradient>
    <linearGradient id="paint1_linear_8295_41437" x1="37.7611" y1="36.8339" x2="14.7529" y2="44.1875" gradientUnits="userSpaceOnUse">
      <stop stopColor="#025A94"/>
      <stop offset="1" stopColor="#00365A"/>
    </linearGradient>
  </defs>
</svg>
          <img src={SigninLogo} alt="aforo logo" className="signin-logo" />

        </div>

        <h2 className="signin-title">Sign in to your aforo account</h2>

        <form className="signin-form" noValidate onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="email">Business Email*</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.currentTarget.value); if (emailError) setEmailError(null); }}
            onBlur={() => setEmailError(validateEmail(email))}
            autoComplete="username"
            className={`field-input ${emailError ? 'is-error' : ''}`}
            required
          />
          {emailError && <p id="email-error" className="field-error" role="alert">{emailError}</p>}

          <div className="password-row">
            <label className="field-label" htmlFor="password">Password*</label>
            <a className="forgot-link" href="#">Forgot password?</a>
          </div>

          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPassword(e.currentTarget.value); if (passwordError) setPasswordError(null); }}
              onBlur={() => setPasswordError(validatePassword(password))}
              autoComplete="current-password"
              className={`field-input ${passwordError ? 'is-error' : ''}`}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14" fill="none">
  <path d="M1.72006 6.9333C1.65061 6.74621 1.65061 6.5404 1.72006 6.35331C2.39647 4.71318 3.54465 3.31084 5.01903 2.32405C6.49341 1.33727 8.22759 0.810486 10.0017 0.810486C11.7759 0.810486 13.51 1.33727 14.9844 2.32405C16.4588 3.31084 17.607 4.71318 18.2834 6.35331C18.3528 6.5404 18.3528 6.74621 18.2834 6.9333C17.607 8.57343 16.4588 9.97577 14.9844 10.9626C13.51 11.9493 11.7759 12.4761 10.0017 12.4761C8.22759 12.4761 6.49341 11.9493 5.01903 10.9626C3.54465 9.97577 2.39647 8.57343 1.72006 6.9333Z" stroke="#B3B8BC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M10.0017 9.1433C11.3824 9.1433 12.5017 8.02402 12.5017 6.64331C12.5017 5.26259 11.3824 4.14331 10.0017 4.14331C8.62101 4.14331 7.50172 5.26259 7.50172 6.64331C7.50172 8.02402 8.62101 9.1433 10.0017 9.1433Z" stroke="#B3B8BC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
              ) : (
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
  <path d="M8.94394 4.36802C10.8851 4.13669 12.8486 4.54704 14.5347 5.53639C16.2207 6.52575 17.5366 8.03975 18.2814 9.84719C18.3509 10.0343 18.3509 10.2401 18.2814 10.4272C17.9752 11.1697 17.5704 11.8676 17.0781 12.5022M11.7364 11.9364C11.2649 12.3917 10.6334 12.6437 9.97793 12.638C9.32244 12.6323 8.69541 12.3694 8.23189 11.9059C7.76837 11.4424 7.50545 10.8153 7.49975 10.1599C7.49406 9.50436 7.74604 8.87286 8.20144 8.40135M14.5656 14.7205C13.4602 15.3753 12.2268 15.7847 10.9492 15.9208C9.67165 16.057 8.37973 15.9167 7.16113 15.5096C5.94253 15.1024 4.82576 14.4379 3.88661 13.5611C2.94746 12.6844 2.2079 11.6158 1.7181 10.428C1.64865 10.2409 1.64865 10.0351 1.7181 9.84802C2.45696 8.05623 3.757 6.55239 5.4231 5.56219M1.66644 1.80469L18.3331 18.4714" stroke="#706C72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
              )}
            </button>
            {passwordError && <p id="password-error" className="field-error" role="alert">{passwordError}</p>}
          </div>

          <button className="primary-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
          {error && <p className="error-msg" role="alert">{error}</p>}
        </form>

        <p className="signin-footer">
          Don’t have an account? <a href="/contact-sales">Contact Sales</a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
