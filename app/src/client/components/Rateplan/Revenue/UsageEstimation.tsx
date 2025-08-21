import React, { useState } from 'react';
import './EstimateRevenue.css';
import { useNavigate } from 'react-router-dom';

const UsageEstimation: React.FC = () => {
  const navigate = useNavigate();
  const [usage, setUsage] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [includeSetup, setIncludeSetup] = useState(true);
  const [includeDiscount, setIncludeDiscount] = useState(true);
  const [includeFreemium, setIncludeFreemium] = useState(false);
  const [includeCommitment, setIncludeCommitment] = useState(true);
  const [showCalculation, setShowCalculation] = useState(false);

  const perUsageRate = 0.1;
  const setupFee = 10;
  const discountPercent = 10;
  const freemiumUnits = 20;

  const usageNum = Number(usage) || 0;
  const usageTotal = usageNum * perUsageRate;
  const setupComponent = includeSetup ? setupFee : 0;
  const subtotal = usageTotal + setupComponent;
  const discountAmount = includeDiscount ? (discountPercent / 100) * subtotal : 0;
  const totalEstimation = subtotal - discountAmount;

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate(-1)}>
        <svg className="back-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10.0013 15.8337L4.16797 10.0003M4.16797 10.0003L10.0013 4.16699M4.16797 10.0003H15.8346" stroke="#706C72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 style={{ margin: 0 }}>Estimate revenue</h2>
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
            <button onClick={handleCalculate} disabled={isCalculating}>
              {isCalculating ? <span className="loader"></span> : 'Calculate Revenue'}
            </button>
          </div>
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
              <td>$0.1</td>
              {showCalculation && <><td>$0.1 * {usage}</td><td>${usageTotal.toFixed(0)}</td></>}
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
              <td>$10</td>
              {showCalculation && <><td>$10</td><td>${setupComponent}</td></>}
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
              <td>10%</td>
              {showCalculation && (
                <>
                  <td>10% of ${subtotal.toFixed(0)} = ${discountAmount.toFixed(0)}</td>
                  <td>-${discountAmount.toFixed(0)}</td>
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
              {showCalculation && <><td>-</td><td>-</td></>}
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
              <td>10 APIs</td>
              {showCalculation && <><td>-</td><td>-</td></>}
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
