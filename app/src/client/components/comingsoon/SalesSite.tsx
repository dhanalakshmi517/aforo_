import React from 'react';
import './SalesSite.css';

const SalesSite: React.FC = () => {
  return (
    <div className="sales-coming-wrapper">
      <div className="sales-coming-card">

        <h1 className="sales-title">
          Not created yet...
        </h1>

        <p className="sales-subtitle">
          still designing 
          <span className="sales-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>

        <div className="sales-progress-bar">
          <div className="sales-progress-fill" />
        </div>

        <p className="sales-footnote">Coming soon</p>
      </div>
    </div>
  );
};

export default SalesSite;
