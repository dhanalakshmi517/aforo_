import React, { useState } from 'react';
import './EditVolume.css';

interface Tier {
  from: string;
  to: string;
  price: string;
  isUnlimited?: boolean;
}

const EditVolume: React.FC = () => {
  const [tiers, setTiers] = useState<Tier[]>([
    { from: '00', to: '10', price: '$100' },
    { from: '11', to: '20', price: '$400' },
    { from: '21', to: '', price: '$800' },
  ]);

  const [unlimited, setUnlimited] = useState(false);
  const [overageCharge, setOverageCharge] = useState('');
  const [graceBuffer, setGraceBuffer] = useState('');

  const handleAddTier = () => {
    setTiers([...tiers, { from: '', to: '', price: '' }]);
  };

  const handleDeleteTier = (index: number) => {
    const updated = tiers.filter((_, i) => i !== index);
    setTiers(updated);
  };

  const handleChange = (index: number, field: keyof Tier, value: string) => {
    setTiers(prev =>
      prev.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier)) as Tier[]
    );
  };

  const handleUnlimitedToggle = (checked: boolean, index: number) => {
    const updated = [...tiers];
    updated[index].isUnlimited = checked;
    if (checked) {
      updated[index].to = '';
    }
    setTiers(updated);
  };

  return (
    <div className="edit-volume-container">
      <div className="edit-volume-input-section">
        <div className="edit-stair-header-row">
          <div className="edit-usage-range-label">Usage Volume Ranges</div>
          <div className="edit-cost-label">Price per Unit</div>
        </div>

        {tiers.map((tier, index) => (
          <div className="edit-volume-stair-row" key={index}>
            <input
              className="edit-volume-input-small"
              value={tier.from}
              onChange={(e) => handleChange(index, 'from', e.target.value)}
              placeholder="From"
            />
            <span>-</span>
            <input
              className="edit-volume-input-small"
              value={tier.isUnlimited ? 'Unlimited' : tier.to}
              placeholder="To"
              disabled={tier.isUnlimited}
              onChange={(e) => handleChange(index, 'to', e.target.value)}
            />
            <input
              className="edit-volume-input-large"
              value={tier.price}
              onChange={(e) => handleChange(index, 'price', e.target.value)}
              placeholder="Price"
            />
            <button className="edit-volume-delete-btn" onClick={() => handleDeleteTier(index)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        ))}

        <label className="edit-volume-checkbox-label">
          <input
            type="checkbox"
            checked={unlimited}
            onChange={(e) => {
              setUnlimited(e.target.checked);
              if (e.target.checked && tiers.length > 0) {
                handleUnlimitedToggle(true, tiers.length - 1);
              }
            }}
          />
          <svg className="edit-checkbox-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12Z"
              stroke="#E6E5E6" strokeWidth="1.2" />
            <path className="tick" d="M8 12.5L10.5 15L16 9.5" stroke="#4C7EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>No upper limit for this Stair</span>
        </label>

        {!unlimited && (
          <div className="edit-volume-extra-fields">
            <label>
              Overage Charge
              <input
                type="text"
                className="edit-volume-input-extra"
                value={overageCharge}
                onChange={(e) => setOverageCharge(e.target.value)}
                placeholder="Enter overage charge"
              />
            </label>
            <label>
              Grace Buffer (optional)
              <input
                type="text"
                className="edit-volume-input-extra"
                value={graceBuffer}
                onChange={(e) => setGraceBuffer(e.target.value)}
                placeholder="Enter grace buffer"
              />
            </label>
          </div>
        )}

        <button className="edit-volume-add-stair-btn" onClick={handleAddTier}>+ Add Volume Tier</button>
      </div>

      {/* <div className="volume-example-section">
        <h4>EXAMPLE</h4>
        <a href="#">Volume Based Pricing</a>
        <table>
          <tbody>
            <tr><td>Volume 1</td><td>1 – 200</td><td>$8</td></tr>
            <tr><td>Volume 2</td><td>201 – 500</td><td>$5</td></tr>
            <tr><td>Volume 3</td><td>501 – 700</td><td>$3</td></tr>
          </tbody>
        </table>
        <p className="volume-consumer-note">
          <a href="#">You to consumer:</a><br />
          <em>“You’ve consumed 560 units this billing cycle, which falls under Stair 3. At $3 per unit, your total charge comes to 560×3 = $1680”</em>
        </p>
      </div> */}
    </div>
  );
};

export default EditVolume;
