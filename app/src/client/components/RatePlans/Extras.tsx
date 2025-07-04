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

  const renderHeader = (label: string, section: string): JSX.Element => (
    <div className="section-header" onClick={() => toggleSection(section)}>
      <span>{label}</span>
      <span className="dropdown-icon">
        {activeSections.includes(section) ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 12.5L10 7.5L5 12.5" stroke="#726E6C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="#726E6C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </div>
  );

  return (
    <div className="extras-container">
      {/* Setup Fee */}
      <div className="section">
        {renderHeader('Setup Fee(Optional)', 'setupFee')}
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

      {/* Overage Charges - only visible if noUpperLimit is false */}
      {!noUpperLimit && (
        <div className="section">
          {renderHeader('Overage Charges', 'overageCharges')}
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
        {renderHeader('Freemium Setup', 'freemium')}
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
  {renderHeader('Minimum Commitment', 'commitment')}
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


      {/* Reset Period */}
      <div className="section">
        {renderHeader('Reset Period', 'resetPeriod')}
        {activeSections.includes('resetPeriod') && (
          <div className="section-content">
            <label>Reset Frequency</label>
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
    </div>
  );
}
