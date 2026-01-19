import React from "react";
import { Link } from "react-router-dom";
import "./ThankYou.css";
import visual from './visual.svg';
import SigninLogo from './signin.svg';
import Footer from './Footer';
import LandNavBar from "../LandingComponents/LandNavBar";

const ThankYou: React.FC = () => {

  return (
    <div className="landing-section" style={{ backgroundColor: 'white' }}>
      <LandNavBar active="none" />

      {/* Background decoration (top-right) */}
      <div className="background-decoration" aria-hidden="true">
       <svg xmlns="http://www.w3.org/2000/svg" width="222" height="216" viewBox="0 0 222 216" fill="none">
  <g opacity="0.6" filter="url(#filter0_f_12072_37422)">
    <path d="M87.3342 175.023C63.4031 175.566 51.4375 175.838 44.5409 170.889C37.6443 165.941 39.651 158.523 43.6645 143.687L59.1275 86.529C67.5057 55.5599 71.6947 40.0753 85.6443 40.0004C99.5938 39.9255 110.186 55.3306 131.371 86.141L169.83 142.075C179.485 156.117 184.312 163.138 179.86 168.081C175.408 173.024 164.024 173.282 141.257 173.799L87.3342 175.023Z" fill="url(#paint0_linear_12072_37422)"/>
  </g>
  <defs>
    <filter id="filter0_f_12072_37422" x="0" y="0" width="221.531" height="215.307" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="5" result="effect1_foregroundBlur_12072_37422"/>
    </filter>
    <linearGradient id="paint0_linear_12072_37422" x1="0.870999" y1="46.8944" x2="81.4024" y2="222.79" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EDF8FD"/>
      <stop offset="1" stop-color="#0092DF"/>
    </linearGradient>
  </defs>
</svg>
      </div>


      {/* Center background decoration */}
      <div className="background-decoration-center" aria-hidden="true">
       <svg xmlns="http://www.w3.org/2000/svg" width="552" height="635" viewBox="0 0 552 635" fill="none">
  <g filter="url(#filter0_f_12072_37418)">
    <path d="M451.026 534.225L99.9966 319.212L436.959 71.9992L451.026 534.225Z" fill="url(#paint0_linear_12072_37418)"/>
  </g>
  <defs>
    <filter id="filter0_f_12072_37418" x="0" y="-28.001" width="551.023" height="662.226" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="30" result="effect1_foregroundBlur_12072_37418"/>
    </filter>
    <linearGradient id="paint0_linear_12072_37418" x1="-314.167" y1="-72.7516" x2="437.072" y2="376.086" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F9FBFD"/>
      <stop offset="0.5" stop-color="#F5E6C8"/>
      <stop offset="1" stop-color="#E2B55A"/>
    </linearGradient>
  </defs>
</svg>
      </div>

      {/* Left-side background decoration */}
      <div className="background-decoration-left" aria-hidden="true">
       <svg xmlns="http://www.w3.org/2000/svg" width="425" height="383" viewBox="0 0 425 383" fill="none">
  <g opacity="0.6" filter="url(#filter0_f_12072_37419)">
    <path d="M100.207 88.2295C99.7343 57.5296 99.4977 42.1796 106.079 34.7252C112.66 27.2709 121.371 33.0225 138.793 44.5257L288.487 143.367C313.973 160.195 326.716 168.609 324.488 182.125C322.26 195.641 307.077 202.03 276.71 214.807L129.494 276.748C117.195 281.923 111.046 284.511 107.076 280.404C103.106 276.296 102.966 267.202 102.686 249.012L100.207 88.2295Z" fill="url(#paint0_linear_12072_37419)"/>
  </g>
  <defs>
    <filter id="filter0_f_12072_37419" x="0" y="-68.6221" width="424.734" height="451.055" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="50" result="effect1_foregroundBlur_12072_37419"/>
    </filter>
    <linearGradient id="paint0_linear_12072_37419" x1="295.849" y1="29.5753" x2="43.7436" y2="117.973" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EDF8FD"/>
      <stop offset="1" stop-color="#0092DF"/>
    </linearGradient>
  </defs>
</svg>
      </div>

      {/* Bottom-left background decoration (above footer) */}
      <div className="background-decoration-bottom-left" aria-hidden="true">
       <svg xmlns="http://www.w3.org/2000/svg" width="275" height="324" viewBox="0 0 275 324" fill="none">
  <g opacity="0.3" filter="url(#filter0_f_12072_37421)">
    <path d="M128.321 238.694C109.173 271.517 99.5986 287.929 89.32 292.161C79.0414 296.393 76.4735 284.98 71.3375 262.156L34.3912 97.9615C29.5341 76.3758 27.1056 65.583 35.7322 55.7595C44.3589 45.9361 57.2257 44.8426 82.9593 42.6555L222.617 30.786C235.933 29.6543 242.591 29.0885 243.839 33.8127C245.088 38.537 240.403 46.5682 231.032 62.6306L128.321 238.694Z" fill="url(#paint0_linear_12072_37421)"/>
  </g>
  <defs>
    <filter id="filter0_f_12072_37421" x="0" y="0" width="274.039" height="323.03" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="5" result="effect1_foregroundBlur_12072_37421"/>
    </filter>
    <linearGradient id="paint0_linear_12072_37421" x1="-28.8332" y1="210.131" x2="172.331" y2="274.455" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EDF8FD"/>
      <stop offset="1" stop-color="#0092DF"/>
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
          <h1>Thanks for choosing Aforo.ai!</h1>
          <p>You'll hear from us shortly to help you launch billing your way.</p>
        </div>
      </section>

      {/* Center background decoration */}
      

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ThankYou;
