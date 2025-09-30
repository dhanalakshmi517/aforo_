import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import './KongIntegration.css';

import TopBar from '../../componenetsss/TopBar';
import Logo from '../../componenetsss/Logo';
import KongPopup from '../../componenetsss/Kongpopup';
import { InputField } from '../../componenetsss/Inputs';
import Kong from '../../componenetsss/Kong';
import CountrySelector from '../../Common/CountrySelector';
import { fetchCountries } from '../../Landing/api';

type Country = {
  code: string;
  name: string;
  dialCode: string;
};

interface KongIntegrationProps {
  onClose: () => void; // use this for TopBar back
}

function ConnectorLine(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="104" height="2" viewBox="0 0 104 2" fill="none" {...props}>
      <path d="M1.08984 0.818359H103.09" stroke="url(#paint0_linear_8436_48735)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="10 8"/>
      <defs>
        <linearGradient id="paint0_linear_8436_48735" x1="1.08984" y1="1.31836" x2="103.09" y2="1.31836" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1BBFA5"/>
          <stop offset="1" stopColor="#003B61"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
export default function KongIntegration({ onClose }: KongIntegrationProps) {
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState('');
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [authToken, setAuthToken] = React.useState('');
  const [showToken, setShowToken] = React.useState(false);
  const navigate = useNavigate();

  // Fetch countries on component mount
  React.useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await fetchCountries();
        setCountries(data);
      } catch (error) {
        console.error('Failed to load countries:', error);
        // Fallback to some default countries if API fails
        setCountries([
          { code: 'US', name: 'United States', dialCode: '+1' },
          { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
          { code: 'IN', name: 'India', dialCode: '+91' },
          { code: 'SG', name: 'Singapore', dialCode: '+65' },
          { code: 'AU', name: 'Australia', dialCode: '+61' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    loadCountries();
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log the import attempt
    console.log('Importing with', { 
      country: selectedCountry ? 
        (countries.find(c => c.code === selectedCountry)?.name || selectedCountry) : 
        'No country selected',
      authToken
    });
    
    // hide sidebar via global event used in App
    window.dispatchEvent(new CustomEvent('toggleSidebar', { 
      detail: { 
        shouldShow: false, 
        hideBreadcrumb: true 
      } 
    }));
    navigate('/get-started/products/import');
  };
  return (
    <>
      <TopBar title="Kong Integration" onBack={onClose} />

      <div className="kong-page">
        <div className="kong-card">
          {/* brand row */}
          <div className="kong-brand-row" aria-hidden="true">
          <Kong size={45} title="Kong" />

            <ConnectorLine className="kong-bridge" />
            <Logo size={32} title="Aforo" />
          </div>

          {/* title + subtitle */}
          <div className="kong-headings">
            <h2 className="kong-title">Connect Your Kong Account</h2>
            <p className="kong-subtitle">
              Securely connect to Kong to import services
            </p>
          </div>

          {/* form */}
          <form className="kong-form" onSubmit={onSubmit} noValidate>
            <div className="kong-field">
              <div className="kong-field">
                <label className="kong-label">Select Country (Optional)</label>
                {isLoading ? (
                  <div className="loading-text">Loading countries...</div>
                ) : (
                  <div className="kong-country-selector">
                    <CountrySelector
                      value={selectedCountry}
                      onChange={setSelectedCountry}
                      countries={countries}
                      showDialCode={false}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="kong-field">
              <div className="kong-label-row">
                <span className="kong-label">Auth Token*</span>
              </div>
                <InputField
                  type="text"
                  name="kong-auth-token"
                  id="kong-auth-token"
                  placeholder="Enter your Kong auth token"
                  value={authToken}
                  onChange={setAuthToken}
                  data-lpignore="true"
                  data-form-type="none"
                  required
                />
                {/* <button 
                  style={{
                    position: 'absolute', 
                    right: 10, 
                    top: '50%', 
                    transform: 'translateY(-30%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-neutral-500)'
                  }}
                  type="button"
                  aria-label={showToken ? 'Hide token' : 'Show token'}
                  onClick={() => setShowToken(v => !v)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
                  </svg>
                </button> */}
            </div>

            <button className="kong-btn" type="submit">
              Import Products
            </button>
          </form>
        </div>
      </div>

      {showConfirm && (
        <KongPopup
          isOpen
          onClose={() => setShowConfirm(false)}
          onKeep={() => setShowConfirm(false)}
          onLeave={() => { setShowConfirm(false); onClose(); }}
        />
      )}
    </>
  );
}
