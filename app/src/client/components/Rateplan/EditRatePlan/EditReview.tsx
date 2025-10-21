// EditReview.tsx
import React, { useState } from 'react';
import './EditReview.css';
import RevenueEstimatorModal from '../RevenueEstimatorModal';
import { getRatePlanData } from '../utils/sessionStorage';

const EditReview: React.FC = () => {
  const [showRevenueEstimator, setShowRevenueEstimator] = useState(false);
  const pricingModel = getRatePlanData('PRICING_MODEL') || 'Flat Fee';

  const handleEstimateRevenueClick = () => {
    setShowRevenueEstimator(true);
  };

  const handleCloseRevenueEstimator = () => {
    setShowRevenueEstimator(false);
  };

  return (
    <div className="review-container">
      <div className="estimate-box" onClick={handleEstimateRevenueClick} style={{ cursor: 'pointer' }}>
        <div className="estimate-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 3V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H21M8 7.5C8 7.77614 7.77614 8 7.5 8C7.22386 8 7 7.77614 7 7.5C7 7.22386 7.22386 7 7.5 7C7.77614 7 8 7.22386 8 7.5ZM19 5.5C19 5.77614 18.7761 6 18.5 6C18.2239 6 18 5.77614 18 5.5C18 5.22386 18.2239 5 18.5 5C18.7761 5 19 5.22386 19 5.5ZM12 11.5C12 11.7761 11.7761 12 11.5 12C11.2239 12 11 11.7761 11 11.5C11 11.2239 11.2239 11 11.5 11C11.7761 11 12 11.2239 12 11.5ZM8 16.5C8 16.7761 7.77614 17 7.5 17C7.22386 17 7 16.7761 7 16.5C7 16.2239 7.22386 16 7.5 16C7.77614 16 8 16.2239 8 16.5ZM18 14.5C18 14.7761 17.7761 15 17.5 15C17.2239 15 17 14.7761 17 14.5C17 14.2239 17.2239 14 17.5 14C17.7761 14 18 14.2239 18 14.5Z"
              stroke="#1CB814" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <strong>Estimate revenue</strong>
        <span>See how much your plan might earn based on expected usage.</span>
        <svg
          className="estimate-arrow"
          onClick={handleEstimateRevenueClick}
          style={{ cursor: 'pointer' }}
          xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#706C72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="card">
        <h3>PLAN DETAILS</h3>
        <div className="row">
          <label>Rate Plan Name</label>
          <span>Entered Value</span>
        </div>
        <div className="row">
          <label>Rate Plan Description</label>
          <span>Entered Value</span>
        </div>
        <div className="row">
          <label>Billing Frequency</label>
          <span>Selected Option</span>
        </div>
      </div>

      <div className="card">
        <h3>DEFINE BILLABLE METRICS</h3>
        <div className="row">
          <label>Description</label>
          <span>Selected Option</span>
        </div>
        <div className="row">
          <label>Metric Name</label>
          <span>Entered Value</span>
        </div>
        <div className="row">
          <label>Define Unit</label>
          <span>Selected Option</span>
        </div>
        <div className="row">
          <label>Define Aggregation Type</label>
          <span>Selected Option</span>
        </div>
      </div>

      <div className="card">
        <h3>PRICING MODEL SETUP</h3>
        <div className="row">
          <label>Rate Plan</label>
          <span>Selected Option</span>
        </div>
        <div className="row">
          <label>Flat Fee Amount</label>
          <span>Selected Option</span>
        </div>
        <div className="row">
          <label>Usage Limit</label>
          <span>Selected Option</span>
        </div>
        <div className="row">
          <label>Charges Per User</label>
          <span>Selected Option</span>
        </div>
      </div>

      <div className="card">
        <h3>EXTRAS</h3>
        <div className="row">
          <label>Setup Fee (Optional)</label>
          <span>Selected Option</span>
        </div>
        <div className="row">
          <label>One-time Setup Fee</label>
          <span>Selected Option</span>
        </div>
      </div>

      {/* Revenue Estimator Modal */}
      {showRevenueEstimator && (
        <RevenueEstimatorModal 
          pricingModel={pricingModel}
          onClose={handleCloseRevenueEstimator}
        />
      )}
    </div>
  );
};

export default EditReview;
