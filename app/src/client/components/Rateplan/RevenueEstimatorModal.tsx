import React from 'react';
import './EstimatorModal.css';

import EstimateRevenue from './Revenue/EstimateRevenue';
import UsageEstimation from './Revenue/UsageEstimation';
import TieredEstimation from './Revenue/TieredEstimation';
import VolumeEstimation from './Revenue/VolumeEstimation';
import StairEstimation from './Revenue/StairEstimation';
import { getRatePlanData } from './utils/sessionStorage';

interface ModalProps {
  pricingModel: string; // expects exact string stored in localStorage
  onClose: () => void;
}

const RevenueEstimatorModal: React.FC<ModalProps> = ({ pricingModel, onClose }) => {
  const renderEstimator = () => {
    const localPricingModel = getRatePlanData('PRICING_MODEL') || pricingModel;
    switch (localPricingModel) {
      case 'Flat Fee':
        return <EstimateRevenue />;
      case 'Usage-Based':
        return <UsageEstimation />;
      case 'Stairstep':
        return <StairEstimation />;
      case 'Volume-Based':
        return <VolumeEstimation />;
      case 'Tiered Pricing':
        return <TieredEstimation />;
      default:
        return null;
    }
  };

  return (
    <div className="estimator-overlay" role="dialog" aria-modal="true">
      <div className="estimator-card">
        <button className="estimator-close" onClick={onClose} aria-label="Close">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="#1A2126"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {renderEstimator()}
      </div>
    </div>
  );
};

export default RevenueEstimatorModal;
