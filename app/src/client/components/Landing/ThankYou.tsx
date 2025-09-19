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
        <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <img src={SigninLogo} alt="Aforo" className="logo-text" height={24} />
        </Link>
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
