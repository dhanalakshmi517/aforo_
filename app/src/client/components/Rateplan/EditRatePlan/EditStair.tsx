import React, { useState, useEffect, useRef } from 'react';
import './EditStair.css';

interface Stair {
  from: string;
  to: string;
  cost: string;
  isUnlimited?: boolean;
}

interface EditStairProps {
  stairs?: Stair[];
  onStairsChange?: (stairs: Stair[]) => void;
  unlimited?: boolean;
  onUnlimitedChange?: (unlimited: boolean) => void;
  overageCharge?: string;
  onOverageChange?: (overage: string) => void;
  graceBuffer?: string;
  onGraceChange?: (grace: string) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (key: string) => void;
}

const EditStair: React.FC<EditStairProps> = ({
  stairs: externalStairs,
  onStairsChange,
  unlimited: externalUnlimited,
  onUnlimitedChange,
  overageCharge: externalOverage,
  onOverageChange,
  graceBuffer: externalGrace,
  onGraceChange,
  validationErrors = {},
  onClearError
}) => {
  // Initialize from props or localStorage fallback
  const [stairs, setStairs] = useState<Stair[]>(() => {
    if (externalStairs) return externalStairs;

    const saved = localStorage.getItem('stairTiers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((r: any) => ({
          from: r.from ?? '',
          to: r.to ?? '',
          cost: r.cost ?? r.price ?? '',
          isUnlimited: r.isUnlimited ?? false,
        }));
      } catch { }
    }
    return [{ from: '', to: '', cost: '' }];
  });

  const [unlimited, setUnlimited] = useState(externalUnlimited ?? false);
  const [overageCharge, setOverageCharge] = useState(
    externalOverage ?? localStorage.getItem('stairOverage') ?? ''
  );
  const [graceBuffer, setGraceBuffer] = useState(
    externalGrace ?? localStorage.getItem('stairGrace') ?? ''
  );
  const isInternalChange = useRef(false);

  // Local validation state
  type RowError = { from?: string; to?: string; cost?: string };
  type RowTouched = { from: boolean; to: boolean; cost: boolean };
  const [touched, setTouched] = useState<RowTouched[]>([{ from: false, to: false, cost: false }]);
  const [rowErrors, setRowErrors] = useState<RowError[]>([{}]);

  // Sync with external props (only when not from internal change)
  useEffect(() => {
    if (externalStairs && !isInternalChange.current) {
      setStairs(externalStairs);
    }
    isInternalChange.current = false;
  }, [externalStairs]);

  useEffect(() => {
    if (externalUnlimited !== undefined) setUnlimited(externalUnlimited);
  }, [externalUnlimited]);

  useEffect(() => {
    if (externalOverage !== undefined) setOverageCharge(externalOverage);
  }, [externalOverage]);

  useEffect(() => {
    if (externalGrace !== undefined) setGraceBuffer(externalGrace);
  }, [externalGrace]);

  // persist stairs snapshot and notify parent
  const persistStairs = (next: Stair[]) => {
    const toSave = next.map(s => ({
      from: s.from,
      to: s.to,
      cost: s.cost,
      isUnlimited: s.isUnlimited,
    }));
    setTimeout(() => localStorage.setItem('stairTiers', JSON.stringify(toSave)), 0);
  };

  useEffect(() => {
    isInternalChange.current = true;
    onStairsChange?.(stairs);
    persistStairs(stairs);
  }, [stairs, onStairsChange]);

  useEffect(() => {
    localStorage.setItem('stairOverage', overageCharge);
  }, [overageCharge]);

  useEffect(() => {
    localStorage.setItem('stairGrace', graceBuffer);
  }, [graceBuffer]);

  // Validation helpers
  const isNonNegInt = (s: string) => /^\d+$/.test(s);
  const isPositiveNum = (s: string) => { const n = Number(s); return !Number.isNaN(n) && n > 0; };

  const validateRow = (r: Stair, index: number): RowError => {
    const e: RowError = {};
    if ((r.from ?? '').trim() === '') e.from = 'This is a required field';
    else if (!isNonNegInt(r.from!)) e.from = 'Enter a valid value';
    else if (index > 0 && stairs[index - 1] && stairs[index - 1].to) {
      const expectedFrom = Number(stairs[index - 1].to) + 1;
      if (Number(r.from) !== expectedFrom) {
        e.from = `Must be ${expectedFrom} (previous tier end + 1)`;
      }
    }
    if (!r.isUnlimited) {
      if ((r.to ?? '').trim() === '') e.to = 'This is a required field';
      else if (!isNonNegInt(r.to!)) e.to = 'Enter a valid value';
      if (!e.from && !e.to && Number(r.to) <= Number(r.from)) e.to = 'Must be > From';
    }
    if ((r.cost ?? '').trim() === '') e.cost = 'This is a required field';
    else if (!isPositiveNum(r.cost!)) e.cost = 'Enter a valid value';
    return e;
  };

  const ensureArrays = (len: number) => {
    setTouched(prev => { const n = [...prev]; while (n.length < len) n.push({ from: false, to: false, cost: false }); return n.slice(0, len); });
    setRowErrors(prev => { const n = [...prev]; while (n.length < len) n.push({}); return n.slice(0, len); });
  };

  const markTouched = (i: number, f: keyof RowTouched) =>
    setTouched(ts => { const n = [...ts]; if (!n[i]) n[i] = { from: false, to: false, cost: false }; n[i][f] = true; return n; });

  // Run validation on stairs change
  useEffect(() => {
    ensureArrays(stairs.length);
    setRowErrors(stairs.map((stair, index) => validateRow(stair, index)));
  }, [stairs]);

  const handleAddStair = () => {
    // Auto-populate 'from' field based on previous tier's 'to' value + 1
    let newFrom = '';
    if (stairs.length > 0 && stairs[stairs.length - 1].to) {
      newFrom = String(Number(stairs[stairs.length - 1].to) + 1);
    }

    const next = [...stairs, { from: newFrom, to: '', cost: '', isUnlimited: false }];
    setStairs(next);
  };

  const handleDeleteStair = (index: number) => {
    const updated = stairs.filter((_, i) => i !== index);
    setStairs(updated.length ? updated : [{ from: '', to: '', cost: '', isUnlimited: false }]);
  };

  const handleChange = (index: number, field: keyof Stair, value: string) => {
    const updated = [...stairs];
    (updated[index] as any)[field] = value;

    // If 'to' field changed, update next tier's 'from' field
    if (field === 'to' && value && !isNaN(Number(value)) && index < updated.length - 1) {
      updated[index + 1].from = String(Number(value) + 1);
    }
    setStairs(updated);

    // Clear local touched state on change
    if (field !== 'isUnlimited') {
      setTouched(ts => {
        const n = [...ts];
        if (n[index]) n[index][field as keyof RowTouched] = false;
        return n;
      });
    }

    // Clear parent validation errors when user types
    if (value.trim() && onClearError) {
      onClearError('stairTiers');
    }
  };

  const handleUnlimitedToggle = (checked: boolean, index: number) => {
    const updated = [...stairs];
    updated[index].isUnlimited = checked;
    if (checked) {
      updated[index].to = '';
    }
    setStairs(updated);
    setUnlimited(checked);
    onUnlimitedChange?.(checked);
  };

  return (
    <div className="edit-stair-container">
      <div className="edit-stair-input-section">
        <div className="edit-stair-header-row">
          <div className="edit-stair-usage-range-label">Usage Range</div>
          <div className="edit-stair-cost-label">Flat–Stair Cost</div>
        </div>

        {stairs.map((stair, index) => (
          <div className="edit-stair-row" key={index}>
            <div className="field-col small-field">
              <input
                className={`edit-input-small ${touched[index]?.from && rowErrors[index]?.from ? 'error-input' : ''}`}
                type="number"
                step="1"
                min="0"
                value={stair.from}
                onChange={(e) => handleChange(index, 'from', e.target.value)}
                onBlur={() => markTouched(index, 'from')}
                placeholder="From"
              />
              {touched[index]?.from && rowErrors[index]?.from && (
                <span className="error-text">{rowErrors[index].from}</span>
              )}
            </div>
            <span>-</span>
            <div className="field-col small-field">
              <input
                className={`edit-input-small ${!stair.isUnlimited && touched[index]?.to && rowErrors[index]?.to ? 'error-input' : ''}`}
                type="number"
                step="1"
                min="0"
                value={stair.isUnlimited ? 'Unlimited' : stair.to}
                placeholder="To"
                disabled={stair.isUnlimited}
                onChange={(e) => handleChange(index, 'to', e.target.value)}
                onBlur={() => markTouched(index, 'to')}
              />
              {!stair.isUnlimited && touched[index]?.to && rowErrors[index]?.to && (
                <span className="error-text">{rowErrors[index].to}</span>
              )}
            </div>
            <div className="field-col large-field">
              <input
                className={`edit-input-large ${touched[index]?.cost && rowErrors[index]?.cost ? 'error-input' : ''}`}
                type="number"
                step="0.01"
                min="0"
                value={stair.cost}
                onChange={(e) => handleChange(index, 'cost', e.target.value)}
                onBlur={() => markTouched(index, 'cost')}
                placeholder="Cost"
              />
              {touched[index]?.cost && rowErrors[index]?.cost && (
                <span className="error-text">{rowErrors[index].cost}</span>
              )}
            </div>
            <button className="edit-delete-btn" onClick={() => handleDeleteStair(index)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ))}

        <label className="edit-checkbox-label">
          <input
            type="checkbox"
            checked={unlimited}
            onChange={(e) => {
              const checked = e.target.checked;
              setUnlimited(checked);
              onUnlimitedChange?.(checked);
              if (stairs.length > 0) {
                handleUnlimitedToggle(checked, stairs.length - 1);
              }
            }}
          />
          <svg className="edit-checkbox-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12Z" stroke="#E6E5E6" strokeWidth="1.2" />
            <path className="tick" d="M8 12.5L10.5 15L16 9.5" stroke="#4C7EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>No upper limit for this Stair</span>
        </label>

        {!unlimited && (
          <div className="edit-extra-fields">
            <label>
              Overage Charge
              <input
                type="number"
                step="0.01"
                min="0"
                className="edit-input-extra-stairs"
                value={overageCharge}
                onChange={(e) => {
                  setOverageCharge(e.target.value);
                  onOverageChange?.(e.target.value);
                  if (onClearError) onClearError('stairOverage');
                }}
                placeholder="Enter overage charge"
              />
              {validationErrors.stairOverage && (
                <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '3px', color: '#ED5142', fontSize: '11px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ marginRight: '3px' }}>
                    <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {validationErrors.stairOverage}
                </div>
              )}
            </label>
            <label>
              Grace Buffer (optional)
              <input
                type="number"
                step="1"
                min="0"
                className="edit-input-extra-stairs"
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

        <button className="edit-add-stair-btn" onClick={handleAddStair}>+ Add Stair</button>

        {validationErrors.stairTiers && (
          <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '10px', color: '#ED5142', fontSize: '12px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
              <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {validationErrors.stairTiers}
          </div>
        )}
      </div>

      <div className="tiered-example-section stair-example-section">
        <div className="tiered-example-header">
          <div className="tiered-example-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M6.675 10.925H8.5C8.71283 10.925 8.891 10.8532 9.0345 10.7095C9.17817 10.566 9.25 10.3878 9.25 10.175V7.6H11.075C11.2878 7.6 11.466 7.52817 11.6095 7.3845C11.7532 7.241 11.825 7.06283 11.825 6.85V4.25H13.5C13.7128 4.25 13.891 4.17817 14.0345 4.0345C14.1782 3.891 14.25 3.71283 14.25 3.5C14.25 3.28717 14.1782 3.109 14.0345 2.9655C13.891 2.82183 13.7128 2.75 13.5 2.75H11.075C10.8622 2.75 10.684 2.82183 10.5405 2.9655C10.3968 3.109 10.325 3.28717 10.325 3.5V6.075H8.5C8.28717 6.075 8.109 6.14683 7.9655 6.2905C7.82183 6.434 7.75 6.61217 7.75 6.825V9.4H5.925C5.71217 9.4 5.534 9.47183 5.3905 9.6155C5.24683 9.759 5.175 9.93717 5.175 10.15V12.75H3.5C3.28717 12.75 3.109 12.8218 2.9655 12.9655C2.82183 13.109 2.75 13.2872 2.75 13.5C2.75 13.7128 2.82183 13.891 2.9655 14.0345C3.109 14.1782 3.28717 14.25 3.5 14.25H5.925C6.13783 14.25 6.316 14.1782 6.4595 14.0345C6.60317 13.891 6.675 13.7128 6.675 13.5V10.925ZM1.80775 17C1.30258 17 0.875 16.825 0.525 16.475C0.175 16.125 0 15.6974 0 15.1923V1.80775C0 1.30258 0.175 0.875 0.525 0.525C0.875 0.175 1.30258 0 1.80775 0H15.1923C15.6974 0 16.125 0.175 16.475 0.525C16.825 0.875 17 1.30258 17 1.80775V15.1923C17 15.6974 16.825 16.125 16.475 16.475C16.125 16.825 15.6974 17 15.1923 17H1.80775ZM1.80775 15.5H15.1923C15.2692 15.5 15.3398 15.4679 15.4038 15.4038C15.4679 15.3398 15.5 15.2692 15.5 15.1923V1.80775C15.5 1.73075 15.4679 1.66025 15.4038 1.59625C15.3398 1.53208 15.2692 1.5 15.1923 1.5H1.80775C1.73075 1.5 1.66025 1.53208 1.59625 1.59625C1.53208 1.66025 1.5 1.73075 1.5 1.80775V15.1923C1.5 15.2692 1.53208 15.3398 1.59625 15.4038C1.66025 15.4679 1.73075 15.5 1.80775 15.5Z" fill="#2A455E" />
            </svg>
          </div>
          <div className="tiered-example-header-text">
            <h4>EXAMPLE</h4>
            <button type="button" className="tiered-example-link">Stair – Step Pricing</button>
          </div>
        </div>

        <table className="tiered-example-table">
          <tbody>
            <tr>
              <td className="tier-label">Stair 1</td>
              <td className="tier-range"><strong>1 – 200</strong></td>
              <td className="tier-price">$20</td>
            </tr>
            <tr>
              <td className="tier-label">Stair 2</td>
              <td className="tier-range"><strong>201 – 500</strong></td>
              <td className="tier-price">$30</td>
            </tr>
            <tr>
              <td className="tier-label">Stair 3</td>
              <td className="tier-range"><strong>501 – 700</strong></td>
              <td className="tier-price">$40</td>
            </tr>
          </tbody>
        </table>

        <p className="tiered-consumer-note">
          <span className="tiered-note-title">You to consumer:</span><br />
          <span className="tiered-note-text">"You've used 300 units this billing cycle, placing you in Stair 2. Your total charge will be $30."</span>
        </p>
      </div>
    </div>
  );
};

export default EditStair;
