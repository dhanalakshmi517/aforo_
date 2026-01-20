import * as React from 'react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import dashboardBlurBg from './sign in with dashboard blur.svg';
import './ResetLinkSent.css';

const ResetLinkSent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isResending, setIsResending] = useState(false);
  const email = (location.state as any)?.email || '';

  const handleBack = () => {
    navigate('/signin');
  };

  const handleSendAgain = async () => {
    setIsResending(true);
    
    try {
      // TODO: Replace with actual API call when backend is ready
      // await resendResetLinkAPI({ businessEmail: email });
      
      // Temporary simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success feedback (could add a toast notification here)
      console.log('Reset link sent again to:', email);
      
    } catch (err) {
      console.error('Failed to resend reset link:', err);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="resetlink-page" style={{ backgroundImage: `url(${dashboardBlurBg})` }}>
      <div className="resetlink-card">
        <button 
          type="button" 
          className="resetlink-back-button" 
          onClick={handleBack}
          aria-label="Go back to sign in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15.834 9.99984H4.16732M4.16732 9.99984L10.0007 4.1665M4.16732 9.99984L10.0007 15.8332" stroke="#034A7D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="resetlink-background-decoration">
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

        <div className="resetlink-icon-container">
          <div className="resetlink-icon-box">
            {/* Layer 1: Gmail icon at the back */}
            <div className="resetlink-gmail-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="106" height="80" viewBox="0 0 106 80" fill="none">
                <path d="M9.82812 79.2031H25.8867V38.8086L0.691406 19.9805V70.0664C0.691406 75.0273 4.76172 79.2031 9.82812 79.2031Z" fill="#4285F4"/>
                <path d="M79.4375 79.2031H95.4961C100.562 79.2031 104.738 75.1328 104.738 70.0664V19.9805L79.4375 38.8086V79.2031Z" fill="#34A853"/>
                <path d="M79.4375 8.83984V38.8086L104.738 19.9805V12.418C104.738 1.32422 91.6367 -4.53906 83.3008 3.03516L79.4375 8.83984Z" fill="#FBBC04"/>
                <path d="M25.8867 38.8086V8.83984L52.7148 28.457L79.4375 8.83984V38.8086L52.7148 57.6367L25.8867 38.8086Z" fill="#EA4335"/>
                <path d="M0.691406 12.418V19.9805L25.8867 38.8086V8.83984L22.1289 3.03516C13.6875 -4.53906 0.691406 1.32422 0.691406 12.418Z" fill="#C5221F"/>
              </svg>
            </div>
            
            {/* Layer 2: Blur overlay */}
            <div className="resetlink-blur-overlay"></div>
            
            {/* Layer 3: Mail icon with checkmark on top */}
            <div className="resetlink-mail-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none">
                {/* Mail envelope */}
                <rect x="10" y="20" width="60" height="40" rx="4" stroke="#034A7D" strokeWidth="3.5" fill="white"/>
                <path d="M10 20L40 40L70 20" stroke="#034A7D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                
                {/* Checkmark */}
                <path d="M52 48L58 54L70 42" stroke="#034A7D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <h2 className="resetlink-title">Check your inbox to reset your password</h2>
        
        <p className="resetlink-description">
          We've sent a password reset link to your registered email address. If you don't see it, check your spam or promotions folder.
        </p>

        <button 
          type="button"
          className="resetlink-signin-button"
          onClick={handleBack}
        >
          Back to Sign In
        </button>

        <div className="resetlink-resend">
          <span className="resetlink-resend-text">Didn't Receive the E-mail? </span>
          <button 
            type="button"
            className="resetlink-resend-link"
            onClick={handleSendAgain}
            disabled={isResending}
          >
            {isResending ? 'Sending...' : 'Send Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetLinkSent;
