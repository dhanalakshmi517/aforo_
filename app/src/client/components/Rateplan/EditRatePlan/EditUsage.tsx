import React, { useEffect, useState } from 'react';
import './EditUsage.css';
import { getRatePlanData, setRatePlanData } from '../utils/sessionStorage';

interface EditUsageProps {
  validationErrors?: Record<string, string>;
  onClearError?: (key: string) => void;
}

const toStr = (v: any): string => {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return '';
  return String(n);
};

const EditUsage: React.FC<EditUsageProps> = ({ validationErrors = {}, onClearError }) => {
  // Hydrate from sessionStorage first; fall back to legacy localStorage
  const initial =
    getRatePlanData('USAGE_PER_UNIT_AMOUNT') ??
    localStorage.getItem('usagePerUnit') ??
    '';

  const [unitAmount, setUnitAmount] = useState<string>(toStr(initial));

  // If session value changes elsewhere (e.g., draft hydration), reflect it here
  useEffect(() => {
    const hydrated =
      getRatePlanData('USAGE_PER_UNIT_AMOUNT') ??
      localStorage.getItem('usagePerUnit') ??
      '';
    setUnitAmount(toStr(hydrated));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUnitAmount(val);
    // keep session in sync so save path uses the latest value
    setRatePlanData('USAGE_PER_UNIT_AMOUNT', val);
    // (optional) legacy localStorage for backward compatibility with old flows
    localStorage.setItem('usagePerUnit', val);

    // Clear validation error when user enters a value
    if (val.trim() && onClearError) {
      onClearError('perUnitAmount');
    }
  };

  const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
      <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="edit-usage-container">
      <div className="edit-usage-left">
        <label className="edit-usage-label">Per Unit Amount</label>
        <input
          className="edit-usage-input"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.0001"
          value={unitAmount}
          onChange={handleChange}
          placeholder="0.10"
        />
        {validationErrors.perUnitAmount && (
          <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
            <ErrorIcon />
            {validationErrors.perUnitAmount}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditUsage;
