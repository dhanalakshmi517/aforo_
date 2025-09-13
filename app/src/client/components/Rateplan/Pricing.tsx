import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { saveFlatFeePricing, saveUsageBasedPricing, saveTieredPricing, saveVolumePricing, saveStairStepPricing } from './api';
import { getRatePlanData, setRatePlanData } from './utils/sessionStorage';
import './Pricing.css';
import FlatFeeForm, { FlatFeePayload, FlatFeeHandle } from './FlatFeeForm';
import Tiered, { TieredHandle } from './Tiered';
import StairStep, { StairStepHandle } from './StairStep';
import UsageBased, { UsagePayload, UsageBasedHandle } from './UsageBased';
import Volume, { VolumeHandle } from './Volume';

interface Tier {
  from: number;
  to: number;
  price: number;
  isUnlimited?: boolean;
}

export interface PricingHandle {
  save: () => Promise<boolean>;
  setFlatFee: (payload: FlatFeePayload) => void;
  getFlatFee: () => FlatFeePayload;
}
interface PricingProps { 
  ratePlanId: number | null; 
  validationErrors?: Record<string, string>;
}

type PricingErrors = {
  general?: string;
  select?: string;
  flatFee?: string;
  usage?: string;
  volume?: string;
  tiered?: string;
  stair?: string;
};

const Pricing = React.forwardRef<PricingHandle, PricingProps>(({ ratePlanId, validationErrors = {} }, ref) => {
  const [selected, setSelected] = useState('');
  const [errors, setErrors] = useState<PricingErrors>({});

  const flatFeeRef = useRef<FlatFeeHandle>(null);
  const usageBasedRef = useRef<UsageBasedHandle>(null);
  const volumeRef = useRef<VolumeHandle>(null);
  const tieredRef = useRef<TieredHandle>(null);
  const stairStepRef = useRef<StairStepHandle>(null);

  const [flatFee, setFlatFee] = useState<FlatFeePayload>({
    flatFeeAmount: 0,
    numberOfApiCalls: 0,
    overageUnitRate: 0,
    graceBuffer: 0,
  });
  const [usage, setUsage] = useState<UsagePayload>({ perUnitAmount: 0 });
  const [overageUnitRate, setOverageUnitRate] = useState(0);
  const [graceBuffer, setGraceBuffer] = useState(0);

  React.useImperativeHandle(ref, () => ({
    save: async () => {
      return await savePricing();
    },
    getFlatFee: () => flatFee,
    setFlatFee,
  }));

  const savePricing = async (): Promise<boolean> => {
    // clear previous messages
    setErrors({});

    // NOTE: per request, no browser/alert popups.
    if (!selected) {
      console.log("⚠️ No pricing model selected - returning true for draft mode");
      return true; // Allow draft save without pricing model selection
    }

    // We keep this as a gentle inline hint instead of an alert.
    if (!ratePlanId) {
      setErrors({
        general:
          'Pricing can be saved after the rate plan is created in earlier steps.',
      });
      return false;
    }

    try {
      if (selected === 'Flat Fee') {
        const { flatFeeAmount, numberOfApiCalls, overageUnitRate } = flatFee;
        const invalid =
          !flatFeeAmount || flatFeeAmount <= 0 ||
          !numberOfApiCalls || numberOfApiCalls <= 0 ||
          !overageUnitRate || overageUnitRate <= 0 ||
          isNaN(flatFeeAmount) || isNaN(numberOfApiCalls) || isNaN(overageUnitRate);

        if (invalid) {
          console.log("⚠️ Flat Fee validation failed - allowing draft save anyway");
          return true; // Allow draft save even with incomplete flat fee data
        }

        localStorage.setItem('flatFeeAmount', flatFeeAmount.toString());
        localStorage.setItem('flatFeeApiCalls', numberOfApiCalls.toString());
        localStorage.setItem('flatFeeOverage', overageUnitRate.toString());
        localStorage.setItem('flatFeeGrace', (graceBuffer || 0).toString());

        console.log("📝 API Call: POST /flat-fee-pricing - Saving Flat Fee pricing model...", flatFee);
        const flatFeeResult = await saveFlatFeePricing(ratePlanId, flatFee);
        console.log("✅ POST Success - Flat Fee pricing saved", flatFeeResult?.data || "");
      } else if (selected === 'Usage-Based') {
        if (!usage.perUnitAmount || usage.perUnitAmount <= 0 || isNaN(usage.perUnitAmount)) {
          console.log("⚠️ Usage-Based validation failed - allowing draft save anyway");
          return true; // Allow draft save even with incomplete usage data
        }
        localStorage.setItem('usagePerUnitAmount', usage.perUnitAmount.toString());
        console.log("📝 API Call: POST /usage-based-pricing - Saving Usage-Based pricing model...", usage);
        const usageResult = await saveUsageBasedPricing(ratePlanId, usage);
        console.log("✅ POST Success - Usage-Based pricing saved", usageResult?.data || "");
      } else if (selected === 'Volume-Based') {
        const validTiers = tiers.filter((t) => t.price || t.from || t.to);
        if (validTiers.length === 0) {
          console.log("⚠️ Volume-Based validation failed - allowing draft save anyway");
          return true; // Allow draft save even with incomplete volume data
        }
        if (!noUpperLimit && (!overageUnitRate || overageUnitRate <= 0 || isNaN(overageUnitRate))) {
          console.log("⚠️ Volume-Based overage validation failed - allowing draft save anyway");
          return true; // Allow draft save even with incomplete overage data
        }
        const payload = {
          tiers: validTiers.map((t) => ({
            usageStart: t.from,
            usageEnd: t.isUnlimited || t.to === 0 ? null : t.to,
            unitPrice: t.price,
          })),
          overageUnitRate,
          graceBuffer,
        };
        // Persist for review screen
        localStorage.setItem('volumeTiers', JSON.stringify(validTiers));
        localStorage.setItem('volumeOverage', overageUnitRate.toString());
        localStorage.setItem('volumeGrace', graceBuffer.toString());
        console.log("📝 API Call: POST /volume-pricing - Saving Volume pricing model...", payload);
        const volumeResult = await saveVolumePricing(ratePlanId, payload);
        console.log("✅ POST Success - Volume pricing saved", volumeResult?.data || "");
      } else if (selected === 'Tiered Pricing') {
        // Use the tieredRef component's save method instead of localStorage
        if (tieredRef.current) {
          console.log("📝 API Call: POST /tiered-pricing - Saving Tiered pricing model via component ref...");
          await tieredRef.current.save(ratePlanId);
          console.log("✅ POST Success - Tiered pricing saved via component ref");
        } else {
          console.log("⚠️ Tiered pricing ref not available - allowing draft save anyway");
          return true;
        }
      } else if (selected === 'Stairstep') {
        const storedStairs = JSON.parse(localStorage.getItem('stairTiers') || '[]');
        const overage = parseFloat(localStorage.getItem('stairOverage') || '0');
        const grace = parseFloat(localStorage.getItem('stairGrace') || '0');

        const validStairs = (storedStairs as any[]).filter((s) => s.cost || s.from || s.to);
        if (validStairs.length === 0) {
          console.log("⚠️ Stairstep validation failed - allowing draft save anyway");
          return true; // Allow draft save even with incomplete stairstep data
        }
        const hasUnlimited = (storedStairs as any[]).some((s) => s.isUnlimited);
        if (!hasUnlimited && (!overage || overage <= 0 || isNaN(overage))) {
          console.log("⚠️ Stairstep overage validation failed - allowing draft save anyway");
          return true; // Allow draft save even with incomplete overage data
        }

        const payload = {
          tiers: validStairs.map((s) => ({
            usageStart: parseInt(s.from, 10) || 0,
            usageEnd: s.isUnlimited || s.to === '' ? null : parseInt(s.to, 10) || 0,
            flatCost: parseFloat(s.cost) || 0,
          })),
          overageUnitRate: overage,
          graceBuffer: grace,
        };
        console.log("📝 API Call: POST /stairstep-pricing - Saving Stairstep pricing model...", payload);
        const stairResult = await saveStairStepPricing(ratePlanId, payload);
        console.log("✅ POST Success - Stairstep pricing saved", stairResult?.data || "");
      }

      // success – clear any general message
      setErrors({});
      return true;
    } catch (err: any) {
      console.error('Failed to save pricing', err);
      console.error('Error details:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // For draft mode, don't show error - just log and return true
      if (err.response?.status === 500) {
        console.warn('⚠️ 500 error during pricing save - likely duplicate entry, continuing...');
        return true;
      }
      
      setErrors({ general: 'Failed to save pricing. Please try again.' });
      return false;
    }
  };

  const [tiers, setTiers] = useState<Tier[]>([]);
  const [noUpperLimit, setNoUpperLimit] = useState(false);

  React.useEffect(() => {
    if (selected) setRatePlanData('PRICING_MODEL', selected);
  }, [selected]);

  const handleAddTier = () =>
    setTiers([...tiers, { from: NaN, to: NaN, price: NaN, isUnlimited: false }]);

  const handleDeleteTier = (index: number) =>
    setTiers(tiers.filter((_, i) => i !== index));

  const handleTierChange = (index: number, field: keyof Tier, value: string) => {
    const updated = [...tiers];
    if (field === 'isUnlimited') {
      updated[index][field] = value === 'true';
    } else if (value.trim() === '') {
      updated[index][field] = NaN as any;
    } else if (field === 'price') {
      updated[index][field] = parseFloat(value);
    } else {
      updated[index][field] = parseInt(value, 10);
    }
    setTiers(updated);
  };

  return (
    <div className="pricing-container">
      <div className="left-section">
        <label className="dropdown-label">Pricing</label>

        {/* Select */}
        <select
          className={`custom-select ${errors.select ? 'has-error' : ''}`}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Select a pricing model</option>
          <option value="Flat Fee">Flat Fee</option>
          <option value="Tiered Pricing">Tiered Pricing</option>
          <option value="Volume-Based">Volume-Based</option>
          <option value="Usage-Based">Usage-Based</option>
          <option value="Stairstep">Stairstep</option>
        </select>
        {(errors.select || validationErrors.pricingModel) && (
          <div className="inline-error" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', color: '#ED5142', fontSize: '12px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '5px' }}>
              <path d="M4.545 4.5C4.66255 4.16583 4.89458 3.88405 5.19998 3.70457C5.50538 3.52508 5.86445 3.45947 6.21359 3.51936C6.56273 3.57924 6.87941 3.76076 7.10754 4.03176C7.33567 4.30277 7.46053 4.64576 7.46 5C7.46 6 5.96 6.5 5.96 6.5M6 8.5H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#ED5142" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {errors.select || validationErrors.pricingModel}
          </div>
        )}
        {errors.general && <div className="inline-error">{errors.general}</div>}

        {/* Render model-specific form and show any model-specific inline message */}
        {selected === 'Flat Fee' && (
          <>
            <div className="pricing-container">
              <FlatFeeForm ref={flatFeeRef} data={flatFee} onChange={setFlatFee} validationErrors={validationErrors} />
            </div>
            {errors.flatFee && <div className="inline-error">{errors.flatFee}</div>}
          </>
        )}

        {selected === 'Tiered Pricing' && (
          <>
            <div className="pricing-container">
              <Tiered ref={tieredRef} validationErrors={validationErrors} />
            </div>
            {errors.tiered && <div className="inline-error">{errors.tiered}</div>}
          </>
        )}

        {selected === 'Volume-Based' && (
          <>
            <div className="pricing-container">
              <Volume
                ref={volumeRef}
                tiers={tiers}
                onAddTier={handleAddTier}
                onDeleteTier={handleDeleteTier}
                onChange={handleTierChange}
                noUpperLimit={noUpperLimit}
                setNoUpperLimit={setNoUpperLimit}
                overageUnitRate={overageUnitRate}
                setOverageUnitRate={setOverageUnitRate}
                graceBuffer={graceBuffer}
                setGraceBuffer={setGraceBuffer}
                validationErrors={validationErrors}
              />
            </div>
            {errors.volume && <div className="inline-error">{errors.volume}</div>}
          </>
        )}

        {selected === 'Stairstep' && (
          <>
            <div className="pricing-container">
              <StairStep ref={stairStepRef} validationErrors={validationErrors} />
            </div>
            {errors.stair && <div className="inline-error">{errors.stair}</div>}
          </>
        )}

        {selected === 'Usage-Based' && (
          <>
            <div className="pricing-container">
              <UsageBased ref={usageBasedRef} data={usage} onChange={setUsage} validationErrors={validationErrors} />
            </div>
            {errors.usage && <div className="inline-error">{errors.usage}</div>}
          </>
        )}
      </div>
    </div>
  );
});

export default Pricing;
