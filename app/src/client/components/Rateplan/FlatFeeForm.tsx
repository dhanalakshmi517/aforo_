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
      </div>
    </div>
  );
};

export default FlatFeeForm;
