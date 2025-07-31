import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EstimateRevenue.css';

const StairEstimation: React.FC = () => {
  const navigate = useNavigate();

  const [usage, setUsage] = useState('');
  const [includeSetup, setIncludeSetup] = useState(true);
  const [includeDiscount, setIncludeDiscount] = useState(true);
  const [includeFreemium, setIncludeFreemium] = useState(true);
  const [includeCommitment, setIncludeCommitment] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const stairs = [
    { label: 'Stair 1', range: '1 – 200', amount: 20, max: 200 },
    { label: 'Stair 2', range: '201 – 500', amount: 30, max: 500 },
    { label: 'Stair 3', range: '501 – 700', amount: 40, max: 700 },
  ];

  const overageRate = 1;
  const setupFee = 10;
  const discountPercent = 10;
  const freemiumUnits = 20;
  const perUnitRate = 0.1;

  const usageNum = Number(usage) || 0;
  const highestStair = stairs[stairs.length - 1];
  const isOverage = usageNum > highestStair.max;
  const overageUnits = isOverage ? usageNum - highestStair.max : 0;
  const overageAmount = overageUnits * overageRate;

  const matchedStair = stairs.findLast(stair => usageNum >= stair.max);
  const stairCharge = matchedStair ? matchedStair.amount : 0;

  const setupAmount = includeSetup ? setupFee : 0;
  const freemiumAmount = includeFreemium ? freemiumUnits * perUnitRate : 0;

  const preDiscountTotal = stairCharge + overageAmount + setupAmount - freemiumAmount;
  const discountAmount = includeDiscount ? (discountPercent / 100) * preDiscountTotal : 0;
  const totalEstimation = preDiscountTotal - discountAmount;

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
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
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
            <tr><td>Model Type</td><td>Stair – Step Pricing</td>{showCalculation && <><td>-</td><td>-</td></>}</tr>

            {stairs.map((stair, index) => (
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
              <td>$1</td>
              {showCalculation && (
                <>
                  <td>{isOverage ? `${overageUnits} * $1` : '-'}</td>
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
              <td>$10</td>
              {showCalculation && <><td>{includeSetup ? '$10' : '-'}</td><td>{includeSetup ? '$10' : '-'}</td></>}
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
                  <td>{includeDiscount ? `10% of $${preDiscountTotal.toFixed(0)} = $${discountAmount.toFixed(0)}` : '-'}</td>
                  <td>{includeDiscount ? `-$${discountAmount.toFixed(0)}` : '-'}</td>
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
              <td>10 APIs</td>
              {showCalculation && <><td>-</td><td>-</td></>}
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
