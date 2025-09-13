import React from "react";
import { Link } from "react-router-dom";
import "./ThankYou.css";
import visual from './visual.svg';
import SigninLogo from './signin.svg';
import Footer from './Footer';

const ThankYou: React.FC = () => {
  return (
    <div className="landing-section" style={{ backgroundColor: 'white' }}>
      {/* Navbar */}
      <header className="navbar">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="41" height="37" viewBox="0 0 41 37" fill="none">
  <path d="M18.7663 0.845831C16.9507 1.36458 13.9031 5.81715 12.6062 7.9786C16.4968 10.2481 20.0632 15.7598 23.6296 19.3262C27.196 22.8926 28.4928 22.5683 30.4381 22.5683C31.9944 22.5683 34.5449 21.2715 35.6256 20.623C33.6803 17.1647 29.1413 9.27546 26.5475 5.38486C23.3054 0.521615 21.0359 0.197398 18.7663 0.845831Z" fill="url(#paint0_linear_7865_40146)"/>
  <path d="M39.8404 29.7011C39.5811 28.6636 37.4355 24.0267 36.8951 22.8379C35.3389 24.3941 33.7884 25.8639 32.7077 26.4042C24.9265 30.2948 17.4695 24.7832 12.9305 21.2168C9.29923 18.3637 7.87841 17.2181 7.1219 17.002C6.68962 17.7585 4.30629 22.309 2.23131 26.4589C-0.362425 31.6464 0.934441 33.9159 3.20396 35.2128C5.47347 36.5097 10.3367 36.8339 19.0906 36.8339H19.0906C27.8444 36.8339 33.3561 36.8339 36.9225 35.537C40.4889 34.2401 40.1646 30.998 39.8404 29.7011Z" fill="url(#paint1_linear_7865_40146)"/>
  <defs>
    <linearGradient id="paint0_linear_7865_40146" x1="38.1615" y1="36.8339" x2="15.1533" y2="44.1875" gradientUnits="userSpaceOnUse">
      <stop stop-color="#025A94"/>
      <stop offset="1" stop-color="#00365A"/>
    </linearGradient>
    <linearGradient id="paint1_linear_7865_40146" x1="38.1615" y1="36.8339" x2="15.1533" y2="44.1875" gradientUnits="userSpaceOnUse">
      <stop stop-color="#025A94"/>
      <stop offset="1" stop-color="#00365A"/>
    </linearGradient>
  </defs>
</svg>
          <img src={SigninLogo} alt="Aforo" className="logo-text" height={24} />
        </div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact-sales">Contact Sales</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/blog">Built for </Link>
          <Link to="/careers">Resources</Link>
          <Link to="/signin" className="login-btn">Sign in</Link>
        </nav>
      </header>

      {/* Thank You Content */}
      <section className="thankyou">
        <div className="thankyou-content">
          <div className="check-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="81" height="80" viewBox="0 0 81 80" fill="none">
              <mask id="mask0_5294_3245" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="81" height="80">
                <rect x="0.5" width="80" height="80" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_5294_3245)">
                <path d="M35.8327 55.3346L59.3327 31.8346L54.666 27.168L35.8327 46.0013L26.3327 36.5013L21.666 41.168L35.8327 55.3346ZM40.4993 73.3346C35.8882 73.3346 31.5549 72.4596 27.4993 70.7096C23.4438 68.9596 19.916 66.5846 16.916 63.5846C13.916 60.5846 11.541 57.0569 9.79102 53.0013C8.04102 48.9457 7.16602 44.6124 7.16602 40.0013C7.16602 35.3902 8.04102 31.0569 9.79102 27.0013C11.541 22.9457 13.916 19.418 16.916 16.418C19.916 13.418 23.4438 11.043 27.4993 9.29297C31.5549 7.54297 35.8882 6.66797 40.4993 6.66797C45.1105 6.66797 49.4438 7.54297 53.4994 9.29297C57.5549 11.043 61.0827 13.418 64.0827 16.418C67.0827 19.418 69.4577 22.9457 71.2077 27.0013C72.9577 31.0569 73.8327 35.3902 73.8327 40.0013C73.8327 44.6124 72.9577 48.9457 71.2077 53.0013C69.4577 57.0569 67.0827 60.5846 64.0827 63.5846C61.0827 66.5846 57.5549 68.9596 53.4994 70.7096C49.4438 72.4596 45.1105 73.3346 40.4993 73.3346Z" fill="#3088B4" />
              </g>
            </svg>
          </div>
          <h1>Thanks for choosing Aforo!</h1>
          <p>You'll hear from us shortly to help you launch billing your way.</p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ThankYou;
