import React from 'react';
import './ReviewTab.css';

export interface FormData {
  productName: string;
  version: string;
  internalSkuCode: string;
  productDescription: string;
}

interface ReviewTabProps {
  formData: FormData;
  configData: Record<string, string>;
  productType: string;
  onFinish: () => Promise<void>;
  isFinishing: boolean;
}

const formatLabel = (label: string) => {
  return label
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

export const ReviewTab: React.FC<ReviewTabProps> = ({ 
  formData, 
  configData, 
  productType,
  onFinish,
  isFinishing
}) => {
  const { productName, version, productDescription, internalSkuCode } = formData;
  
  const renderConfigDetails = () => {
    if (!configData || Object.keys(configData).length === 0) {
      return (
        <div className="no-config">
          No configuration details available.
        </div>
      );
    }

    return (
      <div className="review-grid config-details">
        {Object.entries(configData).map(([key, value]) => (
          <div className="review-item" key={key}>
            <span className="review-label">
              {formatLabel(key)}
            </span>
            <span className="review-value">
              {value || '-'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="review-tab">
      {/* General Details */}
      <div className="review-section">
        <h5 className="section-heading">GENERAL DETAILS</h5>
        <div className="review-grid general-details">
          <div className="review-item">
            <span className="review-label">Product Name</span>
            <span className="review-value">{productName || '-'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Version</span>
            <span className="review-value">{version || '-'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Description</span>
            <span className="review-value">{productDescription || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Configuration Details */}
      <div className="review-section">
        <h5 className="section-heading">CONFIGURATION DETAILS</h5>
        {renderConfigDetails()}
      </div>
      
    </div>
  );
};

export default ReviewTab;
