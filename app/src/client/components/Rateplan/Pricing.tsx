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

    const [tiers, setTiers] = useState<Tier[]>([]);
    const [noUpperLimit, setNoUpperLimit] = useState(false);

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
          // When unlimited, overage/grace are irrelevant
          const payload = {
            tiers: tiers.map(t => ({
              usageStart: t.from ?? 0,
              usageEnd: t.isUnlimited || !t.to ? null : t.to,
              unitPrice: t.price ?? 0
            })),
            overageUnitRate: noUpperLimit ? 0 : overageUnitRate,
            graceBuffer: noUpperLimit ? 0 : graceBuffer
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
          price: x.unitPrice ?? null,
          isUnlimited: x.usageEnd == null ? true : false,
        }));
        setTiers(t);
        const lastUnlimited = t.length > 0 ? !!t[t.length - 1].isUnlimited : false;
        setNoUpperLimit(lastUnlimited);
        setRatePlanData('VOLUME_NO_UPPER_LIMIT', lastUnlimited ? 'true' : 'false');

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
          price: x.unitPrice ?? null,
          isUnlimited: x.endRange == null ? true : false,
        }));
        setTiers(t);

        const savedUnlimited = getRatePlanData('TIERED_NO_UPPER_LIMIT');
        const lastUnlimited = t.length > 0 ? !!t[t.length - 1].isUnlimited : false;
        const finalUnlimited = savedUnlimited != null ? savedUnlimited === 'true' : lastUnlimited;
        setNoUpperLimit(finalUnlimited);
        setRatePlanData('TIERED_NO_UPPER_LIMIT', finalUnlimited ? 'true' : 'false');

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
        || (Array.isArray(draftData.stairStepPricings)
            ? draftData.stairStepPricings[draftData.stairStepPricings.length - 1]
            : draftData.stairStepPricings);

      if (stairRaw && Object.keys(stairRaw).length > 0) {
        setSelected('Stairstep');
        const t = (stairRaw.tiers || []).map((x: any) => ({
          from: x.usageStart ?? null,
          to: x.usageEnd ?? null,
          price: x.flatCost ?? null,
          isUnlimited: x.usageEnd == null ? true : false,
        }));
        setTiers(t);
        const lastUnlimited = t.length > 0 ? !!t[t.length - 1].isUnlimited : false;
        setNoUpperLimit(lastUnlimited);

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
      const savedModel = getRatePlanData('PRICING_MODEL');
      const savedStep = getRatePlanData('WIZARD_STEP');
      const hasExistingData = savedModel || savedStep;

      if (isFreshCreation && !hasExistingData) {
        setSelected('');
      } else {
        if (savedModel) {
          setSelected(savedModel);

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
            }
          } else if (savedModel === 'Usage-Based') {
            const savedPerUnit = getRatePlanData('USAGE_PER_UNIT_AMOUNT');
            if (savedPerUnit) {
              setUsage({ perUnitAmount: Number(savedPerUnit) || 0 });
            }
          } else if (savedModel === 'Volume-Based') {
            const savedTiers = getRatePlanData('VOLUME_TIERS');
            const savedOverage = getRatePlanData('VOLUME_OVERAGE');
            const savedGrace = getRatePlanData('VOLUME_GRACE');
            const savedUnlimited = getRatePlanData('VOLUME_NO_UPPER_LIMIT');

            if (savedTiers) {
              try {
                const parsedTiers = JSON.parse(savedTiers);
                if (Array.isArray(parsedTiers) && parsedTiers.length > 0) {
                  const volumeTiers = parsedTiers.map((t: any) => ({
                    from: Number(t.from) || null,
                    to: t.isUnlimited ? null : (Number(t.to) || null),
                    price: Number(t.price) || null,
                    isUnlimited: !!t.isUnlimited
                  }));
                  setTiers(volumeTiers);
                  const lastUnlimited = volumeTiers.length > 0 ? !!volumeTiers[volumeTiers.length - 1].isUnlimited : false;
                  const finalUnlimited = savedUnlimited != null ? savedUnlimited === 'true' : lastUnlimited;
                  setNoUpperLimit(finalUnlimited);
                  setRatePlanData('VOLUME_NO_UPPER_LIMIT', finalUnlimited ? 'true' : 'false');
                }
              } catch (e) {
                console.error('Failed to parse volume tiers:', e);
              }
            }
            if (savedOverage) setOverageUnitRate(Number(savedOverage) || 0);
            if (savedGrace) setGraceBuffer(Number(savedGrace) || 0);
          } else if (savedModel === 'Tiered Pricing') {
            const savedTiers = getRatePlanData('TIERED_TIERS');
            const savedOverage = getRatePlanData('TIERED_OVERAGE');
            const savedGrace = getRatePlanData('TIERED_GRACE');
            const savedUnlimited = getRatePlanData('TIERED_NO_UPPER_LIMIT');

            if (savedTiers) {
              try {
                const parsedTiers = JSON.parse(savedTiers);
                if (Array.isArray(parsedTiers) && parsedTiers.length > 0) {
                  const tieredTiers = parsedTiers.map((t: any) => ({
                    from: Number(t.from) || null,
                    to: t.isUnlimited ? null : (Number(t.to) || null),
                    price: Number(t.price) || null,
                    isUnlimited: !!t.isUnlimited
                  }));
                  setTiers(tieredTiers);

                  const lastUnlimited = tieredTiers.length > 0 ? !!tieredTiers[tieredTiers.length - 1].isUnlimited : false;
                  const finalUnlimited = savedUnlimited != null ? savedUnlimited === 'true' : lastUnlimited;
                  setNoUpperLimit(finalUnlimited);
                  setRatePlanData('TIERED_NO_UPPER_LIMIT', finalUnlimited ? 'true' : 'false');
                }
              } catch (e) {
                console.error('Failed to parse tiered tiers:', e);
              }
            }
            if (savedOverage) setOverageUnitRate(Number(savedOverage) || 0);
            if (savedGrace) setGraceBuffer(Number(savedGrace) || 0);
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
                    to: s.isUnlimited ? null : (Number(s.to) || null),
                    price: Number(s.cost) || null,
                    isUnlimited: !!s.isUnlimited
                  }));
                  setTiers(stairTiers);
                  const lastUnlimited = stairTiers.length > 0 ? !!stairTiers[stairTiers.length - 1].isUnlimited : false;
                  setNoUpperLimit(lastUnlimited);
                }
              } catch (e) {
                console.error('Failed to parse stair tiers:', e);
              }
            }
            if (savedOverage) setOverageUnitRate(Number(savedOverage) || 0);
            if (savedGrace) setGraceBuffer(Number(savedGrace) || 0);
          }
        }
      }
    }, [isFreshCreation]);

    useEffect(() => {
      if (selected) setRatePlanData('PRICING_MODEL', selected);
    }, [selected]);

    const handleAddTier = () => {
      // When adding a new tier, uncheck unlimited since user wants more tiers
      setNoUpperLimit(false);
      
      // Clear unlimited from current last tier if it was unlimited
      const updated = [...tiers];
      if (updated.length > 0 && updated[updated.length - 1].isUnlimited) {
        updated[updated.length - 1].isUnlimited = false;
      }
      
      // Add new tier with unlimited = false
      updated.push({ from: null, to: null, price: null, isUnlimited: false });
      setTiers(updated);
      
      // Update session storage
      const isTiered = selected === 'Tiered Pricing';
      const isVolume = selected === 'Volume-Based';
      
      if (isTiered) setRatePlanData('TIERED_NO_UPPER_LIMIT', 'false');
      if (isVolume) setRatePlanData('VOLUME_NO_UPPER_LIMIT', 'false');
    };

    const handleDeleteTier = (index: number) =>
      setTiers(tiers.filter((_, i) => i !== index));

    const handleTierChange = (index: number, field: keyof Tier, value: string) => {
      const updated = [...tiers];
      const isTiered = selected === 'Tiered Pricing';
      const isVolume = selected === 'Volume-Based';

      if (field === 'isUnlimited') {
        updated[index][field] = value === 'true';
        if (value === 'true') {
          updated[index].to = null; // clear 'to' when unlimited
        }
        if (index === updated.length - 1) {
          const flag = value === 'true';
          setNoUpperLimit(flag);
          if (isTiered) setRatePlanData('TIERED_NO_UPPER_LIMIT', flag ? 'true' : 'false');
          if (isVolume) setRatePlanData('VOLUME_NO_UPPER_LIMIT', flag ? 'true' : 'false');
        }
      } else if (value.trim() === '') {
        (updated[index] as any)[field] = null;
      } else if (field === 'price') {
        (updated[index] as any)[field] = parseFloat(value);
      } else {
        (updated[index] as any)[field] = parseInt(value, 10);
      }

      setTiers(updated);

      const mirror = updated.map(t => ({
        from: t.from,
        to: t.isUnlimited ? null : t.to,
        price: t.price,
        isUnlimited: !!t.isUnlimited
      }));

      if (isTiered) {
        setRatePlanData('TIERED_TIERS', JSON.stringify(mirror));
      } else if (isVolume) {
        setRatePlanData('VOLUME_TIERS', JSON.stringify(mirror));
      }
    };

    const toStr = (n: number | null | undefined) =>
      n == null || Number.isNaN(n) ? '' : String(n);

    const mapStairsToTiers = (s: Stair[]): Tier[] =>
      (s || []).map(r => ({
        from: r.from?.trim() === '' ? null : parseInt(r.from, 10),
        to: r.isUnlimited ? null : (r.to?.trim() === '' ? null : parseInt(r.to, 10)),
        price: r.cost?.trim() === '' ? null : parseFloat(r.cost),
        isUnlimited: r.isUnlimited,
      }));

    // —— filter validationErrors for Volume when unlimited ——
    const volumeValidationErrors = (() => {
      if (selected !== 'Volume-Based') return validationErrors;
      const lastUnlimited = tiers.length > 0 ? !!tiers[tiers.length - 1].isUnlimited : false;
      if (noUpperLimit || lastUnlimited) {
        const copy = { ...validationErrors };
        // prevent “Overage unit rate is required” when unlimited
        delete (copy as any).volumeOverage;
        return copy;
      }
      return validationErrors;
    })();

    return (
      <div className="pricing-container">
        <div className="left-section">
          <label className="dropdown-label">Pricing</label>

          <select
            className={`custom-select ${errors.select ? 'has-error' : ''}`}
            value={selected}
            onChange={e => {
              const v = e.target.value;
              setSelected(v);
              if (v === 'Tiered Pricing' && tiers.length === 0) {
                setTiers([{ from: null, to: null, price: null, isUnlimited: false }]);
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
                    price: toStr(t.price),
                    isUnlimited: !!t.isUnlimited,
                  }))}
                  onAddTier={handleAddTier}
                  onDeleteTier={handleDeleteTier}
                  onChange={handleTierChange}
                  noUpperLimit={noUpperLimit}
                  setNoUpperLimit={(checked) => {
                    setNoUpperLimit(checked);
                    setRatePlanData('TIERED_NO_UPPER_LIMIT', checked ? 'true' : 'false');
                    if (tiers.length > 0) {
                      const updated = [...tiers];
                      const lastIndex = updated.length - 1;
                      updated[lastIndex].isUnlimited = checked;
                      if (checked) updated[lastIndex].to = null;
                      setTiers(updated);
                      const mirror = updated.map(t => ({ from: t.from, to: t.isUnlimited ? null : t.to, price: t.price, isUnlimited: !!t.isUnlimited }));
                      setRatePlanData('TIERED_TIERS', JSON.stringify(mirror));
                    }
                  }}
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
                  setNoUpperLimit={(flag:boolean)=>{
                    setNoUpperLimit(flag);
                    setRatePlanData('VOLUME_NO_UPPER_LIMIT', flag ? 'true' : 'false');

                    // ✅ keep last tier in sync (like Tiered)
                    if (tiers.length > 0) {
                      const updated = [...tiers];
                      const lastIndex = updated.length - 1;
                      updated[lastIndex].isUnlimited = flag;
                      if (flag) updated[lastIndex].to = null;
                      setTiers(updated);

                      const mirror = updated.map(t => ({
                        from: t.from,
                        to: t.isUnlimited ? null : t.to,
                        price: t.price,
                        isUnlimited: !!t.isUnlimited
                      }));
                      setRatePlanData('VOLUME_TIERS', JSON.stringify(mirror));
                    }

                    // and clear persisted overage/grace when enabling unlimited
                    if (flag) {
                      setOverageUnitRate(0);
                      setGraceBuffer(0);
                      setRatePlanData('VOLUME_OVERAGE', '');
                      setRatePlanData('VOLUME_GRACE', '');
                    }
                  }}
                  overageUnitRate={overageUnitRate}
                  setOverageUnitRate={setOverageUnitRate}
                  graceBuffer={graceBuffer}
                  setGraceBuffer={setGraceBuffer}
                  // ❌ don’t surface “volumeOverage” when unlimited
                  validationErrors={volumeValidationErrors}
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
                    const stairTiers = next.map(y => ({ from: y.from, to: y.isUnlimited ? '' : y.to, cost: y.cost, isUnlimited: !!y.isUnlimited }));
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
