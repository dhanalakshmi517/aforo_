// KongBar.tsx
import React from "react";
import "./KongBar.css"; // keep same CSS file unless you also rename it
import aforoLogo from "../../Landing/aforo.aifinal .svg";

interface KongBarProps {
  onBack?: () => void;
}

const KongBar: React.FC<KongBarProps> = ({ onBack }) => {
  return (
    <header className="kong-topbar">
      <button
        type="button"
        className="kong-topbar-back"
        onClick={onBack}
        aria-label="Go back"
      >
        {/* Back Arrow */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M6.58333 12.4167L0.75 6.58333M0.75 6.58333L6.58333 0.75M0.75 6.58333H12.4167"
            stroke="#909599"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="kong-topbar-center">
        <span className="kong-topbar-aforo">
          <svg xmlns="http://www.w3.org/2000/svg" width="72" height="16" viewBox="0 0 72 16" fill="none">
  <path d="M4.73496 15.9735C2.41249 15.9735 0.67627 14.6657 0.67627 12.4785C0.67627 9.90797 3.13403 8.91585 6.76431 8.78056L8.25249 8.73546V8.37469C8.25249 7.38256 7.53095 6.72866 6.33589 6.72866C5.11828 6.72866 4.48693 7.36002 4.28399 8.26195H0.969397C1.23998 5.87183 3.22423 4.02287 6.33589 4.02287C9.24462 4.02287 11.3867 5.44341 11.3867 8.35214V13.651C11.3867 14.35 11.4318 15.3196 11.4994 15.5901V15.6352H8.29759C8.27504 15.3647 8.27504 14.9813 8.27504 14.5078C7.53095 15.3421 6.33589 15.9735 4.73496 15.9735ZM5.63689 13.4706C7.17017 13.4706 8.25249 12.3657 8.25249 11.0805V10.607L7.32801 10.6521C5.20847 10.7874 4.10361 11.2609 4.10361 12.253C4.10361 12.9971 4.75751 13.4706 5.63689 13.4706Z" fill="url(#paint0_linear_13364_19230)"/>
  <path d="M16.8739 15.6352H13.5143V6.9767H11.4624V4.3611H13.5593V2.48959C13.5593 0.775918 14.326 0.00927734 16.0397 0.00927734H19.3543V2.71507H17.5278C16.9416 2.71507 16.7612 2.89546 16.7612 3.43662V4.3611H19.3543V6.9767H16.8739V15.6352Z" fill="url(#paint1_linear_13364_19230)"/>
  <path d="M24.6907 15.996C21.2634 15.996 18.6027 13.4481 18.6027 9.99817C18.6027 6.52573 21.2634 4.00032 24.6907 4.00032C28.0955 4.00032 30.7787 6.52573 30.7787 9.99817C30.7787 13.4481 28.0955 15.996 24.6907 15.996ZM24.6907 12.8843C26.224 12.8843 27.2838 11.6216 27.2838 9.99817C27.2838 8.32959 26.224 7.11199 24.6907 7.11199C23.1349 7.11199 22.0751 8.32959 22.0751 9.99817C22.0751 11.6216 23.1349 12.8843 24.6907 12.8843Z" fill="url(#paint2_linear_13364_19230)"/>
  <path d="M38.6092 4.15816H38.7671V7.85608C38.474 7.81098 38.2485 7.78843 37.9553 7.78843C36.3319 7.78843 34.7084 8.53253 34.7084 10.8099V15.6352H31.2811V4.3611H34.6182V6.2777C35.4525 4.94735 36.9858 4.15816 38.6092 4.15816Z" fill="url(#paint3_linear_13364_19230)"/>
  <path d="M44.1145 15.996C40.6871 15.996 38.0264 13.4481 38.0264 9.99817C38.0264 6.52573 40.6871 4.00032 44.1145 4.00032C47.5192 4.00032 50.2025 6.52573 50.2025 9.99817C50.2025 13.4481 47.5192 15.996 44.1145 15.996ZM44.1145 12.8843C45.6477 12.8843 46.7075 11.6216 46.7075 9.99817C46.7075 8.32959 45.6477 7.11199 44.1145 7.11199C42.5586 7.11199 41.4989 8.32959 41.4989 9.99817C41.4989 11.6216 42.5586 12.8843 44.1145 12.8843Z" fill="url(#paint4_linear_13364_19230)"/>
  <path d="M54.6508 15.6352H50.5244V11.7344H54.6508V15.6352Z" fill="url(#paint5_linear_13364_19230)"/>
  <path d="M59.0426 15.9735C56.7202 15.9735 54.984 14.6657 54.984 12.4785C54.984 9.90797 57.4417 8.91585 61.072 8.78056L62.5602 8.73546V8.37469C62.5602 7.38256 61.8386 6.72866 60.6436 6.72866C59.426 6.72866 58.7946 7.36002 58.5917 8.26195H55.2771C55.5477 5.87183 57.5319 4.02287 60.6436 4.02287C63.5523 4.02287 65.6944 5.44341 65.6944 8.35214V13.651C65.6944 14.35 65.7395 15.3196 65.8071 15.5901V15.6352H62.6053C62.5827 15.3647 62.5827 14.9813 62.5827 14.5078C61.8386 15.3421 60.6436 15.9735 59.0426 15.9735ZM59.9446 13.4706C61.4779 13.4706 62.5602 12.3657 62.5602 11.0805V10.607L61.6357 10.6521C59.5162 10.7874 58.4113 11.2609 58.4113 12.253C58.4113 12.9971 59.0652 13.4706 59.9446 13.4706Z" fill="url(#paint6_linear_13364_19230)"/>
  <path d="M70.2089 3.09839H66.7815V0.0769213H70.2089V3.09839ZM70.2089 15.6352H66.7815V4.3611H70.2089V15.6352Z" fill="url(#paint7_linear_13364_19230)"/>
  <defs>
    <linearGradient id="paint0_linear_13364_19230" x1="66.9012" y1="15.996" x2="49.9331" y2="37.785" gradientUnits="userSpaceOnUse">
      <stop stop-color="#025A94"/>
      <stop offset="1" stop-color="#2A455E"/>
    </linearGradient>
    <linearGradient id="paint1_linear_13364_19230" x1="66.9012" y1="15.996" x2="49.9331" y2="37.785" gradientUnits="userSpaceOnUse">
      <stop stop-color="#025A94"/>
      <stop offset="1" stop-color="#2A455E"/>
    </linearGradient>
    <linearGradient id="paint2_linear_13364_19230" x1="66.9012" y1="15.996" x2="49.9331" y2="37.785" gradientUnits="userSpaceOnUse">
      <stop stop-color="#025A94"/>
      <stop offset="1" stop-color="#2A455E"/>
    </linearGradient>
    <linearGradient id="paint3_linear_13364_19230" x1="66.9012" y1="15.996" x2="49.9331" y2="37.785" gradientUnits="userSpaceOnUse">
      <stop stop-color="#025A94"/>
      <stop offset="1" stop-color="#2A455E"/>
    </linearGradient>
    <linearGradient id="paint4_linear_13364_19230" x1="66.9012" y1="15.996" x2="49.9331" y2="37.785" gradientUnits="userSpaceOnUse">
      <stop stop-color="#025A94"/>
      <stop offset="1" stop-color="#2A455E"/>
    </linearGradient>
    <linearGradient id="paint5_linear_13364_19230" x1="66.9012" y1="15.996" x2="49.9331" y2="37.785" gradientUnits="userSpaceOnUse">
      <stop stop-color="#025A94"/>
      <stop offset="1" stop-color="#2A455E"/>
    </linearGradient>
    <linearGradient id="paint6_linear_13364_19230" x1="66.9012" y1="15.996" x2="49.9331" y2="37.785" gradientUnits="userSpaceOnUse">
      <stop stop-color="#025A94"/>
      <stop offset="1" stop-color="#2A455E"/>
    </linearGradient>
    <linearGradient id="paint7_linear_13364_19230" x1="66.9012" y1="15.996" x2="49.9331" y2="37.785" gradientUnits="userSpaceOnUse">
      <stop stop-color="#025A94"/>
      <stop offset="1" stop-color="#2A455E"/>
    </linearGradient>
  </defs>
</svg>
        </span>

        <span className="kong-topbar-divider">
          {/* Vertical Divider */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="2"
            height="27"
            viewBox="0 0 2 27"
            fill="none"
          >
            <path
              d="M0.633545 0.633789L0.633544 25.9776"
              stroke="#D1D7E0"
              strokeWidth="1.26719"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <span className="kong-topbar-kong-logo" aria-label="Kong logo">
          {/* Kong Logo */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="50"
            viewBox="0 0 47 46"
            fill="none"
          >
            <path
              d="M4.97266 32.6851V39.29H10.6341L15.8237 32.2133H21.9569L23.8441 29.8543L16.7673 21.834L12.0494 26.0801H10.1623L4.97266 32.6851Z"
              fill="url(#paint0_linear_8342_43527)"
            />
            <path
              d="M16.7673 34.1004L15.8237 35.044L17.7108 37.8747V39.29H25.2594L25.7312 37.8747L21.9569 34.1004H16.7673Z"
              fill="url(#paint1_linear_8342_43527)"
            />
            <path
              d="M21.0133 15.7008L18.1826 20.4186L32.808 37.4029L32.3362 39.29H38.4694L39.8847 34.1004L24.3158 15.7008H21.0133Z"
              fill="url(#paint2_linear_8342_43527)"
            />
            <path
              d="M23.3723 10.9829L21.4851 13.8137L21.9569 14.2854H25.2594L31.3926 20.8904L34.6951 18.0597V17.1162L33.7515 15.229V13.3419L27.1465 8.62402L23.3723 10.9829Z"
              fill="url(#paint3_linear_8342_43527)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_8342_43527"
                x1="33.2798"
                y1="14.2854"
                x2="6.38801"
                y2="37.8747"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#14A06C" />
                <stop offset="1" stopColor="#2578D1" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_8342_43527"
                x1="33.2798"
                y1="14.2854"
                x2="6.38801"
                y2="37.8747"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#14A06C" />
                <stop offset="1" stopColor="#2578D1" />
              </linearGradient>
              <linearGradient
                id="paint2_linear_8342_43527"
                x1="33.2798"
                y1="14.2854"
                x2="6.38801"
                y2="37.8747"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#14A06C" />
                <stop offset="1" stopColor="#2578D1" />
              </linearGradient>
              <linearGradient
                id="paint3_linear_8342_43527"
                x1="33.2798"
                y1="14.2854"
                x2="6.38801"
                y2="37.8747"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#14A06C" />
                <stop offset="1" stopColor="#2578D1" />
              </linearGradient>
            </defs>
          </svg>
        </span>
      </div>
    </header>
  );
};

export default KongBar;
