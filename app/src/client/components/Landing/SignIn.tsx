import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api';
import { setAuthData, type LoginResponse } from '../../utils/auth';
import PrimaryButton from '../componenetsss/PrimaryButton';
import aforoLogo from './aforo.aifinal .svg';
import './SignIn.css';

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
        <img src={aforoLogo} alt="aforo.ai" className="signin-logo" />
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
              ) : (
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-closed-icon lucide-eye-closed"><path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/></svg>
              )}
            </button>
            {passwordError && <p id="password-error" className="field-error" role="alert">{passwordError}</p>}
          </div>

          <PrimaryButton 
            type="submit" 
            disabled={isSubmitting}
            fullWidth={true}
            onClick={handleSubmit}
            className="primary-btn"
          >
          Sign In
          </PrimaryButton>
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
