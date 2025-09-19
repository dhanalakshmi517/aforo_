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
  if (!isValidEmailFormat(v)) return 'Enter a valid email address (e.g., name@company.com)';
  if (!isBusinessEmail(v)) return 'Please use your business email (no Gmail/Outlook/etc.)';
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
          <svg aria-hidden="true" width="40" height="37" viewBox="0 0 40 37" fill="none">
            <path d="M18.366 0.845861C16.5503 1.36461 13.5027 5.81718 12.2058 7.97863C16.0964 10.2481 19.6628 15.7598 23.2292 19.3262C26.7956 22.8926 28.0925 22.5684 30.0378 22.5684C31.594 22.5684 34.1445 21.2715 35.2252 20.6231C33.2799 17.1648 28.7409 9.27549 26.1472 5.38489C22.905 0.521645 20.6355 0.197428 18.366 0.845861Z" fill="url(#paint0)"/>
            <path d="M39.44 29.7011C39.1807 28.6636 37.0351 24.0267 36.4947 22.8379C34.9385 24.3941 33.388 25.8639 32.3073 26.4043C24.5261 30.2949 17.0691 24.7832 12.5301 21.2168C8.89884 18.3637 7.47802 17.2181 6.72151 17.002C6.28922 17.7585 3.9059 22.309 1.83092 26.459C-0.762816 31.6464 0.53405 33.916 2.80357 35.2128C5.07308 36.5097 9.93633 36.8339 18.6902 36.8339C27.4441 36.8339 32.9557 36.8339 36.5221 35.537C40.0885 34.2402 39.7643 30.998 39.44 29.7011Z" fill="url(#paint1)"/>
            <defs>
              <linearGradient id="paint0" x1="37.7611" y1="36.8339" x2="14.7529" y2="44.1875" gradientUnits="userSpaceOnUse">
                <stop stopColor="#025A94"/><stop offset="1" stopColor="#00365A"/>
              </linearGradient>
              <linearGradient id="paint1" x1="37.7611" y1="36.8339" x2="14.7529" y2="44.1875" gradientUnits="userSpaceOnUse">
                <stop stopColor="#025A94"/><stop offset="1" stopColor="#00365A"/>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-eye-off-icon lucide-eye-off"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
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
