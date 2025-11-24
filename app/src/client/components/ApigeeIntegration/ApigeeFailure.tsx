import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apigeeLogo } from '../../static/images';
import './ApigeeSuccess.css'; // Using shared styles
import './ApigeeFailure.css'; // Failure-specific styles

const ApigeeFailure: React.FC = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/get-started/integrations');
  };

  const handleTryAgain = () => {
    navigate('/apigee-integration');
  };

  return (
    <div className="apigee-success-page">
      {/* Header */}
      <div className="apigee-header">
        <button className="back-button" onClick={handleBackClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M10.0001 15.8334L4.16675 10.0001M4.16675 10.0001L10.0001 4.16675M4.16675 10.0001H15.8334"
              stroke="#909599"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="aforo-logo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="72"
            height="16"
            viewBox="0 0 72 16"
            fill="none"
          >
            <path
              d="M4.7352 15.9735C2.41273 15.9735 0.676514 14.6657 0.676514 12.4785C0.676514 9.90797 3.13428 8.91585 6.76455 8.78056L8.25274 8.73546V8.37469C8.25274 7.38256 7.53119 6.72866 6.33613 6.72866C5.11852 6.72866 4.48717 7.36002 4.28424 8.26195H0.969641C1.24022 5.87183 3.22447 4.02287 6.33613 4.02287C9.24486 4.02287 11.3869 5.44341 11.3869 8.35214V13.651C11.3869 14.35 11.432 15.3196 11.4997 15.5901V15.6352H8.29783C8.27528 15.3647 8.27528 14.9813 8.27528 14.5078C7.53119 15.3421 6.33613 15.9735 4.7352 15.9735ZM5.63714 13.4706C7.17042 13.4706 8.25274 12.3657 8.25274 11.0805V10.607L7.32826 10.6521C5.20872 10.7874 4.10385 11.2609 4.10385 12.253C4.10385 12.9971 4.75775 13.4706 5.63714 13.4706Z"
              fill="url(#paint0_linear_12866_2370)"
            />
            <path
              d="M16.8742 15.6352H13.5145V6.9767H11.4626V4.3611H13.5596V2.48959C13.5596 0.775918 14.3262 0.00927734 16.0399 0.00927734H19.3545V2.71507H17.5281C16.9418 2.71507 16.7614 2.89546 16.7614 3.43662V4.3611H19.3545V6.9767H16.8742V15.6352Z"
              fill="url(#paint1_linear_12866_2370)"
            />
            <path
              d="M24.691 15.996C21.2636 15.996 18.6029 13.4481 18.6029 9.99817C18.6029 6.52573 21.2636 4.00032 24.691 4.00032C28.0957 4.00032 30.779 6.52573 30.779 9.99817C30.779 13.4481 28.0957 15.996 24.691 15.996ZM24.691 12.8843C26.2242 12.8843 27.284 11.6216 27.284 9.99817C27.284 8.32959 26.2242 7.11199 24.691 7.11199C23.1351 7.11199 22.0754 8.32959 22.0754 9.99817C22.0754 11.6216 23.1351 12.8843 24.691 12.8843Z"
              fill="url(#paint2_linear_12866_2370)"
            />
            <path
              d="M38.6095 4.15816H38.7673V7.85608C38.4742 7.81098 38.2487 7.78843 37.9556 7.78843C36.3321 7.78843 34.7086 8.53253 34.7086 10.8099V15.6352H31.2813V4.3611H34.6184V6.2777C35.4527 4.94735 36.986 4.15816 38.6095 4.15816Z"
              fill="url(#paint3_linear_12866_2370)"
            />
            <path
              d="M44.1147 15.996C40.6874 15.996 38.0267 13.4481 38.0267 9.99817C38.0267 6.52573 40.6874 4.00032 44.1147 4.00032C47.5195 4.00032 50.2027 6.52573 50.2027 9.99817C50.2027 13.4481 47.5195 15.996 44.1147 15.996ZM44.1147 12.8843C45.648 12.8843 46.7078 11.6216 46.7078 9.99817C46.7078 8.32959 45.648 7.11199 44.1147 7.11199C42.5589 7.11199 41.4991 8.32959 41.4991 9.99817C41.4991 11.6216 42.5589 12.8843 44.1147 12.8843Z"
              fill="url(#paint4_linear_12866_2370)"
            />
            <path
              d="M54.651 15.6352H50.5247V11.7344H54.651V15.6352Z"
              fill="url(#paint5_linear_12866_2370)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint2_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint3_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint4_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint5_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="separator">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="2"
            height="27"
            viewBox="0 0 2 27"
            fill="none"
          >
            <path
              d="M0.633545 0.633545L0.633544 25.9773"
              stroke="#D1D7E0"
              strokeWidth="1.26719"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div
          className="apigee-logo"
          style={{
            backgroundImage: `url(${apigeeLogo})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            width: '40px',
            height: '40px',
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="success-content">
        {/* Sidebar */}
        <div className="apigee-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-item failed">
              <div className="sidebar-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                >
                  <path
                    d="M12.5 3.75L6.25 10L2.5 6.25"
                    stroke="#E53935"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="sidebar-text">
                <h4>Manage Connection</h4>
                <p>Failed to Connect</p>
              </div>
            </div>

            <div className="sidebar-item disabled">
              <div className="sidebar-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <g clipPath="url(#clip0_12866_2701)">
                    <path
                      d="M2.2 4.66668L8 8.00002M8 8.00002L13.8 4.66668M8 8.00002L8 14.6667M14 5.33335C13.9998 5.09953 13.938 4.86989 13.821 4.66746C13.704 4.46503 13.5358 4.29692 13.3333 4.18002L8.66667 1.51335C8.46397 1.39633 8.23405 1.33472 8 1.33472C7.76595 1.33472 7.53603 1.39633 7.33333 1.51335L2.66667 4.18002C2.46417 4.29692 2.29599 4.46503 2.17897 4.66746C2.06196 4.86989 2.00024 5.09953 2 5.33335V10.6667C2.00024 10.9005 2.06196 11.1301 2.17897 11.3326C2.29599 11.535 2.46417 11.7031 2.66667 11.82L7.33333 14.4867C7.53603 14.6037 7.76595 14.6653 8 14.6653C8.23405 14.6653 8.46397 14.6037 8.66667 14.4867L13.3333 11.82C13.5358 11.7031 13.704 11.535 13.821 11.3326C13.938 11.1301 13.9998 10.9005 14 10.6667V5.33335Z"
                      stroke="var(--icon-color-lightest, #C4C4C4)"
                      strokeWidth="1.52381"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_12866_2701">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className="sidebar-text">
                <h4>Import Apigee Products</h4>
                <p>Not Available</p>
              </div>
            </div>
          </div>

          <div className="sidebar-footer">
            <button className="import-history-btn" disabled>
              Import History
            </button>
          </div>
        </div>

        {/* Failure Message */}
        <div className="success-main">
          <div className="failure-icon">
            {/* UPDATED SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
            >
              <g filter="url(#filter0_f_13019_74804)">
                <path
                  d="M88.4167 60.9583L95.5833 53.8333H95.5C99.336 49.8585 101.438 44.5239 101.344 39.0007C101.25 33.4776 98.9687 28.2174 95 24.375C91.1123 20.6258 85.9218 18.5308 80.5208 18.5308C75.1198 18.5308 69.9294 20.6258 66.0417 24.375L58.875 31.5M31.4583 58.875L24.3333 66C20.4974 69.9748 18.3955 75.3095 18.4893 80.8326C18.583 86.3558 20.8647 91.616 24.8333 95.4583C28.7211 99.2075 33.9115 101.303 39.3125 101.303C44.7135 101.303 49.9039 99.2075 53.7917 95.4583L60.9167 88.3333M43.25 18.25V30.75M18.25 43.25H30.75M76.5833 89.0833V101.583M89.0833 76.5833H101.583"
                  stroke="url(#paint0_linear_13019_74804)"
                  strokeWidth="12.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <filter
                  id="filter0_f_13019_74804"
                  x="-2.08301"
                  y="-2.08447"
                  width="124"
                  height="124"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feGaussianBlur
                    stdDeviation="6"
                    result="effect1_foregroundBlur_13019_74804"
                  />
                </filter>
                <linearGradient
                  id="paint0_linear_13019_74804"
                  x1="97.6192"
                  y1="101.583"
                  x2="48.0694"
                  y2="116.212"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#025A94" />
                  <stop offset="1" stopColor="#2A455E" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 className="failure-title">Connection Failed</h1>

          <p className="failure-description">
            Unable to connect to Apigee. This could be due to invalid credentials or
            network issues. Please check your settings and try again.
          </p>

          <button className="try-again-btn" onClick={handleTryAgain}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApigeeFailure;
