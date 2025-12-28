import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api';
import { setAuthData, type LoginResponse } from '../../utils/auth';
import PrimaryButton from '../componenetsss/PrimaryButton';
import aforoLogo from './aforo.aifinal .svg';
import dashboardBlurBg from './sign in with dashboard blur.svg';
import './SignIn.css';

const PERSONAL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'outlook.com', 'hotmail.com',
  'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com', 'proton.me', 'protonmail.com',
  'pm.me', 'aol.com', 'gmx.com', 'mail.com', 'yandex.com', 'zoho.com', 'fastmail.com'
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
      const redirectTo = '/get-started';
      navigate(redirectTo);
      onSuccess?.();
    } catch (err: any) {
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      if (err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (err.message?.includes('401') || err.message?.toLowerCase?.().includes('invalid credentials')) {
        errorMessage = 'Invalid credentials';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signin-page" style={{ backgroundImage: `url(${dashboardBlurBg})` }}>
      <div className="signin-card">
        <div className="signin-background-decoration">
          <svg xmlns="http://www.w3.org/2000/svg" width="381" height="418" viewBox="0 0 381 418" fill="none">
            <g opacity="0.4" filter="url(#filter0_f_12301_9099)">
              <path d="M488.199 376.709C503.63 402.582 511.346 415.518 509.45 425.169C507.555 434.821 497.376 434.425 477.018 433.633L152.062 420.996C121.521 419.809 106.25 419.215 101.278 406.436C96.3046 393.658 106.138 380.281 125.805 353.526L301.044 115.136C309.1 104.176 313.128 98.6966 318.692 100.264C324.256 101.831 328.998 109.781 338.481 125.682L488.199 376.709Z" fill="url(#paint0_linear_12301_9099)" />
            </g>
            <defs>
              <filter id="filter0_f_12301_9099" x="0" y="0" width="609.734" height="534.002" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="30" result="effect1_foregroundBlur_12301_9099" />
              </filter>
              <linearGradient id="paint0_linear_12301_9099" x1="262.252" y1="574.64" x2="524.1" y2="266.911" gradientUnits="userSpaceOnUse">
                <stop stop-color="#EDF8FD" />
                <stop offset="1" stop-color="#0092DF" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="signin-header">
          <div className='signin-logo'>
<svg xmlns="http://www.w3.org/2000/svg" width="57" height="49" viewBox="0 0 57 49" fill="none">
  <path d="M23.2003 44.9616L18.7809 33.8246C17.7817 31.3067 17.2822 30.0478 17.6797 29.8179C18.0772 29.588 18.9192 30.6489 20.6032 32.7707L30.118 44.7594C31.1279 46.0318 31.6328 46.668 32.2708 47.1134C32.7356 47.4379 33.2494 47.6861 33.7926 47.8485C34.538 48.0713 35.3502 48.0713 36.9747 48.0713C46.0434 48.0713 50.5778 48.0713 53.1266 46.0348C54.9426 44.5838 56.1501 42.506 56.5117 40.2098C57.0191 36.987 54.7742 33.0474 50.2843 25.1681L48.3052 21.6949C40.388 7.80095 36.4293 0.853964 30.5047 0.0965767C29.6444 -0.0133982 28.7747 -0.0295477 27.9109 0.0484123C21.9622 0.585319 17.7484 7.38056 9.32081 20.971L7.57389 23.7881C2.11934 32.5842 -0.607939 36.9822 0.11459 40.5899C0.495721 42.4929 1.46207 44.2292 2.8785 45.556C5.56369 48.0713 10.7387 48.0713 21.0887 48.0713C22.332 48.0713 22.9537 48.0713 23.3223 47.7671C23.518 47.6055 23.6635 47.3913 23.7414 47.1498C23.8882 46.695 23.6589 46.1172 23.2003 44.9616Z" fill="url(#paint0_linear_15332_26720)"/>
  <defs>
    <linearGradient id="paint0_linear_15332_26720" x1="59.9664" y1="48.0713" x2="19.2163" y2="62.3876" gradientUnits="userSpaceOnUse">
      <stop stop-color="#025A94"/>
      <stop offset="1" stop-color="#034A7D"/>
    </linearGradient>
  </defs>
</svg>    
</div>    </div>

        <h2 className="signin-title">Sign in to your aforo account</h2>

        <form className="signin-form" noValidate onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="email">Business Email</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.currentTarget.value); if (emailError) setEmailError(null); }}
            autoComplete="username"
            className={`field-input ${emailError ? 'is-error' : ''}`}
            required
          />
          {emailError && <p id="email-error" className="field-error" role="alert">{emailError}</p>}

          <div className="password-row">
            <label className="field-label" htmlFor="password">Password</label>
            <a className="forgot-link" href="#">Forgot password?</a>
          </div>

          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPassword(e.currentTarget.value); if (passwordError) setPasswordError(null); }}
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-closed-icon lucide-eye-closed"><path d="m15 18-.722-3.25" /><path d="M2 8a10.645 10.645 0 0 0 20 0" /><path d="m20 15-1.726-2.05" /><path d="m4 15 1.726-2.05" /><path d="m9 18 .722-3.25" /></svg>
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
            <div className="primary-btn-text">Sign In</div>
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
