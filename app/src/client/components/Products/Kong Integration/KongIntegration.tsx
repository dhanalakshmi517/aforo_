import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import './KongIntegration.css';

import TopBar from '../../componenetsss/TopBar';
import Logo from '../../componenetsss/Logo';
import KongPopup from '../../componenetsss/Kongpopup';
import { InputField } from '../../componenetsss/Inputs';
import Kong from '../../componenetsss/Kong';

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
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Directly show product selection screen
    console.log('Importing with', { email, password });
    // hide sidebar via global event used in App
    window.dispatchEvent(new CustomEvent('toggleSidebar', { detail: { shouldShow: false, hideBreadcrumb: true }}));
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
            Securely connect to Kong to import services            </p>
          </div>

          {/* form */}
          <form className="kong-form" onSubmit={onSubmit} noValidate>
            <div className="kong-field">
              <InputField
                label="Email ID"
                required
                type="email"
                name="email"
                placeholder="john@example.com"
                value={email}
                onChange={setEmail}
                autoComplete="username"
              />
            </div>

            <div className="kong-field">
              <div className="kong-label-row" style={{marginBottom:'4px'}}>
                <span className="kong-label">Password*</span>
                <a className="kong-forgot" href="#" onClick={(e)=>e.preventDefault()}>Forgot password?</a>
              </div>
              <div style={{position:'relative'}}>
                <InputField
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="current-password"
                  required
                />
                <button style={{position:'absolute', right:10, top:'50%', transform:'translateY(-30%)'}}
                  type="button"
                  className="kong-eye"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPw(v => !v)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
                  </svg>
                </button>
              </div>
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
