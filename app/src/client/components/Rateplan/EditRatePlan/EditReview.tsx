// EditReview.tsx
import React, { useState } from 'react';
import './EditReview.css';
import RevenueEstimatorModal from '../RevenueEstimatorModal';
import { getRatePlanData } from '../utils/sessionStorage';

const EditReview: React.FC = () => {
  const [showRevenueEstimator, setShowRevenueEstimator] = useState(false);

  // Fetch pricing model
  const pricingModel = getRatePlanData('PRICING_MODEL') || '';

  // Determine pricing model type
  const isFlat = pricingModel === 'Flat Fee';
  const isStair = pricingModel === 'Stairstep';
  const isVolume = pricingModel === 'Volume-Based';
  const isTier = pricingModel === 'Tiered Pricing';
  const isUsage = pricingModel === 'Usage-Based';

  // Fetch plan details
  const planName = getRatePlanData('PLAN_NAME') || '';
  const planDescription = getRatePlanData('PLAN_DESCRIPTION') || '';
  const billingFrequency = getRatePlanData('BILLING_FREQUENCY') || '';
  const productName = getRatePlanData('PRODUCT_NAME') || '';

  // Fetch billable metric details
  const billableName = getRatePlanData('BILLABLE_METRIC_NAME') || '';
  const billableDesc = getRatePlanData('BILLABLE_METRIC_DESCRIPTION') || '';
  const billableUnit = getRatePlanData('BILLABLE_METRIC_UNIT') || '';
  const billableAgg = getRatePlanData('BILLABLE_METRIC_AGGREGATION') || '';

  // Fetch Flat Fee details
  const flatFeeAmount = isFlat ? getRatePlanData('FLAT_FEE_AMOUNT') || '' : '';
  const flatFeeLimit = isFlat ? getRatePlanData('FLAT_FEE_API_CALLS') || '' : '';
  const flatFeeOverage = isFlat ? getRatePlanData('FLAT_FEE_OVERAGE') || '' : '';
  const flatFeeGrace = isFlat ? getRatePlanData('FLAT_FEE_GRACE') || '' : '';

  // Fetch Tiered data
  const tieredTiers = isTier ? JSON.parse(getRatePlanData('TIERED_TIERS') || '[]') as any[] : [];
  const tieredOverage = isTier ? getRatePlanData('TIERED_OVERAGE') || '' : '';
  const tieredGrace = isTier ? getRatePlanData('TIERED_GRACE') || '' : '';

  // Fetch Usage-based data
  const usagePerUnit = isUsage ? getRatePlanData('USAGE_PER_UNIT_AMOUNT') || '' : '';

  // Fetch Volume data
  const volumeTiers = isVolume ? JSON.parse(getRatePlanData('VOLUME_TIERS') || '[]') as any[] : [];
  const volumeOverage = isVolume ? getRatePlanData('VOLUME_OVERAGE') || '' : '';
  const volumeGrace = isVolume ? getRatePlanData('VOLUME_GRACE') || '' : '';

  // Fetch Stair data
  const stairTiers = isStair ? JSON.parse(getRatePlanData('STAIR_TIERS') || '[]') as any[] : [];
  const stairOverage = isStair ? getRatePlanData('STAIR_OVERAGE') || '' : '';
  const stairGrace = isStair ? getRatePlanData('STAIR_GRACE') || '' : '';

  // Fetch extras
  const setupFee = getRatePlanData('SETUP_FEE') || '';
  const discountPercent = getRatePlanData('DISCOUNT_PERCENT') || '';
  const discountFlat = getRatePlanData('DISCOUNT_FLAT') || '';
  const freemiumUnits = getRatePlanData('FREEMIUM_UNITS') || '';
  const minimumUsage = getRatePlanData('MINIMUM_USAGE') || '';
  const minimumCharge = getRatePlanData('MINIMUM_CHARGE') || '';

  const canShowEstimator = isFlat || isUsage || isStair || isVolume || isTier;

  const handleEstimateRevenueClick = () => {
    if (canShowEstimator) {
      setShowRevenueEstimator(true);
    }
  };

  const handleCloseRevenueEstimator = () => {
    setShowRevenueEstimator(false);
  };

  return (
    <div className="review-container">
      <div
        className="estimate-box"
        onClick={handleEstimateRevenueClick}
        style={{ cursor: canShowEstimator ? 'pointer' : 'not-allowed', opacity: canShowEstimator ? 1 : 0.5 }}
      >
        <div className="estimate-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 3V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H21M8 7.5C8 7.77614 7.77614 8 7.5 8C7.22386 8 7 7.77614 7 7.5C7 7.22386 7.22386 7 7.5 7C7.77614 7 8 7.22386 8 7.5ZM19 5.5C19 5.77614 18.7761 6 18.5 6C18.2239 6 18 5.77614 18 5.5C18 5.22386 18.2239 5 18.5 5C18.7761 5 19 5.22386 19 5.5ZM12 11.5C12 11.7761 11.7761 12 11.5 12C11.2239 12 11 11.7761 11 11.5C11 11.2239 11.2239 11 11.5 11C11.7761 11 12 11.2239 12 11.5ZM8 16.5C8 16.7761 7.77614 17 7.5 17C7.22386 17 7 16.7761 7 16.5C7 16.2239 7.22386 16 7.5 16C7.77614 16 8 16.2239 8 16.5ZM18 14.5C18 14.7761 17.7761 15 17.5 15C17.2239 15 17 14.7761 17 14.5C17 14.2239 17.2239 14 17.5 14C17.7761 14 18 14.2239 18 14.5Z"
              stroke="#1CB814" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <strong>Estimate revenue</strong>
        <span>See how much your plan might earn based on expected usage.</span>
        <svg
          className="estimate-arrow"
          onClick={handleEstimateRevenueClick}
          style={{ cursor: canShowEstimator ? 'pointer' : 'not-allowed' }}
          xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#706C72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="card">
        <h3>PLAN DETAILS</h3>
        <div className="row">
          <label>Rate Plan Name</label>
          <span>{planName || 'Not entered'}</span>
        </div>
        <div className="row">
          <label>Rate Plan Description</label>
          <span>{planDescription || 'Not entered'}</span>
        </div>
        <div className="row">
          <label>Billing Frequency</label>
          <span>{billingFrequency || 'Not selected'}</span>
        </div>
        <div className="row">
          <label>Product Name</label>
          <span>{productName || 'Not selected'}</span>
        </div>
      </div>

      <div className="card">
        <h3>DEFINE BILLABLE METRICS</h3>
        <div className="row">
          <label>Description</label>
          <span>{billableDesc || 'Not entered'}</span>
        </div>
        <div className="row">
          <label>Metric Name</label>
          <span>{billableName || 'Not entered'}</span>
        </div>
        <div className="row">
          <label>Define Unit</label>
          <span>{billableUnit || 'Not selected'}</span>
        </div>
        <div className="row">
          <label>Define Aggregation Type</label>
          <span>{billableAgg || 'Not selected'}</span>
        </div>
      </div>

      <div className="card">
        <h3>PRICING MODEL SETUP</h3>
        <div className="row">
          <label>Pricing Model</label>
          <span>{pricingModel || 'Not selected'}</span>
        </div>

        {isFlat && (
          <>
            <div className="row">
              <label>Flat Fee Amount</label>
              <span>{flatFeeAmount ? `$${flatFeeAmount}` : 'Not entered'}</span>
            </div>
            <div className="row">
              <label>Number of API calls</label>
              <span>{flatFeeLimit || 'Not entered'}</span>
            </div>
            <div className="row">
              <label>Overage unit rate</label>
              <span>{flatFeeOverage ? `$${flatFeeOverage}` : 'Not entered'}</span>
            </div>
            <div className="row">
              <label>Grace buffer (Optional)</label>
              <span>{flatFeeGrace || '—'}</span>
            </div>
          </>
        )}

        {isTier && (
          <>
            {tieredTiers.length > 0 && (
              <div className="row">
                <label>Tiers</label>
                <span>{tieredTiers.map((t: any, idx: number) => `${t.from}-${t.to || (t.isUnlimited ? '∞' : '')} @ $${t.price}`).join('; ')}</span>
              </div>
            )}
            <div className="row">
              <label>Overage Charge</label>
              <span>{tieredOverage || 'Not entered'}</span>
            </div>
            <div className="row">
              <label>Grace Buffer</label>
              <span>{tieredGrace || '—'}</span>
            </div>
          </>
        )}

        {isUsage && (
          <div className="row">
            <label>Per-unit Amount</label>
            <span>{usagePerUnit ? `$${usagePerUnit}` : 'Not entered'}</span>
          </div>
        )}

        {isVolume && (
          <>
            {volumeTiers.length > 0 && (
              <div className="row">
                <label>Tiers</label>
                <span>{volumeTiers.map((t: any) => `${t.from}-${t.to || (t.isUnlimited ? '∞' : '')} @ $${t.price}`).join('; ')}</span>
              </div>
            )}
            <div className="row">
              <label>Overage Charge</label>
              <span>{volumeOverage || 'Not entered'}</span>
            </div>
            <div className="row">
              <label>Grace Buffer</label>
              <span>{volumeGrace || '—'}</span>
            </div>
          </>
        )}

        {isStair && (
          <>
            {stairTiers.length > 0 && (
              <div className="row">
                <label>Stairs</label>
                <span>{stairTiers.map((s: any) => `${s.from}-${s.to || (s.isUnlimited ? '∞' : '')} cost $${s.cost}`).join('; ')}</span>
              </div>
            )}
            <div className="row">
              <label>Overage Charge</label>
              <span>{stairOverage || 'Not entered'}</span>
            </div>
            <div className="row">
              <label>Grace Buffer</label>
              <span>{stairGrace || '—'}</span>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h3>EXTRAS</h3>
        <div className="row">
          <label>Setup Fee</label>
          <span>{setupFee ? `$${setupFee}` : 'Not added'}</span>
        </div>
        <div className="row">
          <label>Discount (%)</label>
          <span>{discountPercent || '—'}</span>
        </div>
        <div className="row">
          <label>Discount (Flat)</label>
          <span>{discountFlat ? `$${discountFlat}` : '—'}</span>
        </div>
        <div className="row">
          <label>Freemium Units</label>
          <span>{freemiumUnits || '—'}</span>
        </div>
        <div className="row">
          <label>Minimum Usage</label>
          <span>{minimumUsage || '—'}</span>
        </div>
        <div className="row">
          <label>Minimum Charge</label>
          <span>{minimumCharge ? `$${minimumCharge}` : '—'}</span>
        </div>
      </div>

      {/* Revenue Estimator Modal */}
      {showRevenueEstimator && (
        <RevenueEstimatorModal
          pricingModel={pricingModel}
          onClose={handleCloseRevenueEstimator}
        />
      )}
    </div>
  );
};

export default EditReview;
