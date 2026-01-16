import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  saveFlatFeePricing,
  saveUsageBasedPricing,
  saveTieredPricing,
  saveVolumePricing,
} from './api';
import { setRatePlanData, getRatePlanData } from './utils/sessionStorage';
import './Pricing.css';
import { SelectField } from '../componenetsss/Inputs';

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
  onClearError?: (key: string) => void;
  draftData?: any;
  isFreshCreation?: boolean;
  locked?: boolean;
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
  ({ ratePlanId, validationErrors = {}, onClearError, draftData, isFreshCreation = false, locked = false }, ref) => {
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
      console.log('💾 Pricing: savePricing called with selected:', selected);

      // Always persist the pricing model selection to session storage
      if (selected) {
        console.log('💾 Pricing: Ensuring pricing model is persisted:', selected);
        setRatePlanData('PRICING_MODEL', selected);
      }

      if (!selected) {
        console.log('⚠️ Pricing: No pricing model selected, returning early');
        return true;
      }

      if (!ratePlanId) {
        console.log('❌ Pricing: No ratePlanId available');
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
      if (!draftData) {
        console.log('🔍 Pricing: No draft data provided');
        return;
      }

      console.log('🔍 Pricing: Processing draft data:', draftData);
      console.log('🔍 Pricing: Draft data keys:', Object.keys(draftData));
      console.log('🔍 Pricing: pricingModelName:', draftData.pricingModelName);
      console.log('🔍 Pricing: pricingModelKey:', draftData.pricingModelKey);

      // PRIORITY 1: Check session storage first (user's most recent selection)
      const sessionPricingModel = getRatePlanData('PRICING_MODEL');
      if (sessionPricingModel) {
        console.log('🎯 Pricing: Using session storage pricing model (user selection):', sessionPricingModel);
        setSelected(sessionPricingModel);

        // Load appropriate data based on session selection, not backend detection
        if (sessionPricingModel === 'Usage-Based') {
          const usageObj = (Array.isArray(draftData.usageBasedPricing)
            ? draftData.usageBasedPricing[0]
            : draftData.usageBasedPricing) ||
            (draftData.perUnitAmount != null
              ? { perUnitAmount: draftData.perUnitAmount }
              : null);
          if (usageObj && usageObj.perUnitAmount != null) {
            const amt = Number(usageObj.perUnitAmount) || 0;
            setUsage({ perUnitAmount: amt });
            setRatePlanData('USAGE_PER_UNIT_AMOUNT', String(amt));
          }
        } else if (sessionPricingModel === 'Flat Fee') {
          if (draftData.flatFeeAmount != null) {
            const next = {
              flatFeeAmount: draftData.flatFeeAmount || 0,
              numberOfApiCalls: draftData.numberOfApiCalls || 0,
              overageUnitRate: draftData.overageUnitRate || 0,
              graceBuffer: draftData.graceBuffer || 0
            };
            setFlatFee(next);
            setRatePlanData('FLAT_FEE_AMOUNT', String(next.flatFeeAmount || ''));
            setRatePlanData('FLAT_FEE_API_CALLS', String(next.numberOfApiCalls || ''));
            setRatePlanData('FLAT_FEE_OVERAGE', String(next.overageUnitRate || ''));
            setRatePlanData('FLAT_FEE_GRACE', String(next.graceBuffer || ''));
          }
        }
        // For other pricing models, continue with existing logic below
        return;
      }

      // PRIORITY 2: Check backend pricingModelName if no session storage
      if (draftData.pricingModelName) {
        console.log('🎯 Pricing: Found direct pricing model name from backend:', draftData.pricingModelName);
        setSelected(draftData.pricingModelName);
        setRatePlanData('PRICING_MODEL', draftData.pricingModelName);
      }

      // PRIORITY 3: Auto-detect from backend data structure (fallback)
      // Usage
      const usageObj =
        (Array.isArray(draftData.usageBasedPricing)
          ? draftData.usageBasedPricing[0]
          : draftData.usageBasedPricing) ||
        (draftData.perUnitAmount != null
          ? { perUnitAmount: draftData.perUnitAmount }
          : null);

      if (usageObj && usageObj.perUnitAmount != null) {
        console.log('🎯 Pricing: Auto-detected Usage-Based pricing in draft data:', usageObj);
        if (!sessionPricingModel) setSelected('Usage-Based');
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
        console.log('🎯 Pricing: Auto-detected Flat Fee pricing in draft data, amount:', draftData.flatFeeAmount);
        if (!sessionPricingModel) setSelected('Flat Fee');
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
          isUnlimited: !!y.isUnlimited  // ← Added missing isUnlimited property
        }));
        setRatePlanData('STAIR_TIERS', JSON.stringify(stairTiers));
        setRatePlanData('STAIR_OVERAGE', String(stairRaw.overageUnitRate || 0));
        setRatePlanData('STAIR_GRACE', String(stairRaw.graceBuffer || 0));
        setRatePlanData('STAIR_NO_UPPER_LIMIT', lastUnlimited ? 'true' : 'false');  // ← Added missing unlimited flag
      } else {
        console.log('⚠️ Pricing: No recognizable pricing model found in draft data');
        console.log('🔍 Pricing: Available fields:', {
          flatFeeAmount: draftData.flatFeeAmount,
          usageBasedPricing: draftData.usageBasedPricing,
          volumePricing: draftData.volumePricing,
          tieredPricing: draftData.tieredPricing,
          stairStepPricing: draftData.stairStepPricing,
          perUnitAmount: draftData.perUnitAmount
        });
      }
    }, [draftData]);

    // Initialize from session storage on mount (only if no draftData)
    useEffect(() => {
      console.log('🔧 Pricing component mounted - checking session storage...');
      const savedModel = getRatePlanData('PRICING_MODEL');
      const savedStep = getRatePlanData('WIZARD_STEP');
      console.log('📖 Saved pricing model from session:', savedModel);
      console.log('📖 Saved wizard step from session:', savedStep);
      console.log('📖 Draft data exists:', !!draftData);
      const hasExistingData = savedModel || savedStep;

      // Load from session storage if no current selection is set
      if (draftData && selected) {
        console.log('🎯 Draft data exists and selection already set - skipping session storage initialization');
        return;
      }

      if (isFreshCreation && !hasExistingData) {
        console.log('🆕 Fresh creation with no existing data - clearing selection');
        setSelected('');
      } else {
        if (savedModel) {
          console.log('✅ Setting pricing model from session storage to:', savedModel);
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
                    from: t.from !== undefined && t.from !== null && t.from !== '' ? Number(t.from) : null,
                    to: t.isUnlimited ? null : (t.to !== undefined && t.to !== null && t.to !== '' ? Number(t.to) : null),
                    price: t.price !== undefined && t.price !== null && t.price !== '' ? Number(t.price) : null,
                    isUnlimited: !!t.isUnlimited
                  }));
                  console.log('🔧 Pricing: Restoring Volume tiers from session:', volumeTiers);
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
            if (savedOverage) {
              console.log('🔧 Pricing: Restoring Volume overage from session:', savedOverage);
              setOverageUnitRate(Number(savedOverage) || 0);
            }
            if (savedGrace) {
              console.log('🔧 Pricing: Restoring Volume grace from session:', savedGrace);
              setGraceBuffer(Number(savedGrace) || 0);
            }
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
                    from: t.from !== undefined && t.from !== null && t.from !== '' ? Number(t.from) : null,
                    to: t.isUnlimited ? null : (t.to !== undefined && t.to !== null && t.to !== '' ? Number(t.to) : null),
                    price: t.price !== undefined && t.price !== null && t.price !== '' ? Number(t.price) : null,
                    isUnlimited: !!t.isUnlimited
                  }));
                  console.log('🔧 Pricing: Restoring Tiered tiers from session:', tieredTiers);
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
            if (savedOverage) {
              console.log('🔧 Pricing: Restoring Tiered overage from session:', savedOverage);
              setOverageUnitRate(Number(savedOverage) || 0);
            }
            if (savedGrace) {
              console.log('🔧 Pricing: Restoring Tiered grace from session:', savedGrace);
              setGraceBuffer(Number(savedGrace) || 0);
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
                    from: s.from !== undefined && s.from !== null && s.from !== '' ? Number(s.from) : null,
                    to: s.isUnlimited ? null : (s.to !== undefined && s.to !== null && s.to !== '' ? Number(s.to) : null),
                    price: s.cost !== undefined && s.cost !== null && s.cost !== '' ? Number(s.cost) : null,
                    isUnlimited: !!s.isUnlimited
                  }));
                  console.log('🔧 Pricing: Restoring Stairstep tiers from session:', stairTiers);
                  setTiers(stairTiers);
                  const lastUnlimited = stairTiers.length > 0 ? !!stairTiers[stairTiers.length - 1].isUnlimited : false;
                  setNoUpperLimit(lastUnlimited);
                }
              } catch (e) {
                console.error('Failed to parse stair tiers:', e);
              }
            }
            if (savedOverage) {
              console.log('🔧 Pricing: Restoring Stairstep overage from session:', savedOverage);
              setOverageUnitRate(Number(savedOverage) || 0);
            }
            if (savedGrace) {
              console.log('🔧 Pricing: Restoring Stairstep grace from session:', savedGrace);
              setGraceBuffer(Number(savedGrace) || 0);
            }
          }
        }
      }
    }, [isFreshCreation, draftData]);

    useEffect(() => {
      console.log('💾 Pricing: Persisting selected model to session storage:', selected);
      if (selected) {
        setRatePlanData('PRICING_MODEL', selected);
        console.log('✅ Pricing: Saved to session storage:', selected);
      } else {
        console.log('⚠️ Pricing: Selected is empty, not persisting');
      }
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

      // Clear parent validation errors when user edits tier data
      if (value.trim() && onClearError) {
        if (isTiered) onClearError('tieredTiers');
        if (isVolume) onClearError('volumeTiers');
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
          <SelectField
            label="Pricing"
            value={selected}
            onChange={v => {
              const value = v;
              console.log('🎯 Pricing: User selected pricing model:', value);

              // If locked, prevent selection and revert to empty state
              if (locked) {
                console.log('🔒 Pricing: Locked mode - reverting selection to empty');
                setSelected('');
                return;
              }

              setSelected(value);
              if (value === 'Tiered Pricing' && tiers.length === 0) {
                setTiers([{ from: null, to: null, price: null, isUnlimited: false }]);
              }
              if (value === 'Volume-Based' && tiers.length === 0) {
                setTiers([{ from: null, to: null, price: null, isUnlimited: false }]);
              }
            }}
            options={[
              { label: 'Flat Fee', value: 'Flat Fee' },
              { label: 'Tiered Pricing', value: 'Tiered Pricing' },
              { label: 'Volume-Based', value: 'Volume-Based' },
              { label: 'Usage-Based', value: 'Usage-Based' },
              { label: 'Stairstep', value: 'Stairstep' },
            ]}
            placeholderOption="Select a pricing model"
            error={errors.select || validationErrors.pricingModel}
          />

          {errors.general && <div className="inline-error">{errors.general}</div>}

          {selected === 'Flat Fee' && !locked && (
            <>
              <div className="pricing-container pricing-subform">
                <FlatFeeForm
                  ref={flatFeeRef}
                  data={flatFee}
                  onChange={setFlatFee}
                  validationErrors={validationErrors}
                  onClearError={onClearError}
                  locked={locked}
                />
              </div>
              {errors.flatFee && <div className="inline-error">{errors.flatFee}</div>}
            </>
          )}

          {selected === 'Tiered Pricing' && !locked && (
            <>
              <div className="pricing-container pricing-subform">
                <Tiered
                  ref={tieredRef}
                  tiers={(() => {
                    const mappedTiers = tiers.map(t => ({
                      from: toStr(t.from),
                      to: toStr(t.to),
                      price: toStr(t.price),
                      isUnlimited: !!t.isUnlimited,
                    }));
                    console.log('🔧 Pricing: Passing tiers to Tiered:', mappedTiers, 'from tiers:', tiers);
                    return mappedTiers;
                  })()}
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
                  onClearError={onClearError}
                  overageCharge={String(overageUnitRate || '')}
                  graceBuffer={String(graceBuffer || '')}
                  locked={locked}
                />
              </div>
              {errors.tiered && <div className="inline-error">{errors.tiered}</div>}
            </>
          )}

          {selected === 'Volume-Based' && !locked && (
            <>
              <div className="pricing-container pricing-subform">
                <Volume
                  ref={volumeRef}
                  tiers={(() => {
                    console.log('🔧 Pricing: Passing tiers to Volume:', tiers);
                    return tiers as any;
                  })()}
                  onAddTier={handleAddTier}
                  onDeleteTier={handleDeleteTier}
                  onChange={handleTierChange}
                  noUpperLimit={noUpperLimit}
                  setNoUpperLimit={(flag: boolean) => {
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
                  onClearError={onClearError}
                  locked={locked}
                />
              </div>
              {errors.volume && <div className="inline-error">{errors.volume}</div>}
            </>
          )}

          {selected === 'Stairstep' && !locked && (
            <>
              <div className="pricing-container pricing-subform">
                <StairStep
                  ref={stairStepRef}
                  validationErrors={validationErrors}
                  stairs={(() => {
                    const mappedStairs = tiers.map(t => ({
                      from: toStr(t.from),
                      to: toStr(t.to),
                      cost: toStr(t.price),
                      isUnlimited: !!t.isUnlimited,
                    }));
                    console.log('🔧 Pricing: Passing stairs to StairStep:', mappedStairs, 'from tiers:', tiers);
                    return mappedStairs;
                  })()}
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
                  onClearError={onClearError}
                  locked={locked}
                />
              </div>
              {errors.stair && <div className="inline-error">{errors.stair}</div>}
            </>
          )}

          {selected === 'Usage-Based' && !locked && (
            <>
              <div className="pricing-container pricing-subform">
                <UsageBased
                  ref={usageBasedRef}
                  data={usage}
                  onChange={setUsage}
                  validationErrors={validationErrors}
                  onClearError={onClearError}
                  locked={locked}
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
