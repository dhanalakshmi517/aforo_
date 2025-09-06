import React, { useState } from 'react';
import SignIn from './SignIn';
import './Landing.css';
import visual from './visual.svg'; // Import the SVG background
import aforoWordmark from './logoaforo.svg';
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
          <svg xmlns="http://www.w3.org/2000/svg" width="34" height="31" viewBox="0 0 34 31" fill="none">
  <path d="M15.9656 0.5566C14.4403 0.992399 11.88 4.733 10.7905 6.54883C14.059 8.45545 17.0551 13.0858 20.0512 16.0819C23.0473 19.078 24.1368 18.8057 25.7711 18.8057C27.0785 18.8057 29.2211 17.7162 30.129 17.1714C28.4948 14.2661 24.6816 7.63833 22.5026 4.36984C19.7788 0.284226 17.8722 0.0118523 15.9656 0.5566Z" fill="#23546C"/>
  <path d="M33.6699 24.7979C33.452 23.9263 32.4896 21.711 32.0357 20.7123C30.7283 22.0197 28.5856 23.2544 27.6777 23.7084C21.1407 26.9769 14.8761 22.3465 11.0629 19.3504C8.01227 16.9535 5.97855 15.9911 5.34301 15.8095C4.97984 16.4451 3.81771 18.5878 2.07452 22.0742C-0.104474 26.4321 0.985022 28.3388 2.89164 29.4283C4.79826 30.5177 8.88387 30.7901 16.238 30.7901C23.5921 30.7901 28.2224 30.7901 31.2185 29.7006C34.2147 28.6111 33.9423 25.8874 33.6699 24.7979Z" fill="#23546C"/>
</svg>
            <img src={aforoWordmark} alt="Aforo" className="logo-text" height={24} />
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
