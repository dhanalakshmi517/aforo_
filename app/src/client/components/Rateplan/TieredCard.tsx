import React from 'react';
import './TieredCard.css';

const TieredCard: React.FC = () => {
  const tiers = [
    { label: 'Stair 1', from: '1', to: '500', price: '$300' },
    { label: 'Stair 2', from: '501', to: '1000', price: '$600' },
    { label: 'Stair 3', from: '1001', to: '1500', price: '$700' },
    { label: 'Stair 4', from: '1501', to: '2000', price: '$800' }
  ];

  return (
    <div className="tiered-card">
      <h3>Example for Tiered Pricing</h3>
      <div className="tiered-table">
        {tiers.map((tier, index) => (
          <div key={index} className="tiered-row">
            <span className="tiered-label">{tier.label}</span>
            <div className="tiered-tiles">
              <div className="tile">{tier.from}</div>
              <div className="tile">...</div>
              <div className="tile">{tier.to}</div>
            </div>
            <span className="tiered-price">{tier.price}</span>
          </div>
        ))}
      </div>

      <p className="highlight">
        If the consumer consumes 500 metrics, it falls under stair 2, so they will pay $600
      </p>

      <p className="footnote">
        You can configure overage charges if usage exceeds 2,000 metrics, or even remove the upper limit for the final stair.
      </p>
    </div>
  );
};

export default TieredCard;
