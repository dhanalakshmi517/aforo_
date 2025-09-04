import React, { useState, useEffect } from 'react';
import './Tiered.css';

interface Tier {
  from: number;
  to: number;
  price: number;
  isUnlimited?: boolean;
}

type TierError = { from?: string; to?: string; price?: string };
type TierTouched = { from: boolean; to: boolean; price: boolean };

interface VolumeProps {
  tiers: Tier[];
  onAddTier: () => void;
  onDeleteTier?: (index: number) => void;
  onChange: (index: number, field: keyof Tier, value: string) => void;
  noUpperLimit: boolean;
  setNoUpperLimit: (val: boolean) => void;
  overageUnitRate: number;
  setOverageUnitRate: (val: number) => void;
  graceBuffer: number;
  setGraceBuffer: (val: number) => void;
}

const Volume: React.FC<VolumeProps> = ({
  tiers,
  onAddTier,
  onDeleteTier,
  onChange,
  noUpperLimit,
  setNoUpperLimit,
  overageUnitRate,
  setOverageUnitRate,
  graceBuffer,
  setGraceBuffer,
}) => {
  const [tierErrors, setTierErrors] = useState<TierError[]>([]);
  const [tierTouched, setTierTouched] = useState<TierTouched[]>([]);
  const [overageError, setOverageError] = useState<string | null>(null);
  const [overageTouched, setOverageTouched] = useState(false);

  const validateTier = (tier: Tier): TierError => {
    const error: TierError = {};
    
    if (String(tier.from).trim() === '' || Number.isNaN(tier.from)) {
      error.from = 'This is a required field';
    } else if (tier.from < 0) {
      error.from = 'Enter a valid value';
    }

    if (!tier.isUnlimited) {
      if (String(tier.to).trim() === '' || Number.isNaN(tier.to)) {
        error.to = 'This is a required field';
      } else if (tier.to < 0) {
        error.to = 'Enter a valid value';
      } else if (!error.from && tier.to < tier.from) {
        error.to = 'Must be ≥ From';
      }
    }

    if (String(tier.price).trim() === '' || Number.isNaN(tier.price)) {
      error.price = 'This is a required field';
    } else if (tier.price <= 0) {
      error.price = 'Enter a valid value';
    }

    return error;
  };

  const validateOverage = (value: number): string | null => {
    if (Number.isNaN(value) || value <= 0) return 'Enter a valid value';
    return null;
  };

  const ensureArrays = (length: number) => {
    setTierTouched(prev => {
      const newTouched = [...prev];
      while (newTouched.length < length) {
        newTouched.push({ from: false, to: false, price: false });
      }
      return newTouched.slice(0, length);
    });
    setTierErrors(prev => {
      const newErrors = [...prev];
      while (newErrors.length < length) {
        newErrors.push({});
      }
      return newErrors.slice(0, length);
    });
  };

  useEffect(() => {
    ensureArrays(tiers.length);
    setTierErrors(tiers.map(validateTier));
    
    if (!noUpperLimit) {
      setOverageError(validateOverage(overageUnitRate));
    } else {
      setOverageError(null);
    }
  }, [tiers, noUpperLimit, overageUnitRate]);

  const markTouched = (index: number, field: keyof TierTouched) => {
    setTierTouched(prev => {
      const newTouched = [...prev];
      if (!newTouched[index]) {
        newTouched[index] = { from: false, to: false, price: false };
      }
      newTouched[index][field] = true;
      return newTouched;
    });
  };

  const handleUnlimitedToggle = (checked: boolean, index: number) => {
    // mirror Tiered behavior: mark last tier unlimited and clear "to"
    const val = checked ? '' : String(tiers[index]?.to ?? '');
    onChange(index, 'isUnlimited', String(checked) as unknown as any);
    onChange(index, 'to', val);
  };

  return (
    <div className="tiered-container">
      <div className="tiered-input-section">
        <div className="tiered-header-row">
          <div className="tiered-usage-range-label">Usage Tiers</div>
          <div className="tiered-cost-label">Price per Unit</div>
        </div>

        {tiers.map((tier, index) => {
          const isLast = index === tiers.length - 1;
          const unlimitedForRow = noUpperLimit && isLast;
          const error = tierErrors[index] || {};
          const touched = tierTouched[index] || { from: false, to: false, price: false };

          return (
            <div className="tiered-row" key={index}>
              <div className="field-col">
                <input
                  className={`tiered-input-small ${touched.from && error.from ? 'error-input' : ''}`}
                  type="number"
                  value={Number.isNaN(tier.from) ? '' : tier.from}
                  onChange={(e) => onChange(index, 'from', e.target.value)}
                  onBlur={() => markTouched(index, 'from')}
                  placeholder="From"
                />
                {touched.from && error.from && <span className="error-text">{error.from}</span>}
              </div>
              
              <span>-</span>

              <div className="field-col">
                <input
                  className={`tiered-input-small ${touched.to && error.to ? 'error-input' : ''}`}
                  value={unlimitedForRow ? 'Unlimited' : (Number.isNaN(tier.to) ? '' : tier.to)}
                  placeholder="To"
                  disabled={unlimitedForRow}
                  onChange={(e) => onChange(index, 'to', e.target.value)}
                  onBlur={() => markTouched(index, 'to')}
                />
                {!unlimitedForRow && touched.to && error.to && <span className="error-text">{error.to}</span>}
              </div>

              <div className="field-col">
                <input
                  className={`tiered-input-large ${touched.price && error.price ? 'error-input' : ''}`}
                  type="number"
                  value={Number.isNaN(tier.price) ? '' : tier.price}
                  onChange={(e) => onChange(index, 'price', e.target.value)}
                  onBlur={() => markTouched(index, 'price')}
                  placeholder="Price"
                />
                {touched.price && error.price && <span className="error-text">{error.price}</span>}
              </div>

              {onDeleteTier && (
                <button
                  className="tiered-delete-btn"
                  onClick={() => onDeleteTier(index)}
                  title="Delete tier"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                       viewBox="0 0 16 16" fill="none">
                    <path d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335"
                          stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          );
        })}

        <label className="tiered-checkbox-label">
          <input
            type="checkbox"
            checked={noUpperLimit}
            onChange={(e) => {
              const checked = e.target.checked;
              setNoUpperLimit(checked);
              if (tiers.length > 0) {
                // toggle only the last tier as unlimited (same UX as Tiered)
                handleUnlimitedToggle(checked, tiers.length - 1);
              }
            }}
          />
          <svg className="checkbox-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
               viewBox="0 0 24 24" fill="none">
            <path d="M4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12Z"
                  stroke="#E6E5E6" strokeWidth="1.2" />
            <path className="tick" d="M8 12.5L10.5 15L16 9.5" stroke="#4C7EFF"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>No upper limit for last tier</span>
        </label>

        {/* Volume doesn’t use overage/grace when unlimited; mirror Tiered’s layout */}
        {!noUpperLimit && (
          <div className="tiered-extra-fields">
            <label>
              Overage Charge
              <input
                type="text"
                className={`tiered-input-extra ${overageTouched && overageError ? 'error-input' : ''}`}
                placeholder="Enter overage charge"
                value={overageUnitRate}
                onChange={(e) => setOverageUnitRate(parseFloat(e.target.value) || 0)}
                onBlur={() => setOverageTouched(true)}
              />
              {overageTouched && overageError && <span className="error-text">{overageError}</span>}
            </label>
            <label>
              Grace Buffer (optional)
              <input
                type="text"
                className="tiered-input-extra"
                placeholder="Enter grace buffer"
                value={graceBuffer}
                onChange={(e) => setGraceBuffer(parseFloat(e.target.value) || 0)}
              />
            </label>
          </div>
        )}

        <button className="tiered-add-btn" onClick={onAddTier}>
          + Add Volume Tier
        </button>
      </div>

      <div className="tiered-example-section">
        <h4>EXAMPLE</h4>
        <a href="#">Volume-Based Pricing</a>
        <table>
          <tbody>
            <tr><td>Tier 1</td><td>1 – 200</td><td>$8</td></tr>
            <tr><td>Tier 2</td><td>201 – 500</td><td>$5</td></tr>
            <tr><td>Tier 3</td><td>501 – 700</td><td>$3</td></tr>
          </tbody>
        </table>
        <p className="tiered-consumer-note">
          <a href="#">You to consumer:</a><br />
          <em>
            “You’ve consumed 300 units this billing cycle.
            Since total usage falls in Tier 2, all 300 units are charged at $5 → $1,500.”
          </em>
        </p>
      </div>
    </div>
  );
};

export default Volume;
