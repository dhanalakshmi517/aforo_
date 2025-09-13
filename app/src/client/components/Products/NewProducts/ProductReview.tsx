// FILE: ProductReview.tsx
// Description: Read-only review UI matching the provided screenshot.
// Usage: import and render <ProductReview />. Styles in ProductReview.css

import * as React from "react";
import "./ProductReview.css";

// Types
interface ReviewRow {
  label: string;
  value: string;
}

interface ReviewSection {
  title: string;
  rows: ReviewRow[];
}

// Utility to prettify camelCase or snake_case keys into labels
const prettify = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')     // camelCase -> camel Case
    .replace(/_/g, ' ')             // snake_case -> snake case
    .replace(/^./, (s) => s.toUpperCase()); // capitalise first letter
};

interface ProductReviewProps {
  generalDetails: Record<string, string>;
  configuration: Record<string, string>;
}

const CardSection: React.FC<ReviewSection> = ({ title, rows }: ReviewSection) => {
  return (
    <section className="pr-card" aria-label={title}>
      <header className="pr-card__header">
        <h3 className="pr-card__title">{title}</h3>
      </header>
      <div className="pr-card__body">
        {rows.map((r, i) => (
          <div className="pr-row" key={`${r.label}-${i}`}>
            <div className="pr-row__label" title={r.label}>
              {r.label}
            </div>
            <div className="pr-row__value" title={r.value}>
              {r.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const ProductReview: React.FC<ProductReviewProps> = ({
  generalDetails,
  configuration,
}) => {
  const generalRows: ReviewRow[] = Object.entries(generalDetails).map(([k, v]) => ({
    label: prettify(k),
    value: v || '-'
  }));
  
  const configRows: ReviewRow[] = Object.entries(configuration).map(([k, v]) => ({
    label: prettify(k),
    value: v || '-'
  }));

  const sections: ReviewSection[] = [
    { title: 'GENERAL DETAILS', rows: generalRows },
    { title: 'PRODUCT CONFIGURATION', rows: configRows }
  ];

  return (
    <div className="pr-grid">
      {sections.map((section) => (
        <CardSection key={section.title} {...section} />
      ))}
    </div>
  );
};

export default ProductReview;