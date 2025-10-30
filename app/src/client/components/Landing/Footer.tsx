import React from 'react';
import './Footer.css';
import logo from '../LandingComponents/logo-new.svg';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Company Info - Left side */}
        <div className="company">
          <img src={logo} alt="aforo" className="footer-logo" />
          <p className="description">
            Powering usage-based billing <br/>for modern enterprises.
          </p>
          
          <div className="social-icons">
            <a href="#" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="29" viewBox="0 0 28 29" fill="none">
  <path d="M18.6654 9.70508C20.5219 9.70508 22.3024 10.4426 23.6151 11.7553C24.9279 13.0681 25.6654 14.8486 25.6654 16.7051V24.8717H20.9987V16.7051C20.9987 16.0862 20.7529 15.4927 20.3153 15.0552C19.8777 14.6176 19.2842 14.3717 18.6654 14.3717C18.0465 14.3717 17.453 14.6176 17.0154 15.0552C16.5779 15.4927 16.332 16.0862 16.332 16.7051V24.8717H11.6654V16.7051C11.6654 14.8486 12.4029 13.0681 13.7156 11.7553C15.0284 10.4426 16.8088 9.70508 18.6654 9.70508Z" stroke="#EBF6FB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6.9987 10.8717H2.33203V24.8717H6.9987V10.8717Z" stroke="#EBF6FB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4.66536 7.37174C5.95403 7.37174 6.9987 6.32708 6.9987 5.03841C6.9987 3.74975 5.95403 2.70508 4.66536 2.70508C3.3767 2.70508 2.33203 3.74975 2.33203 5.03841C2.33203 6.32708 3.3767 7.37174 4.66536 7.37174Z" stroke="#EBF6FB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
            </a>
            <a href="#" aria-label="Twitter">
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="29" viewBox="0 0 28 29" fill="none">
  <path d="M25.6654 5.03844C25.6654 5.03844 24.8487 7.48844 23.332 9.0051C25.1987 20.6718 12.3654 29.1884 2.33203 22.5384C4.8987 22.6551 7.46536 21.8384 9.33203 20.2051C3.4987 18.4551 0.582031 11.5718 3.4987 6.2051C6.06536 9.23844 10.032 10.9884 13.9987 10.8718C12.9487 5.97177 18.6654 3.17177 22.1654 6.43844C23.4487 6.43844 25.6654 5.03844 25.6654 5.03844Z" stroke="#EBF6FB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
            </a>
            <a href="#" aria-label="Facebook">
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="29" viewBox="0 0 28 29" fill="none">
  <path d="M21.0013 2.70508H17.5013C15.9542 2.70508 14.4705 3.31966 13.3765 4.41362C12.2826 5.50758 11.668 6.99132 11.668 8.53841V12.0384H8.16797V16.7051H11.668V26.0384H16.3346V16.7051H19.8346L21.0013 12.0384H16.3346V8.53841C16.3346 8.22899 16.4576 7.93225 16.6763 7.71345C16.8951 7.49466 17.1919 7.37174 17.5013 7.37174H21.0013V2.70508Z" stroke="#EBF6FB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
            </a>
            <a href="#" aria-label="YouTube">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="29" viewBox="0 0 28 29" fill="none">
  <path d="M2.91594 20.2044C2.10094 16.3582 2.10094 12.3839 2.91594 8.53776C3.02303 8.14717 3.22994 7.79118 3.51632 7.5048C3.8027 7.21842 4.15869 7.01151 4.54928 6.90443C10.8066 5.8678 17.1919 5.8678 23.4493 6.90443C23.8399 7.01151 24.1959 7.21842 24.4822 7.5048C24.7686 7.79118 24.9755 8.14717 25.0826 8.53776C25.8976 12.3839 25.8976 16.3582 25.0826 20.2044C24.9755 20.595 24.7686 20.951 24.4822 21.2374C24.1959 21.5238 23.8399 21.7307 23.4493 21.8378C17.1919 22.8746 10.8066 22.8746 4.54928 21.8378C4.15869 21.7307 3.8027 21.5238 3.51632 21.2374C3.22994 20.951 3.02303 20.595 2.91594 20.2044Z" stroke="#EBF6FB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M11.6659 17.8711L17.4993 14.3711L11.6659 10.8711V17.8711Z" stroke="#EBF6FB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
            </a>
          </div>
        </div>

        {/* Right side sections */}
        <div className="footer-sections">
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li className="footer-link">
                <span>Home</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </li>
              <li className="footer-link">
                <span>Product</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </li>
              <li className="footer-link">
                <span>RatePlan</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </li>
              <li className="footer-link">
                <span>Subscription</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </li>
              <li className="footer-link">
                <span>Invoices</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Documentation</h4>
            <ul>
              <li className="footer-link">
                <span>FAQs</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </li>
              <li className="footer-link">
                <span>Support</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li className="footer-link">
                <span>Privacy Policy</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </li>
              <li className="footer-link">
                <span>Terms of Service</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
