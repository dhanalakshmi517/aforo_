import React, { useEffect, useState } from 'react';
import './EditUsage.css';
import { getRatePlanData, setRatePlanData } from '../utils/sessionStorage';

const toStr = (v: any): string => {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return '';
  return String(n);
};

const EditUsage: React.FC = () => {
  // Hydrate from sessionStorage first; fall back to legacy localStorage
  const initial =
    getRatePlanData('USAGE_PER_UNIT_AMOUNT') ??
    localStorage.getItem('usagePerUnit') ??
    '';

  const [unitAmount, setUnitAmount] = useState<string>(toStr(initial));
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If session value changes elsewhere (e.g., draft hydration), reflect it here
  useEffect(() => {
    const hydrated =
      getRatePlanData('USAGE_PER_UNIT_AMOUNT') ??
      localStorage.getItem('usagePerUnit') ??
      '';
    setUnitAmount(toStr(hydrated));
  }, []);

  const validate = (val: string): string | null => {
    if (val.trim() === '') return 'This is a required field';
    const n = Number(val);
    if (!Number.isFinite(n) || n <= 0) return 'Enter a valid value';
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUnitAmount(val);
    // keep session in sync so save path uses the latest value
    setRatePlanData('USAGE_PER_UNIT_AMOUNT', val);
    // (optional) legacy localStorage for backward compatibility with old flows
    localStorage.setItem('usagePerUnit', val);
    setError(validate(val));
  };

  return (
    <div className="edit-usage-container">
      <div className="edit-usage-left">
        <label className="edit-usage-label">Per Unit Amount</label>
        <input
          className={`edit-usage-input ${touched && error ? 'error-input' : ''}`}
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
      </div>
    </div>
  );
};

export default EditUsage;
