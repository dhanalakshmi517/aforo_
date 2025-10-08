import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { saveTieredPricing } from './api';
import { setRatePlanData, getRatePlanData } from './utils/sessionStorage';
import './Tiered.css';

export interface TieredHandle { save: (ratePlanId: number) => Promise<any>; }

interface Tier {
  from: string;
  to: string;
  price: string;
  isUnlimited?: boolean;
}

type TierError = { from?: string; to?: string; price?: string };
type TierTouched = { from: boolean; to: boolean; price: boolean };

interface TieredProps {
  tiers?: Tier[];
  onAddTier?: () => void;
  onDeleteTier?: (index: number) => void;
  onChange?: (index: number, field: keyof Tier, value: string) => void;
  noUpperLimit?: boolean;
  setNoUpperLimit?: (val: boolean) => void;
  validationErrors?: Record<string, string>;
  overageCharge?: string | number;
  graceBuffer?: string | number;
}

const Tiered = forwardRef<TieredHandle, TieredProps>(({
  tiers: externalTiers,
  onAddTier,
  onDeleteTier,
  onChange,
  noUpperLimit: externalUnlimited,
  setNoUpperLimit,
  validationErrors = {},
  overageCharge: overageFromParent,
  graceBuffer: graceFromParent,
}, ref) => {
  const [tiers, setTiers] = useState<Tier[]>(externalTiers ?? [{ from: '', to: '', price: '' }]);
  const [unlimited, setUnlimited] = useState(externalUnlimited ?? false);
  const [overageCharge, setOverageCharge] = useState<string>('');
  const [graceBuffer, setGraceBuffer] = useState<string>('');

  const [tierErrors, setTierErrors] = useState<TierError[]>([]);
  const [tierTouched, setTierTouched] = useState<TierTouched[]>([]);
  const [overageError, setOverageError] = useState<string | null>(null);
  const [overageTouched, setOverageTouched] = useState(false);

  // Keep internal tiers synced with props; if parent gives an empty array, still render one blank row
  useEffect(() => {
    if (externalTiers && externalTiers.length > 0) {
      setTiers(externalTiers);
    } else if (externalTiers && externalTiers.length === 0) {
      setTiers([{ from: '', to: '', price: '' }]);
    }
  }, [externalTiers]);

  useEffect(() => {
    if (externalUnlimited !== undefined) {
      console.log('🎯 Tiered: Updating unlimited from prop:', externalUnlimited);
      setUnlimited(externalUnlimited);
    }
  }, [externalUnlimited]);
  
  // Update overage and grace from props
  useEffect(() => {
    if (overageFromParent !== undefined && overageFromParent !== null) {
      console.log('🎯 Tiered: Updating overage from prop:', overageFromParent);
      setOverageCharge(String(overageFromParent));
    }
  }, [overageFromParent]);
  
  useEffect(() => {
    if (graceFromParent !== undefined && graceFromParent !== null) {
      console.log('🎯 Tiered: Updating grace buffer from prop:', graceFromParent);
      setGraceBuffer(String(graceFromParent));
    }
  }, [graceFromParent]);

  // Persist for review/draft
  useEffect(() => {
    setRatePlanData('TIERED_TIERS', JSON.stringify(tiers));
  }, [tiers]);

  useEffect(() => {
    setRatePlanData('TIERED_OVERAGE', overageCharge);
  }, [overageCharge]);

  useEffect(() => {
    setRatePlanData('TIERED_GRACE', graceBuffer);
  }, [graceBuffer]);

  const validateTier = (tier: Tier): TierError => {
    const error: TierError = {};

    if (tier.from.trim() === '') {
      error.from = 'This is a required field';
    } else if (Number.isNaN(Number(tier.from)) || Number(tier.from) < 0) {
      error.from = 'Enter a valid value';
    }

    if (!tier.isUnlimited) {
      if (tier.to.trim() === '') {
        error.to = 'This is a required field';
      } else if (Number.isNaN(Number(tier.to)) || Number(tier.to) < 0) {
        error.to = 'Enter a valid value';
      } else if (!error.from && Number(tier.to) < Number(tier.from)) {
        error.to = 'Must be ≥ From';
      }
    }

    if (tier.price.trim() === '') {
      error.price = 'This is a required field';
    } else if (Number.isNaN(Number(tier.price)) || Number(tier.price) <= 0) {
      error.price = 'Enter a valid value';
    }

    return error;
  };

  const validateOverage = (value: string): string | null => {
    if (value.trim() === '') return 'This is a required field';
    if (Number.isNaN(Number(value)) || Number(value) <= 0) return 'Enter a valid value';
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

    if (!unlimited) {
      setOverageError(validateOverage(overageCharge));
    } else {
      setOverageError(null);
    }
  }, [tiers, unlimited, overageCharge]);

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

  const handleAddTier = () => {
    const next = [...tiers, { from: '', to: '', price: '' }];
    setTiers(next);
    onAddTier?.();
  };

  const handleDeleteTier = (index: number) => {
    const updated = tiers.filter((_, i) => i !== index);
    setTiers(updated);
    onDeleteTier?.(index);
    setTierTouched(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof Tier, value: string) => {
    setTiers(prev => prev.map((tier, i) => (
      i === index ? { ...tier, [field]: value } : tier
    )) as Tier[]);
    onChange?.(index, field, value);
  };

  const handleUnlimitedToggle = (checked: boolean, index: number) => {
    const updated = [...tiers];
    updated[index].isUnlimited = checked;
    if (checked) {
      updated[index].to = '';
    }
    setTiers(updated);
    setNoUpperLimit?.(checked);
  };

  useImperativeHandle(ref, () => ({
    save: async (ratePlanId: number) => {
      const payload = {
        tiers: tiers.map(tier => ({
          startRange: Number(tier.from) || 0,
          endRange: tier.isUnlimited ? null : (Number(tier.to) || 0),
          unitPrice: Number(tier.price) || 0,
        })),
        overageUnitRate: Number(overageCharge) || 0,
        graceBuffer: Number(graceBuffer) || 0,
      };

      const result = await saveTieredPricing(ratePlanId, payload);
      return result;
    },
  }));

  return (
    <div className="tiered-container">
      <div className="tiered-input-section">
        <div className="tiered-header-row">
          <div className="tiered-usage-range-label">Usage Tiers</div>
          <div className="tiered-cost-label">Price per Unit</div>
        </div>

        {tiers.map((tier, index) => {
          const error = tierErrors[index] || {};
          const touched = tierTouched[index] || { from: false, to: false, price: false };

          return (
            <div className="tiered-row" key={index}>
              <div className="field-col">
                <input
                  className={`tiered-input-small ${touched.from && error.from ? 'error-input' : ''}`}
                  value={tier.from}
                  onChange={(e) => handleChange(index, 'from', e.target.value)}
                  onBlur={() => markTouched(index, 'from')}
                  placeholder="From"
                />
                {touched.from && error.from && <span className="error-text">{error.from}</span>}
              </div>

              <span>-</span>

              <div className="field-col">
                <input
                  className={`tiered-input-small ${touched.to && error.to ? 'error-input' : ''}`}
                  value={tier.isUnlimited ? 'Unlimited' : tier.to}
                  placeholder="To"
                  disabled={tier.isUnlimited}
                  onChange={(e) => handleChange(index, 'to', e.target.value)}
                  onBlur={() => markTouched(index, 'to')}
                />
                {!tier.isUnlimited && touched.to && error.to && <span className="error-text">{error.to}</span>}
              </div>

              <div className="field-col">
                <input
                  className={`tiered-input-large ${touched.price && error.price ? 'error-input' : ''}`}
                  value={tier.price}
                  onChange={(e) => handleChange(index, 'price', e.target.value)}
                  onBlur={() => markTouched(index, 'price')}
                  placeholder="Price"
                />
                {touched.price && error.price && <span className="error-text">{error.price}</span>}
              </div>

              <button className="tiered-delete-btn" onClick={() => handleDeleteTier(index)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          );
        })}

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
                className={`tiered-input-extra ${overageTouched && overageError ? 'error-input' : ''}`}
                value={overageCharge}
                onChange={(e) => setOverageCharge(e.target.value)}
                onBlur={() => setOverageTouched(true)}
                placeholder="Enter overage charge"
              />
              {overageTouched && overageError && <span className="error-text">{overageError}</span>}
              {validationErrors.tieredOverage && (
                <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
                    <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {validationErrors.tieredOverage}
                </div>
              )}
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

        {validationErrors.tieredTiers && (
          <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '10px', color: '#ED5142', fontSize: '12px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
              <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {validationErrors.tieredTiers}
          </div>
        )}
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
});
export default Tiered;
