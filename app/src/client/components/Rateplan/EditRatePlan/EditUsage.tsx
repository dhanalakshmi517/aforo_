import React, { useState } from 'react';
import './EditUsage.css';

const EditUsage: React.FC = () => {
  const [unitAmount, setUnitAmount] = useState('$2');

  return (
    <div className="edit-usage-container">
      <div className="edit-usage-left">
        <label className="edit-usage-label">Per Unit Amount</label>
        <input
          className="edit-usage-input"
          type="text"
          value={unitAmount}
          onChange={(e) => setUnitAmount(e.target.value)}
          placeholder="$0.10"
        />
      </div>

      {/* <div className="usage-example-section">
        <h4>EXAMPLE</h4>
        <a href="#">Usage Based Pricing</a>
        <p className="usage-highlight">0.1$ per usage</p>
        <p className="usage-note">
          <a href="#">You to consumer:</a><br />
          <em>“You’ve consumed 10,000 units this cycle. At $0.10 per unit, your total comes to $1,000.”</em>
        </p>
      </div> */}
    </div>
  );
};

export default EditUsage;
