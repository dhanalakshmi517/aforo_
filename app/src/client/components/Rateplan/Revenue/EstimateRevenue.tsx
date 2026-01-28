import React, { useMemo, useState } from 'react';
import './EstimateRevenue.css';
import { useNavigate } from 'react-router-dom';
import { getRatePlanData } from '../utils/sessionStorage';
import { estimateRevenue, RevenueEstimationRequest, RevenueEstimationResponse } from '../api';

const normalizePricingModel = (raw: string | null): 'usage' | 'flat' => {
  const v = (raw || '').toLowerCase().trim();
  // Accept many variants
  if (
    v.includes('usage') ||
    v.includes('per usage') ||
    v.includes('usage-based') ||
    v.includes('usage based') ||
    v === 'usage' ||
    v === 'usage_based' ||
    v === 'usage-based'
  ) {
    return 'usage';
  }
  return 'flat';
};

const safeNum = (v: string | null): number => {
  const n = Number(v);
  return isFinite(n) ? n : 0;
};

const EstimateRevenue: React.FC = () => {
  const navigate = useNavigate();
  const [usage, setUsage] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);

  // Read saved values
  const flatFee = safeNum(getRatePlanData('FLAT_FEE_AMOUNT'));
  const numberUnits = safeNum(getRatePlanData('FLAT_FEE_API_CALLS'));
  const overageCharge = safeNum(getRatePlanData('FLAT_FEE_OVERAGE'));
  const usagePerUnit = safeNum(getRatePlanData('USAGE_PER_UNIT_AMOUNT'));

  const pricingModelRaw = getRatePlanData('PRICING_MODEL');
  const modelKind = normalizePricingModel(pricingModelRaw);
  const isUsageBased = modelKind === 'usage';

  const setupFee = safeNum(getRatePlanData('SETUP_FEE'));
  const discountPercent = safeNum(getRatePlanData('DISCOUNT_PERCENT'));
  const discountFlat = safeNum(getRatePlanData('DISCOUNT_FLAT'));
  // helper reads latest freemium units from session storage (handles legacy FREE_UNITS key too)
  const readFreemiumUnits = () => safeNum(getRatePlanData('FREEMIUM_UNITS')) || safeNum(getRatePlanData('FREE_UNITS'));

  // state so later session-storage updates are reflected
  const [freemiumUnits, setFreemiumUnits] = useState<number>(readFreemiumUnits());
  const minimumUsage = safeNum(getRatePlanData('MINIMUM_USAGE'));
  const minimumCharge = safeNum(getRatePlanData('MINIMUM_CHARGE'));

  // Toggles — default freemium to ON when units are saved (so users see its effect immediately)
  const [includeSetup, setIncludeSetup] = useState(false);
  const [includeDiscount, setIncludeDiscount] = useState(false);
  const [includeFreemium, setIncludeFreemium] = useState(freemiumUnits > 0);
  const [includeCommitment, setIncludeCommitment] = useState(false);

  const [showCalculation, setShowCalculation] = useState(false);

  const usageNum = Number(usage) || 0;

  // Compute all money math from current inputs/toggles
  const {
    baseAmount,
    effectiveUsage,
    freemiumSavings,
    fullUsageAmount,
    setupComponent,
    subtotal,
    discountAmount,
    beforeMinimum,
    totalEstimation,
    minimumAdjustment,
  } = useMemo(() => {
    let _effectiveUsage = usageNum;
    let _freemiumSavings = 0;
    let _baseAmount = 0;

    if (isUsageBased) {
      const _fullUsageAmount = usageNum * usagePerUnit;

      // compute what freemium WOULD save if applied
      if (freemiumUnits > 0) {
        _effectiveUsage = Math.max(0, usageNum - freemiumUnits);
        _freemiumSavings = Math.min(usageNum, freemiumUnits) * usagePerUnit;
      }

      // apply based on toggle
      _baseAmount = includeFreemium ? _effectiveUsage * usagePerUnit : _fullUsageAmount;

      const _setupComponent = includeSetup ? setupFee : 0;
      const _subtotal = _baseAmount + _setupComponent;

      const _discountAmount = includeDiscount
        ? (discountPercent > 0
          ? (discountPercent / 100) * _subtotal
          : discountFlat)
        : 0;

      let _totalEstimation = _subtotal - _discountAmount;
      const _beforeMinimum = _totalEstimation;

      if (includeCommitment && minimumCharge > 0) {
        _totalEstimation = Math.max(_totalEstimation, minimumCharge);
      }

      return {
        baseAmount: _baseAmount,
        effectiveUsage: _effectiveUsage,
        freemiumSavings: _freemiumSavings,
        fullUsageAmount: _fullUsageAmount,
        setupComponent: _setupComponent,
        subtotal: _subtotal,
        discountAmount: _discountAmount,
        beforeMinimum: _beforeMinimum,
        totalEstimation: _totalEstimation,
        minimumAdjustment: _totalEstimation - _beforeMinimum,
      };
    } else {
      // Flat fee branch (kept same semantics, with freemium reducing overage if toggled)
      // overage before freemium
      const rawOverage = Math.max(0, usageNum - numberUnits);
      // apply freemium only to overage units, never below zero
      const effectiveOverage = includeFreemium ? Math.max(0, rawOverage - freemiumUnits) : rawOverage;
      const overageTotal = effectiveOverage * overageCharge;

      const freemiumTotal = includeFreemium ? (Math.min(rawOverage, freemiumUnits) * overageCharge) : 0;

      const setupComponent = includeSetup ? setupFee : 0;
      const subtotal = flatFee + setupComponent + overageTotal; // freemium already deducted via effectiveOverage

      const _baseAmount = flatFee + overageTotal;
      const _freemiumSavings = freemiumTotal;
      const _setupComponent = includeSetup ? setupFee : 0;
      const _subtotal = _baseAmount + _setupComponent;

      const _discountAmount = includeDiscount
        ? (discountPercent > 0
          ? (discountPercent / 100) * _subtotal
          : discountFlat)
        : 0;

      let _totalEstimation = _subtotal - _discountAmount;
      const _beforeMinimum = _totalEstimation;

      if (includeCommitment && minimumCharge > 0) {
        _totalEstimation = Math.max(_totalEstimation, minimumCharge);
      }

      return {
        baseAmount: _baseAmount,
        effectiveUsage: _effectiveUsage,
        freemiumSavings: _freemiumSavings,
        fullUsageAmount: flatFee + overageTotal,
        setupComponent: _setupComponent,
        subtotal: _subtotal,
        discountAmount: _discountAmount,
        beforeMinimum: _beforeMinimum,
        totalEstimation: _totalEstimation,
        minimumAdjustment: _totalEstimation - _beforeMinimum,
      };
    }
  }, [
    // inputs and toggles that affect math
    isUsageBased,
    usageNum,
    usagePerUnit,
    freemiumUnits,
    includeFreemium,
    includeSetup,
    setupFee,
    includeDiscount,
    discountPercent,
    discountFlat,
    includeCommitment,
    minimumCharge,
    numberUnits,
    overageCharge,
    flatFee,
  ]);

  const [backendResponse, setBackendResponse] = useState<RevenueEstimationResponse | null>(null);

  const handleCalculate = async () => {
    // refresh freemium units that may have been saved after hydration
    const freshUnits = readFreemiumUnits();
    setFreemiumUnits(freshUnits);

    setIsCalculating(true);
    setShowCalculation(false);

    try {
      // Build request payload matching backend expectations
      const request: RevenueEstimationRequest = {
        pricingModel: isUsageBased ? 'USAGE_BASED' : 'FLAT_FEE',
        usage: usageNum,
        flatFeeAmount: flatFee,
        numberOfApiCalls: numberUnits,
        overageUnitRate: overageCharge,
        perUnitAmount: usagePerUnit,
        tiers: [{
          minUnits: 0,
          maxUnits: 0,
          pricePerUnit: 0
        }],
        steps: [{
          usageThresholdStart: 0,
          usageThresholdEnd: 0,
          monthlyCharge: 0
        }],
        includeSetup: includeSetup,
        setupFee: setupFee,
        includeDiscount: includeDiscount,
        discountPct: discountPercent,
        flatDiscountAmount: discountFlat,
        includeFreemium: includeFreemium,
        freeUnits: freshUnits,
        includeCommitment: includeCommitment,
        minCommitmentAmount: minimumCharge,
        flatFeeAmountSafe: flatFee,
        usageSafe: usagePerUnit,
        includedUnitsSafe: numberUnits,
        overageUnitRateSafe: overageCharge,
        perUnitAmountSafe: usagePerUnit
      };

      console.log('🚀 Sending revenue estimation request:', request);

      const response = await estimateRevenue(request);
      console.log('✅ Backend response:', response);

      setBackendResponse(response);
      setShowCalculation(true);
    } catch (error) {
      console.error('❌ Revenue estimation failed:', error);
      // Fallback to frontend calculation
      setShowCalculation(true);
    } finally {
      setIsCalculating(false);
    }
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
              <td>{isUsageBased ? 'Usage Based Pricing' : 'Flat Fee'}</td>
              {showCalculation && <><td>-</td><td>-</td></>}
            </tr>

            {isUsageBased ? (
              <>
                <tr>
                  <td>Per Usage Amount</td>
                  <td>{`$${usagePerUnit}`}</td>
                  {showCalculation && (
                    <>
                      <td>{`${usageNum} × $${usagePerUnit}`}</td>
                      <td>{`$${fullUsageAmount.toFixed(2)}`}</td>
                    </>
                  )}
                </tr>
                {showCalculation && includeFreemium && freemiumUnits > 0 && (
                  <tr>
                    <td style={{ paddingLeft: '40px' }}>└ Freemium Deduction</td>
                    <td>{`${freemiumUnits} free units`}</td>
                    <td>{`${Math.min(usageNum, freemiumUnits)} × $${usagePerUnit}`}</td>
                    <td>{`-$${freemiumSavings.toFixed(2)}`}</td>
                  </tr>
                )}
              </>
            ) : (
              <>
                <tr>
                  <td>Flat fee amount</td>
                  <td>{`$${flatFee}`}</td>
                  {showCalculation && <><td>{`$${flatFee}`}</td><td>{`$${flatFee}`}</td></>}
                </tr>
                <tr>
                  <td>Number of API calls</td>
                  <td>{numberUnits}</td>
                  {showCalculation && <><td>-</td><td>-</td></>}
                </tr>
                <tr>
                  <td>Overage Charges</td>
                  <td>{`$${overageCharge} per call`}</td>
                  {showCalculation && (
                    <>
                      <td>{`${Math.max(0, usageNum - numberUnits)} × $${overageCharge}`}</td>
                      <td>{`$${(Math.max(0, usageNum - numberUnits) * overageCharge).toFixed(2)}`}</td>
                    </>
                  )}
                </tr>
                {showCalculation && includeFreemium && freemiumUnits > 0 && Math.max(0, usageNum - numberUnits) > 0 && (
                  <tr>
                    <td style={{ paddingLeft: '40px' }}>└ Freemium Deduction</td>
                    <td>{`${freemiumUnits} free units`}</td>
                    <td>{`${Math.min(Math.max(0, usageNum - numberUnits), freemiumUnits)} × $${overageCharge}`}</td>
                    <td>{`-$${freemiumSavings.toFixed(2)}`}</td>
                  </tr>
                )}
              </>
            )}

            <tr>
              <td>
                <label className="switch">
                  <input type="checkbox" checked={includeSetup} onChange={(e) => setIncludeSetup(e.target.checked)} />
                  <span className="slider"></span>
                </label>
                &nbsp;Setup Fee
              </td>
              <td>{setupFee > 0 ? `$${setupFee}` : '-'}</td>
              {showCalculation && includeSetup && <><td>{`$${setupFee}`}</td><td>{`$${setupFee}`}</td></>}
            </tr>

            <tr>
              <td>
                <label className="switch">
                  <input type="checkbox" checked={includeDiscount} onChange={(e) => setIncludeDiscount(e.target.checked)} />
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
                  <input type="checkbox" checked={includeFreemium} onChange={(e) => setIncludeFreemium(e.target.checked)} />
                  <span className="slider"></span>
                </label>
                &nbsp;Freemium Setup
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
                  <input type="checkbox" checked={includeCommitment} onChange={(e) => setIncludeCommitment(e.target.checked)} />
                  <span className="slider"></span>
                </label>
                &nbsp;Minimum Commitment
              </td>
              <td>{minimumCharge > 0 ? `${minimumUsage} units / $${minimumCharge}` : '-'}</td>
              {showCalculation && (
                includeCommitment ? (
                  <>
                    <td>{minimumCharge > 0 ? `Max($${beforeMinimum.toFixed(2)}, $${minimumCharge}) = $${totalEstimation.toFixed(2)}` : 'No minimum charge set'}</td>
                    <td>{minimumCharge > 0 ? (minimumAdjustment > 0 ? `+$${minimumAdjustment.toFixed(2)}` : '$0') : '$0'}</td>
                  </>
                ) : (
                  <><td>-</td><td>-</td></>
                )
              )}
            </tr>

            {showCalculation && (
              <tr className="total-row">
                <td colSpan={3}>Total Estimation</td>
                <td>${backendResponse ? backendResponse.total : totalEstimation.toFixed(0)}</td>
              </tr>
            )}

            {/* Backend Response Breakdown */}
            {showCalculation && backendResponse && (
              <>
                <tr style={{ backgroundColor: '#f0f8ff' }}>
                  <td colSpan={4} style={{ fontWeight: 'bold', textAlign: 'center', padding: '16px' }}>
                    Backend Calculation Breakdown
                  </td>
                </tr>
                {backendResponse.breakdown.map((item, index) => (
                  <tr key={index}>
                    <td>{item.label}</td>
                    <td>-</td>
                    <td>{item.calculation}</td>
                    <td>${item.amount}</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default EstimateRevenue;
