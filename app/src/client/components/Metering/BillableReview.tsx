import React from 'react';
import './BillableReview.css';

interface BillableReviewProps {
  metricName: string;
  description: string;
  linkProduct: string;
  unit: string;
  aggregationType: string;
}

const BillableReview: React.FC<BillableReviewProps> = ({
  metricName,
  description,
  linkProduct,
  unit,
  aggregationType,
}) => {
  return (
    <div className="review-container">
      <div className="review-box">
        <p className="review-heading">METRIC IDENTITY</p>
        <div className="review-row">
          <span>Metric Name</span>
          <span>{metricName}</span>
        </div>
        <div className="review-row">
          <span>Description</span>
          <span>{description}</span>
        </div>
        <div className="review-row">
          <span>Link Product</span>
          <span>{linkProduct}</span>
        </div>
      </div>

      <div className="review-box">
        <p className="review-heading">METRIC PROPERTIES</p>
        <div className="review-row">
          <span>Define Unit</span>
          <span>{unit}</span>
        </div>
        <div className="review-row">
          <span>Define Aggregation Type</span>
          <span>{aggregationType}</span>
        </div>
      </div>

      <p className="review-footer">
        You're about to create a new Usage Metric. Please review your entries before proceeding.
      </p>
    </div>
  );
};

export default BillableReview;
