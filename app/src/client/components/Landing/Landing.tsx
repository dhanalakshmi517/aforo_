import React from 'react';
import './Landing.css';
import bgPipes from './bg-pipes.svg'; // Import the SVG
import Features from './Features';
import ProgressSection from './ProgressSection';
import Revenue from './Revenue';
import Footer from './Footer';

const Landing: React.FC = () => {
  return (
    <>
    <div
      className="landing-section"
      style={{ backgroundImage: `url(${bgPipes})` }}
    >
      <header className="navbar">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Aforo logo icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 0 49 49" fill="none">
            <path d="M15.5193 16.6599C19.5627 9.65657 21.5844 6.15488 24.6169 6.15488C27.6495 6.15488 29.6712 9.65657 33.7146 16.6599L36.0838 20.7635C40.1272 27.7669 42.1489 31.2686 40.6326 33.8948C39.1163 36.5211 35.0729 36.5211 26.9861 36.5211H22.2477C14.1609 36.5211 10.1175 36.5211 8.60126 33.8948C7.08498 31.2686 9.10668 27.7669 13.1501 20.7635L15.5193 16.6599Z" fill="#2B7194" />
            <g style={{ mixBlendMode: 'overlay' }}>
              <path d="M18.5115 11.7605C16.3463 15.2249 14.1811 18.6892 12.0159 22.1535C12.3432 22.2829 12.6672 22.4214 13.0008 22.5773C16.0509 23.927 18.9823 26.5938 23.4574 29.1405C25.6723 30.3768 28.8584 31.3918 31.7915 30.8828C34.7161 30.4123 36.8659 29.0163 38.6721 27.5825C39.0747 27.2581 39.4405 26.9392 39.8299 26.5891C38.9514 25.334 38.0728 24.079 37.1943 22.8239C36.7982 23.023 36.4328 23.1879 36.0523 23.3486C34.3474 24.0766 32.6531 24.4272 31.4309 24.1901C30.2208 23.9578 29.3728 23.321 28.2405 22.2037C25.9975 19.9555 23.574 16.1893 19.8169 12.8558C19.3953 12.4824 18.9673 12.1208 18.5115 11.7605Z" fill="url(#paint0_linear_5076_290)" />
            </g>
            <defs>
              <linearGradient id="paint0_linear_5076_290" x1="12.6899" y1="5.82884" x2="33.1529" y2="29.3558" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" />
                <stop offset="1" stopColor="#989898" />
              </linearGradient>
            </defs>
          </svg>
          <span className="logo-text">aforo</span>
        </div>
        <nav className="nav-links">
          <a href="#">Home</a>
          <a href="#">Pricing</a>
          <a href="#">Built For</a>
          <a href="#">Resources</a>
          <button className="contact-btn">Contact Sales</button>
        </nav>
      </header>

      <main className="hero">
        <h1 className="gradient-text">Bill with Precision</h1>
        <p>
          Aforo is the billing platform built to capture every drop — usage-based,
          subscription, or hybrid pricing.
        </p>
        <button className="demo-btn">Schedule a Demo</button>
      </main>

      <section className="usage-info">
        <h2>
          Track Every Usage, Bill with Accuracy
        </h2>
        <p>
          Aforo turns your usage data into accurate, on-time invoices—automatically.
          Simplify metering and billing so you can focus on growing your business.
        </p>
      </section>
    </div>
    <section>
      <Features />
    </section>
    <section>
      <ProgressSection />
    </section>
    <section>
      <Revenue />
    </section>
    <section>
      <Footer />
    </section>
    </>
  );
};

export default Landing;
