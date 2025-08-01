import React, { useState, useEffect } from 'react';
import './Tiered.css';

interface Tier {
  from: string;
  to: string;
  price: string;
  isUnlimited?: boolean;
}

interface TieredProps {
  tiers?: Tier[];
  onAddTier?: () => void;
  onDeleteTier?: (index: number) => void;
  onChange?: (index: number, field: keyof Tier, value: string) => void;
  noUpperLimit?: boolean;
  setNoUpperLimit?: (val: boolean) => void;
}

const Tiered: React.FC<TieredProps> = ({
  tiers: externalTiers,
  onAddTier,
  onDeleteTier,
  onChange,
  noUpperLimit: externalUnlimited,
  setNoUpperLimit,
}) => {
  const [tiers, setTiers] = useState<Tier[]>(externalTiers ?? [
    { from: '0', to: '10', price: '100' },
    { from: '11', to: '20', price: '400' },
    { from: '21', to: '0', price: '800' },
  ]);

  const [unlimited, setUnlimited] = useState(externalUnlimited ?? false);
  const [overageCharge, setOverageCharge] = useState('');
  const [graceBuffer, setGraceBuffer] = useState('');

  // Persist values so Review can consume
  useEffect(() => {
    localStorage.setItem('tieredTiers', JSON.stringify(tiers));
  }, [tiers]);

  useEffect(() => {
    localStorage.setItem('tieredOverage', overageCharge);
  }, [overageCharge]);

  useEffect(() => {
    localStorage.setItem('tieredGrace', graceBuffer);
  }, [graceBuffer]);

  const handleAddTier = () => {
    setTiers([...tiers, { from: '', to: '', price: '' }]);
  };

  const handleDeleteTier = (index: number) => {
    const updated = tiers.filter((_, i) => i !== index);
    setTiers(updated);
  };

  const handleChange = (index: number, field: keyof Tier, value: string) => {
    setTiers(prev => prev.map((tier, i) => (
      i === index ? { ...tier, [field]: value } : tier
    )) as Tier[]);
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
    <div className="tiered-container">
      <div className="tiered-input-section">
        <div className="tiered-header-row">
          <div className="tiered-usage-range-label">Usage Tiers</div>
          <div className="tiered-cost-label">Price per Unit</div>
        </div>

        {tiers.map((tier, index) => (
          <div className="tiered-row" key={index}>
            <input
              className="tiered-input-small"
              value={tier.from}
              onChange={(e) => handleChange(index, 'from', e.target.value)}
              placeholder="From"
            />
            <span>-</span>
            <input
              className="tiered-input-small"
              value={tier.isUnlimited ? 'Unlimited' : tier.to}
              placeholder="To"
              disabled={tier.isUnlimited}
              onChange={(e) => handleChange(index, 'to', e.target.value)}
            />
            <input
              className="tiered-input-large"
              value={tier.price}
              onChange={(e) => handleChange(index, 'price', e.target.value)}
              placeholder="Price"
            />
            <button className="tiered-delete-btn" onClick={() => handleDeleteTier(index)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        ))}

        <label className="tiered-checkbox-label">
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
          <svg className="checkbox-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12Z" stroke="#E6E5E6" strokeWidth="1.2" />
            <path className="tick" d="M8 12.5L10.5 15L16 9.5" stroke="#4C7EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>No upper limit for last tier</span>
        </label>

        {!unlimited && (
          <div className="tiered-extra-fields">
            <label>
              Overage Charge
              <input
                type="text"
                className="tiered-input-extra"
                value={overageCharge}
                onChange={(e) => setOverageCharge(e.target.value)}
                placeholder="Enter overage charge"
              />
            </label>
            <label>
              Grace Buffer (optional)
              <input
                type="text"
                className="tiered-input-extra"
                value={graceBuffer}
                onChange={(e) => setGraceBuffer(e.target.value)}
                placeholder="Enter grace buffer"
              />
            </label>
          </div>
        )}

        <button className="tiered-add-btn" onClick={handleAddTier}>+ Add Volume Tier</button>
      </div>

      <div className="tiered-example-section">
        <h4>EXAMPLE</h4>
        <a href="#">Tired Based Pricing</a>
        <table>
          <tbody>
            <tr><td>Tier 1</td><td>1 – 200</td><td>$8</td></tr>
            <tr><td>Tier 2</td><td>201 – 500</td><td>$5</td></tr>
            <tr><td>Tier 3</td><td>501 – 700</td><td>$3</td></tr>
          </tbody>
        </table>
        <p className="tiered-consumer-note">
          <a href="#">You to consumer:</a><br />
          <em>“You’ve consumed 300 units this billing cycle.<br />
          • First 200 units are for $8 → $1600<br />
          • Next 100 units are for $5 → $500<br />
          Total charge: $2,100.”</em>
        </p>
      </div>
    </div>
  );
};
export default Tiered;
