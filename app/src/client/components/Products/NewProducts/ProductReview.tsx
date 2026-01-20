// FILE: ProductReview.tsx
// Description: Read-only review UI matching the provided screenshot.
// Usage: import and render <ProductReview />. Styles in ProductReview.css

import * as React from "react";
import "./ProductReview.css";
import ReviewComponent, { ReviewRow } from "../../componenetsss/ReviewComponent";

// Utility to prettify camelCase or snake_case keys into labels
const prettify = (key: string): string => {
  return key
    // Handle consecutive capitals (acronyms like URL, API, DB)
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')  // URLPath -> URL Path
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')      // endpointURL -> endpoint URL
    .replace(/_/g, ' ')                          // snake_case -> snake case
    .replace(/^./, (s) => s.toUpperCase())       // capitalize first letter
    .trim();
};

interface ProductReviewProps {
  generalDetails: Record<string, string>;
  configuration: Record<string, string>;
}

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

  const sections = [
    { title: 'GENERAL DETAILS', rows: generalRows },
    { title: 'PRODUCT CONFIGURATION', rows: configRows }
  ];

  return (
    <div className="product-review-grid">
      {sections.map((section) => (
        <ReviewComponent
          key={section.title}
          title={section.title}
          rows={section.rows}
        />
      ))}
    </div>
  );
};

export default ProductReview;


