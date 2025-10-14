import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { saveVolumePricing } from './api';
import { setRatePlanData } from './utils/sessionStorage';
import './Tiered.css';
import './Volume.css';

export interface VolumeHandle { save: (ratePlanId: number) => Promise<void>; }

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
  validationErrors?: Record<string, string>;
}

const Volume = forwardRef<VolumeHandle, VolumeProps>(({
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
  validationErrors = {},
}, ref) => {
  const [tierErrors, setTierErrors] = useState<TierError[]>([]);
  const [tierTouched, setTierTouched] = useState<TierTouched[]>([]);
  const [overageError, setOverageError] = useState<string | null>(null);
  const [overageTouched, setOverageTouched] = useState(false);

  /** basic field validation (caller decides whether a row is unlimited) */
  const validateTier = (tier: Tier & { _derivedUnlimited?: boolean }): TierError => {
    const error: TierError = {};
    const isUnlimited = !!(tier.isUnlimited || tier._derivedUnlimited);

    if (String(tier.from).trim() === '' || Number.isNaN(tier.from)) {
      error.from = 'This is a required field';
    } else if (tier.from < 0) {
      error.from = 'Enter a valid value';
    }

    if (!isUnlimited) {
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

    // 🔧 Derive "unlimited" from the global checkbox for the last row during validation
    const lastIndex = tiers.length - 1;
    const derived = tiers.map((t, i) => ({
      ...t,
      _derivedUnlimited: noUpperLimit && i === lastIndex
    }));
    setTierErrors(derived.map(validateTier));

    // Overage is only applicable when NOT unlimited
    if (!noUpperLimit) {
      setOverageError(validateOverage(overageUnitRate));
    } else {
      setOverageError(null);
    }
  }, [tiers, noUpperLimit, overageUnitRate]);

  // Persist editable fields
  useEffect(() => {
    setRatePlanData('VOLUME_TIERS', JSON.stringify(tiers));
  }, [tiers]);

  useEffect(() => {
    setRatePlanData('VOLUME_OVERAGE', overageUnitRate.toString());
  }, [overageUnitRate]);

  useEffect(() => {
    setRatePlanData('VOLUME_GRACE', graceBuffer.toString());
  }, [graceBuffer]);

  // Persist unlimited flag and clear dependent stored values
  useEffect(() => {
    setRatePlanData('VOLUME_NO_UPPER_LIMIT', noUpperLimit ? 'true' : 'false');
    if (noUpperLimit) {
      setRatePlanData('VOLUME_OVERAGE', '');
      setRatePlanData('VOLUME_GRACE', '');
    }
  }, [noUpperLimit]);

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
    // Keep tier model in sync with the checkbox
    const val = checked ? '' : String(tiers[index]?.to ?? '');
    onChange(index, 'isUnlimited', String(checked) as unknown as any);
    onChange(index, 'to', val);
  };

  useImperativeHandle(ref, () => ({
    save: async (ratePlanId: number) => {
      const payload = {
        tiers: tiers.map(tier => ({
          usageStart: tier.from,
          usageEnd: tier.isUnlimited ? null : tier.to,
          unitPrice: tier.price,
        })),
        overageUnitRate: noUpperLimit ? 0 : overageUnitRate,
        graceBuffer: noUpperLimit ? 0 : graceBuffer,
      };
      await saveVolumePricing(ratePlanId, payload);
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

              if (checked) {
                // reset overage/grace ui + validation
                setOverageUnitRate(0);
                setGraceBuffer(0);
                setOverageTouched(false);
                setOverageError(null);
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

        {/* Hide overage/grace entirely when unlimited */}
        {!noUpperLimit && (
          <div className="tiered-extra-fields">
            <label>
              Overage Charge
              <input
                type="text"
                className={`volume-input-extra ${!noUpperLimit && overageTouched && overageError ? 'error-input' : ''}`}
                placeholder="Enter overage charge"
                value={overageUnitRate}
                onChange={(e) => setOverageUnitRate(parseFloat(e.target.value) || 0)}
                onBlur={() => setOverageTouched(true)}
              />
              {/* Only show overage errors when NOT unlimited */}
              {!noUpperLimit && overageTouched && overageError && <span className="error-text">{overageError}</span>}
              {!noUpperLimit && validationErrors.volumeOverage && (
                <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
                    <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {validationErrors.volumeOverage}
                </div>
              )}
            </label>
            <label>
              Grace Buffer (optional)
              <input
                type="text"
                className="volume-input-extra"
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

        {validationErrors.volumeTiers && (
          <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '10px', color: '#ED5142', fontSize: '12px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
              <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {validationErrors.volumeTiers}
          </div>
        )}
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
});

export default Volume;
