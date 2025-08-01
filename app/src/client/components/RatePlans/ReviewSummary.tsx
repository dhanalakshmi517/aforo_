import React from 'react';
import './ReviewSummary.css';

interface SummaryItem {
  label: string;
  value: string;
  highlight?: boolean;
}

interface SummarySection {
  title: string;
  items: SummaryItem[];
}

const sections: SummarySection[] = [
  {
    title: 'PLAN DETAILS',
    items: [
      { label: 'Rate Plan Name', value: 'Entered Value', highlight: true },
      { label: 'Rate Plan Description', value: 'Entered Value', highlight: true },
      { label: 'Billing Frequency', value: 'Selected Option' },
    ],
  },
  {
    title: 'DEFINE BILLABLE METRICS',
    items: [
      { label: 'Description', value: 'Selected Option' },
      { label: 'Metric Name', value: 'Entered Value', highlight: true },
      { label: 'Define Unit', value: 'Selected Option' },
      { label: 'Define Aggregation Type', value: 'Selected Option' },
    ],
  },
  {
    title: 'PRICING MODEL SETUP',
    items: [
      { label: 'Rate Plan', value: 'Selected Option' },
      { label: 'Flat Fee Amount', value: 'Selected Option' },
      { label: 'Usage Limit', value: 'Selected Option' },
      { label: 'Charges Per User', value: 'Selected Option' },
    ],
  },
  {
    title: 'EXTRAS',
    items: [
      { label: 'Setup Fee (Optional)', value: 'Selected Option', highlight: true },
      { label: 'One-time Setup Fee', value: 'Selected Option' },
      { label: 'Application Timing', value: 'Selected Option' },
      { label: 'Invoice Description', value: 'Selected Option' },
    ],
  },
];

const ReviewSummary: React.FC = () => {
  return (
    <div className="summary-panel">
      {sections.map((section, index) => (
        <div className="summary-section" key={index}>
          <div className="summary-title">{section.title}</div>
          {section.items.map((item, idx) => (
            <div className="summary-row" key={idx}>
              <div className="summary-label">{item.label}</div>
              <div
                className={`summary-value ${item.highlight ? 'highlight' : ''}`}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ReviewSummary;
