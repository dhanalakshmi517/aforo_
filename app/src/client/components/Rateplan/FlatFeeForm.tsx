import React, { useEffect, useState } from 'react';
import './FlatFeeForm.css';

export interface FlatFeePayload {
  flatFeeAmount: number;
  numberOfApiCalls: number;
  overageUnitRate: number;
  graceBuffer: number;
}

interface FlatFeeFormProps {
  data: FlatFeePayload;
  onChange: (payload: FlatFeePayload) => void;
}

const toNumber = (s: string): number => (s.trim() === '' ? NaN : Number(s));
const numToStr = (n: number | undefined): string => (n && n !== 0 ? n.toString() : '');

const FlatFeeForm: React.FC<FlatFeeFormProps> = ({ data, onChange }) => {
  const [flatFee, setFlatFee] = useState<string>(numToStr(data.flatFeeAmount));
  const [apiCalls, setApiCalls] = useState<string>(numToStr(data.numberOfApiCalls));
  const [overageRate, setOverageRate] = useState<string>(numToStr(data.overageUnitRate));
  const [graceBuffer, setGraceBuffer] = useState<string>(numToStr(data.graceBuffer));

  const [errors, setErrors] = useState<{ flatFee?: string; api?: string; overage?: string; grace?: string }>({});
  const [touched, setTouched] = useState<{ flatFee: boolean; api: boolean; overage: boolean; grace: boolean }>({
    flatFee: false, api: false, overage: false, grace: false,
  });

  useEffect(() => {
    setFlatFee(numToStr(data.flatFeeAmount));
    setApiCalls(numToStr(data.numberOfApiCalls));
    setOverageRate(numToStr(data.overageUnitRate));
    setGraceBuffer(numToStr(data.graceBuffer));
  }, [data]);

  const validateField = (value: string, fieldType: 'flatFee' | 'api' | 'overage' | 'grace'): string | null => {
    if (fieldType === 'grace') {
      // Grace buffer is optional
      if (value.trim() !== '' && (Number(value) < 0 || Number.isNaN(Number(value)))) {
        return 'Enter a valid value';
      }
      return null;
    }
    
    // Required fields
    if (value.trim() === '') {
      return 'This is a required field';
    }
    
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) {
      return 'Enter a valid value';
    }
    
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

      // Validate the field
      const error = validateField(val, key);
      setErrors(prev => {
        const next = { ...prev };
        if (error) {
          next[key] = error;
        } else {
          delete next[key];
        }
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
          <em>“You will get 10M API calls for a flat $30.”</em>
        </p>
      </div>
    </div>
  );
};

export default FlatFeeForm;
