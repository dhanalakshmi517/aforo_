import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../componenetsss/PrimaryButton';
import aforoLogo from './aforo.aifinal .svg';
import dashboardBlurBg from './sign in with dashboard blur.svg';
import './ForgotPassword.css';

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

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleBack = () => {
    navigate('/signin');
  };

  const runValidation = () => {
    const eErr = validateEmail(email);
    setEmailError(eErr);
    return !eErr;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!runValidation()) return;

    const payload = { businessEmail: email.trim() };

    try {
      setIsSubmitting(true);
      // TODO: Replace with actual API call when backend is ready
      // const response = await forgotPasswordAPI(payload);
      
      // Simulate a brief delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to reset link sent page
      navigate('/reset-link-sent', { state: { email: email.trim() } });
      
    } catch (err: any) {
      let errorMessage = 'Failed to send password reset link. Please try again.';
      if (err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgotpwd-page" style={{ backgroundImage: `url(${dashboardBlurBg})` }}>
      <div className="forgotpwd-card">
        <button 
          type="button" 
          className="forgotpwd-back-button" 
          onClick={handleBack}
          aria-label="Go back to sign in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15.834 9.99984H4.16732M4.16732 9.99984L10.0007 4.1665M4.16732 9.99984L10.0007 15.8332" stroke="#034A7D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="forgotpwd-background-decoration">
          <svg xmlns="http://www.w3.org/2000/svg" width="381" height="418" viewBox="0 0 381 418" fill="none">
            <g opacity="0.4" filter="url(#filter0_f_12301_9099)">
              <path d="M488.199 376.709C503.63 402.582 511.346 415.518 509.45 425.169C507.555 434.821 497.376 434.425 477.018 433.633L152.062 420.996C121.521 419.809 106.25 419.215 101.278 406.436C96.3046 393.658 106.138 380.281 125.805 353.526L301.044 115.136C309.1 104.176 313.128 98.6966 318.692 100.264C324.256 101.831 328.998 109.781 338.481 125.682L488.199 376.709Z" fill="url(#paint0_linear_12301_9099)" />
            </g>
            <defs>
              <filter id="filter0_f_12301_9099" x="0" y="0" width="609.734" height="534.002" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="30" result="effect1_foregroundBlur_12301_9099" />
              </filter>
              <linearGradient id="paint0_linear_12301_9099" x1="262.252" y1="574.64" x2="524.1" y2="266.911" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EDF8FD" />
                <stop offset="1" stopColor="#0092DF" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="forgotpwd-header">
          <div className='forgotpwd-logo'>
            <svg xmlns="http://www.w3.org/2000/svg" width="57" height="49" viewBox="0 0 57 49" fill="none">
              <path d="M23.2003 44.9616L18.7809 33.8246C17.7817 31.3067 17.2822 30.0478 17.6797 29.8179C18.0772 29.588 18.9192 30.6489 20.6032 32.7707L30.118 44.7594C31.1279 46.0318 31.6328 46.668 32.2708 47.1134C32.7356 47.4379 33.2494 47.6861 33.7926 47.8485C34.538 48.0713 35.3502 48.0713 36.9747 48.0713C46.0434 48.0713 50.5778 48.0713 53.1266 46.0348C54.9426 44.5838 56.1501 42.506 56.5117 40.2098C57.0191 36.987 54.7742 33.0474 50.2843 25.1681L48.3052 21.6949C40.388 7.80095 36.4293 0.853964 30.5047 0.0965767C29.6444 -0.0133982 28.7747 -0.0295477 27.9109 0.0484123C21.9622 0.585319 17.7484 7.38056 9.32081 20.971L7.57389 23.7881C2.11934 32.5842 -0.607939 36.9822 0.11459 40.5899C0.495721 42.4929 1.46207 44.2292 2.8785 45.556C5.56369 48.0713 10.7387 48.0713 21.0887 48.0713C22.332 48.0713 22.9537 48.0713 23.3223 47.7671C23.518 47.6055 23.6635 47.3913 23.7414 47.1498C23.8882 46.695 23.6589 46.1172 23.2003 44.9616Z" fill="url(#paint0_linear_15332_26720)"/>
              <defs>
                <linearGradient id="paint0_linear_15332_26720" x1="59.9664" y1="48.0713" x2="19.2163" y2="62.3876" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#025A94"/>
                  <stop offset="1" stopColor="#034A7D"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <h2 className="forgotpwd-title">Enter your E-mail address, and We'll send you a Password Reset link.</h2>

        <form className="forgotpwd-form" noValidate onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="email">Business Email</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            placeholder="eg., Leodas@example.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
              setEmail(e.currentTarget.value); 
              if (emailError) setEmailError(null); 
              if (error) setError(null);
              if (successMessage) setSuccessMessage(null);
            }}
            autoComplete="username"
            className={`field-input ${emailError ? 'is-error' : ''}`}
            required
          />
          {emailError && <p id="email-error" className="field-error" role="alert">{emailError}</p>}
          {error && <p className="field-error" role="alert">{error}</p>}
          {successMessage && <p className="field-success" role="status">{successMessage}</p>}

          <PrimaryButton
            type="submit"
            className="forgotpwd-submit-button"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Continue
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
