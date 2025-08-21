import React from 'react';
import './Review.css';

interface ReviewRowProps {
  label: string;
  value: string;
}

const ReviewRow: React.FC<ReviewRowProps> = ({ label, value }) => (
  <div className="review-row">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

interface UsageConditionRow {
  dimension: string;
  operator: string;
  value: string;
}

interface ReviewProps {
  metricName: string;
  productName: string;
  description: string;
  version: string;
  unitOfMeasure: string;
  aggregationFunction: string;
  aggregationWindow: string;
  usageConditions: UsageConditionRow[];
  billingCriteria?: string;
}

const Review: React.FC<ReviewProps> = ({
  metricName,
  productName,
  description,
  version,
  unitOfMeasure,
  aggregationFunction,
  aggregationWindow,
  usageConditions,
  billingCriteria,
}) => {
  return (
    <div className="review-container">
      <div className="review-section">
        <h3>METRIC IDENTITY</h3>
        <ReviewRow label="Metric Name" value={metricName} />
        <ReviewRow label="Product Name" value={productName} />
        <ReviewRow label="Description" value={description} />
        <ReviewRow label="Version" value={version} />
        <ReviewRow label="Aggregation Function" value={aggregationFunction} />
        <ReviewRow label="Aggregation Window" value={aggregationWindow} />
        <ReviewRow label="Unit of Measure" value={unitOfMeasure} />

      </div>

      <div className="review-section">
        <h3>BILLING CRITERIA</h3>
        <ReviewRow label="Billing Criteria" value={billingCriteria || '-'} />
      </div>

      <div className="review-section">
        <h3>METRIC PROPERTIES</h3>
        {usageConditions.length === 0 ? (
          <ReviewRow label="Dimensions" value="-" />
        ) : (
          usageConditions.map((c, idx) => (
            <React.Fragment key={idx}>
              <ReviewRow label="Dimension" value={c.dimension || '-'} />
              <ReviewRow label="Operator" value={c.operator || '-'} />
              <ReviewRow label="Value" value={c.value || '-'} />
            </React.Fragment>
          ))
        )}
      </div>

      <p className="review-footer">
        You’re about to create a new Usage Metric. Please review your entries before proceeding.
      </p>
    </div>
  );
};

export default Review;
