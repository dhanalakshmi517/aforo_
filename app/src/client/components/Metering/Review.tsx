import React from 'react';
import './Review.css';
import ReviewComponent, { ReviewRow } from '../componenetsss/ReviewComponent';

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
  const metricIdentityRows: ReviewRow[] = [
    { label: 'Metric Name', value: metricName },
    { label: 'Product Name', value: productName },
    { label: 'Description', value: description },
    { label: 'Version', value: version },
    { label: 'Aggregation Function', value: aggregationFunction },
    { label: 'Aggregation Window', value: aggregationWindow },
    { label: 'Unit of Measure', value: unitOfMeasure },
  ];

  const billingCriteriaRows: ReviewRow[] = [
    { label: 'Billing Criteria', value: billingCriteria || '-' },
  ];

  const metricPropertiesRows: ReviewRow[] = usageConditions.length === 0
    ? [{ label: 'Dimensions', value: '-' }]
    : usageConditions.flatMap((c, idx) => [
        { label: 'Dimension', value: c.dimension || '-' },
        { label: 'Operator', value: c.operator || '-' },
        { label: 'Value', value: c.value || '-' },
      ]);

  return (
    <div className="review-container">
      <ReviewComponent title="METRIC IDENTITY" rows={metricIdentityRows} />
      <ReviewComponent title="BILLING CRITERIA" rows={billingCriteriaRows} />
      <ReviewComponent title="METRIC PROPERTIES" rows={metricPropertiesRows} />

      <p className="review-footer">
        You're about to create a new Usage Metric. Please review your entries before proceeding.
      </p>
    </div>
  );
};

export default Review;
