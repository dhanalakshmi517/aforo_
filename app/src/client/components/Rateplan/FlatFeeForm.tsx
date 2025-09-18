import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { saveFlatFeePricing } from './api';
import { setRatePlanData } from './utils/sessionStorage';
import './FlatFeeForm.css';

export interface FlatFeePayload {
  flatFeeAmount: number;
  numberOfApiCalls: number;
  overageUnitRate: number;
  graceBuffer: number;
}

export interface FlatFeeHandle { save: (ratePlanId: number) => Promise<void>; }

interface FlatFeeFormProps {
  data: FlatFeePayload;
  onChange: (payload: FlatFeePayload) => void;
  validationErrors?: Record<string, string>;
}

const toNumber = (s: string): number => (s.trim() === '' ? NaN : Number(s));
const numToStr = (n: number | undefined): string => (n && n !== 0 ? n.toString() : '');

const FlatFeeForm = forwardRef<FlatFeeHandle, FlatFeeFormProps>(({ data, onChange, validationErrors = {} }, ref) => {
  const [flatFee, setFlatFee] = useState<string>(numToStr(data.flatFeeAmount));
  const [apiCalls, setApiCalls] = useState<string>(numToStr(data.numberOfApiCalls));
  const [overageRate, setOverageRate] = useState<string>(numToStr(data.overageUnitRate));
  const [graceBuffer, setGraceBuffer] = useState<string>(numToStr(data.graceBuffer));

  const [errors, setErrors] = useState<{ flatFee?: string; api?: string; overage?: string; grace?: string }>({});
  const [touched, setTouched] = useState<{ flatFee: boolean; api: boolean; overage: boolean; grace: boolean }>({
    flatFee: false, api: false, overage: false, grace: false,
  });

  // Hydrate local inputs when parent data changes
  useEffect(() => {
    setFlatFee(numToStr(data.flatFeeAmount));
    setApiCalls(numToStr(data.numberOfApiCalls));
    setOverageRate(numToStr(data.overageUnitRate));
    setGraceBuffer(numToStr(data.graceBuffer));
  }, [data]);

  // ✅ NEW: Also mirror hydrated values into sessionStorage so step validator sees them
  useEffect(() => {
    setRatePlanData('FLAT_FEE_AMOUNT', flatFee);
    setRatePlanData('FLAT_FEE_API_CALLS', apiCalls);
    setRatePlanData('FLAT_FEE_OVERAGE', overageRate);
    setRatePlanData('FLAT_FEE_GRACE', graceBuffer);
  }, [flatFee, apiCalls, overageRate, graceBuffer]);

  const validateField = (value: string, fieldType: 'flatFee' | 'api' | 'overage' | 'grace'): string | null => {
    if (fieldType === 'grace') {
      if (value.trim() !== '' && (Number(value) < 0 || Number.isNaN(Number(value)))) {
        return 'Enter a valid value';
      }
      return null;
    }
    if (value.trim() === '') return 'This is a required field';
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) return 'Enter a valid value';
    return null;
  };

  const propagate = (ff: string, api: string, ov: string, gr: string) => {
    onChange({
      flatFeeAmount: toNumber(ff),
      numberOfApiCalls: toNumber(api),
      overageUnitRate: toNumber(ov),
      graceBuffer: toNumber(gr),
    });
  };

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>, key: 'flatFee' | 'api' | 'overage' | 'grace') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setter(val);

      // Write to sessionStorage live (kept from your original logic)
      if (key === 'flatFee') setRatePlanData('FLAT_FEE_AMOUNT', val);
      else if (key === 'api') setRatePlanData('FLAT_FEE_API_CALLS', val);
      else if (key === 'overage') setRatePlanData('FLAT_FEE_OVERAGE', val);
      else if (key === 'grace') setRatePlanData('FLAT_FEE_GRACE', val);

      // Validate on change
      const error = validateField(val, key);
      setErrors(prev => {
        const next = { ...prev };
        if (error) next[key] = error;
        else delete next[key];
        return next;
      });

      propagate(
        key === 'flatFee' ? val : flatFee,
        key === 'api' ? val : apiCalls,
        key === 'overage' ? val : overageRate,
        key === 'grace' ? val : graceBuffer
      );
    };

  const markTouched = (key: 'flatFee' | 'api' | 'overage' | 'grace') =>
    setTouched(t => ({ ...t, [key]: true }));

  useImperativeHandle(ref, () => ({
    save: async (ratePlanId: number) => {
      const payload: FlatFeePayload = {
        flatFeeAmount: toNumber(flatFee),
        numberOfApiCalls: toNumber(apiCalls),
        overageUnitRate: toNumber(overageRate),
        graceBuffer: toNumber(graceBuffer),
      };
      await saveFlatFeePricing(ratePlanId, payload);
    },
  }));

  return (
    <div className="flat-fee-container">
      <div className="form-sections">
        <label className="ff-label">
          <span>Flat Fee Amount</span>
          <input
            type="number" inputMode="decimal" min="0" step="0.01"
            placeholder="Enter amount"
            value={flatFee}
            onChange={handleChange(setFlatFee, 'flatFee')}
            onBlur={() => markTouched('flatFee')}
            className={touched.flatFee && errors.flatFee ? 'error-input' : undefined}
          />
          {touched.flatFee && errors.flatFee && <span className="error-text">{errors.flatFee}</span>}
          {validationErrors.flatFeeAmount && (
            <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
                <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {validationErrors.flatFeeAmount}
            </div>
          )}
        </label>

        <label className="ff-label">
          <span>Number of API calls</span>
          <input
            type="number" inputMode="numeric" min="0" step="1"
            placeholder="Enter limit"
            value={apiCalls}
            onChange={handleChange(setApiCalls, 'api')}
            onBlur={() => markTouched('api')}
            className={touched.api && errors.api ? 'error-input' : undefined}
          />
          {touched.api && errors.api && <span className="error-text">{errors.api}</span>}
          {validationErrors.apiCalls && (
            <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
                <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {validationErrors.apiCalls}
            </div>
          )}
        </label>

        <label className="ff-label">
          <span>Overage unit rate</span>
          <input
            type="number" inputMode="decimal" min="0" step="0.01"
            placeholder="Enter overage per unit"
            value={overageRate}
            onChange={handleChange(setOverageRate, 'overage')}
            onBlur={() => markTouched('overage')}
            className={touched.overage && errors.overage ? 'error-input' : undefined}
          />
          {touched.overage && errors.overage && <span className="error-text">{errors.overage}</span>}
          {validationErrors.overageRate && (
            <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
                <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {validationErrors.overageRate}
            </div>
          )}
        </label>

        <label className="ff-label">
          <span>Grace buffer (Optional)</span>
          <input
            type="number" inputMode="numeric" min="0" step="1"
            placeholder="Enter grace buffer"
            value={graceBuffer}
            onChange={handleChange(setGraceBuffer, 'grace')}
            onBlur={() => markTouched('grace')}
          />
        </label>
      </div>

      <div className="example-section">
        <h4>EXAMPLE</h4>
        <button type="button" className="linklike">Flat Fee Pricing</button>
        <p><strong>10M units</strong> for <strong>$30</strong></p>
        <p className="consumer-note">
          <span className="note-title">You to consumer:</span>
          <em>"You will get 10M API calls for a flat $30."</em>
        </p>
      </div>
    </div>
  );
});

export default FlatFeeForm;
