import React from 'react';
import './Volume.css';

interface Tier {
  from: number;
  to: number;
  price: number;
}

interface VolumeProps {
  tiers: Tier[];
  onAddTier: () => void;
  onDeleteTier?: (index: number) => void;
  onChange: (index: number, field: keyof Tier, value: string) => void;
  noUpperLimit: boolean;
  setNoUpperLimit: (val: boolean) => void;
}

const Volume: React.FC<VolumeProps> = ({
  tiers,
  onAddTier,
  onDeleteTier,
  onChange,
  noUpperLimit,
  setNoUpperLimit,
}) => {
  const handleNoUpperLimitChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNoUpperLimit(e.target.checked);
  };

  return (
    <div className="tiered-pricing-container">
      <h5>Volume-Based Pricing</h5>
      <p className="description">
        The consumer is charged according to the per-unit price corresponding
        to their total usage volume.
      </p>

      <div className="tiered-header">
        <span>Usage volume Ranges</span>
        <span></span>
        <span>Price per Unit</span>
        <span></span>
      </div>

      <div className="tiered-pricing-columns">
        {tiers.map((tier, index) => (
          <div key={index} className="tier-row">
            <div className="tier-inputs">
              <input
                type="number"
                value={tier.from}
                onChange={(e) => onChange(index, 'from', e.target.value)}
                placeholder="Start"
                className="tier-input from-input"
              />
              <input
                type="number"
                value={tier.to}
                onChange={(e) => onChange(index, 'to', e.target.value)}
                placeholder="End"
                className="tier-input to-input"
                disabled={noUpperLimit && index === tiers.length - 1}
              />
              <input
                type="text"
                value={`$${tier.price}`}
                onChange={(e) =>
                  onChange(index, 'price', e.target.value.replace('$', ''))
                }
                placeholder="Price"
                className="tier-input price-input wide-margin"
              />
            </div>

            {onDeleteTier && (
              <button
                className="delete-btn"
                onClick={() => onDeleteTier(index)}
                title="Delete tier"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335"
                    stroke="#E34935"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="tier-actions">
        <div className="volume-tier-actions">
          <label className="no-upper-limit-checkbox">
            <input
              type="checkbox"
              checked={noUpperLimit}
              onChange={handleNoUpperLimitChange}
            />
            No upper limit for this tier
          </label>
          <button onClick={onAddTier} className="add-tier-btn">
            + Add Volume Tier
          </button>
        </div>
      </div>
    </div>
  );
};

export default Volume;
