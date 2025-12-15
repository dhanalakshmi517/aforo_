// EditFlat.tsx
import React, { useState, useEffect } from 'react';
import './EditFlat.css';
import { getRatePlanData, setRatePlanData } from '../utils/sessionStorage';

interface EditFlatProps {
  validationErrors?: Record<string, string>;
  onClearError?: (key: string) => void;
}

const read = (sessionKey: any, legacyKey: string): string =>
  getRatePlanData(sessionKey as any) ??
  localStorage.getItem(legacyKey) ??
  '';

const EditFlat: React.FC<EditFlatProps> = ({ validationErrors = {}, onClearError }) => {
  // Initialize from session-scoped storage first, then legacy localStorage
  const [flatFee, setFlatFee] = useState<string>(() => read('FLAT_FEE_AMOUNT', 'flatFeeAmount'));
  const [apiCalls, setApiCalls] = useState<string>(() => read('FLAT_FEE_API_CALLS', 'flatFeeApiCalls'));
  const [overageRate, setOverageRate] = useState<string>(() => read('FLAT_FEE_OVERAGE', 'flatFeeOverage'));
  const [graceBuffer, setGraceBuffer] = useState<string>(() => read('FLAT_FEE_GRACE', 'flatFeeGrace'));

  // On mount, re-hydrate once more in case parent finished setting session data just before this render
  useEffect(() => {
    setFlatFee(read('FLAT_FEE_AMOUNT', 'flatFeeAmount'));
    setApiCalls(read('FLAT_FEE_API_CALLS', 'flatFeeApiCalls'));
    setOverageRate(read('FLAT_FEE_OVERAGE', 'flatFeeOverage'));
    setGraceBuffer(read('FLAT_FEE_GRACE', 'flatFeeGrace'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange =
    (
      setter: React.Dispatch<React.SetStateAction<string>>,
      sessionKey:
        | 'FLAT_FEE_AMOUNT'
        | 'FLAT_FEE_API_CALLS'
        | 'FLAT_FEE_OVERAGE'
        | 'FLAT_FEE_GRACE',
      legacyKey: string,
      errorKey: string
    ) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setter(val);
        // new session-scoped storage (used by the rest of the wizard)
        setRatePlanData(sessionKey as any, val);
        // legacy localStorage for backwards compatibility
        localStorage.setItem(legacyKey, val);

        // Clear validation error when user enters a value
        if (val.trim() && onClearError) {
          onClearError(errorKey);
        }
      };

  const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
      <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6. 5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="edit-flat-fee-container">
      <div className="edit-form-sections">
        <div className="edit-form-section">
          <label htmlFor="flat-fee-amount">Flat Fee Amount</label>
          <input
            id="flat-fee-amount"
            type="number"
            placeholder="Enter amount"
            value={flatFee}
            onChange={handleChange(setFlatFee, 'FLAT_FEE_AMOUNT', 'flatFeeAmount', 'flatFeeAmount')}
          />
          {validationErrors.flatFeeAmount && (
            <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
              <ErrorIcon />
              {validationErrors.flatFeeAmount}
            </div>
          )}
        </div>

        <div className="edit-form-section">
          <label htmlFor="flat-fee-api">Number of API calls</label>
          <input
            id="flat-fee-api"
            type="number"
            placeholder="Enter limit"
            value={apiCalls}
            onChange={handleChange(setApiCalls, 'FLAT_FEE_API_CALLS', 'flatFeeApiCalls', 'apiCalls')}
          />
          {validationErrors.apiCalls && (
            <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
              <ErrorIcon />
              {validationErrors.apiCalls}
            </div>
          )}
        </div>

        <div className="edit-form-section">
          <label htmlFor="flat-fee-overage">Overage unit rate</label>
          <input
            id="flat-fee-overage"
            type="number"
            placeholder="Enter overage per unit"
            value={overageRate}
            onChange={handleChange(setOverageRate, 'FLAT_FEE_OVERAGE', 'flatFeeOverage', 'overageRate')}
          />
          {validationErrors.overageRate && (
            <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
              <ErrorIcon />
              {validationErrors.overageRate}
            </div>
          )}
        </div>

        <div className="edit-form-section">
          <label htmlFor="flat-fee-grace">
            Grace buffer <span className="optional">(Optional)</span>
          </label>
          <input
            id="flat-fee-grace"
            type="number"
            placeholder="Enter grace buffer"
            value={graceBuffer}
            onChange={handleChange(setGraceBuffer, 'FLAT_FEE_GRACE', 'flatFeeGrace', 'graceBuffer')}
          />
        </div>
      </div>
    </div>
  );
};

export default EditFlat;
