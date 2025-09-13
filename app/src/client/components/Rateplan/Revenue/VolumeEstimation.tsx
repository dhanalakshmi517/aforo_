import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EstimateRevenue.css';
import { getRatePlanData } from '../utils/sessionStorage';

interface Tier {
  usageStart: number;
  usageEnd: number | null; // null means unlimited
  pricePerUnit: number;
}

function parseVolumeTiers(): Tier[] {
  try {
    const arr = JSON.parse(getRatePlanData('VOLUME_TIERS') || '[]');
    return Array.isArray(arr)
      ? arr.map((t: any) => ({
          usageStart: Number(t.usageStart || 0),
          usageEnd: t.usageEnd === null ? null : Number(t.usageEnd || 0),
          pricePerUnit: Number(t.price || t.flatCost || 0),
        }))
      : [];
  } catch {
    return [];
  }
}

const VolumeEstimation: React.FC = () => {
  const navigate = useNavigate();
  const [usage, setUsage] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  // saved pricing
  const tiers = parseVolumeTiers();
  const overageRate = Number(getRatePlanData('VOLUME_OVERAGE') || 0);
  const graceBuffer = Number(getRatePlanData('VOLUME_GRACE') || 0);

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

  // select tier where total usage falls
  const matchedTier = tiers.find(
    (t) => usageNum >= t.usageStart && (t.usageEnd === null || usageNum <= t.usageEnd)
  );
  const tierRate = matchedTier ? matchedTier.pricePerUnit : overageRate; // fallback

  const tierCharge = usageNum * tierRate;
  const freemiumReduction = incFree ? freemiumUnits * tierRate : 0;
  const setupCharge = incSetup ? setupFee : 0;

  let subtotal = tierCharge + setupCharge - freemiumReduction;

  // overage: if usage exceeds last tier and unlimited is false
  const lastTierEnd = tiers.length ? tiers[tiers.length - 1].usageEnd : null;
  const isOver = lastTierEnd !== null && usageNum > lastTierEnd;
  const overUnits = isOver ? usageNum - (lastTierEnd ?? 0) : 0;
  const overCharge = overUnits * overageRate;
  subtotal += overCharge;

  const discountVal = incDiscount
    ? discountPercent > 0
      ? (discountPercent / 100) * subtotal
      : discountFlat
    : 0;
  let total = subtotal - discountVal;
  if (incCommit && minimumCharge > 0) total = Math.max(total, minimumCharge);

  const handleCalc = () => {
    setIsCalculating(true);
    setShowCalc(false);
    setTimeout(() => {
      setIsCalculating(false);
      setShowCalc(true);
    }, 1200);
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => { navigate('/get-started/rate-plans'); }}>
        ← Back
      </div>
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
          <button onClick={handleCalc} disabled={isCalculating}>
            {isCalculating ? <span className="loader"></span> : 'Calculate Revenue'}
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
              <td>Volume-Based</td>
              {showCalc && <><td>-</td><td>-</td></>}
            </tr>
            {tiers.map((t, i) => (
              <tr key={i}>
                <td>
                  Tier {i + 1}<br />
                  <small>
                    {t.usageStart} – {t.usageEnd === null ? '∞' : t.usageEnd}
                  </small>
                </td>
                <td>${t.pricePerUnit}</td>
                {showCalc && (
                  <>
                    <td>{matchedTier === t ? `${usageNum} * ${t.pricePerUnit}` : '-'}</td>
                    <td>{matchedTier === t ? `$${tierCharge.toFixed(2)}` : '-'}</td>
                  </>
                )}
              </tr>
            ))}
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
            <tr>
              <td>
                <label className="switch"><input type="checkbox" checked={incSetup} onChange={(e)=>setIncSetup(e.target.checked)} /><span className="slider"></span></label>&nbsp;Setup Fee
              </td>
              <td>{setupFee>0?`$${setupFee}`:'-'}</td>
              {showCalc && <><td>{incSetup?`$${setupFee}`:'-'}</td><td>{incSetup?`$${setupFee}`:'-'}</td></>}
            </tr>
            <tr>
              <td>
                <label className="switch"><input type="checkbox" checked={incDiscount} onChange={(e)=>setIncDiscount(e.target.checked)} /><span className="slider"></span></label>&nbsp;Discounts
              </td>
              <td>{discountPercent>0?`${discountPercent}%`:discountFlat>0?`$${discountFlat}`:'-'}</td>
              {showCalc && (
                <>
                  <td>{incDiscount?(discountPercent>0?`${discountPercent}% of $${subtotal.toFixed(2)}`:`$${discountFlat}`):'-'}</td>
                  <td>{incDiscount?`-$${discountVal.toFixed(2)}`:'-'}</td>
                </>
              )}
            </tr>
            <tr>
              <td>
                <label className="switch"><input type="checkbox" checked={incFree} onChange={(e)=>setIncFree(e.target.checked)} /><span className="slider"></span></label>&nbsp;Freemium
              </td>
              <td>{freemiumUnits}</td>
              {showCalc && <><td>{incFree?`${freemiumUnits} * ${tierRate}`:'-'}</td><td>{incFree?`-$${freemiumReduction.toFixed(2)}`:'-'}</td></>}
            </tr>
            <tr>
              <td>
                <label className="switch"><input type="checkbox" checked={incCommit} onChange={(e)=>setIncCommit(e.target.checked)} /><span className="slider"></span></label>&nbsp;Minimum Commitment
              </td>
              <td>{minimumCharge>0?`${minimumUsage} units / $${minimumCharge}`:'-'}</td>
              {showCalc && <><td>{incCommit?`Floor to $${minimumCharge}`:'-'}</td><td>{incCommit?`$${Math.max(total,minimumCharge).toFixed(2)}`:'-'}</td></>}
            </tr>
            {showCalc && (
              <tr className="total-row"><td colSpan={3}>Total</td><td>${total.toFixed(2)}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default VolumeEstimation;
