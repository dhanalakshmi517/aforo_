import React, { useState } from 'react';
import './UsageBased.css';



export interface UsagePayload { perUnitAmount: number; }

interface UsageBasedProps {
  data: UsagePayload;
  onChange: (payload: UsagePayload) => void;
}

const numToStr = (n: number | undefined): string => (n && n !== 0 ? n.toString() : '');

const UsageBased: React.FC<UsageBasedProps> = ({ data, onChange }) => {
  const [unitAmount, setUnitAmount] = useState<string>(numToStr(data.perUnitAmount));
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="usage-container">
      <div className="usage-left">
        <label className="usage-label">Per Unit Amount</label>
        <input
          className="usage-input-field"
          type="text"
          value={unitAmount}
          onChange={(e) => {
            const val = e.target.value;
            setUnitAmount(val);
            const num = val.trim() === '' ? NaN : Number(val);
            if (isNaN(num) || num <= 0) {
              setError('Enter a valid amount');
            } else {
              setError(null);
            }
            onChange({ perUnitAmount: num });
          }}
          placeholder="$0.10"
        />
        {error && <span className="error-text">{error}</span>}
      </div>

      <div className="usage-example-section">
        <h4>EXAMPLE</h4>
        <a href="#">Usage Based Pricing</a>
        <p className="usage-highlight">0.1$ per usage</p>
        <p className="usage-note">
          <a href="#">You to consumer:</a><br />
          <em>“You’ve consumed 10,000 units this cycle. At $0.10 per unit, your total comes to $1,000.”</em>
        </p>
      </div>
          
    </div>
  );
};

export default UsageBased;
