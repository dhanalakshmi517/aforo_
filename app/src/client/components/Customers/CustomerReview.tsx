import React from 'react';
import { AccountDetailsData } from './AccountDetailsForm';
import './CustomerReview.css';

interface Section {
  title: string;
  fields: { label: string; value: string }[];
}

interface CustomerReviewProps {
  customerName: string;
  companyName: string;
  companyType: string;
  accountDetails: AccountDetailsData | null;
}

const getSections = (props: CustomerReviewProps): Section[] => {
  const customerFields: Section['fields'] = [
    { label: 'Customer Name', value: props.customerName || '—' },
    { label: 'Company Name', value: props.companyName || '—' },
    { label: 'Company Type', value: props.companyType || '—' },
  ];

  const accountFields: Section['fields'] = [
    // Contact Details
    { label: 'Phone Number', value: props.accountDetails?.phoneNumber || '—' },
    { label: 'Primary Email', value: props.accountDetails?.primaryEmail || '—' },
    { label: 'Additional Email Recipients', value: props.accountDetails?.additionalEmailRecipients?.join(', ') || '—' },
    // Customer Address
    { label: 'Customer Address Line 1', value: props.accountDetails?.customerAddressLine1 || '—' },
    { label: 'Customer Address Line 2', value: props.accountDetails?.customerAddressLine2 || '—' },
    { label: 'Customer City', value: props.accountDetails?.customerCity || '—' },
    { label: 'Customer State/Province', value: props.accountDetails?.customerState || '—' },
    { label: 'Customer Postal Code', value: props.accountDetails?.customerPostalCode || '—' },
    { label: 'Customer Country', value: props.accountDetails?.customerCountry || '—' },
    // Billing Address
    { label: 'Billing Same As Customer', value: props.accountDetails?.billingSameAsCustomer ? 'Yes' : 'No' },
    { label: 'Billing Address Line 1', value: props.accountDetails?.billingAddressLine1 || '—' },
    { label: 'Billing Address Line 2', value: props.accountDetails?.billingAddressLine2 || '—' },
    { label: 'Billing City', value: props.accountDetails?.billingCity || '—' },
    { label: 'Billing State/Province', value: props.accountDetails?.billingState || '—' },
    { label: 'Billing Postal Code', value: props.accountDetails?.billingPostalCode || '—' },
    { label: 'Billing Country', value: props.accountDetails?.billingCountry || '—' },
  ];

  return [
    { title: 'Customer Details', fields: customerFields },
    { title: 'Account Details', fields: accountFields },
  ];
};

const CustomerReview: React.FC<CustomerReviewProps> = (props) => {
  const sections = getSections(props);
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