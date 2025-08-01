import React, { useState } from 'react';
import './Extras.css';

interface ExtrasProps {
  noUpperLimit: boolean;
}

export default function Extras({ noUpperLimit }: ExtrasProps): JSX.Element {
  const [activeSections, setActiveSections] = useState<string[]>([]);
  const [freemiumType, setFreemiumType] = useState('');
  const [minimumUsage, setMinimumUsage] = useState('');
const [minimumCharge, setMinimumCharge] = useState('');


  const toggleSection = (section: string) => {
    setActiveSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const iconMap: Record<string, JSX.Element> = {
    setupFee: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M14.6994 6.30022C14.5161 6.48715 14.4135 6.73847 14.4135 7.00022C14.4135 7.26198 14.5161 7.51329 14.6994 7.70022L16.2994 9.30022C16.4863 9.48345 16.7376 9.58608 16.9994 9.58608C17.2611 9.58608 17.5124 9.48345 17.6994 9.30022L21.4694 5.53022C21.9722 6.64141 22.1244 7.87946 21.9058 9.07937C21.6872 10.2793 21.1081 11.3841 20.2456 12.2465C19.3832 13.1089 18.2784 13.6881 17.0785 13.9067C15.8786 14.1253 14.6406 13.9731 13.5294 13.4702L6.61937 20.3802C6.22154 20.778 5.68198 21.0015 5.11937 21.0015C4.55676 21.0015 4.01719 20.778 3.61937 20.3802C3.22154 19.9824 2.99805 19.4428 2.99805 18.8802C2.99805 18.3176 3.22154 17.778 3.61937 17.3802L10.5294 10.4702C10.0265 9.35904 9.87428 8.12099 10.0929 6.92108C10.3115 5.72117 10.8907 4.61638 11.7531 3.75395C12.6155 2.89151 13.7203 2.31239 14.9202 2.09377C16.1201 1.87514 17.3582 2.02739 18.4694 2.53022L14.6994 6.30022Z" stroke="#2B7194" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    ),
    overageCharges: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M3 3V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H21M7 16C7.5 14 8.5 9 11 9C13 9 13 12 15 12C17.5 12 19.5 7 20 5" stroke="#2B7194" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    ),
    discounts: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M15 9L9 15M9 9H9.01M15 15H15.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#2B7194" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    ),
    freemium: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 7.99995V20.9999M12 7.99995C11.6383 6.50935 11.0154 5.23501 10.2127 4.34311C9.41003 3.45121 8.46469 2.98314 7.5 2.99995C6.83696 2.99995 6.20107 3.26334 5.73223 3.73218C5.26339 4.20102 5 4.83691 5 5.49995C5 6.16299 5.26339 6.79887 5.73223 7.26772C6.20107 7.73656 6.83696 7.99995 7.5 7.99995M12 7.99995C12.3617 6.50935 12.9846 5.23501 13.7873 4.34311C14.59 3.45121 15.5353 2.98314 16.5 2.99995C17.163 2.99995 17.7989 3.26334 18.2678 3.73218C18.7366 4.20102 19 4.83691 19 5.49995C19 6.16299 18.7366 6.79887 18.2678 7.26772C17.7989 7.73656 17.163 7.99995 16.5 7.99995M19 11.9999V18.9999C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7892 17.5304 20.9999 17 20.9999H7C6.46957 20.9999 5.96086 20.7892 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 18.9999V11.9999M4 7.99995H20C20.5523 7.99995 21 8.44766 21 8.99995V10.9999C21 11.5522 20.5523 11.9999 20 11.9999H4C3.44772 11.9999 3 11.5522 3 10.9999V8.99995C3 8.44766 3.44772 7.99995 4 7.99995Z" stroke="#2B7194" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    ),
    commitment: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M9 12.0004H15M20 13.0004C20 18.0004 16.5 20.5004 12.34 21.9504C12.1222 22.0243 11.8855 22.0207 11.67 21.9404C7.5 20.5004 4 18.0004 4 13.0004V6.00045C4 5.73523 4.10536 5.48088 4.29289 5.29334C4.48043 5.10581 4.73478 5.00045 5 5.00045C7 5.00045 9.5 3.80045 11.24 2.28045C11.4519 2.09945 11.7214 2 12 2C12.2786 2 12.5481 2.09945 12.76 2.28045C14.51 3.81045 17 5.00045 19 5.00045C19.2652 5.00045 19.5196 5.10581 19.7071 5.29334C19.8946 5.48088 20 5.73523 20 6.00045V13.0004Z" stroke="#2B7194" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    ),
  
  };

  const renderHeader = (label: string, section: string): JSX.Element => (
    <div className="section-header" onClick={() => toggleSection(section)}>
      <button type="button" className="header-icon-btn" aria-label={`${label} icon`}>
        {iconMap[section]}
      </button>
      <span className="header-label">{label}</span>
      <span className="dropdown-icon">
        {activeSections.includes(section) ? (
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
           <path d="M15 12.5L10 7.5L5 12.5" stroke="#2B7194" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>
        ) : (
         
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 7.5L10 12.5L15 7.5" stroke="#2B7194" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
        )}
      </span>
    </div>
  );

  return (
<<<<<<< HEAD
    <>
=======
    <div className="extras-container">
>>>>>>> main
      {/* Setup Fee */}
      <div className="section">
        {renderHeader('Setup Fee(Optional)', 'setupFee')}
        <div className="description-row"><p className="description">Charge a one-time fee when the customer starts this plan.</p><button className="icon-btn" aria-label="Add setup fee action" /></div>
        {activeSections.includes('setupFee') && (
          <div className="section-content">
            <label>Enter one-time Setup Fee <span className="optional">(optional)</span></label>
            <input type="text" placeholder="$22" />
            <label>Application Timing</label>
            <input type="text" placeholder="$22" />
            <label>Invoice Description</label>
            <textarea placeholder="Invoice Description"></textarea>
          </div>
        )}
      </div>

<<<<<<< HEAD
      
      {/* Discounts */}
      <div className="section">
        {renderHeader('Discounts(Optional)', 'discounts')}
=======
      {/* Overage Charges - only visible if noUpperLimit is false */}
      {!noUpperLimit && (
        <div className="section">
          {renderHeader('Overage Charges', 'overageCharges')}
          <div className="description-row"><p className="description">Define how customers are billed when usage exceeds the plan limits.</p><button className="icon-btn" aria-label="Add overage action" /></div>
          {activeSections.includes('overageCharges') && (
            <div className="section-content">
              <label>Overage unit rate</label>
              <input type="text" placeholder="Placeholder" />
              <label>Grace buffer <span className="optional">(optional)</span></label>
              <input type="text" placeholder="Placeholder" />
            </div>
          )}
        </div>
      )}

      {/* Discounts */}
      <div className="section">
        {renderHeader('Discounts', 'discounts')}
>>>>>>> main
        <div className="description-row"><p className="description">Add time-bound or recurring discounts to attract or retain users.</p><button className="icon-btn" aria-label="Add discount action" /></div>
        {activeSections.includes('discounts') && (
          <div className="section-content">
            <label>Discount Type</label>
            <select><option>Placeholder</option></select>
            <label>Enter % discount</label>
            <input type="text" placeholder="Placeholder" />
            <label>Enter Flat Discount Amount</label>
            <input type="text" placeholder="Placeholder" />
            <label>Eligibility</label>
            <select><option>Placeholder</option></select>
            <label>Validity Period</label>
            <div className="date-range">
              <div className="date-input">
                <label>Start Date</label>
                <input type="date" />
              </div>
              <div className="date-input">
                <label>End Date</label>
                <input type="date" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Freemium Setup */}
      <div className="section">
<<<<<<< HEAD
        {renderHeader('Freemium Setup(Optional)', 'freemium')}
=======
        {renderHeader('Freemium Setup', 'freemium')}
>>>>>>> main
        <div className="description-row"><p className="description">Allow limited access to features for free before switching to paid tiers.</p><button className="icon-btn" aria-label="Add freemium action" /></div>
        {activeSections.includes('freemium') && (
          <div className="section-content">
            <label>Freemium Type</label>
            <select value={freemiumType} onChange={(e) => setFreemiumType(e.target.value)}>
              <option value="">--Select--</option>
              <option value="free_units">Free Units</option>
              <option value="free_trial">Free Trial Duration</option>
              <option value="units_per_duration">Free Units for Duration</option>
            </select>

            {(freemiumType === 'free_units' || freemiumType === 'units_per_duration') && (
              <>
                <label>Select Free Units</label>
                <input type="text" placeholder="Enter Free Units" />
              </>
            )}

            {(freemiumType === 'free_trial' || freemiumType === 'units_per_duration') && (
              <>
                <label>Select Free Trial Duration</label>
                <input type="text" placeholder="Enter Trial Duration" />
              </>
            )}

            <div className="date-range">
              <div className="date-input">
                <label>Start Date</label>
                <input type="date" />
              </div>
              <div className="date-input">
                <label>End Date</label>
                <input type="date" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Minimum Commitment */}
      <div className="section">
<<<<<<< HEAD
        {renderHeader('Minimum Commitment(Optional)', 'commitment')}
=======
        {renderHeader('Minimum Commitment', 'commitment')}
>>>>>>> main
        <div className="description-row"><p className="description">Define how customers are billed when usage exceeds the plan limits.</p><button className="icon-btn" aria-label="Add commitment action" /></div>
        {activeSections.includes('commitment') && (
          <div className="section-content">
            <label>Minimum Usage</label>
            <input
              type="text"
              placeholder="Enter usage"
              value={minimumUsage}
              onChange={(e) => {
                setMinimumUsage(e.target.value);
                if (e.target.value) setMinimumCharge(''); // Clear charge
              }}
              disabled={!!minimumCharge}
            />

            <label>Minimum Charge</label>
            <input
              type="text"
              placeholder="Enter charge"
              value={minimumCharge}
              onChange={(e) => {
                setMinimumCharge(e.target.value);
                if (e.target.value) setMinimumUsage(''); // Clear usage
              }}
              disabled={!!minimumUsage}
            />
          </div>
        )}
      </div>
<<<<<<< HEAD
      </>

     
=======

     
    </div>
>>>>>>> main
  );
}
