import React, { useState, useEffect } from 'react';
import './EditPricing.css';
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

const EditPricing: React.FC = () => {
  const [selected, setSelected] = useState('');
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
    </div>
  );
};

export default EditPricing;
