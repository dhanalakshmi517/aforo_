import React from 'react';
import './CustomerReview.css';

interface Section {
  title: string;
  fields: { label: string; value: string }[];
}

const sections: Section[] = [
  {
    title: 'Customer Details',
    fields: [
      { label: 'Customer Name', value: 'Entered Value' },
      { label: 'Company Name', value: 'Entered Value' },
      { label: 'Company Type', value: 'Entered Value' },
    ],
  },
  {
    title: 'Account Details',
    fields: [
      { label: 'Account Name', value: 'Entered Value' },
      { label: 'Net Term Days', value: 'Entered Value' },
      { label: 'Primary Email', value: 'Entered Value' },
      { label: 'Email Recipients', value: 'Entered Value' },
      { label: 'Account Billing Address', value: 'Selected' },
      { label: 'Phone Number', value: 'Entered Value' },
      { label: 'Billing Address Line 1', value: 'Entered Value' },
      { label: 'Billing Address Line 2', value: 'Entered Value' },
    ],
  },
];

const CustomerReview: React.FC = () => {
  return (
    <div className="review-wrapper">
      {sections.map((section, idx) => (
        <div className="review-section" key={idx}>
          <h4 className="section-title">{section.title}</h4>
          <div className="review-grid">
            {section.fields.map((field, i) => (
              <React.Fragment key={i}>
                <div className="review-label">{field.label}</div>
                <div className="review-value">{field.value}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerReview;
