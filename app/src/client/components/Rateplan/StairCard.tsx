import React from 'react';
import './StairCard.css';

const StairCard: React.FC = () => {
  const stairs = [
    { label: 'Stair 1', from: '1', to: '500', price: '$300' },
    { label: 'Stair 2', from: '501', to: '1000', price: '$600' },
    { label: 'Stair 3', from: '1001', to: '1500', price: '$700' },
    { label: 'Stair 4', from: '1501', to: '2000', price: '$800' }
  ];

  return (
    <div className="stair-card">
      <h3>Example for Stair Step Pricing</h3>
      <div className="stair-table">
        {stairs.map((step, index) => (
          <div key={index} className="stair-row">
            <span className="stair-label">{step.label}</span>
            <div className="stair-tiles">
              <div className="tile">{step.from}</div>
              <div className="tile">...</div>
              <div className="tile">{step.to}</div>
            </div>
            <span className="stair-price">{step.price}</span>
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

export default StairCard;
