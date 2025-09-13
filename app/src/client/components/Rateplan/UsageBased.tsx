import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { saveUsageBasedPricing } from './api';
import { getRatePlanData, setRatePlanData } from './utils/sessionStorage';
import './UsageBased.css';

export interface UsagePayload { perUnitAmount: number; }

export interface UsageBasedHandle { save: (ratePlanId: number) => Promise<void>; }

interface UsageBasedProps {
  data: UsagePayload;
  onChange: (payload: UsagePayload) => void;
  validationErrors?: Record<string, string>;
}

const numToStr = (n: number | undefined): string => (n && n !== 0 ? n.toString() : '');

const UsageBased = forwardRef<UsageBasedHandle, UsageBasedProps>(({ data, onChange, validationErrors = {} }, ref) => {
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
    // Save to session storage for validation
    setRatePlanData('USAGE_PER_UNIT_AMOUNT', val);
    
    const validationError = validateAmount(val);
    setError(validationError);
    
    const num = val.trim() === '' ? NaN : Number(val);
    onChange({ perUnitAmount: num });
  };

  const handleBlur = () => {
    setTouched(true);
  };

  useImperativeHandle(ref, () => ({
    save: async (ratePlanId: number) => {
      const payload = { perUnitAmount: Number(unitAmount) || 0 };
      await saveUsageBasedPricing(ratePlanId, payload);
    },
  }));

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
        {validationErrors.perUnitAmount && (
          <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
              <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {validationErrors.perUnitAmount}
          </div>
        )}
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
});

export default UsageBased;
