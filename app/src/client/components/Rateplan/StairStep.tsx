import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { saveStairStepPricing } from './api';
import { setRatePlanData, getRatePlanData } from './utils/sessionStorage';
import './StairStep.css';

export interface Stair { from: string; to: string; cost: string; isUnlimited?: boolean; }
export interface StairStepHandle { save: (ratePlanId: number) => Promise<void>; }

type RowError = { from?: string; to?: string; cost?: string };
type RowTouched = { from: boolean; to: boolean; cost: boolean };

interface StairStepProps {
  validationErrors?: Record<string, string>;

  /** controlled props from parent */
  stairs?: Stair[];
  overageCharge?: string | number;
  graceBuffer?: string | number;

  /** bubble up changes so parent state stays in sync */
  onStairsChange?: (stairs: Stair[]) => void;
  onOverageChange?: (val: string) => void;
  onGraceBufferChange?: (val: string) => void;
  locked?: boolean;
}

const StairStep = forwardRef<StairStepHandle, StairStepProps>(
  ({ validationErrors = {}, stairs: externalStairs, overageCharge: overageFromParent, graceBuffer: graceFromParent, onStairsChange, onOverageChange, onGraceBufferChange, locked = false }, ref) => {
    // hydrate from parent only once to prevent clobbering user edits on re-renders
    const hydrated = useRef(false);

    const [stairs, setStairs] = useState<Stair[]>(
      externalStairs && externalStairs.length ? externalStairs : [{ from: '', to: '', cost: '' }]
    );
    const [touched, setTouched] = useState<RowTouched[]>([{ from: false, to: false, cost: false }]);
    const [rowErrors, setRowErrors] = useState<RowError[]>([{}]);

    const [unlimited, setUnlimited] = useState(!!(externalStairs?.[externalStairs.length - 1]?.isUnlimited));
    const [overageCharge, setOverageCharge] = useState<string>(overageFromParent != null ? String(overageFromParent) : '');
    const [overageTouched, setOverageTouched] = useState(false);
    const [graceBuffer, setGraceBuffer] = useState<string>(graceFromParent != null ? String(graceFromParent) : '');

    const [mustHaveOneError, setMustHaveOneError] = useState<string | null>(null);
    const [overageError, setOverageError] = useState<string | null>(null);

    // Sync incoming stairs (always keep at least one row)
    useEffect(() => {
      if (externalStairs && externalStairs.length > 0) {
        // Only hydrate if we haven't hydrated yet, OR if current stairs are empty/default
        const currentIsEmpty = stairs.length === 1 && stairs[0].from === '' && stairs[0].to === '' && stairs[0].cost === '';

        if (!hydrated.current || currentIsEmpty) {
          console.log('🔧 StairStep: Hydrating from external stairs:', externalStairs);
          hydrated.current = true;
          setStairs(externalStairs);
          const last = externalStairs[externalStairs.length - 1];
          setUnlimited(!!last?.isUnlimited);
        }
      }
    }, [externalStairs]);

    // Hydrate unlimited from session storage (like Tiered component)
    useEffect(() => {
      const saved = getRatePlanData('STAIR_NO_UPPER_LIMIT');
      console.log('🔧 StairStep: Session storage STAIR_NO_UPPER_LIMIT:', saved);
      if (saved != null) {
        const flag = saved === 'true';
        console.log('🔧 StairStep: Restoring unlimited state from session:', flag);
        setUnlimited(flag);

        // Also update the last stair's isUnlimited property
        setStairs(prevStairs => {
          console.log('🔧 StairStep: Current stairs before update:', prevStairs);
          if (prevStairs.length > 0) {
            const updated = [...prevStairs];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = { ...updated[lastIndex], isUnlimited: flag };
            if (flag) {
              updated[lastIndex].to = '';
            }
            console.log('🔧 StairStep: Updated stairs with unlimited state:', updated);
            return updated;
          }
          return prevStairs;
        });
      } else {
        console.log('🔧 StairStep: No session storage unlimited state found');
      }
    }, []);

    useEffect(() => {
      if (overageFromParent !== undefined && overageFromParent !== null) {
        console.log('🔧 StairStep: Updating overage charge from prop:', overageFromParent);
        setOverageCharge(String(overageFromParent));
      }
    }, [overageFromParent]);

    useEffect(() => {
      if (graceFromParent !== undefined && graceFromParent !== null) {
        console.log('🔧 StairStep: Updating grace buffer from prop:', graceFromParent);
        setGraceBuffer(String(graceFromParent));
      }
    }, [graceFromParent]);

    // persist to session storage for validation outside
    useEffect(() => { setRatePlanData('STAIR_TIERS', JSON.stringify(stairs)); }, [stairs]);
    useEffect(() => { setRatePlanData('STAIR_OVERAGE', overageCharge); }, [overageCharge]);
    useEffect(() => { setRatePlanData('STAIR_GRACE', graceBuffer); }, [graceBuffer]);
    useEffect(() => { setRatePlanData('STAIR_NO_UPPER_LIMIT', unlimited ? 'true' : 'false'); }, [unlimited]);

    const ensureArrays = (len: number) => {
      setTouched(prev => { const n = [...prev]; while (n.length < len) n.push({ from: false, to: false, cost: false }); return n.slice(0, len); });
      setRowErrors(prev => { const n = [...prev]; while (n.length < len) n.push({}); return n.slice(0, len); });
    };

    const markTouched = (i: number, f: keyof RowTouched) =>
      setTouched(ts => { const n = [...ts]; if (!n[i]) n[i] = { from: false, to: false, cost: false }; n[i][f] = true; return n; });

    const isNonNegInt = (s: string) => /^\d+$/.test(s);
    const isPositiveNum = (s: string) => { const n = Number(s); return !Number.isNaN(n) && n > 0; };

    const validateRow = (r: Stair): RowError => {
      const e: RowError = {};
      if ((r.from ?? '').trim() === '') e.from = 'This is a required field';
      else if (!isNonNegInt(r.from!)) e.from = 'Enter a valid value';
      if (!r.isUnlimited) {
        if ((r.to ?? '').trim() === '') e.to = 'This is a required field';
        else if (!isNonNegInt(r.to!)) e.to = 'Enter a valid value';
        if (!e.from && !e.to && Number(r.to) < Number(r.from)) e.to = 'Must be ≥ From';
      }
      if ((r.cost ?? '').trim() === '') e.cost = 'This is a required field';
      else if (!isPositiveNum(r.cost!)) e.cost = 'Enter a valid value';
      return e;
    };

    const validateOverage = (value: string): string | null => {
      if (value.trim() === '') return 'This is a required field';
      if (!isPositiveNum(value)) return 'Enter a valid value';
      return null;
    };

    useEffect(() => {
      ensureArrays(stairs.length);
      setRowErrors(stairs.map(validateRow));
      setMustHaveOneError(stairs.length === 0 ? 'At least one stair is required' : null);

      if (!unlimited) {
        setOverageError(validateOverage(overageCharge));
      } else setOverageError(null);
    }, [stairs, unlimited, overageCharge]);

    const pushChangeUp = (nextStairs: Stair[]) => {
      onStairsChange?.(nextStairs);
    };
    const pushOverageUp = (val: string) => {
      onOverageChange?.(val);
    };
    const pushGraceUp = (val: string) => {
      onGraceBufferChange?.(val);
    };

    const addStair = (e?: React.MouseEvent) => {
      e?.preventDefault();

      // When adding a new stair, uncheck unlimited since user wants more stairs
      setUnlimited(false);
      setRatePlanData('STAIR_NO_UPPER_LIMIT', 'false');

      // Clear unlimited from current last stair if it was unlimited
      const updated = [...stairs];
      if (updated.length > 0 && updated[updated.length - 1].isUnlimited) {
        updated[updated.length - 1].isUnlimited = false;
      }

      // Add new stair with unlimited = false
      const next = [...updated, { from: '', to: '', cost: '', isUnlimited: false }];
      setStairs(next);
      pushChangeUp(next);
    };

    const deleteStair = (index: number) => {
      const next = stairs.filter((_, i) => i !== index);
      const safe = next.length === 0 ? [{ from: '', to: '', cost: '', isUnlimited: false }] : next;
      setStairs(safe);
      setTouched(prev => {
        const n = prev.filter((_, i) => i !== index);
        return n.length === 0 ? [{ from: false, to: false, cost: false }] : n;
      });
      pushChangeUp(safe);
    };

    const change = (i: number, field: keyof Stair, val: string) => {
      if (field === 'to' && stairs[i].isUnlimited) return;
      const n = [...stairs]; (n[i] as any)[field] = val; setStairs(n);
      pushChangeUp(n);
    };

    const toggleUnlimited = (checked: boolean, index: number) => {
      // Set unlimited state first to avoid race conditions
      setUnlimited(checked);
      setRatePlanData('STAIR_NO_UPPER_LIMIT', checked ? 'true' : 'false');

      // Then update stairs with the correct isUnlimited property
      const n = [...stairs];
      n[index].isUnlimited = checked;
      if (checked) {
        n[index].to = '';
      }
      setStairs(n);
      pushChangeUp(n);
    };

    const last = stairs.length - 1;

    useImperativeHandle(ref, () => ({
      save: async (ratePlanId: number) => {
        const payload = {
          tiers: stairs.map(stair => ({
            usageStart: Number(stair.from) || 0,
            usageEnd: stair.isUnlimited ? null : (Number(stair.to) || 0),
            flatCost: Number(stair.cost) || 0,
          })),
          overageUnitRate: Number(overageCharge) || 0,
          graceBuffer: Number(graceBuffer) || 0,
        };
        await saveStairStepPricing(ratePlanId, payload);
      },
    }));

    return (
      <div className="stair-container">
        <div className="stair-input-section">
          {mustHaveOneError && <div className="error-banner">{mustHaveOneError}</div>}

          <div className="stair-header-row">
            <div className="usage-range-label">Usage Range</div>
            <div className="cost-label">Flat–Stair Cost</div>
          </div>

          {stairs.map((row, i) => {
            const e = rowErrors[i] || {};
            const t = touched[i] || { from: false, to: false, cost: false };
            return (
              <div className="stair-row" key={i}>
                <div className="field-col">
                  <input
                    className={`input-small ${t.from && e.from ? 'error-input' : ''}`}
                    value={row.from}
                    onChange={(ev) => change(i, 'from', ev.target.value)}
                    onBlur={() => markTouched(i, 'from')}
                    placeholder="From"
                    disabled={locked}
                  />
                  {t.from && e.from && <span className="error-text">{e.from}</span>}
                </div>

                <span className="dash">-</span>

                <div className="field-col">
                  <input
                    className={`input-small ${t.to && e.to ? 'error-input' : ''}`}
                    value={row.isUnlimited ? 'Unlimited' : row.to}
                    placeholder="To"
                    disabled={row.isUnlimited || locked}
                    onChange={(ev) => change(i, 'to', ev.target.value)}
                    onBlur={() => markTouched(i, 'to')}
                  />
                  {!row.isUnlimited && t.to && e.to && <span className="error-text">{e.to}</span>}
                </div>

                <div className="field-col">
                  <input
                    className={`input-large ${t.cost && e.cost ? 'error-input' : ''}`}
                    value={row.cost}
                    onChange={(ev) => change(i, 'cost', ev.target.value)}
                    onBlur={() => markTouched(i, 'cost')}
                    placeholder="Cost"
                    disabled={locked}
                  />
                  {t.cost && e.cost && <span className="error-text">{e.cost}</span>}
                </div>

                <button className="delete-btn" onClick={() => deleteStair(i)} aria-label="Delete stair" disabled={locked}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            );
          })}

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={unlimited}
              onChange={(e) => toggleUnlimited(e.target.checked, last)}
              disabled={locked}
            />
            <svg className="checkbox-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12Z" stroke="#E6E5E6" strokeWidth="1.2" />
              <path className="tick" d="M8 12.5L10.5 15L16 9.5" stroke="#4C7EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>No upper limit for this Stair</span>
          </label>

          {!unlimited && (
            <div className="extra-fields">
              <label className="extra-label">
                Overage Charge
                <input
                  type="text"
                  className={`input-extra ${overageTouched && overageError ? 'error-input' : ''}`}
                  value={overageCharge}
                  onChange={(e) => { setOverageCharge(e.target.value); pushOverageUp(e.target.value); }}
                  onBlur={() => setOverageTouched(true)}
                  placeholder="Enter overage charge"
                  disabled={locked}
                />
                {overageTouched && overageError && <span className="error-text">{overageError}</span>}
                {validationErrors.stairOverage && (
                  <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
                      <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {validationErrors.stairOverage}
                  </div>
                )}
              </label>

              <label className="extra-label">
                Grace Buffer (optional)
                <input
                  type="text"
                  className="input-extra"
                  value={graceBuffer}
                  onChange={(e) => { setGraceBuffer(e.target.value); pushGraceUp(e.target.value); }}
                  placeholder="Enter grace buffer"
                  disabled={locked}
                />
              </label>
            </div>
          )}

          <button className="add-stair-btn" onClick={addStair} disabled={locked}>+ Add Stair</button>

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
  <path d="M6.675 10.925H8.5C8.71283 10.925 8.891 10.8532 9.0345 10.7095C9.17817 10.566 9.25 10.3878 9.25 10.175V7.6H11.075C11.2878 7.6 11.466 7.52817 11.6095 7.3845C11.7532 7.241 11.825 7.06283 11.825 6.85V4.25H13.5C13.7128 4.25 13.891 4.17817 14.0345 4.0345C14.1782 3.891 14.25 3.71283 14.25 3.5C14.25 3.28717 14.1782 3.109 14.0345 2.9655C13.891 2.82183 13.7128 2.75 13.5 2.75H11.075C10.8622 2.75 10.684 2.82183 10.5405 2.9655C10.3968 3.109 10.325 3.28717 10.325 3.5V6.075H8.5C8.28717 6.075 8.109 6.14683 7.9655 6.2905C7.82183 6.434 7.75 6.61217 7.75 6.825V9.4H5.925C5.71217 9.4 5.534 9.47183 5.3905 9.6155C5.24683 9.759 5.175 9.93717 5.175 10.15V12.75H3.5C3.28717 12.75 3.109 12.8218 2.9655 12.9655C2.82183 13.109 2.75 13.2872 2.75 13.5C2.75 13.7128 2.82183 13.891 2.9655 14.0345C3.109 14.1782 3.28717 14.25 3.5 14.25H5.925C6.13783 14.25 6.316 14.1782 6.4595 14.0345C6.60317 13.891 6.675 13.7128 6.675 13.5V10.925ZM1.80775 17C1.30258 17 0.875 16.825 0.525 16.475C0.175 16.125 0 15.6974 0 15.1923V1.80775C0 1.30258 0.175 0.875 0.525 0.525C0.875 0.175 1.30258 0 1.80775 0H15.1923C15.6974 0 16.125 0.175 16.475 0.525C16.825 0.875 17 1.30258 17 1.80775V15.1923C17 15.6974 16.825 16.125 16.475 16.475C16.125 16.825 15.6974 17 15.1923 17H1.80775ZM1.80775 15.5H15.1923C15.2692 15.5 15.3398 15.4679 15.4038 15.4038C15.4679 15.3398 15.5 15.2692 15.5 15.1923V1.80775C15.5 1.73075 15.4679 1.66025 15.4038 1.59625C15.3398 1.53208 15.2692 1.5 15.1923 1.5H1.80775C1.73075 1.5 1.66025 1.53208 1.59625 1.59625C1.53208 1.66025 1.5 1.73075 1.5 1.80775V15.1923C1.5 15.2692 1.53208 15.3398 1.59625 15.4038C1.66025 15.4679 1.73075 15.5 1.80775 15.5Z" fill="#2A455E"/>
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
            <span className="tiered-note-text">"You’ve used 300 units this billing cycle, placing you in Stair 2. Your total charge will be $30."</span>
          </p>
        </div>
      </div>
    );
  });

export default StairStep;
