import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../componenetsss/Header';
import './Integrations.css';

const Integrations: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="integrations-page">
      <Header
        title="Integrations"
        showPrimary={false}
        showKongButton={false}
        showSearch={false}
        onSettingsClick={() => {
          // Handle settings click
          console.log("Settings clicked");
        }}
        onNotificationsClick={() => {
          // Handle notifications click
          console.log("Notifications clicked");
        }}
      />
      
      <div className="integrations-content">
        <div className="integrations-grid">
          {/* Apigee Integration Card */}
          <div className="integration-card">
            <div className="integration-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="8" cy="8" r="3" fill="#4285F4"/>
                <circle cx="16" cy="8" r="3" fill="#EA4335"/>
                <circle cx="8" cy="16" r="3" fill="#34A853"/>
                <circle cx="16" cy="16" r="3" fill="#FBBC04"/>
                <path d="M11 8H13V16H11V8Z" fill="#9AA0A6"/>
                <path d="M8 11V13H16V11H8Z" fill="#9AA0A6"/>
              </svg>
            </div>
            <h3 className="integration-card-title">Apigee</h3>
            <p className="integration-card-description">Apigee is an API management platform by Google that</p>
            <button className="integration-card-sync-btn">+ Sync</button>
          </div>

          {/* QuickBooks Integration Card */}
          <div className="integration-card">
            <div className="integration-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#2CA01C"/>
                <path d="M8 9C8 8.44772 8.44772 8 9 8H11C11.5523 8 12 8.44772 12 9V15C12 15.5523 11.5523 16 11 16H9C8.44772 16 8 15.5523 8 15V9Z" fill="white"/>
                <path d="M12 6C12 5.44772 12.4477 5 13 5H15C15.5523 5 16 5.44772 16 6V18C16 18.5523 15.5523 19 15 19H13C12.4477 19 12 18.5523 12 18V6Z" fill="white"/>
              </svg>
            </div>
            <h3 className="integration-card-title">QuickBooks</h3>
            <p className="integration-card-description">QuickBooks is an accounting software platform by Intuit that</p>
            <button className="integration-card-sync-btn">+ Sync</button>
          </div>

          {/* RazorPay Integration Card */}
          <div className="integration-card">
            <div className="integration-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M2 8L8 2L14 8L20 2L22 4L16 10L22 16L20 18L14 12L8 18L2 12L4 10L10 4L2 8Z" fill="url(#razorpay-gradient)"/>
                <defs>
                  <linearGradient id="razorpay-gradient" x1="2" y1="2" x2="22" y2="18" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3395FF"/>
                    <stop offset="1" stopColor="#1E40AF"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3 className="integration-card-title">RazorPay</h3>
            <p className="integration-card-description">RazorPay is a payment gateway platform by Razorpay that</p>
            <button className="integration-card-sync-btn">+ Sync</button>
          </div>

          {/* Kong Integration Card */}
          <div className="integration-card">
            <div className="integration-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M2 2L8 8L2 14L8 20L14 14L20 20L22 18L16 12L22 6L20 4L14 10L8 4L2 2Z" fill="url(#kong-gradient)"/>
                <defs>
                  <linearGradient id="kong-gradient" x1="2" y1="2" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00C9A7"/>
                    <stop offset="1" stopColor="#1E3A8A"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3 className="integration-card-title">Kong</h3>
            <p className="integration-card-description">Kong is an API management platform and gateway that</p>
            <button className="integration-card-sync-btn">+ Sync</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
