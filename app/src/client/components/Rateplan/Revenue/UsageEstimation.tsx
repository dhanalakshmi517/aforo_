import React, { useState } from 'react';
import './EstimateRevenue.css';
import { useNavigate } from 'react-router-dom';
import { getRatePlanData } from '../utils/sessionStorage';

const UsageEstimation: React.FC = () => {
  const navigate = useNavigate();
  const [usage, setUsage] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const perUsageRate = Number(getRatePlanData('USAGE_PER_UNIT_AMOUNT') || 0);
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


  const usageNum = Number(usage) || 0;

  // Calculate full usage amount (before any deductions)
  const fullUsageAmount = usageNum * perUsageRate;

  // Calculate freemium reduction
  const freemiumReduction = includeFreemium && freemiumUnits > 0 ? Math.min(freemiumUnits, usageNum) * perUsageRate : 0;

  // Calculate billable amount after freemium
  const usageTotal = fullUsageAmount - freemiumReduction;

  const setupComponent = includeSetup ? setupFee : 0;
  const subtotal = usageTotal + setupComponent;
  const discountAmount = includeDiscount ? (discountPercent > 0 ? (discountPercent / 100) * subtotal : discountFlat) : 0;
  let totalEstimation = subtotal - discountAmount;

  // Apply minimum charge as floor
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
            <tr>
              <td>Model Type</td>
              <td>Usage Based Pricing</td>
              {showCalculation && <><td>-</td><td>-</td></>}
            </tr>
            <tr>
              <td>Per Usage Amount</td>
              <td>{`$${perUsageRate}`}</td>
              {showCalculation && <><td>{`${usageNum} × $${perUsageRate}`}</td><td>{`$${fullUsageAmount.toFixed(2)}`}</td></>}
            </tr>
            {showCalculation && includeFreemium && freemiumUnits > 0 && (
              <tr>
                <td style={{ paddingLeft: '40px' }}>└ Freemium Deduction</td>
                <td>{`Free Units - ${freemiumUnits}`}</td>
                <td>{`${Math.min(freemiumUnits, usageNum)} × $${perUsageRate}`}</td>
                <td>{`-$${freemiumReduction.toFixed(2)}`}</td>
              </tr>
            )}
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
                &nbsp;Freemium
              </td>
              <td>{freemiumUnits > 0 ? `Free Units - ${freemiumUnits}` : '-'}</td>
              {showCalculation && !includeFreemium && (
                <>
                  <td>-</td>
                  <td>-</td>
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
              {showCalculation && includeSetup && <><td>{`$${setupFee}`}</td><td>{`$${setupComponent.toFixed(2)}`}</td></>}
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
                  <td>{discountPercent > 0 ? `${discountPercent}% of $${subtotal.toFixed(2)} = $${discountAmount.toFixed(2)}` : `$${discountFlat}`}</td>
                  <td>{`-$${discountAmount.toFixed(2)}`}</td>
                </>
              )}
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
              <td>{minimumCharge > 0 ? `${minimumUsage} units / $${minimumCharge}` : (minimumUsage > 0 ? `${minimumUsage} units` : '-')}</td>
              {showCalculation && (
                <>
                  <td>{includeCommitment ? (minimumUsage > 0 && usageNum < minimumUsage ? `Using ${minimumUsage} units (minimum)` : minimumCharge > 0 ? `Max($${(subtotal - discountAmount).toFixed(2)}, $${minimumCharge})` : '-') : '-'}</td>
                  <td>{includeCommitment ? `$${totalEstimation.toFixed(2)}` : '-'}</td>
                </>
              )}
            </tr>
            {showCalculation && (
              <tr className="total-row">
                <td colSpan={3}>Total Estimation</td>
                <td>${totalEstimation.toFixed(0)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UsageEstimation;
