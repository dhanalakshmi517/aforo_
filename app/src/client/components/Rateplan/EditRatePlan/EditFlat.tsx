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
            step="any"
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
            step="any"
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
            step="any"
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
            step="any"
            placeholder="Enter grace buffer"
            value={graceBuffer}
            onChange={handleChange(setGraceBuffer, 'FLAT_FEE_GRACE', 'flatFeeGrace', 'graceBuffer')}
          />
        </div>
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
};

export default EditFlat;
