<<<<<<< HEAD
import React, { useState } from 'react';
import './FlatFeeForm.css';

const FlatFeeForm: React.FC = () => {
  const [flatFee, setFlatFee] = useState<string>(localStorage.getItem('flatFeeAmount') || '');
  const [apiCalls, setApiCalls] = useState<string>(localStorage.getItem('flatFeeApiCalls') || '');
  const [overageRate, setOverageRate] = useState<string>(localStorage.getItem('flatFeeOverage') || '');
  const [graceBuffer, setGraceBuffer] = useState<string>(localStorage.getItem('flatFeeGrace') || '');

  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>, key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    localStorage.setItem(key, e.target.value);
  };
  return (
    <div className="flat-fee-container">
      <div className="form-sections">
        <label>
          Flat Fee Amount
          <input type="number"
           placeholder="Enter amount" 
           value={flatFee} 
           onChange={handleChange(setFlatFee,'flatFeeAmount')} />
        </label>
        <label>
          Number of API calls
          <input type="number" placeholder="Enter limit" value={apiCalls} onChange={handleChange(setApiCalls,'flatFeeApiCalls')} />
        </label>
        <label>
          Overage unit rate
          <input type="number" placeholder="Enter overage per unit" value={overageRate} onChange={handleChange(setOverageRate,'flatFeeOverage')} />
        </label>
        <label>
          Grace buffer (Optional)
          <input type="number" placeholder="Enter grace buffer" value={graceBuffer} onChange={handleChange(setGraceBuffer,'flatFeeGrace')} />
        </label>
      </div>

      <div className="example-section">
        <h4>EXAMPLE</h4>
        <a href="#">Flat Fee Pricing</a>
        <p><strong>10M of units</strong> for <strong>30$</strong></p>
        <p className="consumer-note">
          <a href="#">You to consumer:</a><br />
          <em>“You will get 10M API calls for flat 30$”</em>
        </p>
=======
import React from 'react';
import './FlatFeeForm.css';

const FlatFeeForm: React.FC = () => {
  return (
    <div className="flat-fee-fields">
      <h5>Flat Fee</h5>
      <p>Charge a fixed monthly price for your product with a simple flat fee setup.</p>

      <div className="form-flat">
        <label>Flat Fee Amount</label>
        <input type="text" placeholder="$30" />
      </div>

      <div className="form-flat">
        <label>Number of API calls</label>
        <input type="text" placeholder="500" />
      </div>

      <div className="form-flat">
        <label>Usage Limit</label>
        <input type="text" placeholder="50,000" />
>>>>>>> main
      </div>
    </div>
  );
};

export default FlatFeeForm;
