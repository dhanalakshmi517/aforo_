import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-section company">
        <h2 className="logo">aforo</h2>
        <p className="description">
          A billing platform built to capture every drop — usage-based, subscription, or hybrid pricing.
        </p>
        <div className="social-icons">
          {/* LinkedIn */}
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M18.6673 9.33203C20.5238 9.33203 22.3043 10.0695 23.6171 11.3823C24.9298 12.695 25.6673 14.4755 25.6673 16.332V24.4987H21.0006V16.332C21.0006 15.7132 20.7548 15.1197 20.3172 14.6821C19.8796 14.2445 19.2862 13.9987 18.6673 13.9987C18.0485 13.9987 17.455 14.2445 17.0174 14.6821C16.5798 15.1197 16.334 15.7132 16.334 16.332V24.4987H11.6673V16.332C11.6673 14.4755 12.4048 12.695 13.7176 11.3823C15.0303 10.0695 16.8108 9.33203 18.6673 9.33203Z" stroke="#EBF6FB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.00065 10.4987H2.33398V24.4987H7.00065V10.4987Z" stroke="#EBF6FB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.66732 6.9987C5.95598 6.9987 7.00065 5.95403 7.00065 4.66536C7.00065 3.3767 5.95598 2.33203 4.66732 2.33203C3.37865 2.33203 2.33398 3.3767 2.33398 4.66536C2.33398 5.95403 3.37865 6.9987 4.66732 6.9987Z" stroke="#EBF6FB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {/* Facebook */}
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M20.9993 2.33203H17.4993C15.9523 2.33203 14.4685 2.94661 13.3746 4.04057C12.2806 5.13454 11.666 6.61827 11.666 8.16536V11.6654H8.16602V16.332H11.666V25.6654H16.3327V16.332H19.8327L20.9993 11.6654H16.3327V8.16536C16.3327 7.85595 16.4556 7.5592 16.6744 7.34041C16.8932 7.12161 17.1899 6.9987 17.4993 6.9987H20.9993V2.33203Z" stroke="#EBF6FB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {/* Twitter */}
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M25.6673 4.66539C25.6673 4.66539 24.8507 7.11539 23.334 8.63206C25.2007 20.2987 12.3673 28.8154 2.33398 22.1654C4.90065 22.2821 7.46732 21.4654 9.33398 19.8321C3.50065 18.0821 0.583984 11.1987 3.50065 5.83206C6.06732 8.86539 10.034 10.6154 14.0007 10.4987C12.9507 5.59872 18.6673 2.79872 22.1673 6.06539C23.4506 6.06539 25.6673 4.66539 25.6673 4.66539Z" stroke="#EBF6FB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {/* YouTube */}
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M2.91594 19.8353C2.10094 15.9891 2.10094 12.0148 2.91594 8.16862C3.02303 7.77803 3.22994 7.42204 3.51632 7.13566C3.8027 6.84928 4.15869 6.64237 4.54928 6.53529C10.8066 5.49865 17.1919 5.49865 23.4493 6.53529C23.8399 6.64237 24.1959 6.84928 24.4822 7.13566C24.7686 7.42204 24.9755 7.77803 25.0826 8.16862C25.8976 12.0148 25.8976 15.9891 25.0826 19.8353C24.9755 20.2259 24.7686 20.5819 24.4822 20.8682C24.1959 21.1546 23.8399 21.3615 23.4493 21.4686C17.1919 22.5055 10.8066 22.5055 4.54928 21.4686C4.15869 21.3615 3.8027 21.1546 3.51632 20.8682C3.22994 20.5819 3.02303 20.2259 2.91594 19.8353Z" stroke="#EBF6FB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.6659 17.502L17.4993 14.002L11.6659 10.502V17.502Z" stroke="#EBF6FB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div className="footer-section">
        <h4>Resources</h4>
        <ul>
          <li>Home</li>
          <li>Product</li>
          <li>Rate Plan</li>
          <li>Subscriptions</li>
          <li>Invoices</li>
        </ul>
      </div>

      <div className="footer-section">
        <h4>Documentation</h4>
        <ul>
          <li>FAQs</li>
          <li>Support</li>
        </ul>
      </div>

      <div className="footer-section">
        <h4>Legal</h4>
        <ul>
          <li>Privacy Policy</li>
          <li>Terms of Service</li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
