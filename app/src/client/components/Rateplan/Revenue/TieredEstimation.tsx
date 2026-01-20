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

  // ✅ FIXED: Apply minimum usage commitment - use higher of actual or minimum
  let effectiveUsage = incCommit && minimumUsage > 0 ? Math.max(usageNum, minimumUsage) : usageNum;
  
  // ✅ FIXED: Apply freemium - reduce billable units before calculating tiers
  const freemiumApplied = incFree && freemiumUnits > 0 ? Math.min(freemiumUnits, effectiveUsage) : 0;
  const billableUsage = effectiveUsage - freemiumApplied;

  // ✅ FIXED: Calculate tiered charge - progressively charge units in each tier
  function computeTieredCharge(units: number): { charge: number; rows: { tier: Tier; units: number; amount: number }[] } {
    let total = 0;
    const rows: { tier: Tier; units: number; amount: number }[] = [];
    let processedUnits = 0;
    
    for (const tier of tiers) {
      if (processedUnits >= units) break; // Already processed all units
      
      const tierEnd = tier.usageEnd === null ? Infinity : tier.usageEnd;
      
      // Calculate how many units to charge in this tier
      const unitsInTier = Math.max(0, Math.min(tierEnd, units) - processedUnits);
      
      if (unitsInTier > 0) {
        const amt = unitsInTier * tier.pricePerUnit;
        rows.push({ tier, units: unitsInTier, amount: amt });
        total += amt;
        processedUnits += unitsInTier;
      }
    }
    return { charge: total, rows };
  }

  const { charge: tieredCharge, rows: tierRows } = computeTieredCharge(billableUsage);

  // overage if billable usage exceeds last tier and unlimited false
  const lastTierEnd = tiers.length ? tiers[tiers.length - 1].usageEnd : null;
  const isOver = lastTierEnd !== null && billableUsage > lastTierEnd;
  const overUnits = isOver ? billableUsage - (lastTierEnd ?? 0) : 0;
  const overCharge = overUnits * overageRate;

  const setupCharge = incSetup ? setupFee : 0;

  let subtotal = tieredCharge + overCharge + setupCharge;
  const discountVal = incDiscount
    ? discountPercent > 0
      ? (discountPercent / 100) * subtotal
      : discountFlat
    : 0;
  let total = subtotal - discountVal;
  // Also apply minimum charge if set (fallback)
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
              step="any"
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
                  <td>${t.pricePerUnit}/unit</td>
                  {showCalc && (
                    <>
                      <td>{unitsRow ? `${unitsRow.units.toFixed(0)} × $${t.pricePerUnit}` : '-'}</td>
                      <td>{unitsRow ? `$${unitsRow.amount.toFixed(2)}` : '-'}</td>
                    </>
                  )}
                </tr>
              );
            })}
            <tr>
              <td>Overage Rate</td>
              <td>${overageRate}/unit</td>
              {showCalc && (
                <>
                  <td>{isOver ? `${overUnits.toFixed(0)} × $${overageRate}` : '-'}</td>
                  <td>{isOver ? `$${overCharge.toFixed(2)}` : '-'}</td>
                </>
              )}
            </tr>
            {/* Setup Fee */}
            <tr>
              <td><label className="switch"><input type="checkbox" checked={incSetup} onChange={e => setIncSetup(e.target.checked)} /><span className="slider"></span></label>&nbsp;Setup Fee</td>
              <td>{setupFee > 0 ? `$${setupFee}` : '-'}</td>
              {showCalc && <><td>{incSetup ? `$${setupFee}` : '-'}</td><td>{incSetup ? `$${setupFee.toFixed(2)}` : '-'}</td></>}
            </tr>
            {/* Discounts */}
            <tr>
              <td><label className="switch"><input type="checkbox" checked={incDiscount} onChange={e => setIncDiscount(e.target.checked)} /><span className="slider"></span></label>&nbsp;Discounts</td>
              <td>{discountPercent > 0 ? `${discountPercent}%` : discountFlat > 0 ? `$${discountFlat}` : '-'}</td>
              {showCalc && (
                <>
                  <td>{incDiscount ? (discountPercent > 0 ? `${discountPercent}% of $${subtotal.toFixed(2)}` : `$${discountFlat}`) : '-'}</td>
                  <td>{incDiscount ? `-$${discountVal.toFixed(2)}` : '-'}</td>
                </>
              )}
            </tr>
            {/* Freemium */}
            <tr>
              <td><label className="switch"><input type="checkbox" checked={incFree} onChange={e => setIncFree(e.target.checked)} /><span className="slider"></span></label>&nbsp;Freemium</td>
              <td>Free Units - {freemiumUnits}</td>
              {showCalc && <><td>{incFree && freemiumApplied > 0 ? `Reduced usage: ${effectiveUsage} - ${freemiumApplied} = ${billableUsage}` : '-'}</td><td>{incFree && freemiumApplied > 0 ? `Applied to tiers` : '-'}</td></>}
            </tr>
            {/* Minimum Commitment */}
            <tr>
              <td><label className="switch"><input type="checkbox" checked={incCommit} onChange={e => setIncCommit(e.target.checked)} /><span className="slider"></span></label>&nbsp;Minimum Commitment</td>
              <td>{minimumCharge > 0 ? `${minimumUsage} units / $${minimumCharge}` : (minimumUsage > 0 ? `${minimumUsage} units` : '-')}</td>
              {showCalc && <><td>{incCommit ? (minimumUsage > 0 && usageNum < minimumUsage ? `Using ${minimumUsage} units (minimum)` : minimumCharge > 0 ? `Max($${(subtotal - discountVal).toFixed(2)}, $${minimumCharge})` : '-') : '-'}</td><td>{incCommit ? `$${total.toFixed(2)}` : '-'}</td></>}
            </tr>
            {showCalc && (<tr className="total-row"><td colSpan={3}>Total Estimation</td><td>${total.toFixed(2)}</td></tr>)}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TieredEstimation;
