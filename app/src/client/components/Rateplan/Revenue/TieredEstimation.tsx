import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EstimateRevenue.css';
import { getRatePlanData } from '../utils/sessionStorage';

interface Tier {
  usageStart: number;
  usageEnd: number | null; // null represents unlimited
  pricePerUnit: number;
}

function parseTieredTiers(): Tier[] {
  try {
    const arr = JSON.parse(getRatePlanData('TIERED_TIERS') || '[]');
    return Array.isArray(arr)
      ? arr.map((t: any) => ({
          usageStart: Number(t.from || 0),
          usageEnd: t.to === '' || t.isUnlimited ? null : Number(t.to || 0),
          pricePerUnit: Number(t.price || 0),
        }))
      : [];
  } catch {
    return [];
  }
}

const TieredEstimation: React.FC = () => {
  const navigate = useNavigate();
  const [usage, setUsage] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  const tiers = parseTieredTiers();
  const overageRate = Number(getRatePlanData('TIERED_OVERAGE') || 0);
  const graceBuffer = Number(getRatePlanData('TIERED_GRACE') || 0);

  // extras
  const setupFee = Number(getRatePlanData('SETUP_FEE') || 0);
  const discountPercent = Number(getRatePlanData('DISCOUNT_PERCENT') || 0);
  const discountFlat = Number(getRatePlanData('DISCOUNT_FLAT') || 0);
  const freemiumUnits = Number(getRatePlanData('FREEMIUM_UNITS') || 0);
  const minimumUsage = Number(getRatePlanData('MINIMUM_USAGE') || 0);
  const minimumCharge = Number(getRatePlanData('MINIMUM_CHARGE') || 0);

  const [incSetup, setIncSetup] = useState(false);
  const [incDiscount, setIncDiscount] = useState(false);
  const [incFree, setIncFree] = useState(false);
  const [incCommit, setIncCommit] = useState(false);

  const usageNum = Number(usage) || 0;

  // calculate tiered charge
  function computeTieredCharge(units: number): { charge: number; rows: {tier: Tier; units: number; amount: number}[] } {
    let remaining = units;
    let total = 0;
    const rows: {tier: Tier; units: number; amount: number}[] = [];
    for (const tier of tiers) {
      if (remaining <= 0) break;
      const from = tier.usageStart;
      const to = tier.usageEnd === null ? Infinity : tier.usageEnd;
      if (units < from) continue; // not reached this tier
      const maxInTier = Math.min(to, units) - from + 1; // inclusive ranges assumed
      const applyUnits = Math.min(maxInTier, remaining);
      if (applyUnits > 0) {
        const amt = applyUnits * tier.pricePerUnit;
        rows.push({ tier, units: applyUnits, amount: amt });
        total += amt;
        remaining -= applyUnits;
      }
    }
    return { charge: total, rows };
  }

  const { charge: tieredCharge, rows: tierRows } = computeTieredCharge(usageNum);

  // overage if usage exceeds last tier and unlimited false
  const lastTierEnd = tiers.length ? tiers[tiers.length - 1].usageEnd : null;
  const isOver = lastTierEnd !== null && usageNum > lastTierEnd;
  const overUnits = isOver ? usageNum - (lastTierEnd ?? 0) : 0;
  const overCharge = overUnits * overageRate;

  const freemiumReduction = incFree ? freemiumUnits * (tiers[0]?.pricePerUnit || 0) : 0; // use first tier rate
  const setupCharge = incSetup ? setupFee : 0;

  let subtotal = tieredCharge + overCharge + setupCharge - freemiumReduction;
  const discountVal = incDiscount
    ? discountPercent > 0
      ? (discountPercent / 100) * subtotal
      : discountFlat
    : 0;
  let total = subtotal - discountVal;
  if (incCommit && minimumCharge > 0) total = Math.max(total, minimumCharge);

  const handleCalculate = () => {
    setCalculating(true);
    setShowCalc(false);
    setTimeout(() => {
      setCalculating(false);
      setShowCalc(true);
    }, 1200);
  };

  return (
    <>
      <h2 style={{ margin: 0 }}>Estimate revenue</h2>
      <div className="estimate-container">
        <div className="input-section">
          <div className="input-group">
            <label>Enter Estimated Usage</label>
            <input
              type="number"
              placeholder="Enter Estimated Usage"
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
            />
          </div>
          <button onClick={handleCalculate} disabled={calculating}>
            {calculating ? <span className="loader"></span> : 'Calculate Revenue'}
          </button>
        </div>
        <table className="estimate-table">
          <thead>
            <tr>
              <th>Pricing Model & Extras</th>
              <th>Saved Values</th>
              {showCalc && <th>Calc</th>}
              {showCalc && <th>Amount</th>}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Model Type</td>
              <td>Tiered Pricing</td>
              {showCalc && <><td>-</td><td>-</td></>}
            </tr>
            {tiers.map((t, idx) => {
              const unitsRow = tierRows.find(r => r.tier === t);
              return (
                <tr key={idx}>
                  <td>
                    Tier {idx + 1}<br />
                    <small>{t.usageStart} – {t.usageEnd === null ? '∞' : t.usageEnd}</small>
                  </td>
                  <td>${t.pricePerUnit}</td>
                  {showCalc && (
                    <>
                      <td>{unitsRow ? `${unitsRow.units} * ${t.pricePerUnit}` : '-'}</td>
                      <td>{unitsRow ? `$${unitsRow.amount.toFixed(2)}` : '-'}</td>
                    </>
                  )}
                </tr>
              );
            })}
            <tr>
              <td>Overage Rate</td>
              <td>{overageRate}</td>
              {showCalc && (
                <>
                  <td>{isOver ? `${overUnits} * ${overageRate}` : '-'}</td>
                  <td>{isOver ? `$${overCharge.toFixed(2)}` : '-'}</td>
                </>
              )}
            </tr>
            {/* Setup Fee */}
            <tr>
              <td><label className="switch"><input type="checkbox" checked={incSetup} onChange={e=>setIncSetup(e.target.checked)}/><span className="slider"></span></label>&nbsp;Setup Fee</td>
              <td>{setupFee>0?`$${setupFee}`:'-'}</td>
              {showCalc && <><td>{incSetup?`$${setupFee}`:'-'}</td><td>{incSetup?`$${setupFee.toFixed(2)}`:'-'}</td></>}
            </tr>
            {/* Discounts */}
            <tr>
              <td><label className="switch"><input type="checkbox" checked={incDiscount} onChange={e=>setIncDiscount(e.target.checked)}/><span className="slider"></span></label>&nbsp;Discounts</td>
              <td>{discountPercent>0?`${discountPercent}%`:discountFlat>0?`$${discountFlat}`:'-'}</td>
              {showCalc && (
                <>
                  <td>{incDiscount?(discountPercent>0?`${discountPercent}% of $${subtotal.toFixed(2)}`:`$${discountFlat}`):'-'}</td>
                  <td>{incDiscount?`-$${discountVal.toFixed(2)}`:'-'}</td>
                </>
              )}
            </tr>
            {/* Freemium */}
            <tr>
              <td><label className="switch"><input type="checkbox" checked={incFree} onChange={e=>setIncFree(e.target.checked)}/><span className="slider"></span></label>&nbsp;Freemium</td>
              <td>{freemiumUnits}</td>
              {showCalc && <><td>{incFree?`${freemiumUnits} * ${(tiers[0]?.pricePerUnit||0)}`:'-'}</td><td>{incFree?`-$${freemiumReduction.toFixed(2)}`:'-'}</td></>}
            </tr>
            {/* Minimum Commitment */}
            <tr>
              <td><label className="switch"><input type="checkbox" checked={incCommit} onChange={e=>setIncCommit(e.target.checked)}/><span className="slider"></span></label>&nbsp;Minimum Commitment</td>
              <td>{minimumCharge>0?`${minimumUsage} units / $${minimumCharge}`:'-'}</td>
              {showCalc && <><td>{incCommit?`Floor to $${minimumCharge}`:'-'}</td><td>{incCommit?`$${Math.max(total,minimumCharge).toFixed(2)}`:'-'}</td></>}
            </tr>
            {showCalc && (<tr className="total-row"><td colSpan={3}>Total</td><td>${total.toFixed(2)}</td></tr>)}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TieredEstimation;
