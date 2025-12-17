import React, { useState, useEffect, useRef } from 'react';
import './EditTiered.css';

interface Tier {
  from: string;
  to: string;
  price: string;
  isUnlimited?: boolean;
}

interface EditTieredProps {
  tiers?: Tier[];
  onTiersChange?: (tiers: Tier[]) => void;
  unlimited?: boolean;
  onUnlimitedChange?: (unlimited: boolean) => void;
  overageCharge?: string;
  onOverageChange?: (overage: string) => void;
  graceBuffer?: string;
  onGraceChange?: (grace: string) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (key: string) => void;
}

const EditTiered: React.FC<EditTieredProps> = ({
  tiers: externalTiers,
  onTiersChange,
  unlimited: externalUnlimited,
  onUnlimitedChange,
  overageCharge: externalOverage,
  onOverageChange,
  graceBuffer: externalGrace,
  onGraceChange,
  validationErrors = {},
  onClearError
}) => {
  const [tiers, setTiers] = useState<Tier[]>(externalTiers || [{ from: '', to: '', price: '' }]);
  const [unlimited, setUnlimited] = useState(externalUnlimited || false);
  const [overageCharge, setOverageCharge] = useState(externalOverage || '');
  const [graceBuffer, setGraceBuffer] = useState(externalGrace || '');
  const isInternalChange = useRef(false);

  // Local validation state
  type TierError = { from?: string; to?: string; price?: string };
  type TierTouched = { from: boolean; to: boolean; price: boolean };
  const [tierTouched, setTierTouched] = useState<TierTouched[]>([{ from: false, to: false, price: false }]);
  const [tierErrors, setTierErrors] = useState<TierError[]>([{}]);

  // Sync with external props (only when not from internal change)
  useEffect(() => {
    if (externalTiers && !isInternalChange.current) {
      setTiers(externalTiers);
    }
    isInternalChange.current = false;
  }, [externalTiers]);

  useEffect(() => {
    if (externalUnlimited !== undefined) setUnlimited(externalUnlimited);
  }, [externalUnlimited]);

  useEffect(() => {
    if (externalOverage !== undefined) setOverageCharge(externalOverage);
  }, [externalOverage]);

  useEffect(() => {
    if (externalGrace !== undefined) setGraceBuffer(externalGrace);
  }, [externalGrace]);

  // Notify parent and persist
  useEffect(() => {
    isInternalChange.current = true;
    onTiersChange?.(tiers);
    localStorage.setItem('tieredTiers', JSON.stringify(tiers));
  }, [tiers, onTiersChange]);

  useEffect(() => {
    localStorage.setItem('tieredOverage', overageCharge);
  }, [overageCharge]);

  useEffect(() => {
    localStorage.setItem('tieredGrace', graceBuffer);
  }, [graceBuffer]);

  // Validation helpers
  const isNonNegInt = (s: string) => /^\d+$/.test(s);
  const isPositiveNum = (s: string) => { const n = Number(s); return !Number.isNaN(n) && n > 0; };

  const validateTier = (tier: Tier, index: number): TierError => {
    const error: TierError = {};

    if (tier.from.trim() === '') {
      error.from = 'This is a required field';
    } else if (Number.isNaN(Number(tier.from)) || Number(tier.from) < 0) {
      error.from = 'Enter a valid value';
    } else if (index > 0 && tiers[index - 1] && tiers[index - 1].to) {
      const expectedFrom = Number(tiers[index - 1].to) + 1;
      if (Number(tier.from) !== expectedFrom) {
        error.from = `Must be ${expectedFrom} (previous tier end + 1)`;
      }
    }

    if (!tier.isUnlimited) {
      if (tier.to.trim() === '') {
        error.to = 'This is a required field';
      } else if (Number.isNaN(Number(tier.to)) || Number(tier.to) < 0) {
        error.to = 'Enter a valid value';
      } else if (!error.from && Number(tier.to) <= Number(tier.from)) {
        error.to = 'Must be > From';
      }
    }

    if (tier.price.trim() === '') {
      error.price = 'This is a required field';
    } else if (Number.isNaN(Number(tier.price)) || Number(tier.price) <= 0) {
      error.price = 'Enter a valid value';
    }

    return error;
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

  const markTouched = (index: number, field: keyof TierTouched) => {
    setTierTouched(prev => {
      const newTouched = [...prev];
      if (!newTouched[index]) newTouched[index] = { from: false, to: false, price: false };
      newTouched[index][field] = true;
      return newTouched;
    });
  };

  // Run validation on tiers change
  useEffect(() => {
    ensureArrays(tiers.length);
    setTierErrors(tiers.map((tier, index) => validateTier(tier, index)));
  }, [tiers]);

  const handleAddTier = () => {
    setTiers(prev => {
      // Auto-populate 'from' field based on previous tier's 'to' value + 1
      let newFrom = '';
      if (prev.length > 0 && prev[prev.length - 1].to) {
        newFrom = String(Number(prev[prev.length - 1].to) + 1);
      }
      return [...prev, { from: newFrom, to: '', price: '', isUnlimited: false }];
    });
  };

  const handleDeleteTier = (index: number) => {
    setTiers(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof Tier, value: string) => {
    // Update state only; persistence handled by useEffect([tiers])
    setTiers(prev => {
      const updated = prev.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier)) as Tier[];
      
      // If 'to' field changed, update next tier's 'from' field
      if (field === 'to' && value && !isNaN(Number(value)) && index < updated.length - 1) {
        updated[index + 1] = { ...updated[index + 1], from: String(Number(value) + 1) };
      }
      
      return updated;
    });

    // Clear local touched state on change
    if (field !== 'isUnlimited') {
      setTierTouched(prev => {
        const newTouched = [...prev];
        if (newTouched[index]) newTouched[index][field as keyof TierTouched] = false;
        return newTouched;
      });
    }

    // Clear validation error for this tier field
    if (value.trim() && onClearError) {
      onClearError(`tier${index}_${field}`);
    }
  };

  const handleUnlimitedToggle = (checked: boolean, index: number) => {
    setTiers(prev => {
      const updated = [...prev];
      const t = updated[index] || { from: '', to: '', price: '' };
      updated[index] = {
        ...t,
        isUnlimited: checked,
        to: checked ? '' : t.to,
      };
      return updated;
    });
    setUnlimited(checked);
    onUnlimitedChange?.(checked);
  };

  return (
    <div className="edit-tiered-container">
      <div className="edit-tiered-input-section">
        <div className="edit-tiered-header-row">
          <div className="edit-tiered-usage-range-label">Usage Tiers</div>
          <div className="edit-tiered-cost-label">Price per Unit</div>
        </div>

        {tiers.map((tier, index) => (
          <div className="edit-tiered-row" key={index}>
            <div className="field-col small-field">
              <input
                className={`edit-tiered-input-small ${tierTouched[index]?.from && tierErrors[index]?.from ? 'error-input' : ''}`}
                value={tier.from}
                onChange={(e) => handleChange(index, 'from', e.target.value)}
                onBlur={() => markTouched(index, 'from')}
                placeholder="From"
              />
              {tierTouched[index]?.from && tierErrors[index]?.from && (
                <span className="error-text">{tierErrors[index].from}</span>
              )}
            </div>
            <span>-</span>
            <div className="field-col small-field">
              <input
                className={`edit-tiered-input-small ${!tier.isUnlimited && tierTouched[index]?.to && tierErrors[index]?.to ? 'error-input' : ''}`}
                value={tier.isUnlimited ? 'Unlimited' : tier.to}
                placeholder="To"
                disabled={tier.isUnlimited}
                onChange={(e) => handleChange(index, 'to', e.target.value)}
                onBlur={() => markTouched(index, 'to')}
              />
              {!tier.isUnlimited && tierTouched[index]?.to && tierErrors[index]?.to && (
                <span className="error-text">{tierErrors[index].to}</span>
              )}
            </div>
            <div className="field-col large-field">
              <input
                className={`edit-tiered-input-large ${tierTouched[index]?.price && tierErrors[index]?.price ? 'error-input' : ''}`}
                value={tier.price}
                onChange={(e) => handleChange(index, 'price', e.target.value)}
                onBlur={() => markTouched(index, 'price')}
                placeholder="Price"
              />
              {tierTouched[index]?.price && tierErrors[index]?.price && (
                <span className="error-text">{tierErrors[index].price}</span>
              )}
            </div>
            <button className="edit-tiered-delete-btn" onClick={() => handleDeleteTier(index)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ))}

        <label className="edit-tiered-checkbox-label">
          <input
            type="checkbox"
            checked={unlimited}
            onChange={(e) => {
              const checked = e.target.checked;
              setUnlimited(checked);
              onUnlimitedChange?.(checked);
              if (tiers.length > 0) {
                handleUnlimitedToggle(checked, tiers.length - 1);
              }
            }}
          />
          <svg className="edit-checkbox-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12Z" stroke="#E6E5E6" strokeWidth="1.2" />
            <path className="tick" d="M8 12.5L10.5 15L16 9.5" stroke="#4C7EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>No upper limit for last tier</span>
        </label>

        {!unlimited && (
          <div className="edit-tiered-extra-fields">
            <label>
              Overage Charge
              <input
                type="text"
                className="edit-tiered-input-extra"
                value={overageCharge}
                onChange={(e) => {
                  setOverageCharge(e.target.value);
                  onOverageChange?.(e.target.value);
                  if (onClearError) onClearError('tieredOverage');
                }}
                placeholder="Enter overage charge"
              />
              {validationErrors.tieredOverage && (
                <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '3px', color: '#ED5142', fontSize: '11px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ marginRight: '3px' }}>
                    <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {validationErrors.tieredOverage}
                </div>
              )}
            </label>
            <label>
              Grace Buffer (optional)
              <input
                type="text"
                className="edit-tiered-input-extra"
                value={graceBuffer}
                onChange={(e) => {
                  setGraceBuffer(e.target.value);
                  onGraceChange?.(e.target.value);
                }}
                placeholder="Enter grace buffer"
              />
            </label>
          </div>
        )}

        <button className="edit-tiered-add-btn" onClick={handleAddTier}>+ Add Volume Tier</button>
      </div>
    </div>
  );
};

export default EditTiered;
