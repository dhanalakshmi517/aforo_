import React, { useState, useEffect } from 'react';
import './EditPricing.css';
import { saveFlatFeePricing, saveVolumePricing, saveTieredPricing, saveStairStepPricing, saveUsageBasedPricing } from '../api';
 import EditFlat from './EditFlat';
import EditVolume from './EditVolume';
import EditTiered from './EditTiered';
import EditStair from './EditStair';
import EditUsage from './EditUsage';

interface Tier {
  from: number;
  to: number;
  price: number;
}

interface EditPricingProps {
  ratePlanId?: number;
}

const EditPricing: React.FC<EditPricingProps> = ({ ratePlanId }) => {
  const [selected, setSelected] = useState('');
  const [saving, setSaving] = useState(false);
  const [tiers, setTiers] = useState<Tier[]>([
    { from: 0, to: 0, price: 0 },
    { from: 0, to: 0, price: 0 },
    { from: 0, to: 0, price: 0 }
  ]);

  const handleAddTier = () => {
    setTiers([...tiers, { from: 0, to: 0, price: 0 }]);
  };

  const handleDeleteTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, field: keyof Tier, value: string) => {
    const updated = [...tiers];
    if (field === 'price') {
      updated[index][field] = parseFloat(value) || 0;
    } else {
      updated[index][field] = parseInt(value) || 0;
    }
    setTiers(updated);
  };

  useEffect(() => {
    const savedModel = localStorage.getItem('pricingModel');
    if (savedModel) {
      setSelected(savedModel);
    }
  }, []);

  const handleSave = async () => {
    if (!ratePlanId) return;
    try {
      setSaving(true);
      if (selected === 'Flat Fee') {
        const payload = {
          flatFeeAmount: Number(localStorage.getItem('flatFeeAmount') || 0),
          numberOfApiCalls: Number(localStorage.getItem('flatFeeApiCalls') || 0),
          overageUnitRate: Number(localStorage.getItem('flatFeeOverage') || 0),
          graceBuffer: Number(localStorage.getItem('flatFeeGrace') || 0),
        };
        await saveFlatFeePricing(ratePlanId, payload);
      } else if (selected === 'Volume-Based') {
        const saved = JSON.parse(localStorage.getItem('volumeTiers') || '[]');
        const tiers = saved.map((t:any)=>({
          usageStart: Number(t.from),
          usageEnd: t.to ? Number(t.to) : null,
          unitPrice: Number(t.price),
        }));
        const payload = {
          tiers,
          overageUnitRate: Number(localStorage.getItem('volumeOverage')||0),
          graceBuffer: Number(localStorage.getItem('volumeGrace')||0),
        };
        await saveVolumePricing(ratePlanId,payload);
      } else if (selected === 'Tiered Pricing') {
        const saved = JSON.parse(localStorage.getItem('tieredTiers') || '[]');
        const tiers = saved.map((t:any)=>({
          startRange: Number(t.from),
          endRange: t.to ? Number(t.to) : null,
          unitPrice: Number(t.price),
        }));
        const payload = {
          tiers,
          overageUnitRate: Number(localStorage.getItem('tieredOverage')||0),
          graceBuffer: Number(localStorage.getItem('tieredGrace')||0),
        };
        await saveTieredPricing(ratePlanId,payload);
      } else if (selected === 'Stairstep') {
        const saved = JSON.parse(localStorage.getItem('stairTiers') || '[]');
        const tiers = saved.map((t:any)=>({
          usageStart: Number(t.from),
          usageEnd: t.to ? Number(t.to): null,
          flatCost: Number(t.price)
        }));
        const payload = {
          tiers,
          overageUnitRate: Number(localStorage.getItem('stairOverage')||0),
          graceBuffer: Number(localStorage.getItem('stairGrace')||0),
        };
        await saveStairStepPricing(ratePlanId,payload);
      } else if (selected === 'Usage-Based') {
        const perUnit = Number(localStorage.getItem('usagePerUnit')||0);
        await saveUsageBasedPricing(ratePlanId,{ perUnitAmount: perUnit});
      }
      alert('Pricing saved');
    } catch(err:any){
      alert(err?.message||'Failed to save pricing');
    } finally {setSaving(false);}
  };

  return (
    <div className="edit-pricing-container">
      <div className="ledit-eft-section">
        <label className="edit-dropdown-label">Pricing</label>
        <select
          className="edit-custom-select"
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            localStorage.setItem('pricingModel', e.target.value);
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
      <div style={{marginTop:'1rem'}}>
        <button className="erp-btn erp-btn-primary" disabled={saving||!ratePlanId} onClick={handleSave}>
          {saving? 'Saving...' : 'Save Pricing'}
        </button>
      </div>
    </div>
  );
};

export default EditPricing;
