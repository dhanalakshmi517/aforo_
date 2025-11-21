import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apigeeLogo } from '../../static/images';
import './ApigeeSuccess.css';
import './ApigeeFailure.css';

const ApigeeFailure: React.FC = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/get-started/integrations');
  };

  const handleTryAgain = () => {
    // Navigate back to the integration page to try again
    navigate('/apigee-integration');
  };


  return (
    <div className="apigee-failure-page">
      {/* Header */}
      <div className="apigee-header">
        <button className="back-button" onClick={handleBackClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10.0001 15.8334L4.16675 10.0001M4.16675 10.0001L10.0001 4.16675M4.16675 10.0001H15.8334" stroke="#909599" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="aforo-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#025A94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#025A94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#025A94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>aforo.ai</span>
        </div>

        <div className="separator">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12L10 8L6 4" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div 
          className="apigee-logo"
          style={{
            width: '80px',
            height: '32px',
            backgroundImage: `url(${apigeeLogo})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        />
      </div>

      {/* Content */}
      <div className="failure-content">
        {/* Sidebar */}
        <div className="apigee-sidebar">
          <div className="sidebar-section">
            {/* Manage Connection - Failed */}
            <div className="sidebar-item failed">
              <div className="sidebar-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4L12 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="sidebar-text">
                <h4>Manage Connection</h4>
                <p>Failed</p>
              </div>
            </div>

            {/* Import Apigee Products - Disabled */}
            <div className="sidebar-item disabled">
              <div className="sidebar-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1V15M1 8H15" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="sidebar-text">
                <h4>Import Apigee Products</h4>
                <p>Not started</p>
              </div>
            </div>
          </div>

          <div className="sidebar-footer">
            <button className="import-history-btn">
              Import History
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="failure-main">
          {/* Error Icon */}
          <div className="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none">
              <g filter="url(#filter0_f_13019_74808)">
                <path d="M88.4167 60.9583L95.5833 53.8333H95.5C99.336 49.8585 101.438 44.5239 101.344 39.0007C101.25 33.4776 98.9687 28.2174 95 24.375C91.1123 20.6258 85.9218 18.5308 80.5208 18.5308C75.1198 18.5308 69.9294 20.6258 66.0417 24.375L58.875 31.5M31.4583 58.875L24.3333 66C20.4974 69.9748 18.3955 75.3095 18.4893 80.8326C18.583 86.3558 20.8647 91.616 24.8333 95.4583C28.7211 99.2075 33.9115 101.303 39.3125 101.303C44.7135 101.303 49.9039 99.2075 53.7917 95.4583L60.9167 88.3333M43.25 18.25V30.75M18.25 43.25H30.75M76.5833 89.0833V101.583M89.0833 76.5833H101.583" stroke="url(#paint0_linear_13019_74808)" strokeWidth="12.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <filter id="filter0_f_13019_74808" x="-2.08301" y="-2.08447" width="124" height="124" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                  <feGaussianBlur stdDeviation="6" result="effect1_foregroundBlur_13019_74808"/>
                </filter>
                <linearGradient id="paint0_linear_13019_74808" x1="97.6192" y1="101.583" x2="48.0694" y2="116.212" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0262A1"/>
                  <stop offset="1" stopColor="#00365A"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Title */}
          <h1 className="failure-title">Connection Failed</h1>

          {/* Description */}
          <p className="failure-description">
            Import products from kong to aforo seamlessly...
          </p>

          {/* Buttons */}
          <div className="failure-buttons">
            <button className="try-again-btn" onClick={handleTryAgain}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApigeeFailure;
