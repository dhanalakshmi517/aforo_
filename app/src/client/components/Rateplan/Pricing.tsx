import React, { useState } from 'react';
import { saveFlatFeePricing, saveUsageBasedPricing, saveVolumePricing, saveTieredPricing, saveStairStepPricing } from './api';
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

export interface PricingHandle { save: () => Promise<boolean>; }
interface PricingProps { ratePlanId: number | null; }

const Pricing = React.forwardRef<PricingHandle, PricingProps>(({ ratePlanId }, ref) => {
  // local state for dropdown selection and payloads
  const [selected, setSelected] = useState('');
  const [flatFee, setFlatFee] = useState<FlatFeePayload>({
    flatFeeAmount: 0,
    numberOfApiCalls: 0,
    overageUnitRate: 0,
    graceBuffer: 0,
  });
  const [usage, setUsage] = useState<UsagePayload>({ perUnitAmount: 0 });
  const [overageUnitRate, setOverageUnitRate] = useState(0);
  const [graceBuffer, setGraceBuffer] = useState(0);
    // expose save via ref
  React.useImperativeHandle(ref, () => ({ save: savePricing }));

  // helper to persist chosen model across sessions if desired (optional)
  // Save handler
  const savePricing = async (): Promise<boolean> => {
    if (!ratePlanId) {
      alert('Rate plan not yet created');
      return false;
    }
    if (!selected) {
      alert('Please select a pricing model.');
      return false;
    }
    try {
      if (selected === 'Flat Fee') {
        // Basic validation for Flat Fee model
        const { flatFeeAmount, numberOfApiCalls, overageUnitRate } = flatFee;
        if (
          !flatFeeAmount || flatFeeAmount <= 0 ||
          !numberOfApiCalls || numberOfApiCalls <= 0 ||
          !overageUnitRate || overageUnitRate <= 0 ||
          isNaN(flatFeeAmount) || isNaN(numberOfApiCalls) || isNaN(overageUnitRate)
        ) {
          alert('Please complete all flat-fee fields before saving.');
          return false;
        }
        console.log('Flat-fee pricing payload', flatFee);
        await saveFlatFeePricing(ratePlanId, flatFee);
        alert('Flat-fee pricing saved');
      } else if (selected === 'Usage-Based') {
        if (!usage.perUnitAmount || usage.perUnitAmount <= 0 || isNaN(usage.perUnitAmount)) {
          alert('Please enter a valid per-unit amount.');
          return false;
        }
        console.log('Usage-based pricing payload', usage);
        await saveUsageBasedPricing(ratePlanId, usage);
        alert('Usage-based pricing saved');
      } else if (selected === 'Volume-Based') {
        const validTiers = tiers.filter(t => (t.price || t.from || t.to));
        if (validTiers.length === 0) {
          alert('Please enter at least one usage tier.');
          return false;
        }
        if (!noUpperLimit && (!overageUnitRate || overageUnitRate <= 0 || isNaN(overageUnitRate))) {
          alert('Please enter a valid overage charge.');
          return false;
        }
        const payload = {
          tiers: validTiers.map(t => ({
            usageStart: t.from,
            usageEnd: t.isUnlimited || t.to === 0 ? null : t.to,
            unitPrice: t.price
          })),
          overageUnitRate,
          graceBuffer
        };
        console.log('Volume-based pricing payload', payload);
        await saveVolumePricing(ratePlanId, payload);
        alert('Volume-based pricing saved');
      } else if (selected === 'Tiered Pricing') {
        // retrieve data stored by Tiered component
        const storedTiers = JSON.parse(localStorage.getItem('tieredTiers') || '[]');
        const overage = parseFloat(localStorage.getItem('tieredOverage') || '0');
        const grace = parseFloat(localStorage.getItem('tieredGrace') || '0');
        const validTiers = (storedTiers as any[]).filter((t) => t.price || t.from || t.to);
        if (validTiers.length === 0) {
          alert('Please enter at least one tier.');
          return false;
        }
        const hasUnlimitedTier = (storedTiers as any[]).some((t) => t.isUnlimited);
        if (!hasUnlimitedTier && (!overage || overage <= 0 || isNaN(overage))) {
          alert('Please enter a valid overage charge.');
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
        console.log('Tiered pricing payload', payload);
        await saveTieredPricing(ratePlanId, payload);
        alert('Tiered pricing saved');
      } else if (selected === 'Stairstep') {
        const storedStairs = JSON.parse(localStorage.getItem('stairTiers') || '[]');
        const overage = parseFloat(localStorage.getItem('stairOverage') || '0');
        const grace = parseFloat(localStorage.getItem('stairGrace') || '0');
        const validStairs = (storedStairs as any[]).filter(s => s.cost || s.from || s.to);
        if (validStairs.length === 0) {
          alert('Please enter at least one stair.');
          return false;
        }
        const hasUnlimited = (storedStairs as any[]).some(s => s.isUnlimited);
        if (!hasUnlimited && (!overage || overage <= 0 || isNaN(overage))) {
          alert('Please enter a valid overage charge.');
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
        console.log('Stairstep pricing payload', payload);
        await saveStairStepPricing(ratePlanId, payload);
        alert('Stairstep pricing saved');
      } else {
        alert('Save not implemented for this pricing model');
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to save pricing', err);
      alert('Failed to save pricing');
      return false;
    }
  };
  const [tiers, setTiers] = useState<Tier[]>([
    { from: 0, to: 0, price: 0, isUnlimited: false },
  ]);
  const [noUpperLimit, setNoUpperLimit] = useState(false);

  const handleAddTier = () => {
    setTiers([...tiers, { from: 0, to: 0, price: 0, isUnlimited: false }]);
  };

  const handleDeleteTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, field: keyof Tier, value: string) => {
    const updated = [...tiers];
    if (field === 'price') {
      updated[index][field] = parseFloat(value) || 0;
    } else if (field === 'isUnlimited') {
      updated[index][field] = value === 'true';
    } else {
      updated[index][field] = parseInt(value) || 0;
    }
    setTiers(updated);
  };

  return (
    <div className="pricing-container">
      <div className="left-section">
        <label className="dropdown-label">Pricing</label>
        <select
          className="custom-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
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

        {/* Render form and card based on selection */}
        {selected === 'Flat Fee' && (
          <div className="pricing-container">
            <FlatFeeForm data={flatFee} onChange={setFlatFee} />
          </div>
        )}

        {selected === 'Tiered Pricing' && (
          <div className="pricing-container">
            <Tiered />
          </div>
        )}

        {selected === 'Volume-Based' && (
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
        )}

        {selected === 'Stairstep' && (
          <div className="pricing-container">
            <StairStep />
          </div>
        )}

        {selected === 'Usage-Based' && (
          <div className="pricing-container">
            <UsageBased data={usage} onChange={setUsage} />
          </div>
        )}

      </div>
    </div>
  );
});

export default Pricing;
