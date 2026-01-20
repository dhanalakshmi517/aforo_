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
  onClearError?: (key: string) => void;
  locked?: boolean;
}

const toNumber = (s: string): number => (s.trim() === '' ? NaN : Number(s));
const numToStr = (n: number | undefined): string => (n && n !== 0 ? n.toString() : '');

const FlatFeeForm = forwardRef<FlatFeeHandle, FlatFeeFormProps>(({ data, onChange, validationErrors = {}, onClearError, locked = false }, ref) => {
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

        // Clear parent validation error when user enters a value
        if (val.trim() && onClearError) {
          if (key === 'flatFee') onClearError('flatFeeAmount');
          else if (key === 'api') onClearError('apiCalls');
          else if (key === 'overage') onClearError('overageRate');
        }

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
            disabled={locked}
          />
          {touched.flatFee && errors.flatFee && <span className="error-text">{errors.flatFee}</span>}
          {validationErrors.flatFeeAmount && (
            <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
                <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
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
            onKeyDown={(e) => {
              if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                e.preventDefault();
              }
            }}
            onBlur={() => markTouched('api')}
            className={touched.api && errors.api ? 'error-input' : undefined}
            disabled={locked}
          />
          {touched.api && errors.api && <span className="error-text">{errors.api}</span>}
          {validationErrors.apiCalls && (
            <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
                <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
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
            disabled={locked}
          />
          {touched.overage && errors.overage && <span className="error-text">{errors.overage}</span>}
          {validationErrors.overageRate && (
            <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
                <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
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
            disabled={locked}
          />
        </label>
      </div>

      <div className="example-section">
        <div className="example-header">
          <div className="example-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="19" viewBox="0 0 15 19" fill="none">
              <path d="M6.923 15.125V15.6923C6.923 15.8076 6.96633 15.9086 7.053 15.9952C7.1395 16.0817 7.24042 16.125 7.35575 16.125H7.97125C8.09175 16.125 8.19717 16.0798 8.2875 15.9895C8.37783 15.899 8.423 15.7935 8.423 15.673V15.125H9.673C9.8855 15.125 10.0637 15.0531 10.2075 14.9093C10.3512 14.7656 10.423 14.5875 10.423 14.375V11.375C10.423 11.1625 10.3512 10.9844 10.2075 10.8408C10.0637 10.6969 9.8855 10.625 9.673 10.625H6.423V9.125H9.673C9.8855 9.125 10.0637 9.05308 10.2075 8.90925C10.3512 8.76542 10.423 8.58725 10.423 8.37475C10.423 8.16208 10.3512 7.984 10.2075 7.8405C10.0637 7.69683 9.8855 7.625 9.673 7.625H8.423V7.05775C8.423 6.94225 8.37975 6.84125 8.29325 6.75475C8.20675 6.66825 8.10583 6.625 7.9905 6.625H7.375C7.2545 6.625 7.14908 6.67017 7.05875 6.7605C6.96825 6.851 6.923 6.9565 6.923 7.077V7.625H5.673C5.4605 7.625 5.28242 7.69692 5.13875 7.84075C4.99492 7.98442 4.923 8.1625 4.923 8.375V11.375C4.923 11.5875 4.99492 11.7656 5.13875 11.9093C5.28242 12.0531 5.4605 12.125 5.673 12.125H8.923V13.625H5.673C5.4605 13.625 5.28242 13.6969 5.13875 13.8408C4.99492 13.9846 4.923 14.1628 4.923 14.3753C4.923 14.5879 4.99492 14.766 5.13875 14.9095C5.28242 15.0532 5.4605 15.125 5.673 15.125H6.923ZM1.80775 19C1.30258 19 0.875 18.825 0.525 18.475C0.175 18.125 0 17.6974 0 17.1923V1.80775C0 1.30258 0.175 0.875 0.525 0.525C0.875 0.175 1.30258 0 1.80775 0H10.3652L15 4.63475V17.1923C15 17.6974 14.825 18.125 14.475 18.475C14.125 18.825 13.6974 19 13.1923 19H1.80775ZM1.80775 17.5H13.1923C13.2692 17.5 13.3398 17.4679 13.4038 17.4038C13.4679 17.3398 13.5 17.2693 13.5 17.1923V5.3845H10.5193C10.2631 5.3845 10.0484 5.29792 9.87525 5.12475C9.70208 4.95158 9.6155 4.73692 9.6155 4.48075V1.5H1.80775C1.73075 1.5 1.66025 1.53208 1.59625 1.59625C1.53208 1.66025 1.5 1.73075 1.5 1.80775V17.1923C1.5 17.2693 1.53208 17.3398 1.59625 17.4038C1.66025 17.4679 1.73075 17.5 1.80775 17.5Z" fill="#2A455E" />
            </svg>
          </div>
          <div className="example-header-text">
            <h4>EXAMPLE</h4>
            <button type="button" className="linklike">Flat Fee Pricing</button>
          </div>
        </div>
        <p className="example-main"><strong>10M units</strong> for <strong>$30</strong></p>
        <p className="consumer-note">
          <span className="note-title">You to consumer:</span>
          <em>"You will get 10M API calls for a flat $30."</em>
        </p>
      </div>
    </div>
  );
});

export default FlatFeeForm;
