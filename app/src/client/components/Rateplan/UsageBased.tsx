import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { saveUsageBasedPricing } from './api';
import { setRatePlanData } from './utils/sessionStorage';
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

  // ✅ hydrate internal state from props (critical for resume-draft)
  useEffect(() => {
    setUnitAmount(numToStr(data.perUnitAmount));
  }, [data]);

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
    setRatePlanData('USAGE_PER_UNIT_AMOUNT', val); // for parent validator
    setError(validateAmount(val));
    onChange({ perUnitAmount: val.trim() === '' ? NaN : Number(val) });
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
          type="number"
          inputMode="decimal"
          min="0"
          step="0.0001"
          value={unitAmount}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          placeholder="0.10"
        />
        {touched && error && <span className="error-text">{error}</span>}
        {validationErrors.perUnitAmount && (
          <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
            {validationErrors.perUnitAmount}
          </div>
        )}
      </div>

      <div className="usage-example-section">
        <h4>EXAMPLE</h4>
        <a href="#">Usage Based Pricing</a>
        <p className="usage-highlight">0.10 per usage</p>
        <p className="usage-note">
          <a href="#">You to consumer:</a><br />
          <em>“You’ve consumed 10,000 units this cycle. At $0.10 per unit, your total comes to $1,000.”</em>
        </p>
      </div>
    </div>
  );
});

export default UsageBased;
