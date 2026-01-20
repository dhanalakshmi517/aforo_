import React, { useState, useEffect, useRef } from 'react';
import './EditVolume.css';

interface Tier {
  from: string;
  to: string;
  price: string;
  isUnlimited?: boolean;
}

interface EditVolumeProps {
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

const EditVolume: React.FC<EditVolumeProps> = ({
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

  // Notify parent of changes
  useEffect(() => {
    isInternalChange.current = true;
    onTiersChange?.(tiers);
    localStorage.setItem('volumeTiers', JSON.stringify(tiers));
  }, [tiers, onTiersChange]);

  // ✅ persist overage / grace so EditPricing can read latest values
  useEffect(() => {
    localStorage.setItem('volumeOverage', overageCharge);
  }, [overageCharge]);

  useEffect(() => {
    localStorage.setItem('volumeGrace', graceBuffer);
  }, [graceBuffer]);

  // Validation helpers
  const validateTier = (tier: Tier, index: number): TierError => {
    const error: TierError = {};

    if (String(tier.from).trim() === '' || tier.from === null) {
      error.from = 'This is a required field';
    } else if (isNaN(Number(tier.from)) || Number(tier.from) < 0) {
      error.from = 'Enter a valid value';
    } else if (index > 0 && tiers[index - 1] && tiers[index - 1].to) {
      const expectedFrom = Number(tiers[index - 1].to) + 1;
      if (Number(tier.from) !== expectedFrom) {
        error.from = `Must be ${expectedFrom} (previous tier end + 1)`;
      }
    }

    if (!tier.isUnlimited) {
      if (String(tier.to).trim() === '' || tier.to === null) {
        error.to = 'This is a required field';
      } else if (isNaN(Number(tier.to)) || Number(tier.to) < 0) {
        error.to = 'Enter a valid value';
      } else if (!error.from && Number(tier.to) <= Number(tier.from)) {
        error.to = 'Must be > From';
      }
    }

    if (String(tier.price).trim() === '' || tier.price === null) {
      error.price = 'This is a required field';
    } else if (isNaN(Number(tier.price)) || Number(tier.price) <= 0) {
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
    <div className="edit-volume-container">
      <div className="edit-volume-input-section">
        <div className="edit-stair-header-row">
          <div className="edit-usage-range-label">Usage Volume Ranges</div>
          <div className="edit-cost-label">Price per Unit</div>
        </div>

        {tiers.map((tier, index) => (
          <div className="edit-volume-stair-row" key={index}>
            <div className="field-col small-field">
              <input
                className={`edit-volume-input-small ${tierTouched[index]?.from && tierErrors[index]?.from ? 'error-input' : ''}`}
                type="number"
                step="1"
                min="0"
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
                className={`edit-volume-input-small ${!tier.isUnlimited && tierTouched[index]?.to && tierErrors[index]?.to ? 'error-input' : ''}`}
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
                className={`edit-volume-input-large ${tierTouched[index]?.price && tierErrors[index]?.price ? 'error-input' : ''}`}
                type="number"
                step="0.01"
                min="0"
                value={tier.price}
                onChange={(e) => handleChange(index, 'price', e.target.value)}
                onBlur={() => markTouched(index, 'price')}
                placeholder="Price"
              />
              {tierTouched[index]?.price && tierErrors[index]?.price && (
                <span className="error-text">{tierErrors[index].price}</span>
              )}
            </div>
            <button className="edit-volume-delete-btn" onClick={() => handleDeleteTier(index)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ))}

        <label className="edit-volume-checkbox-label">
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
          <div className="edit-volume-extra-fields">
            <label>
              Overage Charge
              <input
                type="number"
                step="0.01"
                min="0"
                className="edit-volume-input-extra"
                value={overageCharge}
                onChange={(e) => {
                  setOverageCharge(e.target.value);
                  onOverageChange?.(e.target.value);
                  if (onClearError) onClearError('volumeOverage');
                }}
                placeholder="Enter overage charge"
              />
              {validationErrors.volumeOverage && (
                <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '3px', color: '#ED5142', fontSize: '11px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ marginRight: '3px' }}>
                    <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {validationErrors.volumeOverage}
                </div>
              )}
            </label>
            <label>
              Grace Buffer (optional)
              <input
                type="number"
                step="1"
                min="0"
                className="edit-volume-input-extra"
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

        <button className="edit-volume-add-stair-btn" onClick={handleAddTier}>+ Add Volume Tier</button>
      </div>

      <div className="tiered-example-section volume-example-section">
        <div className="tiered-example-header">
          <div className="tiered-example-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
              <path d="M0.113636 6.44825L3.20214 0.969251C3.2958 0.805251 3.40964 0.686333 3.54364 0.6125C3.6778 0.538833 3.82689 0.502 3.99089 0.502C4.15489 0.502 4.3038 0.538833 4.43764 0.6125C4.57164 0.686333 4.68547 0.805251 4.77914 0.969251L7.86764 6.44825C7.95097 6.60008 7.98847 6.75192 7.98014 6.90375C7.9718 7.05558 7.92914 7.19983 7.85214 7.3365C7.77714 7.47217 7.67214 7.58142 7.53714 7.66425C7.4023 7.74708 7.24914 7.7885 7.07764 7.7885H0.903636C0.732136 7.7885 0.578886 7.74708 0.443886 7.66425C0.309053 7.58142 0.204136 7.47217 0.129136 7.3365C0.0521362 7.19983 0.0094697 7.05558 0.00113636 6.90375C-0.00719697 6.75192 0.030303 6.60008 0.113636 6.44825ZM4.00014 17.8365C2.95797 17.8365 2.0708 17.4705 1.33864 16.7385C0.606636 16.0065 0.240636 15.1207 0.240636 14.081C0.240636 13.0258 0.606636 12.1348 1.33864 11.4078C2.0708 10.6809 2.95797 10.3175 4.00014 10.3175C5.04247 10.3175 5.92964 10.6835 6.66164 11.4155C7.3938 12.1475 7.75989 13.0347 7.75989 14.077C7.75989 15.1193 7.3938 16.0065 6.66164 16.7385C5.92964 17.4705 5.04247 17.8365 4.00014 17.8365ZM4.00014 16.3368C4.62714 16.3368 5.16047 16.1168 5.60014 15.677C6.03997 15.2373 6.25989 14.704 6.25989 14.077C6.25989 13.45 6.03997 12.9167 5.60014 12.477C5.16047 12.0372 4.62714 11.8173 4.00014 11.8173C3.3733 11.8173 2.83997 12.0372 2.40014 12.477C1.96047 12.9167 1.74064 13.45 1.74064 14.077C1.74064 14.704 1.96047 15.2373 2.40014 15.677C2.83997 16.1168 3.3733 16.3368 4.00014 16.3368ZM1.91939 6.2885H6.07139L3.99064 2.64425L1.91939 6.2885ZM10.2311 16.9328V11.2213C10.2311 10.9651 10.3177 10.7504 10.4909 10.5773C10.6641 10.4041 10.8787 10.3175 11.1349 10.3175H16.8464C17.1024 10.3175 17.3171 10.4041 17.4904 10.5773C17.6636 10.7504 17.7501 10.9651 17.7501 11.2213V16.9328C17.7501 17.1889 17.6636 17.4036 17.4904 17.5767C17.3171 17.7499 17.1024 17.8365 16.8464 17.8365H11.1349C10.8787 17.8365 10.6641 17.7499 10.4909 17.5767C10.3177 17.4036 10.2311 17.1889 10.2311 16.9328ZM11.7309 16.3368H16.2501V11.8173H11.7309V16.3368ZM13.4079 9.28825V3.57675C13.4079 3.32058 13.4945 3.10583 13.6676 2.9325C13.8408 2.759 14.0555 2.67225 14.3117 2.67225H18.0732C18.3294 2.67225 18.5441 2.759 18.7172 2.9325C18.8904 3.10583 18.977 3.32058 18.977 3.57675V9.28825C18.977 9.54442 18.8904 9.75925 18.7172 9.93275C18.5441 10.1062 18.3294 10.193 18.0732 10.193H14.3117C14.0555 10.193 13.8408 10.1062 13.6676 9.93275C13.4945 9.75925 13.4079 9.54442 13.4079 9.28825ZM14.9077 8.693H17.4772V4.172H14.9077V8.693Z" fill="#2A455E" />
            </svg>
          </div>
          <div className="tiered-example-header-text">
            <h4>EXAMPLE</h4>
            <button type="button" className="tiered-example-link">Volume based Pricing</button>
          </div>
        </div>

        <table className="tiered-example-table">
          <tbody>
            <tr>
              <td className="tier-label">Volume 1</td>
              <td className="tier-range"><strong>1 – 200</strong></td>
              <td className="tier-price">$8</td>
            </tr>
            <tr>
              <td className="tier-label">Volume 2</td>
              <td className="tier-range"><strong>201 – 500</strong></td>
              <td className="tier-price">$5</td>
            </tr>
            <tr>
              <td className="tier-label">Volume 3</td>
              <td className="tier-range"><strong>501 – 700</strong></td>
              <td className="tier-price">$3</td>
            </tr>
          </tbody>
        </table>

        <p className="tiered-consumer-note">
          <span className="tiered-note-title">You to consumer:</span><br />
          <span className="tiered-note-text">
            "You've consumed 560 units this billing cycle, which falls under Volume 3.
            At $3 per unit, your total charge comes to 560*3 = $1,680."
          </span>
        </p>
      </div>
    </div>
  );
};

export default EditVolume;
