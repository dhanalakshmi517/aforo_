import React, { useState } from 'react';
import './StairStep.css';

interface Stair {
  from: string;
  to: string;
  cost: string;
  isUnlimited?: boolean;
}

const StairStep: React.FC = () => {
  const [stairs, setStairs] = useState<Stair[]>([
    { from: '00', to: '10', cost: '$11' },
    { from: '11', to: '20', cost: '$10' },
    { from: '21', to: '', cost: '$8' },
  ]);

  const [unlimited, setUnlimited] = useState(false);
  const [overageCharge, setOverageCharge] = useState('');
  const [graceBuffer, setGraceBuffer] = useState('');

  const handleAddStair = () => {
    setStairs([...stairs, { from: '', to: '', cost: '' }]);
  };

  const handleDeleteStair = (index: number) => {
    const updated = stairs.filter((_, i) => i !== index);
    setStairs(updated);
  };

  const handleChange = (index: number, field: keyof Stair, value: string) => {
    const updated = [...stairs];
    (updated[index] as any)[field] = value;
    setStairs(updated);
  };

  const handleUnlimitedToggle = (checked: boolean, index: number) => {
    const updated = [...stairs];
    updated[index].isUnlimited = checked;
    if (checked) {
      updated[index].to = '';
    }
    setStairs(updated);
  };

  return (
    <div className="stair-container">
      <div className="stair-input-section">
        {/* Heading Row */}
        <div className="stair-header-row">
          <div className="usage-range-label">Usage Range</div>
          <div className="cost-label">Flat–Stair Cost</div>
        </div>

        {stairs.map((stair, index) => (
          <div className="stair-row" key={index}>
            <input
              className="input-small"
              value={stair.from}
              onChange={(e) => handleChange(index, 'from', e.target.value)}
              placeholder="From"
            />
            <span>-</span>
            <input
              className="input-small"
              value={stair.isUnlimited ? 'Unlimited' : stair.to}
              placeholder="To"
              disabled={stair.isUnlimited}
              onChange={(e) => handleChange(index, 'to', e.target.value)}
            />
            <input
              className="input-large"
              value={stair.cost}
              onChange={(e) => handleChange(index, 'cost', e.target.value)}
              placeholder="Cost"
            />
            <button className="delete-btn" onClick={() => handleDeleteStair(index)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        ))}

        {/* Unlimited checkbox */}
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={unlimited}
            onChange={(e) => {
              setUnlimited(e.target.checked);
              if (e.target.checked && stairs.length > 0) {
                handleUnlimitedToggle(true, stairs.length - 1);
              }
            }}
          />
          <svg className="checkbox-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12Z"
              stroke="#E6E5E6" strokeWidth="1.2" />
            <path className="tick" d="M8 12.5L10.5 15L16 9.5" stroke="#4C7EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>No upper limit for this Stair</span>
        </label>

        {/* Conditionally shown fields */}
        {!unlimited && (
          <div className="extra-fields">
            <label>
              Overage Charge
              <input
                type="text"
                className="input-extra"
                value={overageCharge}
                onChange={(e) => setOverageCharge(e.target.value)}
                placeholder="Enter overage charge"
              />
            </label>
            <label>
              Grace Buffer(optional)
              <input
                type="text"
                className="input-extra"
                value={graceBuffer}
                onChange={(e) => setGraceBuffer(e.target.value)}
                placeholder="Enter grace buffer"
              />
            </label>
          </div>
        )}

        <button className="add-stair-btn" onClick={handleAddStair}>+ Add Stair</button>
      </div>

      {/* Example Section */}
      <div className="stair-example-section">
        <h4>EXAMPLE</h4>
        <a href="#">Stair – Step Pricing</a>
        <table>
          <tbody>
            <tr><td>Stair 1</td><td>1 – 200</td><td>$20</td></tr>
            <tr><td>Stair 2</td><td>201 – 500</td><td>$30</td></tr>
            <tr><td>Stair 3</td><td>501 – 700</td><td>$40</td></tr>
          </tbody>
        </table>
        <p className="consumer-note">
          <a href="#">You to consumer:</a><br />
          <em>“You’ve used 300 units this billing cycle, placing you in Stair 2. Your total charge will be $30.”</em>
        </p>

      </div>
    </div>
  );
};

export default StairStep;
