import React, { useState, useEffect, useCallback } from 'react';
import './EditPricing.css';
import {
  saveFlatFeePricing,
  saveVolumePricing,
  saveTieredPricing,
  saveStairStepPricing,
  saveUsageBasedPricing
} from '../api';
import { setRatePlanData } from '../utils/sessionStorage';
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
  /** Optional: parent can register a handler to invoke save from its own button */
  registerSavePricing?: (fn: () => Promise<void>) => void;
  /** Draft data from backend for pre-filling */
  draftData?: any;
}

const EditPricing: React.FC<EditPricingProps> = ({ ratePlanId, registerSavePricing, draftData }) => {
  const [selected, setSelected] = useState('');
  const [saving, setSaving] = useState(false);
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

  // Initialize from backend data (same pattern as draft mode)
  useEffect(() => {
    if (!draftData) {
      // Fallback to localStorage for backward compatibility
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
      return;
    }

    // Stairstep
    const stairObj = Array.isArray(draftData.stairStepPricing)
      ? draftData.stairStepPricing[0]
      : draftData.stairStepPricing;
    if (stairObj && Object.keys(stairObj).length > 0) {
      setSelected('Stairstep');
      const t = (stairObj.tiers || []).map((x: any) => ({
        from: x.usageStart ?? null,
        to: x.usageEnd ?? null,
        price: x.flatCost ?? null
      }));
      setTiers(t);
      setOverageUnitRate(stairObj.overageUnitRate || 0);
      setGraceBuffer(stairObj.graceBuffer || 0);
      setRatePlanData('PRICING_MODEL', 'Stairstep');
      const stairTiers = t.map((y: Tier) => ({
        from: String(y.from ?? ''),
        to: String(y.to ?? ''),
        cost: String(y.price ?? '')
      }));
      setRatePlanData('STAIR_TIERS', JSON.stringify(stairTiers));
      setRatePlanData('STAIR_OVERAGE', String(stairObj.overageUnitRate || 0));
      setRatePlanData('STAIR_GRACE', String(stairObj.graceBuffer || 0));
    }
  }, [draftData]);

  // Persist model name when user changes it
  useEffect(() => {
    if (selected) setRatePlanData('PRICING_MODEL', selected);
  }, [selected]);

  const handleSave = useCallback(async () => {
    if (!ratePlanId) return;
    try {
      setSaving(true);

      if (selected === 'Flat Fee') {
        const payload = {
          flatFeeAmount: Number(localStorage.getItem('flatFeeAmount') || 0),
          numberOfApiCalls: Number(localStorage.getItem('flatFeeApiCalls') || 0),
          overageUnitRate: Number(localStorage.getItem('flatFeeOverage') || 0),
          graceBuffer: Number(localStorage.getItem('flatFeeGrace') || 0)
        };
        await saveFlatFeePricing(ratePlanId, payload);
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
        const saved = JSON.parse(localStorage.getItem('tieredTiers') || '[]');
        const tiers = saved.map((t: any) => ({
          startRange: Number(t.from),
          endRange: t.to ? Number(t.to) : null,
          unitPrice: Number(t.price)
        }));
        const payload = {
          tiers,
          overageUnitRate: Number(localStorage.getItem('tieredOverage') || 0),
          graceBuffer: Number(localStorage.getItem('tieredGrace') || 0)
        };
        await saveTieredPricing(ratePlanId, payload);
      } else if (selected === 'Stairstep') {
        const payload = {
          tiers: tiers.map(s => ({
            usageStart: s.from ?? 0,
            usageEnd: s.isUnlimited || !s.to ? null : s.to,
            flatCost: s.price ?? 0
          })),
          overageUnitRate,
          graceBuffer
        };
        await saveStairStepPricing(ratePlanId, payload);
      } else if (selected === 'Usage-Based') {
        const perUnit = Number(localStorage.getItem('usagePerUnit') || 0);
        await saveUsageBasedPricing(ratePlanId, { perUnitAmount: perUnit });
      }

      alert('Pricing saved');
    } catch (err: any) {
      alert(err?.message || 'Failed to save pricing');
    } finally {
      setSaving(false);
    }
  }, [ratePlanId, selected, tiers, overageUnitRate, graceBuffer]);

  // Let the parent register a way to trigger save (optional)
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
            // Auto-add blank tier for Tiered Pricing if none exist
            if (v === 'Tiered Pricing' && tiers.length === 0) {
              setTiers([{ from: null, to: null, price: null }]);
            }
          }}
        >
          <option value="" disabled hidden>
            --Select--
          </option>
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

      {/* Removed the duplicate bottom "Save Pricing" button */}
    </div>
  );
};

export default EditPricing;
