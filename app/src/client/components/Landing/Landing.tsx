import React, { useState } from 'react';
import SignIn from './SignIn';
import './Landing.css';
import visual from './visual.svg'; // Import the SVG background
import SigninLogo from './signin.svg';
import Features from './Features';
import ProgressSection from './ProgressSection';
import Revenue from './Revenue';
import HeroSection from './HeroSection';
import Organization from './Organization';
import Footer from './Footer';

const Landing: React.FC = () => {
  const [showOrg, setShowOrg] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  // Only show navbar when not showing organization form or sign in
  const showNavbar = !showOrg && !showSignIn;
  
  return (
    <>
    <div
      className="landing-section"
      style={{ 
        backgroundImage: showNavbar ? `url(${visual})` : 'none',
        backgroundColor: showNavbar ? 'transparent' : 'white'
      }}
    >
      {showNavbar && (
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
            <a href="#">Home</a>
            <a href="#">Pricing</a>
            <a href="#">Built For</a>
            <a href="#">Resources</a>
            <a 
              href="#" 
              className="nav-link" 
              onClick={(e) => { 
                e.preventDefault(); 
                setShowSignIn(true); 
                setShowOrg(false); 
              }}
            >
              Sign In
            </a>
            <button className="contact-btn" onClick={()=>setShowOrg(true)}>Contact Sales</button>
          </nav>
        </header>
      )}

      {/* Hero or Organization */}
      {showSignIn ? (
        <SignIn />
      ) : showOrg ? (
        <Organization />
      ) : (
        <>
          <HeroSection />
          <section className="usage-info">
        <h2>
          Track Every Usage, Bill with Accuracy
        </h2>
        <p>
          Aforo turns your usage data into accurate, on-time invoices—automatically.
          Simplify metering and billing so you can focus on growing your business.
        </p>
                </section>
        </>
      )}
    </div>
    {!showOrg && !showSignIn && (
      <>
        <section>
          <Features />
        </section>
        <section>
          <ProgressSection />
        </section>
        <section>
          <Revenue />
        </section>
      </>
    )}
    {/* Only show footer when not showing organization form or sign in */}
    {!showOrg && !showSignIn && (
      <section>
        <Footer />
      </section>
    )}
    </>
  );
};

export default Landing;
