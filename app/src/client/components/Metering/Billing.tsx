import React from 'react';
import './Billing.css';

const Billing: React.FC = () => {
  return (
    <div className="billing-form-wrapper">
      <div className="form-cardss">
        <div className="form-groupss">
          <label>Function</label>
          <select>
            <option>Placeholder</option>
          </select>
        </div>

        <div className="form-groupss">
          <label>Aggregation Window</label>
          <input type="text" placeholder="Placeholder" />
        </div>

        <div className="form-groupss">
          <label>Group–By Keys</label>
          <select>
            <option>--select--</option>
          </select>
        </div>

        <div className="form-groupss">
          <label>Threshold</label>
          <select>
            <option>--select--</option>
          </select>
        </div>

        <div className="form-groupss">
          <label>Reset Behavior</label>
          <select>
            <option>--select--</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Billing;
