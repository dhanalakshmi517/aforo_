import React, { useState } from 'react';
import './EditExtras.css';

interface EditExtrasProps {
  noUpperLimit: boolean;
}

export default function EditExtras({ noUpperLimit }: EditExtrasProps): JSX.Element {
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
        <path d="M14.6994 6.30022...Z" stroke="#2B7194" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    overageCharges: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 3V19C3..." stroke="#2B7194" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    discounts: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 9L9 15M..." stroke="#2B7194" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    freemium: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 7.99995V20.9..." stroke="#2B7194" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    commitment: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 12.0004H15M..." stroke="#2B7194" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
            <path d="M15 12.5L10 7.5L5 12.5" stroke="#2B7194" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="#2B7194" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </div>
  );

  return (
    <>
      {/* Setup Fee */}
      <div className="section">
        {renderHeader('Setup Fee (Optional)', 'setupFee')}
        <div className="description-row">
          <p className="description">Charge a one-time fee when the customer starts this plan.</p>
          <button className="icon-btn" aria-label="Add setup fee action" />
        </div>
        {activeSections.includes('setupFee') && (
          <div className="section-content">
            <label>Enter one-time Setup Fee <span className="optional">(optional)</span></label>
            <input type="text" placeholder="$22" />
            <label>Application Timing</label>
            <input type="text" placeholder="On Activation / First Invoice" />
            <label>Invoice Description</label>
            <textarea placeholder="Invoice Description"></textarea>
          </div>
        )}
      </div>

      {/* Discounts */}
      <div className="section">
        {renderHeader('Discounts', 'discounts')}
        <div className="description-row">
          <p className="description">Add time-bound or recurring discounts to attract or retain users.</p>
          <button className="icon-btn" aria-label="Add discount action" />
        </div>
        {activeSections.includes('discounts') && (
          <div className="section-content">
            <label>Discount Type</label>
            <select><option>Recurring / One-time</option></select>
            <label>Enter % discount</label>
            <input type="text" placeholder="10%" />
            <label>Enter Flat Discount Amount</label>
            <input type="text" placeholder="$50" />
            <label>Eligibility</label>
            <select><option>All Customers / New Customers</option></select>
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
        {renderHeader('Freemium Setup', 'freemium')}
        <div className="description-row">
          <p className="description">Allow limited access to features for free before switching to paid tiers.</p>
          <button className="icon-btn" aria-label="Add freemium action" />
        </div>
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
                <input type="text" placeholder="e.g., 1000 API calls" />
              </>
            )}

            {(freemiumType === 'free_trial' || freemiumType === 'units_per_duration') && (
              <>
                <label>Select Free Trial Duration</label>
                <input type="text" placeholder="e.g., 14 days" />
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
        {renderHeader('Minimum Commitment', 'commitment')}
        <div className="description-row">
          <p className="description">Define how customers are billed when usage exceeds the plan limits.</p>
          <button className="icon-btn" aria-label="Add commitment action" />
        </div>
        {activeSections.includes('commitment') && (
          <div className="section-content">
            <label>Minimum Usage</label>
            <input
              type="text"
              placeholder="Enter usage"
              value={minimumUsage}
              onChange={(e) => {
                setMinimumUsage(e.target.value);
                if (e.target.value) setMinimumCharge('');
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
                if (e.target.value) setMinimumUsage('');
              }}
              disabled={!!minimumUsage}
            />
          </div>
        )}
      </div>
    </>
  );
}
