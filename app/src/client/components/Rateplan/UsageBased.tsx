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
  onClearError?: (key: string) => void;
  locked?: boolean;
}

const numToStr = (n: number | undefined): string => {
  if (n === undefined || n === null || Number.isNaN(n) || n === 0) return '';
  return n.toString();
};

const UsageBased = forwardRef<UsageBasedHandle, UsageBasedProps>(({ data, onChange, validationErrors = {}, onClearError, locked = false }, ref) => {
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

    // Clear parent validation error when user enters a value
    if (val.trim() && onClearError) {
      onClearError('perUnitAmount');
    }
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
          disabled={locked}
        />
        {touched && error && <span className="error-text">{error}</span>}
        {validationErrors.perUnitAmount && (
          <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
            {validationErrors.perUnitAmount}
          </div>
        )}
      </div>

      <div className="usage-example-section">
        <div className="usage-example-header">
          <div className="usage-example-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
              <path d="M4.8845 17.025C4.35517 17.0083 3.85167 16.8717 3.374 16.6152C2.8965 16.3589 2.44492 15.9827 2.01925 15.4865C1.38458 14.7442 0.889417 13.8461 0.53375 12.7922C0.177917 11.7384 0 10.6506 0 9.52875C0 8.20958 0.248083 6.9705 0.74425 5.8115C1.24042 4.6525 1.91767 3.64383 2.776 2.7855C3.63433 1.92717 4.64142 1.24833 5.79725 0.749C6.95292 0.249667 8.18717 0 9.5 0C10.8128 0 12.0471 0.25225 13.2028 0.75675C14.3586 1.26125 15.3641 1.94617 16.2193 2.8115C17.0744 3.677 17.7517 4.69275 18.251 5.85875C18.7503 7.02475 19 8.27442 19 9.60775C19 10.7884 18.8092 11.9067 18.4277 12.9625C18.0464 14.0182 17.5109 14.9166 16.8212 15.6577C16.3929 16.1116 15.9477 16.4529 15.4855 16.6817C15.0233 16.9106 14.5448 17.025 14.05 17.025C13.782 17.025 13.5173 16.9923 13.2557 16.927C12.9942 16.8615 12.7327 16.7634 12.4712 16.6327L11.0712 15.9327C10.8328 15.8134 10.5802 15.724 10.3135 15.6645C10.0468 15.6048 9.7725 15.575 9.4905 15.575C9.202 15.575 8.926 15.6048 8.6625 15.6645C8.399 15.724 8.15125 15.8134 7.91925 15.9327L6.52875 16.6327C6.25058 16.7801 5.97817 16.8865 5.7115 16.952C5.44483 17.0173 5.16917 17.0417 4.8845 17.025ZM4.925 15.525C5.075 15.525 5.22917 15.5083 5.3875 15.475C5.54583 15.4417 5.7 15.3833 5.85 15.3L7.25 14.6C7.6 14.4167 7.9625 14.2833 8.3375 14.2C8.7125 14.1167 9.09167 14.075 9.475 14.075C9.85833 14.075 10.2417 14.1167 10.625 14.2C11.0083 14.2833 11.375 14.4167 11.725 14.6L13.15 15.3C13.3 15.3833 13.45 15.4417 13.6 15.475C13.75 15.5083 13.9 15.525 14.05 15.525C14.3667 15.525 14.6683 15.4417 14.9548 15.275C15.2413 15.1083 15.5262 14.8583 15.8095 14.525C16.3428 13.8917 16.7579 13.1333 17.0548 12.25C17.3516 11.3667 17.5 10.4552 17.5 9.5155C17.5 7.28217 16.725 5.38792 15.175 3.83275C13.625 2.27758 11.7333 1.5 9.5 1.5C7.26667 1.5 5.375 2.28333 3.825 3.85C2.275 5.41667 1.5 7.31667 1.5 9.55C1.5 10.5 1.65575 11.425 1.96725 12.325C2.27875 13.225 2.70633 13.9833 3.25 14.6C3.53333 14.9333 3.80833 15.1708 4.075 15.3125C4.34167 15.4542 4.625 15.525 4.925 15.525ZM9.5 11.25C9.98583 11.25 10.399 11.0798 10.7395 10.7395C11.0798 10.399 11.25 9.98583 11.25 9.5C11.25 9.36033 11.2327 9.22217 11.198 9.0855C11.1635 8.949 11.1148 8.81733 11.052 8.6905L12.6 6.6595C12.8218 6.89933 13.0087 7.15125 13.1605 7.41525C13.3125 7.67942 13.4333 7.96083 13.523 8.2595C13.5872 8.45567 13.6833 8.6265 13.8115 8.772C13.9397 8.9175 14.1018 8.99025 14.298 8.99025C14.5545 8.99025 14.7529 8.87967 14.8932 8.6585C15.0336 8.4375 15.0685 8.19367 14.998 7.927C14.6455 6.69233 13.9613 5.6875 12.9453 4.9125C11.9293 4.1375 10.7808 3.75 9.5 3.75C8.209 3.75 7.05642 4.1375 6.04225 4.9125C5.02825 5.6875 4.34492 6.69233 3.99225 7.927C3.92175 8.19367 3.95833 8.4375 4.102 8.6585C4.2455 8.87967 4.44225 8.99025 4.69225 8.99025C4.88842 8.99025 5.049 8.9175 5.174 8.772C5.299 8.6265 5.39358 8.45567 5.45775 8.2595C5.72308 7.36333 6.22758 6.63775 6.97125 6.08275C7.71475 5.52758 8.55767 5.25 9.5 5.25C9.83717 5.25 10.1686 5.29258 10.4943 5.37775C10.8199 5.46308 11.1283 5.58458 11.4193 5.74225L9.85575 7.80375C9.80325 7.79108 9.744 7.77892 9.678 7.76725C9.61183 7.75575 9.5525 7.75 9.5 7.75C9.01417 7.75 8.601 7.92017 8.2605 8.2605C7.92017 8.601 7.75 9.01417 7.75 9.5C7.75 9.98583 7.92017 10.399 8.2605 10.7395C8.601 11.0798 9.01417 11.25 9.5 11.25Z" fill="#0262A1" />
            </svg>
          </div>
          <div className="usage-example-header-text">
            <h4>EXAMPLE</h4>
            <button type="button" className="usage-example-link">Usage Based Pricing</button>
          </div>
        </div>

        <p className="usage-highlight"><strong>0.10 per usage</strong></p>
        <p className="usage-note">
          <span className="usage-note-title">You to consumer:</span><br />
          <span className="usage-note-text">"You’ve consumed 10,000 units this cycle. At $0.10 per unit, your total comes to $1,000."</span>
        </p>
      </div>
    </div>
  );
});

export default UsageBased;
