import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ThankYou.css";
import visual from './visual.svg';
import SigninLogo from './signin.svg';
import Footer from './Footer';
import LandNavBar from "../LandingComponents/LandNavBar";

const ThankYou: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="landing-section" style={{ backgroundColor: 'white' }}>
      <LandNavBar active="none" />

      {/* Background decoration */}
      <div className="background-decoration">
        <svg xmlns="http://www.w3.org/2000/svg" width="316" height="335" viewBox="0 0 316 335" fill="none">
          <g opacity="0.6" filter="url(#filter0_f_12072_37422)">
            <path d="M155.704 232.221C126.521 234.923 111.93 236.274 104.106 230.579C96.2816 224.883 100.572 216.033 109.154 198.334L137.153 140.587C150.513 113.031 157.193 99.2533 170.905 100.031C184.616 100.809 192.886 115.435 209.426 144.687L239.061 197.098C245.943 209.271 249.385 215.357 245.541 219.808C241.697 224.259 232.244 225.134 213.338 226.885L155.704 232.221Z" fill="url(#paint0_linear_12072_37422)"/>
          </g>
          <defs>
            <filter id="filter0_f_12072_37422" x="0" y="0" width="347.141" height="334.55" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="50" result="effect1_foregroundBlur_12072_37422"/>
            </filter>
            <linearGradient id="paint0_linear_12072_37422" x1="79.8639" y1="114.996" x2="150.935" y2="270.228" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EDF8FD"/>
              <stop offset="1" stopColor="#0092DF"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Thank You Content */}
      <section className="thankyou">
        <div className="thankyou-content">
          <div className="check-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="146" height="146" viewBox="0 0 146 146" fill="none">
  <mask id="mask0_6842_36161" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="146" height="146">
    <rect width="146" height="146" fill="#D9D9D9"/>
  </mask>
  <g mask="url(#mask0_6842_36161)">
    <path d="M58.8239 95.3263C61.9481 98.4505 67.0134 98.4505 70.1376 95.3263L103.11 62.354C105.462 60.0022 105.462 56.1892 103.11 53.8373C100.758 51.4855 96.945 51.4855 94.5932 53.8373L64.4807 83.9498L51.4016 70.8707C49.0498 68.5189 45.2367 68.5189 42.8849 70.8707C40.5331 73.2225 40.5331 77.0355 42.8849 79.3873L58.8239 95.3263ZM72.9974 133.833C64.5821 133.833 56.6738 132.236 49.2724 129.043C41.871 125.849 35.4328 121.514 29.9578 116.039C24.4828 110.564 20.1484 104.126 16.9547 96.7248C13.7609 89.3235 12.1641 81.4151 12.1641 72.9998C12.1641 64.5846 13.7609 56.6762 16.9547 49.2748C20.1484 41.8734 24.4828 35.4353 29.9578 29.9603C35.4328 24.4853 41.871 20.1509 49.2724 16.9571C56.6738 13.7634 64.5821 12.1665 72.9974 12.1665C81.4127 12.1665 89.321 13.7634 96.7224 16.9571C104.124 20.1509 110.562 24.4853 116.037 29.9603C121.512 35.4353 125.846 41.8734 129.04 49.2748C132.234 56.6762 133.831 64.5846 133.831 72.9998C133.831 81.4151 132.234 89.3235 129.04 96.7248C125.846 104.126 121.512 110.564 116.037 116.039C110.562 121.514 104.124 125.849 96.7224 129.043C89.321 132.236 81.4127 133.833 72.9974 133.833Z" fill="url(#paint0_linear_6842_36161)"/>
  </g>
  <defs>
    <linearGradient id="paint0_linear_6842_36161" x1="128.043" y1="133.833" x2="55.7004" y2="155.192" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0262A1"/>
      <stop offset="1" stop-color="#00365A"/>
    </linearGradient>
  </defs>
</svg>
          </div>
          <h1>Thanks for choosing Aforo.Ai!</h1>
          <p>You'll hear from us shortly to help you launch billing your way.</p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ThankYou;
