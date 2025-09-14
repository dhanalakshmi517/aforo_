import React, { useState } from 'react';
import './EditFlat.css';

const EditFlat: React.FC = () => {
  const [flatFee, setFlatFee] = useState<string>(localStorage.getItem('flatFeeAmount') || '');
  const [apiCalls, setApiCalls] = useState<string>(localStorage.getItem('flatFeeApiCalls') || '');
  const [overageRate, setOverageRate] = useState<string>(localStorage.getItem('flatFeeOverage') || '');
  const [graceBuffer, setGraceBuffer] = useState<string>(localStorage.getItem('flatFeeGrace') || '');

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>, key: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      localStorage.setItem(key, e.target.value);
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
            onChange={handleChange(setFlatFee, 'flatFeeAmount')}
          />
        </div>

        <div className="edit-form-section">
          <label htmlFor="flat-fee-api">Number of API calls</label>
          <input
            id="flat-fee-api"
            type="number"
            placeholder="Enter limit"
            value={apiCalls}
            onChange={handleChange(setApiCalls, 'flatFeeApiCalls')}
          />
        </div>

        <div className="edit-form-section">
          <label htmlFor="flat-fee-overage">Overage unit rate</label>
          <input
            id="flat-fee-overage"
            type="number"
            placeholder="Enter overage per unit"
            value={overageRate}
            onChange={handleChange(setOverageRate, 'flatFeeOverage')}
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
            onChange={handleChange(setGraceBuffer, 'flatFeeGrace')}
          />
        </div>
      </div>
    </div>
  );
};

export default EditFlat;
