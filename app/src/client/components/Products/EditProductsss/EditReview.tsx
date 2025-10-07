// FILE: EditReview.tsx
// Description: Read-only review UI.
// Usage: import and render <EditReview />. Styles in ProductReview.css

import React, { useEffect } from 'react';
import './EditReview.css';

// Types
interface ReviewRow {
  label: string;
  value: string;
}

interface ReviewSection {
  title: string;
  rows: ReviewRow[];
}

interface EditReviewProps {
  generalDetails: Record<string, string>;
  configuration: Record<string, string>;
  enableLocalStorage?: boolean; // Optional flag to enable localStorage persistence
}

// Known label overrides for common keys
const LABEL_OVERRIDES: Record<string, string> = {
  productName: 'Product Name',
  version: 'Version',
  skuCode: 'SKU Code',
  internalSkuCode: 'Internal SKU Code',
  productDescription: 'Product Description',
};

// Utility to prettify keys into labels (handles camelCase/snake_case + acronyms)
const prettify = (key: string): string => {
  if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key];

  const spaced = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (s) => s.toUpperCase());

  const ACRONYMS = new Map<string, string>([
    ['api', 'API'],
    ['url', 'URL'],
    ['id', 'ID'],
    ['sku', 'SKU'],
    ['uom', 'UOM'],
    ['db', 'DB'],
    ['sql', 'SQL'],
    ['llm', 'LLM'],
  ]);

  return spaced
    .split(' ')
    .map((w) => ACRONYMS.get(w.toLowerCase()) ?? w)
    .join(' ');
};

// Sort general details in a friendly order, keeping any extras afterward
const orderGeneral = (obj: Record<string, string>): [string, string][] => {
  const preferred = ['productName', 'version', 'skuCode', 'internalSkuCode', 'productDescription'];
  const seen = new Set(preferred);
  const entries = Object.entries(obj);
  const preferredEntries = preferred
    .map((k) => entries.find(([ek]) => ek === k))
    .filter((x): x is [string, string] => Boolean(x));

  const remaining = entries.filter(([k]) => !seen.has(k));
  return [...preferredEntries, ...remaining];
};

const CardSection: React.FC<ReviewSection> = React.memo(({ title, rows }) => {
  return (
    <section className="edit-pr-card" aria-label={title}>
      <header className="edit-pr-card__header">
        <h3 className="edit-pr-card__title">{title}</h3>
      </header>
      <div className="edit-pr-card__body">
        {rows.map((r, i) => (
          <div className="edit-pr-row" key={r.label + i}>
            <div className="edit-pr-row__label" title={r.label}>
              {r.label}
            </div>
            <div className="edit-pr-row__value" title={r.value}>
              {r.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});
CardSection.displayName = 'CardSection';

// Utility function to clear localStorage for edit review
export const clearEditReviewStorage = () => {
  localStorage.removeItem('editReviewGeneralDetails');
  localStorage.removeItem('editReviewConfiguration');
};

// Utility function to load review data from localStorage
export const loadEditReviewFromStorage = (): {
  generalDetails: Record<string, string> | null;
  configuration: Record<string, string> | null;
} => {
  try {
    const generalDetails = localStorage.getItem('editReviewGeneralDetails');
    const configuration = localStorage.getItem('editReviewConfiguration');
    return {
      generalDetails: generalDetails ? JSON.parse(generalDetails) : null,
      configuration: configuration ? JSON.parse(configuration) : null,
    };
  } catch (error) {
    console.error('Error loading review data from localStorage:', error);
    return { generalDetails: null, configuration: null };
  }
};

const EditReview: React.FC<EditReviewProps> = ({ 
  generalDetails, 
  configuration, 
  enableLocalStorage = true 
}) => {
  // Persist to localStorage whenever props change
  useEffect(() => {
    if (enableLocalStorage) {
      if (generalDetails && Object.keys(generalDetails).length > 0) {
        localStorage.setItem('editReviewGeneralDetails', JSON.stringify(generalDetails));
      }
      if (configuration && Object.keys(configuration).length > 0) {
        localStorage.setItem('editReviewConfiguration', JSON.stringify(configuration));
      }
    }
  }, [generalDetails, configuration, enableLocalStorage]);

  const generalRows: ReviewRow[] = orderGeneral(generalDetails).map(([k, v]) => ({
    label: prettify(k),
    value: (v ?? '').toString() || '—',
  }));

  const configRows: ReviewRow[] = Object.entries(configuration).map(([k, v]) => ({
    label: prettify(k),
    value: (v ?? '').toString() || '—',
  }));

  const sections: ReviewSection[] = [
    { title: 'GENERAL DETAILS', rows: generalRows },
    { title: 'PRODUCT CONFIGURATION', rows: configRows },
  ];

  return (
    <div className="edit-pr-wrapper">
      <div className="edit-pr-grid">
        {sections.map((s) => (
          <CardSection key={s.title} {...s} />
        ))}
      </div>
    </div>
  );
};

export default EditReview;
