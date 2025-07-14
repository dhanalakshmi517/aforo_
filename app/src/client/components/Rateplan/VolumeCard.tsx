import React from 'react';
import './VolumeCard.css';

const VolumeCard: React.FC = () => {
  const volumes = [
    { label: 'Tier 1', from: '1', to: '500', price: '$0.10/unit' },
    { label: 'Tier 2', from: '501', to: '1000', price: '$0.08/unit' },
    { label: 'Tier 3', from: '1001', to: '1500', price: '$0.06/unit' },
    { label: 'Tier 4', from: '1501', to: '2000', price: '$0.05/unit' }
  ];

  return (
    <div className="volume-card">
      <h3>Example for Volume-Based Pricing</h3>
      <div className="volume-table">
        {volumes.map((tier, index) => (
          <div key={index} className="volume-row">
            <span className="volume-label">{tier.label}</span>
            <div className="volume-tiles">
              <div className="tile">{tier.from}</div>
              <div className="tile">...</div>
              <div className="tile">{tier.to}</div>
            </div>
            <span className="volume-price">{tier.price}</span>
          </div>
        ))}
      </div>

      <p className="highlight">
        If the consumer uses 500 units, all 500 are charged at the Tier 1 rate of $0.10/unit, so they pay $50.
      </p>

      <p className="footnote">
        In volume-based pricing, all usage is charged at the unit rate corresponding to the final tier reached.
      </p>
    </div>
  );
};

export default VolumeCard;
