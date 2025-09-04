import React, { useState } from 'react';
import {
  saveFlatFeePricing,
  saveUsageBasedPricing,
  saveVolumePricing,
  saveTieredPricing,
  saveStairStepPricing,
} from './api';
import './Pricing.css';
import FlatFeeForm, { FlatFeePayload } from './FlatFeeForm';
import Tiered from './Tiered';
import StairStep from './StairStep';
import UsageBased, { UsagePayload } from './UsageBased';
import Volume from './Volume';

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
interface PricingProps { ratePlanId: number | null; }

type PricingErrors = {
  general?: string;
  select?: string;
  flatFee?: string;
  usage?: string;
  volume?: string;
  tiered?: string;
  stair?: string;
};

const Pricing = React.forwardRef<PricingHandle, PricingProps>(({ ratePlanId }, ref) => {
  const [selected, setSelected] = useState('');
  const [errors, setErrors] = useState<PricingErrors>({});

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
    save: savePricing,
    getFlatFee: () => flatFee,
    setFlatFee,
  }));

  const savePricing = async (): Promise<boolean> => {
    // clear previous messages
    setErrors({});

    // NOTE: per request, no browser/alert popups.
    if (!selected) {
      setErrors({ select: 'Please select a pricing model.' });
      return false;
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
          setErrors({
            flatFee:
              'Please complete all flat-fee fields with valid values before saving.',
          });
          return false;
        }

        localStorage.setItem('flatFeeAmount', flatFeeAmount.toString());
        localStorage.setItem('flatFeeApiCalls', numberOfApiCalls.toString());
        localStorage.setItem('flatFeeOverage', overageUnitRate.toString());
        localStorage.setItem('flatFeeGrace', (graceBuffer || 0).toString());

        await saveFlatFeePricing(ratePlanId, flatFee);
      } else if (selected === 'Usage-Based') {
        if (!usage.perUnitAmount || usage.perUnitAmount <= 0 || isNaN(usage.perUnitAmount)) {
          setErrors({ usage: 'Enter a valid per-unit amount.' });
          return false;
        }
        localStorage.setItem('usagePerUnitAmount', usage.perUnitAmount.toString());
        await saveUsageBasedPricing(ratePlanId, usage);
      } else if (selected === 'Volume-Based') {
        const validTiers = tiers.filter((t) => t.price || t.from || t.to);
        if (validTiers.length === 0) {
          setErrors({ volume: 'Add at least one usage tier.' });
          return false;
        }
        if (!noUpperLimit && (!overageUnitRate || overageUnitRate <= 0 || isNaN(overageUnitRate))) {
          setErrors({ volume: 'Enter a valid overage charge.' });
          return false;
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
        await saveVolumePricing(ratePlanId, payload);
      } else if (selected === 'Tiered Pricing') {
        const storedTiers = JSON.parse(localStorage.getItem('tieredTiers') || '[]');
        const overage = parseFloat(localStorage.getItem('tieredOverage') || '0');
        const grace = parseFloat(localStorage.getItem('tieredGrace') || '0');

        const validTiers = (storedTiers as any[]).filter((t) => t.price || t.from || t.to);
        if (validTiers.length === 0) {
          setErrors({ tiered: 'Add at least one tier.' });
          return false;
        }
        const hasUnlimitedTier = (storedTiers as any[]).some((t) => t.isUnlimited);
        if (!hasUnlimitedTier && (!overage || overage <= 0 || isNaN(overage))) {
          setErrors({
            tiered:
              'Enter a valid overage charge, or add an Unlimited final tier.',
          });
          return false;
        }

        const payload = {
          tiers: validTiers.map((t) => ({
            startRange: parseInt(t.from, 10) || 0,
            endRange: t.isUnlimited || t.to === '' ? null : parseInt(t.to, 10) || 0,
            unitPrice: parseFloat(t.price) || 0,
          })),
          overageUnitRate: overage,
          graceBuffer: grace,
        };
        await saveTieredPricing(ratePlanId, payload);
      } else if (selected === 'Stairstep') {
        const storedStairs = JSON.parse(localStorage.getItem('stairTiers') || '[]');
        const overage = parseFloat(localStorage.getItem('stairOverage') || '0');
        const grace = parseFloat(localStorage.getItem('stairGrace') || '0');

        const validStairs = (storedStairs as any[]).filter((s) => s.cost || s.from || s.to);
        if (validStairs.length === 0) {
          setErrors({ stair: 'Add at least one stair.' });
          return false;
        }
        const hasUnlimited = (storedStairs as any[]).some((s) => s.isUnlimited);
        if (!hasUnlimited && (!overage || overage <= 0 || isNaN(overage))) {
          setErrors({
            stair:
              'Enter a valid overage charge, or add an Unlimited final stair.',
          });
          return false;
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
        await saveStairStepPricing(ratePlanId, payload);
      }

      // success – clear any general message
      setErrors({});
      return true;
    } catch (err) {
      console.error('Failed to save pricing', err);
      setErrors({ general: 'Failed to save pricing. Please try again.' });
      return false;
    }
  };

  const [tiers, setTiers] = useState<Tier[]>([]);
  const [noUpperLimit, setNoUpperLimit] = useState(false);

  React.useEffect(() => {
    if (selected) localStorage.setItem('pricingModel', selected);
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
          onChange={(e) => {
            setSelected(e.target.value);
            setErrors((prev) => ({ ...prev, select: undefined, general: undefined }));
          }}
        >
          <option value="" disabled hidden>
            Select a pricing model
          </option>
          <option value="Flat Fee">Flat Fee</option>
          <option value="Tiered Pricing">Tiered Pricing</option>
          <option value="Volume-Based">Volume-Based</option>
          <option value="Usage-Based">Usage-Based</option>
          <option value="Stairstep">Stairstep</option>
        </select>
        {errors.select && <div className="inline-error">{errors.select}</div>}
        {errors.general && <div className="inline-error">{errors.general}</div>}

        {/* Render model-specific form and show any model-specific inline message */}
        {selected === 'Flat Fee' && (
          <>
            <div className="pricing-container">
              <FlatFeeForm data={flatFee} onChange={setFlatFee} />
            </div>
            {errors.flatFee && <div className="inline-error">{errors.flatFee}</div>}
          </>
        )}

        {selected === 'Tiered Pricing' && (
          <>
            <div className="pricing-container">
              <Tiered />
            </div>
            {errors.tiered && <div className="inline-error">{errors.tiered}</div>}
          </>
        )}

        {selected === 'Volume-Based' && (
          <>
            <div className="pricing-container">
              <Volume
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
              />
            </div>
            {errors.volume && <div className="inline-error">{errors.volume}</div>}
          </>
        )}

        {selected === 'Stairstep' && (
          <>
            <div className="pricing-container">
              <StairStep />
            </div>
            {errors.stair && <div className="inline-error">{errors.stair}</div>}
          </>
        )}

        {selected === 'Usage-Based' && (
          <>
            <div className="pricing-container">
              <UsageBased data={usage} onChange={setUsage} />
            </div>
            {errors.usage && <div className="inline-error">{errors.usage}</div>}
          </>
        )}
      </div>
    </div>
  );
});

export default Pricing;
