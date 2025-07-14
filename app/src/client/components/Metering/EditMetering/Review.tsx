import React from 'react';
import './Review.css';

interface ReviewProps {
  metricName: string;
  description: string;
  linkProduct: string;
  defineUnit: string;
  defineAggregationType: string;
}

const Review: React.FC<ReviewProps> = ({
  metricName,
  description,
  linkProduct,
  defineUnit,
  defineAggregationType
}) => {
  return (
    <div className="review-wrapper">
      <div className="review-card">
        <div className="section">
          <div className="section-title">METRIC IDENTITY</div>
          <div className="row">
            <div className="label">Metric Name</div>
            <div className="value">{metricName}</div>
          </div>
          <div className="row">
            <div className="label">Description</div>
            <div className="value">{description}</div>
          </div>
          <div className="row">
            <div className="label">Link Product</div>
            <div className="value">{linkProduct}</div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">METRIC PROPERTIES</div>
          <div className="row">
            <div className="label">Define Unit</div>
            <div className="value">{defineUnit}</div>
          </div>
          <div className="row">
            <div className="label">Define Aggregation Type</div>
            <div className="value">{defineAggregationType}</div>
          </div>
        </div>
      </div>

      <p className="note">
        You're about to create a new Usage Metric. Please review your entries before proceeding.
      </p>
    </div>
  );
};

export default Review;
