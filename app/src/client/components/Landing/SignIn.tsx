import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { login } from '../../api';
import { setAuthData, type LoginResponse } from '../../utils/auth';
import "./SignIn.css";

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    const payload = { businessEmail: email.trim(), password };
    
    try {
      setIsSubmitting(true);
      console.log('Attempting login with email:', email);
      
      const loginResponse = await login(payload);
      console.log('Login response received:', loginResponse);
      
      if (!loginResponse || !loginResponse.token) {
        throw new Error(loginResponse?.message || 'No authentication token received');
      }
      
      if (!loginResponse.success) {
        throw new Error(loginResponse.message || 'Login failed');
      }
      
      // Store authentication data including organizationId and token
      setAuthData(loginResponse, email.trim());
      
      // Redirect to the dashboard or intended URL
      const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/get-started';
      console.log('Login successful, redirecting to:', redirectTo);
      navigate(redirectTo);
    } catch (err: any) {
      console.error('Login error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      
      // More user-friendly error messages
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (err.message.includes('401') || err.message.toLowerCase().includes('invalid credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.message) {
        // Use the server's error message if available
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
      <svg xmlns="http://www.w3.org/2000/svg" width="34" height="31" viewBox="0 0 34 31" fill="none">
  <path d="M15.9656 0.5566C14.4403 0.992399 11.88 4.733 10.7905 6.54883C14.059 8.45545 17.0551 13.0858 20.0512 16.0819C23.0473 19.078 24.1368 18.8057 25.7711 18.8057C27.0785 18.8057 29.2211 17.7162 30.129 17.1714C28.4948 14.2661 24.6816 7.63833 22.5026 4.36984C19.7788 0.284226 17.8722 0.0118523 15.9656 0.5566Z" fill="#025A94"/>
  <path d="M33.6699 24.7979C33.452 23.9263 32.4896 21.711 32.0357 20.7123C30.7283 22.0197 28.5856 23.2544 27.6777 23.7084C21.1407 26.9769 14.8761 22.3465 11.0629 19.3504C8.01227 16.9535 5.97855 15.9911 5.34301 15.8095C4.97984 16.4451 3.81771 18.5878 2.07452 22.0742C-0.104474 26.4321 0.985022 28.3388 2.89164 29.4283C4.79826 30.5177 8.88387 30.7901 16.238 30.7901C23.5921 30.7901 28.2224 30.7901 31.2185 29.7006C34.2147 28.6111 33.9423 25.8874 33.6699 24.7979Z" fill="#025A94"/>
</svg><span className="logo-text" style={{ marginLeft: 8, fontSize: '24px', fontWeight: 600 }}>aforo</span>

        <h2 className="signin-title">Sign in to your aforo account</h2>

        <form className="signin-form" onSubmit={handleSubmit}>
          <label className="field-label">Business Email*</label>
          <input
            className="field-input"
            type="email"
            placeholder="Placeholder"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-row">
            <label className="field-label">Password*</label>
            <a className="forgot-link" href="#">
              Forgot password?
            </a>
          </div>
          <div className="password-wrapper">
            <input
              className="field-input"
              type={showPassword ? "text" : "password"}
              placeholder="Placeholder"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3-11-7 1.21-2.74 3.27-5 6-6.38"/><path d="M1 1l22 22"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                  <path d="M1.7181 10.4275C1.64865 10.2404 1.64865 10.0346 1.7181 9.84751C2.39452 8.20739 3.5427 6.80504 5.01708 5.81826C6.49146 4.83147 8.22564 4.30469 9.99977 4.30469C11.7739 4.30469 13.5081 4.83147 14.9825 5.81826C16.4568 6.80504 17.605 8.20739 18.2814 9.84751C18.3509 10.0346 18.3509 10.2404 18.2814 10.4275C17.605 12.0676 16.4568 13.47 14.9825 14.4568C13.5081 15.4435 11.7739 15.9703 9.99977 15.9703C8.22564 15.9703 6.49146 15.4435 5.01708 14.4568C3.5427 13.47 2.39452 12.0676 1.7181 10.4275Z" stroke="#706C72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.99977 12.6375C11.3805 12.6375 12.4998 11.5182 12.4998 10.1375C12.4998 8.7568 11.3805 7.63751 9.99977 7.63751C8.61906 7.63751 7.49977 8.7568 7.49977 10.1375C7.49977 11.5182 8.61906 12.6375 9.99977 12.6375Z" stroke="#706C72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          <button className="primary-btn" type="submit" disabled={isSubmitting}>
            Sign in
          </button>
          {error && <p className="error-msg">{error}</p>}
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="social-list">
          <button className="social-btn google">
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                <path d="M15.0377 6.82975H14.5007V6.80208H8.50065V9.46875H12.2683C11.7187 11.0211 10.2417 12.1354 8.50065 12.1354C6.29165 12.1354 4.50065 10.3444 4.50065 8.13542C4.50065 5.92642 6.29165 4.13542 8.50065 4.13542C9.52032 4.13542 10.448 4.52008 11.1543 5.14842L13.04 3.26275C11.8493 2.15308 10.2567 1.46875 8.50065 1.46875C4.81898 1.46875 1.83398 4.45375 1.83398 8.13542C1.83398 11.8171 4.81898 14.8021 8.50065 14.8021C12.1823 14.8021 15.1673 11.8171 15.1673 8.13542C15.1673 7.68842 15.1213 7.25208 15.0377 6.82975Z" fill="#FFC107"/>
                <path d="M2.60156 5.03242L4.7919 6.63875C5.38456 5.17142 6.8199 4.13542 8.49956 4.13542C9.51923 4.13542 10.4469 4.52008 11.1532 5.14842L13.0389 3.26275C11.8482 2.15308 10.2556 1.46875 8.49956 1.46875C5.9389 1.46875 3.71823 2.91442 2.60156 5.03242Z" fill="#FF3D00"/>
                <path d="M8.49945 14.8036C10.2215 14.8036 11.7861 14.1446 12.9691 13.0729L10.9058 11.3269C10.2141 11.8533 9.36865 12.1379 8.49945 12.1369C6.76545 12.1369 5.29312 11.0313 4.73845 9.48828L2.56445 11.1633C3.66779 13.3223 5.90845 14.8036 8.49945 14.8036Z" fill="#4CAF50"/>
                <path d="M15.037 6.83235H14.5V6.80469H8.5V9.47135H12.2677C12.0047 10.2102 11.5311 10.8557 10.9053 11.3284L10.9063 11.3277L12.9697 13.0737C12.8237 13.2064 15.1667 11.4714 15.1667 8.13802C15.1667 7.69102 15.1207 7.25469 15.037 6.83235Z" fill="#1976D2"/>
              </svg>
            </span>
            <span>Sign up with Google</span>
          </button>
          <button className="social-btn apple">
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                <path d="M11.3661 13.6567C10.7128 14.2901 9.99946 14.1901 9.31279 13.8901C8.58613 13.5834 7.91946 13.5701 7.15279 13.8901C6.19279 14.3034 5.68613 14.1834 5.11279 13.6567C1.85946 10.3034 2.33946 5.19672 6.03279 5.01005C6.93279 5.05672 7.55946 5.50339 8.08613 5.54339C8.87279 5.38339 9.62613 4.92339 10.4661 4.98339C11.4728 5.06339 12.2328 5.46339 12.7328 6.18339C10.6528 7.43005 11.1461 10.1701 13.0528 10.9367C12.6728 11.9367 12.1795 12.9301 11.3595 13.6634L11.3661 13.6567ZM8.01946 4.97005C7.91946 3.48339 9.12613 2.25672 10.5128 2.13672C10.7061 3.85672 8.95279 5.13672 8.01946 4.97005Z" fill="black" />
              </svg>
            </span>
            <span>Sign up with Apple</span>
          </button>
          <button className="social-btn ms">
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                <g clipPath="url(#clip0)">
                  <path d="M7.60412 7.74084H0V0.136719H7.60412V7.74084Z" fill="#F1511B" />
                  <path d="M16.0005 7.74084H8.39648V0.136719H16.0005V7.74084Z" fill="#80CC28" />
                  <path d="M7.60394 16.1354H0V8.53125H7.60394V16.1354Z" fill="#00ADEF" />
                  <path d="M16.0005 16.1354H8.39648V8.53125H16.0005V16.1354Z" fill="#FBBC09" />
                </g>
                <defs>
                  <clipPath id="clip0">
                    <rect width="16" height="16" fill="white" transform="translate(0 0.136719)" />
                  </clipPath>
                </defs>
              </svg>
            </span>
            <span>Sign up with Microsoft</span>
          </button>
          <button className="social-btn passkey">
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                <path d="M2.5 13.4714V11.6047C2.5 11.2269 2.59733 10.8798 2.792 10.5634C2.98667 10.2469 3.24489 10.0051 3.56667 9.83802C4.25556 9.49358 4.95556 9.23535 5.66667 9.06335C6.37778 8.89135 7.1 8.80513 7.83333 8.80469C8.05556 8.80469 8.27778 8.81313 8.5 8.83002C8.72222 8.84691 8.94444 8.8718 9.16667 8.90469C9.12222 9.54913 9.23889 10.1576 9.51667 10.73C9.79444 11.3025 10.2 11.7718 10.7333 12.138V13.4714H2.5ZM13.1667 15.4714L12.1667 14.4714V11.3714C11.6778 11.2269 11.2778 10.952 10.9667 10.5467C10.6556 10.1414 10.5 9.6718 10.5 9.13802C10.5 8.49358 10.7278 7.94358 11.1833 7.48802C11.6389 7.03246 12.1889 6.80469 12.8333 6.80469C13.4778 6.80469 14.0278 7.03246 14.4833 7.48802C14.9389 7.94358 15.1667 8.49358 15.1667 9.13802C15.1667 9.63802 15.0249 10.0825 14.7413 10.4714C14.4578 10.8602 14.0996 11.138 13.6667 11.3047L14.5 12.138L13.5 13.138L14.5 14.138L13.1667 15.4714ZM7.83333 8.13802C7.1 8.13802 6.47222 7.87691 5.95 7.35469C5.42778 6.83246 5.16667 6.20469 5.16667 5.47135C5.16667 4.73802 5.42778 4.11024 5.95 3.58802C6.47222 3.0658 7.1 2.80469 7.83333 2.80469C8.56667 2.80469 9.19444 3.0658 9.71667 3.58802C10.2389 4.11024 10.5 4.73802 10.5 5.47135C10.5 6.20469 10.2389 6.83246 9.71667 7.35469C9.19444 7.87691 8.56667 8.13802 7.83333 8.13802ZM12.8333 9.47135C13.0222 9.47135 13.1807 9.40735 13.3087 9.27935C13.4367 9.15135 13.5004 8.99313 13.5 8.80469C13.4996 8.61624 13.4356 8.45802 13.308 8.33002C13.1804 8.20202 13.0222 8.13802 12.8333 8.13802C12.6444 8.13802 12.4862 8.20202 12.3587 8.33002C12.2311 8.45802 12.1671 8.61624 12.1667 8.80469C12.1662 8.99313 12.2302 9.15158 12.3587 9.28002C12.4871 9.40847 12.6453 9.47224 12.8333 9.47135Z" fill="black" />
              </svg>
            </span>
            <span>Sign up with Passkey</span>
          </button>
        </div>

        <p className="signin-footer">
          Don’t have an account? <a href="/contact-sales">Contact Sales</a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;