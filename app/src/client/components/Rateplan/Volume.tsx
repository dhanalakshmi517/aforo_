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
  onClearError?: (key: string) => void;
  locked?: boolean;
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
  onClearError,
  locked = false,
}, ref) => {
  const [tierErrors, setTierErrors] = useState<TierError[]>([]);
  const [tierTouched, setTierTouched] = useState<TierTouched[]>([]);
  const [overageError, setOverageError] = useState<string | null>(null);
  const [overageTouched, setOverageTouched] = useState(false);

  /** basic field validation (caller decides whether a row is unlimited) */
  const validateTier = (tier: Tier & { _derivedUnlimited?: boolean }, index: number): TierError => {
    const error: TierError = {};
    const isUnlimited = !!(tier.isUnlimited || tier._derivedUnlimited);

    if (String(tier.from).trim() === '' || Number.isNaN(tier.from)) {
      error.from = 'This is a required field';
    } else if (tier.from < 0) {
      error.from = 'Enter a valid value';
    } else if (index > 0 && tiers[index - 1] && tiers[index - 1].to) {
      const expectedFrom = Number(tiers[index - 1].to) + 1;
      if (Number(tier.from) !== expectedFrom) {
        error.from = `Must be ${expectedFrom} (previous tier end + 1)`;
      }
    }

    if (!isUnlimited) {
      if (String(tier.to).trim() === '' || Number.isNaN(tier.to)) {
        error.to = 'This is a required field';
      } else if (tier.to < 0) {
        error.to = 'Enter a valid value';
      } else if (!error.from && tier.to <= tier.from) {
        error.to = 'Must be > From';
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
    setTierErrors(derived.map((tier, index) => validateTier(tier, index)));

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
              <div className="field-col small-field">
                <input
                  className={`tiered-input-small ${touched.from && error.from ? 'error-input' : ''}`}
                  type="number"
                  step="any"
                  value={Number.isNaN(tier.from) ? '' : tier.from}
                  onChange={(e) => onChange(index, 'from', e.target.value)}
                  onBlur={() => markTouched(index, 'from')}
                  placeholder="From"
                  disabled={locked}
                />
                {touched.from && error.from && <span className="error-text">{error.from}</span>}
              </div>

              <span>-</span>

              <div className="field-col small-field">
                <input
                  className={`tiered-input-small ${touched.to && error.to ? 'error-input' : ''}`}
                  value={unlimitedForRow ? 'Unlimited' : (Number.isNaN(tier.to) ? '' : tier.to)}
                  placeholder="To"
                  disabled={unlimitedForRow || locked}
                  onChange={(e) => onChange(index, 'to', e.target.value)}
                  onBlur={() => markTouched(index, 'to')}
                />
                {!unlimitedForRow && touched.to && error.to && <span className="error-text">{error.to}</span>}
              </div>

              <div className="field-col large-field">
                <input
                  className={`tiered-input-large ${touched.price && error.price ? 'error-input' : ''}`}
                  type="number"
                  step="any"
                  value={Number.isNaN(tier.price) ? '' : tier.price}
                  onChange={(e) => onChange(index, 'price', e.target.value)}
                  onBlur={() => markTouched(index, 'price')}
                  placeholder="Price"
                  disabled={locked}
                />
                {touched.price && error.price && <span className="error-text">{error.price}</span>}
              </div>

              {onDeleteTier && (
                <button
                  className="tiered-delete-btn"
                  onClick={() => onDeleteTier(index)}
                  title="Delete tier"
                  disabled={locked}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    viewBox="0 0 16 16" fill="none">
                    <path d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335"
                      stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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
            disabled={locked}
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
                type="number"
                step="0.01"
                min="0"
                className={`volume-input-extra ${!noUpperLimit && overageTouched && overageError ? 'error-input' : ''}`}
                placeholder="Enter overage charge"
                value={overageUnitRate}
                onChange={(e) => {
                  setOverageUnitRate(parseFloat(e.target.value) || 0);
                  if (overageTouched) setOverageTouched(false);
                  if (onClearError) onClearError('volumeOverage');
                }}
                onBlur={() => setOverageTouched(true)}
                disabled={locked}
              />
              {/* Only show overage errors when NOT unlimited */}
              {!noUpperLimit && overageTouched && overageError && <span className="error-text">{overageError}</span>}
              {!noUpperLimit && validationErrors.volumeOverage && (
                <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
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
                className="volume-input-extra"
                placeholder="Enter grace buffer"
                value={graceBuffer}
                onChange={(e) => setGraceBuffer(parseFloat(e.target.value) || 0)}
                disabled={locked}
              />
            </label>
          </div>
        )}

        <button className="tiered-add-btn" onClick={onAddTier} disabled={locked}>
          + Add Volume Tier
        </button>

        {validationErrors.volumeTiers && (
          <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '10px', color: '#ED5142', fontSize: '12px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
              <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {validationErrors.volumeTiers}
          </div>
        )}
      </div>

      <div className="tiered-example-section volume-example-section">
        <div className="tiered-example-header">
          <div className="tiered-example-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
              <path d="M0.113636 6.44825L3.20214 0.969251C3.2958 0.805251 3.40964 0.686333 3.54364 0.6125C3.6778 0.538833 3.82689 0.502 3.99089 0.502C4.15489 0.502 4.3038 0.538833 4.43764 0.6125C4.57164 0.686333 4.68547 0.805251 4.77914 0.969251L7.86764 6.44825C7.95097 6.60008 7.98847 6.75192 7.98014 6.90375C7.9718 7.05558 7.92914 7.19983 7.85214 7.3365C7.77714 7.47217 7.67214 7.58142 7.53714 7.66425C7.4023 7.74708 7.24914 7.7885 7.07764 7.7885H0.903636C0.732136 7.7885 0.578886 7.74708 0.443886 7.66425C0.309053 7.58142 0.204136 7.47217 0.129136 7.3365C0.0521362 7.19983 0.0094697 7.05558 0.00113636 6.90375C-0.00719697 6.75192 0.030303 6.60008 0.113636 6.44825ZM4.00014 17.8365C2.95797 17.8365 2.0708 17.4705 1.33864 16.7385C0.606636 16.0065 0.240636 15.1207 0.240636 14.081C0.240636 13.0258 0.606636 12.1348 1.33864 11.4078C2.0708 10.6809 2.95797 10.3175 4.00014 10.3175C5.04247 10.3175 5.92964 10.6835 6.66164 11.4155C7.3938 12.1475 7.75989 13.0347 7.75989 14.077C7.75989 15.1193 7.3938 16.0065 6.66164 16.7385C5.92964 17.4705 5.04247 17.8365 4.00014 17.8365ZM4.00014 16.3368C4.62714 16.3368 5.16047 16.1168 5.60014 15.677C6.03997 15.2373 6.25989 14.704 6.25989 14.077C6.25989 13.45 6.03997 12.9167 5.60014 12.477C5.16047 12.0372 4.62714 11.8173 4.00014 11.8173C3.3733 11.8173 2.83997 12.0372 2.40014 12.477C1.96047 12.9167 1.74064 13.45 1.74064 14.077C1.74064 14.704 1.96047 15.2373 2.40014 15.677C2.83997 16.1168 3.3733 16.3368 4.00014 16.3368ZM1.91939 6.2885H6.07139L3.99064 2.64425L1.91939 6.2885ZM10.2311 16.9328V11.2213C10.2311 10.9651 10.3177 10.7504 10.4909 10.5773C10.6641 10.4041 10.8787 10.3175 11.1349 10.3175H16.8464C17.1024 10.3175 17.3171 10.4041 17.4904 10.5773C17.6636 10.7504 17.7501 10.9651 17.7501 11.2213V16.9328C17.7501 17.1889 17.6636 17.4036 17.4904 17.5767C17.3171 17.7499 17.1024 17.8365 16.8464 17.8365H11.1349C10.8787 17.8365 10.6641 17.7499 10.4909 17.5767C10.3177 17.4036 10.2311 17.1889 10.2311 16.9328ZM11.7309 16.3368H16.2501V11.8173H11.7309V16.3368ZM13.4079 7.30575L12.3136 6.3925C11.3048 5.56033 10.5661 4.85392 10.0974 4.27325C9.62872 3.69242 9.39439 3.05717 9.39439 2.3675C9.39439 1.69433 9.6233 1.1315 10.0811 0.679001C10.5388 0.226334 11.1144 0 11.8079 0C12.2322 0 12.629 0.101 12.9981 0.303C13.3675 0.505 13.6983 0.795667 13.9906 1.175C14.283 0.802 14.617 0.512917 14.9926 0.30775C15.3681 0.102583 15.7649 0 16.1829 0C16.8676 0 17.4394 0.231417 17.8984 0.694251C18.3572 1.15708 18.5866 1.72442 18.5866 2.39625C18.5866 3.07958 18.3524 3.70842 17.8839 4.28275C17.4152 4.85708 16.6765 5.56033 15.6676 6.3925L14.5734 7.30575C14.4089 7.45325 14.2146 7.527 13.9904 7.527C13.7662 7.527 13.5721 7.45325 13.4079 7.30575ZM13.9906 5.827C15.1715 4.87833 15.9827 4.16042 16.4244 3.67325C16.8661 3.18608 17.0869 2.7675 17.0869 2.4175C17.0869 2.1495 17.0051 1.92958 16.8416 1.75775C16.6781 1.58592 16.4656 1.5 16.2041 1.5C16.0131 1.5 15.8269 1.5555 15.6454 1.6665C15.4641 1.77733 15.2246 1.9815 14.9271 2.279L13.9906 3.18475L13.0541 2.279C12.7503 1.97517 12.5096 1.76933 12.3319 1.6615C12.1544 1.55383 11.9695 1.5 11.7771 1.5C11.5091 1.5 11.2951 1.58108 11.1349 1.74325C10.9746 1.90542 10.8944 2.12375 10.8944 2.39825C10.8944 2.76108 11.1152 3.18608 11.5569 3.67325C11.9986 4.16042 12.8098 4.87833 13.9906 5.827Z" fill="#2A455E" />
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
            "You’ve consumed 560 units this billing cycle, which falls under Volume 3.
            At $3 per unit, your total charge comes to 560*3 = $1,680."
          </span>
        </p>
      </div>
    </div>
  );
});

export default Volume;
