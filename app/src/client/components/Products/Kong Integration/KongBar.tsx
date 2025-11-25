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
          <img src={aforoLogo} alt="aforo.ai" />
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
