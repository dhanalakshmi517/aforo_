import React, { useState } from 'react';
import './EstimateRevenue.css';
import { getRatePlanData } from '../utils/sessionStorage';

const StairEstimation: React.FC = () => {
  const [usage, setUsage] = useState('');
  // read saved pricing model details
  const storedStairs = JSON.parse(getRatePlanData('STAIR_TIERS') || '[]');
  const overageRate = Number(getRatePlanData('STAIR_OVERAGE') || 0);
  const setupFee = Number(getRatePlanData('SETUP_FEE') || 0);
  const discountPercent = Number(getRatePlanData('DISCOUNT_PERCENT') || 0);
  const discountFlat = Number(getRatePlanData('DISCOUNT_FLAT') || 0);
  const freemiumUnits = Number(getRatePlanData('FREEMIUM_UNITS') || 0);
  const minimumUsage = Number(getRatePlanData('MINIMUM_USAGE') || 0);
  const minimumCharge = Number(getRatePlanData('MINIMUM_CHARGE') || 0);

  const [includeSetup, setIncludeSetup] = useState(false);
  const [includeDiscount, setIncludeDiscount] = useState(false);
  const [includeFreemium, setIncludeFreemium] = useState(false);
  const [includeCommitment, setIncludeCommitment] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  interface Stair { label: string; range: string; amount: number; max: number; }
  const stairs: Stair[] = storedStairs.length > 0
    ? storedStairs.map((s: any, i: number): Stair => ({
      label: `Stair ${i + 1}`,
      range: `${s.from}–${s.to ?? '∞'}`,
      amount: Number(s.cost),
      max: s.to ?? Number.MAX_SAFE_INTEGER,
    }))
    : [];

  const usageNum = Number(usage) || 0;
  const highestStair = stairs[stairs.length - 1];
  const isOverage = usageNum > highestStair.max;
  const overageUnits = isOverage ? usageNum - highestStair.max : 0;
  const overageAmount = overageUnits * overageRate;

  const matchedStair = stairs.slice().reverse().find((stair: Stair) => usageNum >= stair.max);
  const stairCharge = matchedStair ? matchedStair.amount : 0;

  const setupAmount = includeSetup ? setupFee : 0;
  const perUnitRate = overageRate; // assume same
  const freemiumAmount = includeFreemium ? freemiumUnits * perUnitRate : 0;

  const subtotal = stairCharge + overageAmount + setupAmount - freemiumAmount;
  const discountAmount = includeDiscount ? (discountPercent > 0 ? (discountPercent / 100) * subtotal : discountFlat) : 0;
  let totalEstimation = subtotal - discountAmount;
  if (includeCommitment && minimumCharge > 0) {
    totalEstimation = Math.max(totalEstimation, minimumCharge);
  }

  const handleCalculate = () => {
    setIsCalculating(true);
    setShowCalculation(false);

    setTimeout(() => {
      setIsCalculating(false);
      setShowCalculation(true);
    }, 1500);
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
          <button onClick={handleCalculate} disabled={isCalculating}>
            {isCalculating ? <span className="loader"></span> : 'Calculate Revenue'}
          </button>
        </div>

        <table className="estimate-table">
          <thead>
            <tr>
              <th>Pricing Model & Extras</th>
              <th>Saved Values</th>
              {showCalculation && <th>Calculation</th>}
              {showCalculation && <th>Amount</th>}
            </tr>
          </thead>
          <tbody>
            <tr><td>Model Type</td><td>Stair – Step Pricing</td>{showCalculation && <><td>-</td><td>-</td></>}</tr>

            {stairs.map((stair: Stair, index: number) => (
              <tr key={index}>
                <td>{stair.label}<br /><small>{stair.range}</small></td>
                <td>${stair.amount}</td>
                {showCalculation && (
                  <>
                    <td>{matchedStair?.label === stair.label ? `$${stair.amount}` : '-'}</td>
                    <td>{matchedStair?.label === stair.label ? `$${stair.amount}` : '-'}</td>
                  </>
                )}
              </tr>
            ))}

            <tr>
              <td>Overage Charges</td>
              <td>${overageRate}</td>
              {showCalculation && (
                <>
                  <td>{isOverage ? `${overageUnits} * ${overageRate}` : '-'}</td>
                  <td>{isOverage ? `$${overageAmount}` : '-'}</td>
                </>
              )}
            </tr>

            <tr>
              <td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={includeSetup}
                    onChange={(e) => setIncludeSetup(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
                &nbsp;Setup Fee
              </td>
              <td>{setupFee > 0 ? `$${setupFee}` : '-'}</td>
              {showCalculation && <><td>{includeSetup ? `$${setupFee}` : '-'}</td><td>{includeSetup ? `$${setupFee}` : '-'}</td></>}
            </tr>

            <tr>
              <td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={includeDiscount}
                    onChange={(e) => setIncludeDiscount(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
                &nbsp;Discounts
              </td>
              <td>{discountPercent > 0 ? `${discountPercent}%` : discountFlat > 0 ? `$${discountFlat}` : '-'}</td>
              {showCalculation && (
                <>
                  <td>{includeDiscount ? (discountPercent > 0 ? `${discountPercent}% of $${subtotal.toFixed(2)} = $${discountAmount.toFixed(2)}` : `$${discountFlat}`) : '-'}</td>
                  <td>{includeDiscount ? `-$${discountAmount.toFixed(2)}` : '-'}</td>
                </>
              )}
            </tr>

            <tr>
              <td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={includeFreemium}
                    onChange={(e) => setIncludeFreemium(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
                &nbsp;Freemium Setup
              </td>
              <td>Free Units - {freemiumUnits}</td>
              {showCalculation && <><td>{includeFreemium ? `${freemiumUnits} * $0.1` : '-'}</td><td>{includeFreemium ? `-$${freemiumAmount.toFixed(0)}` : '-'}</td></>}
            </tr>

            <tr>
              <td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={includeCommitment}
                    onChange={(e) => setIncludeCommitment(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
                &nbsp;Minimum Commitment
              </td>
              <td>{minimumCharge > 0 ? `${minimumUsage} units / $${minimumCharge}` : '-'}</td>
              {showCalculation && <><td>{includeCommitment ? `Floor to $${minimumCharge}` : '-'}</td><td>{includeCommitment ? `$${totalEstimation.toFixed(2)}` : '-'}</td></>}
            </tr>

            {showCalculation && (
              <tr className="total-row">
                <td colSpan={showCalculation ? 3 : 2}>Total Estimation</td>
                <td>${totalEstimation.toFixed(0)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default StairEstimation;
