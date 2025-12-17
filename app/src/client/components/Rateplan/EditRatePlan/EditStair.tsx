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
                type="text"
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
                type="text"
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
    </div>
  );
};

export default EditStair;
