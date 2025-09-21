// EditFlat.tsx
import React, { useState, useEffect } from 'react';
import './EditFlat.css';
import { getRatePlanData, setRatePlanData } from '../utils/sessionStorage';

const read = (sessionKey: any, legacyKey: string): string =>
  getRatePlanData(sessionKey as any) ??
  localStorage.getItem(legacyKey) ??
  '';

const EditFlat: React.FC = () => {
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
      legacyKey: string
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setter(val);
      // new session-scoped storage (used by the rest of the wizard)
      setRatePlanData(sessionKey as any, val);
      // legacy localStorage for backwards compatibility
      localStorage.setItem(legacyKey, val);
    };

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
            onChange={handleChange(setFlatFee, 'FLAT_FEE_AMOUNT', 'flatFeeAmount')}
          />
        </div>

        <div className="edit-form-section">
          <label htmlFor="flat-fee-api">Number of API calls</label>
          <input
            id="flat-fee-api"
            type="number"
            placeholder="Enter limit"
            value={apiCalls}
            onChange={handleChange(setApiCalls, 'FLAT_FEE_API_CALLS', 'flatFeeApiCalls')}
          />
        </div>

        <div className="edit-form-section">
          <label htmlFor="flat-fee-overage">Overage unit rate</label>
          <input
            id="flat-fee-overage"
            type="number"
            placeholder="Enter overage per unit"
            value={overageRate}
            onChange={handleChange(setOverageRate, 'FLAT_FEE_OVERAGE', 'flatFeeOverage')}
          />
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
            onChange={handleChange(setGraceBuffer, 'FLAT_FEE_GRACE', 'flatFeeGrace')}
          />
        </div>
      </div>
    </div>
  );
};

export default EditFlat;
