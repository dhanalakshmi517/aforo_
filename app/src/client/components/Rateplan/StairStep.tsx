import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { saveStairStepPricing } from './api';
import { getRatePlanData, setRatePlanData } from './utils/sessionStorage';
import './StairStep.css';

export interface StairStepHandle { save: (ratePlanId: number) => Promise<void>; }

interface StairStepProps {
  validationErrors?: Record<string, string>;
}

interface Stair { from: string; to: string; cost: string; isUnlimited?: boolean; }
type RowError = { from?: string; to?: string; cost?: string };
type RowTouched = { from: boolean; to: boolean; cost: boolean };

const StairStep = forwardRef<StairStepHandle, StairStepProps>(({ validationErrors = {} }, ref) => {
  const [stairs, setStairs] = useState<Stair[]>([{ from: '', to: '', cost: '' }]);
  const [touched, setTouched] = useState<RowTouched[]>([{ from:false, to:false, cost:false }]);
  const [rowErrors, setRowErrors] = useState<RowError[]>([{}]);

  const [unlimited, setUnlimited] = useState(false);
  const [overageCharge, setOverageCharge] = useState('');
  const [overageTouched, setOverageTouched] = useState(false);
  const [graceBuffer, setGraceBuffer] = useState('');

  const [mustHaveOneError, setMustHaveOneError] = useState<string | null>(null);
  const [overageError, setOverageError] = useState<string | null>(null);

  useEffect(() => { setRatePlanData('STAIR_TIERS', JSON.stringify(stairs)); }, [stairs]);
  useEffect(() => { setRatePlanData('STAIR_OVERAGE', overageCharge); }, [overageCharge]);
  useEffect(() => { setRatePlanData('STAIR_GRACE', graceBuffer); }, [graceBuffer]);

  const ensureArrays = (len:number) => {
    setTouched(prev => { const n=[...prev]; while(n.length<len) n.push({from:false,to:false,cost:false}); return n.slice(0,len);});
    setRowErrors(prev => { const n=[...prev]; while(n.length<len) n.push({}); return n.slice(0,len);});
  };

  const markTouched = (i:number, f:keyof RowTouched) =>
    setTouched(ts => { const n=[...ts]; if(!n[i]) n[i]={from:false,to:false,cost:false}; n[i][f]=true; return n; });

  const isNonNegInt = (s:string)=>/^\d+$/.test(s);
  const isPositiveNum = (s:string)=>{ const n=Number(s); return !Number.isNaN(n) && n>0; };

  const validateRow = (r:Stair): RowError => {
    const e: RowError = {};
    if (r.from.trim()==='') e.from='This is a required field';
    else if(!isNonNegInt(r.from)) e.from='Enter a valid value';
    if (!r.isUnlimited){
      if (r.to.trim()==='') e.to='This is a required field';
      else if(!isNonNegInt(r.to)) e.to='Enter a valid value';
      if(!e.from && !e.to && Number(r.to)<Number(r.from)) e.to='Must be ≥ From';
    }
    if (r.cost.trim()==='') e.cost='This is a required field';
    else if(!isPositiveNum(r.cost)) e.cost='Enter a valid value';
    return e;
  };

  const validateOverage = (value: string): string | null => {
    if (value.trim() === '') return 'This is a required field';
    if (!isPositiveNum(value)) return 'Enter a valid value';
    return null;
  };

  const validateGrace = (value: string): string | null => {
    // Grace buffer is optional
    if (value.trim() !== '' && !isNonNegInt(value)) {
      return 'Enter a valid value';
    }
    return null;
  };

  useEffect(() => {
    ensureArrays(stairs.length);
    setRowErrors(stairs.map(validateRow));
    setMustHaveOneError(stairs.length===0 ? 'At least one stair is required' : null);

    if (!unlimited){
      setOverageError(validateOverage(overageCharge));
    } else setOverageError(null);
  }, [stairs, unlimited, overageCharge]);

  const addStair = () => setStairs(prev => [...prev, { from:'', to:'', cost:'' }]);

  const deleteStair = (index:number) => {
    setStairs(prev => {
      const n = prev.filter((_,i)=>i!==index);
      return n.length===0 ? [{from:'',to:'',cost:''}] : n;
    });
    setTouched(prev => {
      const n = prev.filter((_,i)=>i!==index);
      return n.length===0 ? [{from:false,to:false,cost:false}] : n;
    });
  };

  const change = (i:number, field:keyof Stair, val:string) => {
    if (field==='to' && stairs[i].isUnlimited) return;
    const n=[...stairs]; (n[i] as any)[field]=val; setStairs(n);
  };

  const toggleUnlimited = (checked:boolean, index:number) => {
    const n=[...stairs]; n[index].isUnlimited=checked; if(checked) n[index].to=''; setStairs(n); setUnlimited(checked);
  };

  const last = stairs.length-1;

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
          const t = touched[i] || {from:false,to:false,cost:false};
          return (
            <div className="stair-row" key={i}>
              <div className="field-col">
                <input
                  className={`input-small ${t.from && e.from ? 'error-input' : ''}`}
                  value={row.from}
                  onChange={(ev)=>change(i,'from',ev.target.value)}
                  onBlur={()=>markTouched(i,'from')}
                  placeholder="From"
                />
                {t.from && e.from && <span className="error-text">{e.from}</span>}
              </div>

              <span className="dash">-</span>

              <div className="field-col">
                <input
                  className={`input-small ${t.to && e.to ? 'error-input' : ''}`}
                  value={row.isUnlimited ? 'Unlimited' : row.to}
                  placeholder="To"
                  disabled={row.isUnlimited}
                  onChange={(ev)=>change(i,'to',ev.target.value)}
                  onBlur={()=>markTouched(i,'to')}
                />
                {!row.isUnlimited && t.to && e.to && <span className="error-text">{e.to}</span>}
              </div>

              <div className="field-col">
                <input
                  className={`input-large ${t.cost && e.cost ? 'error-input' : ''}`}
                  value={row.cost}
                  onChange={(ev)=>change(i,'cost',ev.target.value)}
                  onBlur={()=>markTouched(i,'cost')}
                  placeholder="Cost"
                />
                {t.cost && e.cost && <span className="error-text">{e.cost}</span>}
              </div>

              <button className="delete-btn" onClick={()=>deleteStair(i)} aria-label="Delete stair">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          );
        })}

        <label className="checkbox-label">
          <input type="checkbox" checked={unlimited} onChange={(e)=>toggleUnlimited(e.target.checked, last)} />
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
                onChange={(e)=>setOverageCharge(e.target.value)}
                onBlur={()=>setOverageTouched(true)}
                placeholder="Enter overage charge"
              />
              {overageTouched && overageError && <span className="error-text">{overageError}</span>}
              {validationErrors.stairOverage && (
                <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
                    <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
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
                onChange={(e)=>setGraceBuffer(e.target.value)}
                placeholder="Enter grace buffer"
              />
            </label>
          </div>
        )}

        <button className="add-stair-btn" onClick={addStair}>+ Add Stair</button>
        
        {/* Display validation errors from parent component */}
        {validationErrors.stairTiers && (
          <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '10px', color: '#ED5142', fontSize: '12px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
              <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {validationErrors.stairTiers}
          </div>
        )}
      </div>

      <div className="stair-example-section">
        <h4>EXAMPLE</h4>
        <a href="#">Stair – Step Pricing</a>
        <table>
          <tbody>
            <tr><td>Stair 1</td><td>1 – 200</td><td>$20</td></tr>
            <tr><td>Stair 2</td><td>201 – 500</td><td>$30</td></tr>
            <tr><td>Stair 3</td><td>501 – 700</td><td>$40</td></tr>
          </tbody>
        </table>
        <p className="consumer-note">
          <a href="#">You to consumer:</a><br />
          <em>“You’ve used 300 units this billing cycle, placing you in Stair 2. Your total charge will be $30.”</em>
        </p>
      </div>
    </div>
  );
});

export default StairStep;
