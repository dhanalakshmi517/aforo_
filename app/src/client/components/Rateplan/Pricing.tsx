import React, { useState } from 'react';
import './Pricing.css';
import FlatFeeForm from './FlatFeeForm';
import Volume from './Volume';
import Tiered from './Tiered';
import StairStep from './StairStep';
import UsageBased from './UsageBased';

interface Tier { from:number; to:number; price:number; }

const Pricing: React.FC = () => {
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
    // parse numbers for from/to, price allow string -> number
    if (field === 'price') {
      updated[index][field] = parseFloat(value) || 0;
    } else {
      updated[index][field] = parseInt(value) || 0;
    }
    setTiers(updated);
  };


  return (
    <div className="pricing-container">
      <div className="left-section">
        {/* Dropdown inline */}
        <label className="dropdown-label">Pricing</label>
        <select
          className="custom-select"
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
          }}
        >
          <option value="" disabled hidden>--Select--</option>
          <option value="Flat Fee">Flat Fee</option>
          <option value="Tiered Pricing">Tiered Pricing</option>
          <option value="Volume-Based">Volume-Based</option>
          <option value="Usage-Based">Usage-Based</option>
          <option value="Stairstep">Stairstep</option>
        </select>

        {/* Render form and card based on selection */}
        {selected === 'Flat Fee' && (
          <div className="pricing-container">
            <FlatFeeForm />
          </div>
        )}
        {selected === 'Tiered Pricing' && (
          <div className="pricing-container">
            <Tiered />
          </div>
        )}
        {selected === 'Volume-Based' && (
          <div className="pricing-container">
            <Volume />
          </div>
        )}
        {selected === 'Stairstep' && (
          <div className="pricing-container">
            <StairStep />
          </div>
        )}
        {selected === 'Usage-Based' && (
          <div className="pricing-container">
            <UsageBased />
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
