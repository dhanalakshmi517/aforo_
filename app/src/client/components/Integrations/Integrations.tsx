import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../componenetsss/Header';
import { kongLogo, razorpayLogo, quickbooksLogo, apigeeLogo } from '../../static/images';
import KongIntegration from '../Products/Kong Integration/KongIntegration';
import './Integrations.css';

const Integrations: React.FC = () => {
  const navigate = useNavigate();
  const [showKongIntegration, setShowKongIntegration] = useState(false);

  const handleKongSync = () => {
    setShowKongIntegration(true);
  };

  const handleApigeeSync = () => {
    navigate('/apigee-integration');
  };

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
          {/* Kong Integration Card */}
          <div className="integration-card">
            <div className="integration-card-content">
              <div 
                className="integration-card-icon"
                style={{
                  backgroundImage: `url(${kongLogo})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: '64px',
                  height: '64px'
                }}
              ></div>
              <div className="integration-card-text">
                <h3 className="integration-card-title">Kong</h3>
                <p className="integration-card-description">Kong is an API management platform by Google that</p>
              </div>
            </div>
            <button className="integration-card-sync-btn" onClick={handleKongSync}>+ Sync</button>
          </div>

          {/* Apigee Integration Card */}
          <div className="integration-card">
            <div className="integration-card-content">
              <div 
                className="integration-card-icon"
                style={{
                  backgroundImage: `url(${apigeeLogo})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: '64px',
                  height: '64px'
                }}
              ></div>
              <div className="integration-card-text">
                <h3 className="integration-card-title">Apigee</h3>
                <p className="integration-card-description">Apigee is an API management platform by Google that</p>
              </div>
            </div>
            <button className="integration-card-sync-btn" onClick={handleApigeeSync}>+ Sync</button>
          </div>

          {/* Razorpay Integration Card */}
          <div className="integration-card">
            <div className="integration-card-content">
              <div 
                className="integration-card-icon"
                style={{
                  backgroundImage: `url(${razorpayLogo})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: '64px',
                  height: '64px'
                }}
              ></div>
              <div className="integration-card-text">
                <h3 className="integration-card-title">Razorpay</h3>
                <p className="integration-card-description">Razorpay is an API management platform by Google that</p>
              </div>
            </div>
            <button className="integration-card-sync-btn">+ Sync</button>
          </div>

          {/* QuickBooks Integration Card */}
          <div className="integration-card">
            <div className="integration-card-content">
              <div 
                className="integration-card-icon"
                style={{
                  backgroundImage: `url(${quickbooksLogo})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: '64px',
                  height: '64px'
                }}
              ></div>
              <div className="integration-card-text">
                <h3 className="integration-card-title">QuickBooks</h3>
                <p className="integration-card-description">Quickbooks is an API management platform by Google that</p>
              </div>
            </div>
            <button className="integration-card-sync-btn">+ Sync</button>
          </div>
        </div>
      </div>
      
      {showKongIntegration && (
        <KongIntegration onClose={() => setShowKongIntegration(false)} />
      )}
    </div>
  );
};

export default Integrations;
