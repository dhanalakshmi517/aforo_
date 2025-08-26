import React from 'react';
import { AccountDetailsData } from './EditAccount';
import './EditReview.css';

interface Field {
  label: string;
  value: string;
}

interface Section {
  title: string;
  fields: Field[];
}

interface EditReviewProps {
  customerName: string;
  companyName: string;
  companyType: string;
  accountDetails: AccountDetailsData | null;
}

const formatValue = (value: string | undefined | null): string => {
  return value && value.trim() !== '' ? value : '—';
};

const getSections = ({ customerName, companyName, companyType, accountDetails }: EditReviewProps): Section[] => {
  const customerFields: Field[] = [
    { label: 'Customer Name', value: formatValue(customerName) },
    { label: 'Company Name', value: formatValue(companyName) },
    { label: 'Company Type', value: formatValue(companyType) },
  ];

  const accountFields: Field[] = [
    { label: 'Phone Number', value: formatValue(accountDetails?.phoneNumber) },
    { label: 'Primary Email', value: formatValue(accountDetails?.primaryEmail) },
    { label: 'Additional Email Recipients', value: accountDetails?.additionalEmailRecipients?.length ? accountDetails.additionalEmailRecipients.join(', ') : '—' },
    { label: 'Customer Address Line 1', value: formatValue(accountDetails?.customerAddressLine1) },
    { label: 'Customer Address Line 2', value: formatValue(accountDetails?.customerAddressLine2) },
    { label: 'Customer City', value: formatValue(accountDetails?.customerCity) },
    { label: 'Customer State/Province', value: formatValue(accountDetails?.customerState) },
    { label: 'Customer Postal Code', value: formatValue(accountDetails?.customerPostalCode) },
    { label: 'Customer Country', value: formatValue(accountDetails?.customerCountry) },
    { label: 'Billing Same As Customer', value: accountDetails?.billingSameAsCustomer ? 'Yes' : 'No' },
    { label: 'Billing Address Line 1', value: formatValue(accountDetails?.billingAddressLine1) },
    { label: 'Billing Address Line 2', value: formatValue(accountDetails?.billingAddressLine2) },
    { label: 'Billing City', value: formatValue(accountDetails?.billingCity) },
    { label: 'Billing State/Province', value: formatValue(accountDetails?.billingState) },
    { label: 'Billing Postal Code', value: formatValue(accountDetails?.billingPostalCode) },
    { label: 'Billing Country', value: formatValue(accountDetails?.billingCountry) },
  ];

  return [
    { title: 'Customer Details', fields: customerFields },
    { title: 'Account Details', fields: accountFields },
  ];
};

const EditReview: React.FC<EditReviewProps> = (props) => {
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

export default EditReview;
