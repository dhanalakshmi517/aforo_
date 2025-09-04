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
  const [touched, setTouched] = useState<boolean>(false);

  const validateAmount = (value: string): string | null => {
    if (value.trim() === '') {
      return 'This is a required field';
    }
    const num = Number(value);
    if (Number.isNaN(num) || num <= 0) {
      return 'Enter a valid value';
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUnitAmount(val);
    
    const validationError = validateAmount(val);
    setError(validationError);
    
    const num = val.trim() === '' ? NaN : Number(val);
    onChange({ perUnitAmount: num });
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <div className="usage-container">
      <div className="usage-left">
        <label className="usage-label">Per Unit Amount</label>
        <input
          className={`usage-input-field ${touched && error ? 'error-input' : ''}`}
          type="text"
          value={unitAmount}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="$0.10"
        />
        {touched && error && <span className="error-text">{error}</span>}
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
