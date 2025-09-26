import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../PageHeader/PageHeader';
import './Settings.css';

// Placeholder Kong icon (replace with your actual Kong logo component if available)
const KongIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 47 46" fill="none">
  <path d="M4.97266 32.6851V39.29H10.6341L15.8237 32.2133H21.9569L23.8441 29.8543L16.7673 21.834L12.0494 26.0801H10.1623L4.97266 32.6851Z" fill="url(#paint0_linear_8342_43527)"/>
  <path d="M16.7673 34.1004L15.8237 35.044L17.7108 37.8747V39.29H25.2594L25.7312 37.8747L21.9569 34.1004H16.7673Z" fill="url(#paint1_linear_8342_43527)"/>
  <path d="M21.0133 15.7008L18.1826 20.4186L32.808 37.4029L32.3362 39.29H38.4694L39.8847 34.1004L24.3158 15.7008H21.0133Z" fill="url(#paint2_linear_8342_43527)"/>
  <path d="M23.3723 10.9829L21.4851 13.8137L21.9569 14.2854H25.2594L31.3926 20.8904L34.6951 18.0597V17.1162L33.7515 15.229V13.3419L27.1465 8.62402L23.3723 10.9829Z" fill="url(#paint3_linear_8342_43527)"/>
  <defs>
    <linearGradient id="paint0_linear_8342_43527" x1="33.2798" y1="14.2854" x2="6.38801" y2="37.8747" gradientUnits="userSpaceOnUse">
      <stop stop-color="#14A06C"/>
      <stop offset="1" stop-color="#2578D1"/>
    </linearGradient>
    <linearGradient id="paint1_linear_8342_43527" x1="33.2798" y1="14.2854" x2="6.38801" y2="37.8747" gradientUnits="userSpaceOnUse">
      <stop stop-color="#14A06C"/>
      <stop offset="1" stop-color="#2578D1"/>
    </linearGradient>
    <linearGradient id="paint2_linear_8342_43527" x1="33.2798" y1="14.2854" x2="6.38801" y2="37.8747" gradientUnits="userSpaceOnUse">
      <stop stop-color="#14A06C"/>
      <stop offset="1" stop-color="#2578D1"/>
    </linearGradient>
    <linearGradient id="paint3_linear_8342_43527" x1="33.2798" y1="14.2854" x2="6.38801" y2="37.8747" gradientUnits="userSpaceOnUse">
      <stop stop-color="#14A06C"/>
      <stop offset="1" stop-color="#2578D1"/>
    </linearGradient>
  </defs>
</svg>
);

export default function Settings() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleKongIntegrationClick = () => {
    // Navigate to Kong Integration page with state indicating it's from settings
    navigate('/get-started/products/import', { state: { from: 'settings' } });
  };

  return (
    <div className="settings-page">
      <PageHeader 
        title="Settings"
        // No searchTerm or onSearchTermChange to hide search
        // No primaryLabel or onPrimaryClick to hide button
      />

      {/* Tabs */}
      <div className="settings-tabs">
        <button className="tab">Profile</button>
        <button className="tab active">Integrations</button>
        <button className="tab">Record Policy</button>
      </div>

      {/* Kong Integration card */}
      <div className="integration-card">
        <div className="icon">
          <KongIcon />
        </div>
        <div className="info">
          <div className="title">Kong</div>
          <div className="desc">
            Link your Kong account to automatically import your products and pricing.
          </div>
        </div>
        <div className="arrow" onClick={handleKongIntegrationClick} style={{ cursor: 'pointer' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
  <path d="M9 18.5225L15 12.5225L9 6.52246" stroke="#025A94" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>        </div>
      </div>
    </div>
  );
}
