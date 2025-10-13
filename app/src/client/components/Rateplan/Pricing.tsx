import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  saveFlatFeePricing,
  saveUsageBasedPricing,
  saveTieredPricing,
  saveVolumePricing,
} from './api';
import { setRatePlanData, getRatePlanData } from './utils/sessionStorage';
import './Pricing.css';

import FlatFeeForm, { FlatFeePayload, FlatFeeHandle } from './FlatFeeForm';
import Tiered, { TieredHandle } from './Tiered';
import StairStep, { StairStepHandle, Stair } from './StairStep';
import UsageBased, { UsagePayload, UsageBasedHandle } from './UsageBased';
import Volume, { VolumeHandle } from './Volume';

interface Tier {
  from: number | null;
  to: number | null;
  price: number | null;
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
  draftData?: any;
  isFreshCreation?: boolean;
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

const Pricing = forwardRef<PricingHandle, PricingProps>(
  ({ ratePlanId, validationErrors = {}, draftData, isFreshCreation = false }, ref) => {
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
      graceBuffer: 0
    });
    const [usage, setUsage] = useState<UsagePayload>({ perUnitAmount: 0 });

    const [overageUnitRate, setOverageUnitRate] = useState(0);
    const [graceBuffer, setGraceBuffer] = useState(0);

    useImperativeHandle(ref, () => ({
      save: async () => await savePricing(),
      getFlatFee: () => flatFee,
      setFlatFee
    }));

    const savePricing = async (): Promise<boolean> => {
      setErrors({});
      if (!selected) return true;

      if (!ratePlanId) {
        setErrors({
          general: 'Pricing can be saved after the rate plan is created in earlier steps.'
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

          if (invalid) return true;
          await saveFlatFeePricing(ratePlanId, flatFee);
        } else if (selected === 'Usage-Based') {
          if (!usage.perUnitAmount || usage.perUnitAmount <= 0 || isNaN(usage.perUnitAmount)) {
            return true;
          }
          await saveUsageBasedPricing(ratePlanId, usage);
        } else if (selected === 'Volume-Based') {
          const payload = {
            tiers: tiers.map(t => ({
              usageStart: t.from ?? 0,
              usageEnd: t.isUnlimited || !t.to ? null : t.to,
              unitPrice: t.price ?? 0
            })),
            overageUnitRate,
            graceBuffer
          };
          await saveVolumePricing(ratePlanId, payload);
        } else if (selected === 'Tiered Pricing') {
          if (tieredRef.current) {
            await tieredRef.current.save(ratePlanId);
          } else {
            return true;
          }
        } else if (selected === 'Stairstep') {
          if (stairStepRef.current) {
            await stairStepRef.current.save(ratePlanId);
          } else {
            return true;
          }
        }

        setErrors({});
        return true;
      } catch (err: any) {
        console.error('Failed to save pricing', err);
        if (err.response?.status === 500) return true;
        setErrors({ general: 'Failed to save pricing. Please try again.' });
        return false;
      }
    };

    const [tiers, setTiers] = useState<Tier[]>([]);
    const [noUpperLimit, setNoUpperLimit] = useState(false);

    // ---------- Draft hydration ----------
    useEffect(() => {
      if (!draftData) return;

      // Usage
      const usageObj =
        (Array.isArray(draftData.usageBasedPricing)
          ? draftData.usageBasedPricing[0]
          : draftData.usageBasedPricing) ||
        (draftData.perUnitAmount != null
          ? { perUnitAmount: draftData.perUnitAmount }
          : null);

      if (usageObj && usageObj.perUnitAmount != null) {
        setSelected('Usage-Based');
        const amt = Number(usageObj.perUnitAmount) || 0;
        setUsage({ perUnitAmount: amt });
        setRatePlanData('PRICING_MODEL', 'Usage-Based');
        setRatePlanData('USAGE_PER_UNIT_AMOUNT', String(amt));
        return;
      }

      // Flat Fee
      if (
        draftData.flatFeeAmount != null &&
        !draftData.volumePricing &&
        !draftData.tieredPricing &&
        !draftData.stairStepPricing
      ) {
        setSelected('Flat Fee');
        const next = {
          flatFeeAmount: draftData.flatFeeAmount || 0,
          numberOfApiCalls: draftData.numberOfApiCalls || 0,
          overageUnitRate: draftData.overageUnitRate || 0,
          graceBuffer: draftData.graceBuffer || 0
        };
        setFlatFee(next);
        setRatePlanData('PRICING_MODEL', 'Flat Fee');
        setRatePlanData('FLAT_FEE_AMOUNT', String(next.flatFeeAmount || ''));
        setRatePlanData('FLAT_FEE_API_CALLS', String(next.numberOfApiCalls || ''));
        setRatePlanData('FLAT_FEE_OVERAGE', String(next.overageUnitRate || ''));
        setRatePlanData('FLAT_FEE_GRACE', String(next.graceBuffer || ''));
        return;
      }

      // Volume
      const volumeObj = Array.isArray(draftData.volumePricing)
        ? draftData.volumePricing[0]
        : draftData.volumePricing;
      if (volumeObj && Object.keys(volumeObj).length > 0) {
        setSelected('Volume-Based');
        const t = (volumeObj.tiers || []).map((x: any) => ({
          from: x.usageStart ?? null,
          to: x.usageEnd ?? null,
          price: x.unitPrice ?? null
        }));
        setTiers(t);
        setOverageUnitRate(volumeObj.overageUnitRate || 0);
        setGraceBuffer(volumeObj.graceBuffer || 0);
        setRatePlanData('PRICING_MODEL', 'Volume-Based');
        setRatePlanData('VOLUME_TIERS', JSON.stringify(t));
        setRatePlanData('VOLUME_OVERAGE', String(volumeObj.overageUnitRate || 0));
        setRatePlanData('VOLUME_GRACE', String(volumeObj.graceBuffer || 0));
        return;
      }

      // Tiered
      const tieredObj = Array.isArray(draftData.tieredPricing)
        ? draftData.tieredPricing[0]
        : draftData.tieredPricing;
      if (tieredObj && Object.keys(tieredObj).length > 0) {
        setSelected('Tiered Pricing');
        const t = (tieredObj.tiers || []).map((x: any) => ({
          from: x.startRange ?? null,
          to: x.endRange ?? null,
          price: x.unitPrice ?? null
        }));
        setTiers(t);
        setOverageUnitRate(tieredObj.overageUnitRate || 0);
        setGraceBuffer(tieredObj.graceBuffer || 0);
        setRatePlanData('PRICING_MODEL', 'Tiered Pricing');
        setRatePlanData('TIERED_TIERS', JSON.stringify(t));
        setRatePlanData('TIERED_OVERAGE', String(tieredObj.overageUnitRate || 0));
        setRatePlanData('TIERED_GRACE', String(tieredObj.graceBuffer || 0));
        return;
      }

      // Stairstep (supports array)
      const stairRaw = Array.isArray(draftData.stairStepPricing)
        ? draftData.stairStepPricing[draftData.stairStepPricing.length - 1]
        : draftData.stairStepPricing
        // also support the list style: stairStepPricings from your payload
        || (Array.isArray(draftData.stairStepPricings)
            ? draftData.stairStepPricings[draftData.stairStepPricings.length - 1]
            : draftData.stairStepPricings);

      if (stairRaw && Object.keys(stairRaw).length > 0) {
        setSelected('Stairstep');
        const t = (stairRaw.tiers || []).map((x: any) => ({
          from: x.usageStart ?? null,
          to: x.usageEnd ?? null,
          price: x.flatCost ?? null
        }));
        setTiers(t);
        setOverageUnitRate(stairRaw.overageUnitRate || 0);
        setGraceBuffer(stairRaw.graceBuffer || 0);
        setRatePlanData('PRICING_MODEL', 'Stairstep');
        const stairTiers = t.map((y: Tier) => ({
          from: String(y.from ?? ''),
          to: String(y.to ?? ''),
          cost: String(y.price ?? ''),
        }));
        setRatePlanData('STAIR_TIERS', JSON.stringify(stairTiers));
        setRatePlanData('STAIR_OVERAGE', String(stairRaw.overageUnitRate || 0));
        setRatePlanData('STAIR_GRACE', String(stairRaw.graceBuffer || 0));
      }
    }, [draftData]);

    // Initialize from session storage on mount
    useEffect(() => {
      // Check if there's any existing session data to determine if this is truly fresh
      const savedModel = getRatePlanData('PRICING_MODEL');
      const savedStep = getRatePlanData('WIZARD_STEP');
      const hasExistingData = savedModel || savedStep;
      
      console.log('📋 Pricing component mounted. Saved model:', savedModel, 'Saved step:', savedStep, 'Has existing data:', hasExistingData);
      
      if (isFreshCreation && !hasExistingData) {
        console.log('🆆 True fresh creation - clearing pricing model');
        setSelected('');
      } else {
        // Load from session storage (either resuming or navigating between steps)
        console.log('📋 Loading saved pricing model from session:', savedModel);
        
        if (savedModel) {
          setSelected(savedModel);
          
          // Also load the corresponding form data
          if (savedModel === 'Flat Fee') {
            const savedAmount = getRatePlanData('FLAT_FEE_AMOUNT');
            const savedCalls = getRatePlanData('FLAT_FEE_API_CALLS');
            const savedOverage = getRatePlanData('FLAT_FEE_OVERAGE');
            const savedGrace = getRatePlanData('FLAT_FEE_GRACE');
            
            if (savedAmount || savedCalls || savedOverage) {
              const restoredData = {
                flatFeeAmount: Number(savedAmount) || 0,
                numberOfApiCalls: Number(savedCalls) || 0,
                overageUnitRate: Number(savedOverage) || 0,
                graceBuffer: Number(savedGrace) || 0
              };
              setFlatFee(restoredData);
              console.log('💰 Restored Flat Fee data:', restoredData);
              
              // Force update the ref if it exists
              if (flatFeeRef.current) {
                console.log('🔄 Updating FlatFeeForm ref with restored data');
              }
            }
          } else if (savedModel === 'Usage-Based') {
            const savedPerUnit = getRatePlanData('USAGE_PER_UNIT_AMOUNT');
            if (savedPerUnit) {
              setUsage({ perUnitAmount: Number(savedPerUnit) || 0 });
              console.log('📊 Restored Usage-Based data:', savedPerUnit);
            }
          } else if (savedModel === 'Volume-Based') {
            const savedTiers = getRatePlanData('VOLUME_TIERS');
            const savedOverage = getRatePlanData('VOLUME_OVERAGE');
            const savedGrace = getRatePlanData('VOLUME_GRACE');
            
            if (savedTiers) {
              try {
                const parsedTiers = JSON.parse(savedTiers);
                if (Array.isArray(parsedTiers) && parsedTiers.length > 0) {
                  const volumeTiers = parsedTiers.map((t: any) => ({
                    from: Number(t.from) || null,
                    to: Number(t.to) || null,
                    price: Number(t.price) || null,
                    isUnlimited: t.isUnlimited || false
                  }));
                  setTiers(volumeTiers);
                  console.log('📊 Restored Volume tiers:', volumeTiers);
                }
              } catch (e) {
                console.error('Failed to parse volume tiers:', e);
              }
            }
            
            if (savedOverage) {
              setOverageUnitRate(Number(savedOverage) || 0);
              console.log('📊 Restored Volume overage:', savedOverage);
            }
            
            if (savedGrace) {
              const graceValue = Number(savedGrace) || 0;
              setGraceBuffer(graceValue);
              console.log('📊 Restored Volume grace buffer:', savedGrace, '-> parsed as:', graceValue);
            } else {
              console.log('⚠️ No saved grace buffer found for Volume pricing');
            }
          } else if (savedModel === 'Tiered Pricing') {
            const savedTiers = getRatePlanData('TIERED_TIERS');
            const savedOverage = getRatePlanData('TIERED_OVERAGE');
            const savedGrace = getRatePlanData('TIERED_GRACE');
            
            if (savedTiers) {
              try {
                const parsedTiers = JSON.parse(savedTiers);
                if (Array.isArray(parsedTiers) && parsedTiers.length > 0) {
                  const tieredTiers = parsedTiers.map((t: any) => ({
                    from: Number(t.from) || null,
                    to: Number(t.to) || null,
                    price: Number(t.price) || null,
                    isUnlimited: t.isUnlimited || false
                  }));
                  setTiers(tieredTiers);
                  console.log('🎯 Restored Tiered tiers:', tieredTiers);
                }
              } catch (e) {
                console.error('Failed to parse tiered tiers:', e);
              }
            }
            
            if (savedOverage) {
              setOverageUnitRate(Number(savedOverage) || 0);
              console.log('🎯 Restored Tiered overage:', savedOverage);
            }
            
            if (savedGrace) {
              setGraceBuffer(Number(savedGrace) || 0);
              console.log('🎯 Restored Tiered grace buffer:', savedGrace);
            }
          } else if (savedModel === 'Stairstep') {
            const savedStairs = getRatePlanData('STAIR_TIERS');
            const savedOverage = getRatePlanData('STAIR_OVERAGE');
            const savedGrace = getRatePlanData('STAIR_GRACE');
            
            if (savedStairs) {
              try {
                const parsedStairs = JSON.parse(savedStairs);
                if (Array.isArray(parsedStairs) && parsedStairs.length > 0) {
                  const stairTiers = parsedStairs.map((s: any) => ({
                    from: Number(s.from) || null,
                    to: Number(s.to) || null,
                    price: Number(s.cost) || null, // Note: StairStep uses 'cost' field
                    isUnlimited: s.isUnlimited || false
                  }));
                  setTiers(stairTiers);
                  console.log('🎡 Restored StairStep tiers:', stairTiers);
                }
              } catch (e) {
                console.error('Failed to parse stair tiers:', e);
              }
            }
            
            if (savedOverage) {
              setOverageUnitRate(Number(savedOverage) || 0);
              console.log('🎡 Restored StairStep overage:', savedOverage);
            }
            
            if (savedGrace) {
              setGraceBuffer(Number(savedGrace) || 0);
              console.log('🎡 Restored StairStep grace buffer:', savedGrace);
            }
          }
        } else {
          console.log('⚠️ No saved pricing model found - keeping empty selection');
        }
      }
    }, [isFreshCreation]); // Re-run when isFreshCreation changes

    useEffect(() => {
      if (selected) setRatePlanData('PRICING_MODEL', selected);
    }, [selected]);

    const handleAddTier = () =>
      setTiers([...tiers, { from: null, to: null, price: null, isUnlimited: false }]);

    const handleDeleteTier = (index: number) =>
      setTiers(tiers.filter((_, i) => i !== index));

    const handleTierChange = (index: number, field: keyof Tier, value: string) => {
      const updated = [...tiers];
      if (field === 'isUnlimited') {
        updated[index][field] = value === 'true';
      } else if (value.trim() === '') {
        (updated[index] as any)[field] = null;
      } else if (field === 'price') {
        (updated[index] as any)[field] = parseFloat(value);
      } else {
        (updated[index] as any)[field] = parseInt(value, 10);
      }
      setTiers(updated);
    };

    const toStr = (n: number | null | undefined) =>
      n == null || Number.isNaN(n) ? '' : String(n);

    // mapper to convert Stair (string fields) from child to our numeric Tier[]
    const mapStairsToTiers = (s: Stair[]): Tier[] =>
      (s || []).map(r => ({
        from: r.from?.trim() === '' ? null : parseInt(r.from, 10),
        to: r.isUnlimited ? null : (r.to?.trim() === '' ? null : parseInt(r.to, 10)),
        price: r.cost?.trim() === '' ? null : parseFloat(r.cost),
        isUnlimited: r.isUnlimited,
      }));

    return (
      <div className="pricing-container">
        <div className="left-section">
          <label className="dropdown-label">Pricing</label>

          <select
            className={`custom-select ${errors.select ? 'has-error' : ''}`}
            value={selected}
            onChange={e => {
              const v = e.target.value;
              console.log('📝 Pricing model selected:', v);
              setSelected(v);
              if (v === 'Tiered Pricing' && tiers.length === 0) {
                setTiers([{ from: null, to: null, price: null }]);
              }
            }}
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
              {errors.select || validationErrors.pricingModel}
            </div>
          )}

          {errors.general && <div className="inline-error">{errors.general}</div>}

          {selected === 'Flat Fee' && (
            <>
              <div className="pricing-container">
                <FlatFeeForm
                  ref={flatFeeRef}
                  data={flatFee}
                  onChange={setFlatFee}
                  validationErrors={validationErrors}
                />
              </div>
              {errors.flatFee && <div className="inline-error">{errors.flatFee}</div>}
            </>
          )}

          {selected === 'Tiered Pricing' && (
            <>
              <div className="pricing-container">
                <Tiered
                  ref={tieredRef}
                  tiers={tiers.map(t => ({
                    from: toStr(t.from),
                    to: toStr(t.to),
                    price: toStr(t.price)
                  }))}
                  onAddTier={handleAddTier}
                  onDeleteTier={handleDeleteTier}
                  onChange={handleTierChange}
                  noUpperLimit={noUpperLimit}
                  setNoUpperLimit={setNoUpperLimit}
                  validationErrors={validationErrors}
                  overageCharge={String(overageUnitRate || '')}
                  graceBuffer={String(graceBuffer || '')}
                />
              </div>
              {errors.tiered && <div className="inline-error">{errors.tiered}</div>}
            </>
          )}

          {selected === 'Volume-Based' && (
            <>
              <div className="pricing-container">
                <Volume
                  ref={volumeRef}
                  tiers={tiers as any}
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
                <StairStep
                  ref={stairStepRef}
                  validationErrors={validationErrors}
                  stairs={tiers.map(t => ({
                    from: toStr(t.from),
                    to: toStr(t.to),
                    cost: toStr(t.price),
                    isUnlimited: !!t.isUnlimited,
                  }))}
                  onStairsChange={(next) => {
                    setTiers(mapStairsToTiers(next));
                    // also mirror to session for validation elsewhere
                    const stairTiers = next.map(y => ({ from: y.from, to: y.isUnlimited ? '' : y.to, cost: y.cost }));
                    setRatePlanData('STAIR_TIERS', JSON.stringify(stairTiers));
                  }}
                  overageCharge={String(overageUnitRate || '')}
                  onOverageChange={(v) => {
                    const n = (v ?? '').toString().trim();
                    setOverageUnitRate(n === '' ? 0 : Number(n));
                    setRatePlanData('STAIR_OVERAGE', n);
                  }}
                  graceBuffer={String(graceBuffer || '')}
                  onGraceBufferChange={(v) => {
                    const n = (v ?? '').toString().trim();
                    setGraceBuffer(n === '' ? 0 : Number(n));
                    setRatePlanData('STAIR_GRACE', n);
                  }}
                />
              </div>
              {errors.stair && <div className="inline-error">{errors.stair}</div>}
            </>
          )}

          {selected === 'Usage-Based' && (
            <>
              <div className="pricing-container">
                <UsageBased
                  ref={usageBasedRef}
                  data={usage}
                  onChange={setUsage}
                  validationErrors={validationErrors}
                />
              </div>
              {errors.usage && <div className="inline-error">{errors.usage}</div>}
            </>
          )}
        </div>
      </div>
    );
  }
);

export default Pricing;
