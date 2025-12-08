import React from "react";
import "./ReviewComponent.css";

export type ReviewRow = {
  label: string;
  value: string;
};

type ReviewComponentProps = {
  /** Section title shown on top (e.g. "PRODUCT METADATA") */
  title: string;
  /** Rows to render in the table */
  rows: ReviewRow[];
  /** Optional extra class for outer wrapper */
  className?: string;
};

const ReviewComponent: React.FC<ReviewComponentProps> = ({
  title,
  rows,
  className = "",
}) => {
  return (
    <section className={`review-card ${className}`}>
      <div className="review-header">{title}</div>

      <dl className="review-table">
        {rows.map((row) => (
          <div className="review-row" key={row.label}>
            <dt className="review-label">{row.label}</dt>
            <dd className="review-value">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default ReviewComponent;
