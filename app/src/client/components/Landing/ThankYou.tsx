import React from "react";
import { Link } from "react-router-dom";
import "./ThankYou.css";
import visual from './visual.svg';
import aforoWordmark from './logoaforo.svg';
import Footer from './Footer';

const ThankYou: React.FC = () => {
  return (
    <div className="landing-section" style={{ backgroundColor: 'white' }}>
      {/* Navbar */}
      <header className="navbar">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <img src={aforoWordmark} alt="Aforo" className="logo-text" height={24} />
        </div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/contact-sales">Contact Sales</Link>
          <Link to="/signin" className="login-btn">Sign in</Link>
          <Link to="/contact-sales" className="get-started-btn">Get Started</Link>
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
