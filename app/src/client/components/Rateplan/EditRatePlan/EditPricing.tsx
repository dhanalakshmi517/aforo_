import React, { useState, useEffect, useCallback } from 'react';
import './EditPricing.css';
import {
  saveFlatFeePricing,
  saveVolumePricing,
  saveTieredPricing,
  saveStairStepPricing,
  saveUsageBasedPricing
} from '../api';
import { getRatePlanData, setRatePlanData } from '../utils/sessionStorage';
import EditFlat from './EditFlat';
import EditVolume from './EditVolume';
import EditTiered from './EditTiered';
import EditStair from './EditStair';
import EditUsage from './EditUsage';

interface Tier {
  from: number | null;
  to: number | null;
  price: number | null;
  isUnlimited?: boolean;
}

interface EditPricingProps {
  ratePlanId?: number;
  registerSavePricing?: (fn: () => Promise<void>) => void;
  draftData?: any;
}

const toNumber = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const EditPricing: React.FC<EditPricingProps> = ({ ratePlanId, registerSavePricing, draftData }) => {
  const [selected, setSelected] = useState('');
  const [saving, setSaving] = useState(false);

  // Local component state
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [overageUnitRate, setOverageUnitRate] = useState(0);
  const [graceBuffer, setGraceBuffer] = useState(0);

  const handleAddTier = () => setTiers([...tiers, { from: null, to: null, price: null, isUnlimited: false }]);
  const handleDeleteTier = (index: number) => setTiers(tiers.filter((_, i) => i !== index));
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

  // Initialize from backend data
  useEffect(() => {
    if (!draftData) {
      const savedModel = localStorage.getItem('pricingModel');
      if (savedModel) setSelected(savedModel);
      return;
    }

    // Usage-Based
    const usageObj =
      (Array.isArray(draftData.usageBasedPricing)
        ? draftData.usageBasedPricing[0]
        : draftData.usageBasedPricing) ||
      (draftData.perUnitAmount != null
        ? { perUnitAmount: draftData.perUnitAmount }
        : null);

    if (usageObj && usageObj.perUnitAmount != null) {
      setSelected('Usage-Based');
      setRatePlanData('PRICING_MODEL', 'Usage-Based');
      setRatePlanData('USAGE_PER_UNIT_AMOUNT', String(usageObj.perUnitAmount));
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
      setRatePlanData('PRICING_MODEL', 'Flat Fee');
      setRatePlanData('FLAT_FEE_AMOUNT', String(draftData.flatFeeAmount || ''));
      setRatePlanData('FLAT_FEE_API_CALLS', String(draftData.numberOfApiCalls || ''));
      setRatePlanData('FLAT_FEE_OVERAGE', String(draftData.overageUnitRate || ''));
      setRatePlanData('FLAT_FEE_GRACE', String(draftData.graceBuffer || ''));
      return;
    }

    // Volume-Based
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

      localStorage.setItem('volumeTiers', JSON.stringify(t));
      localStorage.setItem('volumeOverage', String(volumeObj.overageUnitRate || ''));
      localStorage.setItem('volumeGrace', String(volumeObj.graceBuffer || ''));
      return;
    }

    // Tiered Pricing
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

      localStorage.setItem('tieredTiers', JSON.stringify(t));
      localStorage.setItem('tieredOverage', String(tieredObj.overageUnitRate || 0));
      localStorage.setItem('tieredGrace', String(tieredObj.graceBuffer || 0));
      return;
    }

    // Stairstep (✅ use last item if array)
    const stairRaw = Array.isArray(draftData.stairStepPricing)
      ? draftData.stairStepPricing[draftData.stairStepPricing.length - 1]
      : draftData.stairStepPricing;
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
        cost: String(y.price ?? '')
      }));
      localStorage.setItem('stairTiers', JSON.stringify(stairTiers));
      localStorage.setItem('stairOverage', String(stairRaw.overageUnitRate || 0));
      localStorage.setItem('stairGrace', String(stairRaw.graceBuffer || 0));
    }
  }, [draftData]);

  useEffect(() => {
    if (selected) setRatePlanData('PRICING_MODEL', selected);
  }, [selected]);

  const handleSave = useCallback(async () => {
    if (!ratePlanId) return;
    try {
      setSaving(true);

      if (selected === 'Flat Fee') {
        const flatFeeAmount = toNumber(
          getRatePlanData('FLAT_FEE_AMOUNT') ?? localStorage.getItem('flatFeeAmount') ?? 0
        );
        const numberOfApiCalls = toNumber(
          getRatePlanData('FLAT_FEE_API_CALLS') ?? localStorage.getItem('flatFeeApiCalls') ?? 0
        );
        const overageUnitRateNum = toNumber(
          getRatePlanData('FLAT_FEE_OVERAGE') ?? localStorage.getItem('flatFeeOverage') ?? 0
        );
        const graceBufferNum = toNumber(
          getRatePlanData('FLAT_FEE_GRACE') ?? localStorage.getItem('flatFeeGrace') ?? 0
        );

        const payload = {
          flatFeeAmount,
          numberOfApiCalls,
          overageUnitRate: overageUnitRateNum,
          graceBuffer: graceBufferNum
        };
        await saveFlatFeePricing(ratePlanId, payload);

      } else if (selected === 'Volume-Based') {
        const savedTiers = JSON.parse(localStorage.getItem('volumeTiers') || '[]');
        const list = Array.isArray(savedTiers) && savedTiers.length > 0 ? savedTiers : tiers;

        const tiersToSend = list.map((t: any) => {
          const fromStr = typeof t.from === 'string' ? t.from.trim() : `${t.from ?? ''}`.trim();
          const toStr = typeof t.to === 'string' ? t.to.trim() : `${t.to ?? ''}`.trim();
          const priceStr = typeof t.price === 'string' ? t.price.trim() : `${t.price ?? ''}`.trim();

          return {
            usageStart: fromStr ? Number(fromStr) : 0,
            usageEnd: t.isUnlimited ? null : (toStr ? Number(toStr) : null),
            unitPrice: priceStr ? Number(priceStr) : 0,
          };
        });

        const over = toNumber(
          localStorage.getItem('volumeOverage') ??
          getRatePlanData('VOLUME_OVERAGE') ??
          overageUnitRate
        );
        const grace = toNumber(
          localStorage.getItem('volumeGrace') ??
          getRatePlanData('VOLUME_GRACE') ??
          graceBuffer
        );

        const payload = {
          tiers: tiersToSend,
          overageUnitRate: over,
          graceBuffer: grace,
        };
        await saveVolumePricing(ratePlanId, payload);

      } else if (selected === 'Tiered Pricing') {
        const saved = JSON.parse(localStorage.getItem('tieredTiers') || '[]');

        const tiersToSend = saved.map((t: any) => {
          const fromStr = typeof t.from === 'string' ? t.from.trim() : `${t.from ?? ''}`.trim();
          const toStr = typeof t.to === 'string' ? t.to.trim() : `${t.to ?? ''}`.trim();
          const priceStr = typeof t.price === 'string' ? t.price.trim() : `${t.price ?? ''}`.trim();

          return {
            startRange: fromStr ? Number(fromStr) : 0,
            endRange: t.isUnlimited ? null : (toStr ? Number(toStr) : null),
            unitPrice: priceStr ? Number(priceStr) : 0,
          };
        });

        const payload = {
          tiers: tiersToSend,
          overageUnitRate: Number(localStorage.getItem('tieredOverage') || 0),
          graceBuffer: Number(localStorage.getItem('tieredGrace') || 0)
        };
        await saveTieredPricing(ratePlanId, payload);

      } else if (selected === 'Stairstep') {
        const saved = JSON.parse(localStorage.getItem('stairTiers') || '[]');
        const list = Array.isArray(saved) && saved.length > 0
          ? saved
          : tiers.map(t => ({
              from: String(t.from ?? ''),
              to: String(t.to ?? ''),
              cost: String(t.price ?? ''),
              isUnlimited: t.isUnlimited ?? false,
            }));

        const tiersToSend = list.map((s: any) => {
          const fromStr = (s.from ?? '').toString().trim();
          const toStr = (s.to ?? '').toString().trim();
          const costStr = (s.cost ?? s.price ?? '').toString().trim();

          return {
            usageStart: fromStr ? Number(fromStr) : 0,
            usageEnd: s.isUnlimited ? null : (toStr ? Number(toStr) : null),
            flatCost: costStr ? Number(costStr) : 0,
          };
        });

        const over = Number(localStorage.getItem('stairOverage') ?? overageUnitRate ?? 0);
        const grace = Number(localStorage.getItem('stairGrace') ?? graceBuffer ?? 0);

        const payload = {
          tiers: tiersToSend,
          overageUnitRate: over,
          graceBuffer: grace
        };
        await saveStairStepPricing(ratePlanId, payload);

      } else if (selected === 'Usage-Based') {
        const perUnit = toNumber(
          getRatePlanData('USAGE_PER_UNIT_AMOUNT') ?? localStorage.getItem('usagePerUnit') ?? 0
        );
        await saveUsageBasedPricing(ratePlanId, { perUnitAmount: perUnit });
      }

      console.log('✅ Pricing saved');
    } catch (err: any) {
      console.error('Failed to save pricing', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [ratePlanId, selected, tiers, overageUnitRate, graceBuffer]);

  useEffect(() => {
    if (registerSavePricing) {
      registerSavePricing(handleSave);
    }
  }, [registerSavePricing, handleSave]);

  return (
    <div className="edit-pricing-container">
      <div className="ledit-eft-section">
        <label className="edit-dropdown-label">Pricing</label>
        <select
          className="edit-custom-select"
          value={selected}
          onChange={(e) => {
            const v = e.target.value;
            setSelected(v);
            localStorage.setItem('pricingModel', v);
            if (v === 'Tiered Pricing' && tiers.length === 0) {
              setTiers([{ from: null, to: null, price: null }]);
            }
          }}
        >
          <option value="" disabled hidden>--Select--</option>
          <option value="Flat Fee">Flat Fee</option>
          <option value="Tiered Pricing">Tiered Pricing</option>
          <option value="Volume-Based">Volume-Based</option>
          <option value="Usage-Based">Usage-Based</option>
          <option value="Stairstep">Stairstep</option>
        </select>

        {selected === 'Flat Fee' && (
          <div className="edit-pricing-container">
            <EditFlat />
          </div>
        )}
        {selected === 'Tiered Pricing' && (
          <div className="edit-pricing-container">
            <EditTiered />
          </div>
        )}
        {selected === 'Volume-Based' && (
          <div className="edit-pricing-container">
            <EditVolume />
          </div>
        )}
        {selected === 'Stairstep' && (
          <div className="edit-pricing-container">
            <EditStair />
          </div>
        )}
        {selected === 'Usage-Based' && (
          <div className="edit-pricing-container">
            <EditUsage />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPricing;
