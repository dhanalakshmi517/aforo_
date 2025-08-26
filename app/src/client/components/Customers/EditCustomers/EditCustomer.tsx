import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCustomer, updateCustomer } from '../api';
import type { Customer } from '../Customers';
import EditReview from './EditReview';
import { AccountDetailsData } from './EditAccount';
import EditAccount from './EditAccount';
import { InputField, SelectField } from '../../Components/InputFields';
import './EditCustomer.css';

const steps = [
  { title: 'Customer Details' },
  { title: 'Billing & Plan' },
  { title: 'Review & Confirm' },
];

const EditCustomer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

  // Step 0: Customer info
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);

  // Step 1: Account details
  const [accountDetails, setAccountDetails] = useState<AccountDetailsData | null>(null);

  // Step control & validation
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [accountErrors, setAccountErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCustomer(id)
      .then((data: Customer) => {
        setCompanyName(data.companyName ?? '');
        setCustomerName(data.customerName ?? '');
        setCompanyType(data.companyType ?? '');
        const account: AccountDetailsData = {
          phoneNumber: data.phoneNumber ?? '',
          primaryEmail: data.primaryEmail ?? '',
          additionalEmailRecipients: data.additionalEmailRecipients ?? [],
          billingSameAsCustomer: data.billingSameAsCustomer ?? false,
          customerAddressLine1: data.customerAddressLine1 ?? '',
          customerAddressLine2: data.customerAddressLine2 ?? '',
          customerCity: data.customerCity ?? '',
          customerState: data.customerState ?? '',
          customerPostalCode: data.customerPostalCode ?? '',
          customerCountry: data.customerCountry ?? '',
          billingAddressLine1: data.billingAddressLine1 ?? '',
          billingAddressLine2: data.billingAddressLine2 ?? '',
          billingCity: data.billingCity ?? '',
          billingState: data.billingState ?? '',
          billingPostalCode: data.billingPostalCode ?? '',
          billingCountry: data.billingCountry ?? '',
        };
        setAccountDetails(account);
      })
      .catch((err: unknown) => {
        console.error('Failed to fetch customer', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleNext = async () => {
    if (currentStep === 0) {
      const newErrors: { [key: string]: string } = {};
      if (!companyName.trim()) newErrors.companyName = 'Company Name is required';
      if (!customerName.trim()) newErrors.customerName = 'Customer Name is required';
      if (!companyType.trim()) newErrors.companyType = 'Company Type is required';
      setErrors(newErrors);
      if (Object.keys(newErrors).length) return;
    }

    if (currentStep === 1) {
      const newAccErrs: { [key: string]: string } = {};
      if (!accountDetails?.phoneNumber?.trim()) newAccErrs.phoneNumber = 'Phone Number is required';
      if (!accountDetails?.primaryEmail?.trim()) {
        newAccErrs.primaryEmail = 'Primary Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountDetails.primaryEmail)) {
        newAccErrs.primaryEmail = 'Enter a valid email address';
      }
      setAccountErrors(newAccErrs);
      if (Object.keys(newAccErrs).length) return;
    }

    const isLastStep = currentStep === steps.length - 1;
    if (isLastStep) {
      const payload: Record<string, any> = {
        companyName,
        customerName,
        companyType,
        ...(accountDetails ?? {})
      };
      try {
        await updateCustomer(id!, payload);
        alert('Changes saved successfully');
      } catch (err) {
        console.error('Failed to update', err);
        alert('Failed to save changes');
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="sub-create-form">
              <InputField
                label="Company Name"
                value={companyName}
                placeholder="Enter company name"
                onChange={(val: string) => {
                  setCompanyName(val);
                  if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: '' }));
                }}
              />
              {errors.companyName && <span className="field-error">{errors.companyName}</span>}
            </div>

            <div className="sub-create-form">
              <InputField
                label="Customer Name"
                value={customerName}
                placeholder="Enter customer name"
                onChange={(val: string) => {
                  setCustomerName(val);
                  if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: '' }));
                }}
              />
              {errors.customerName && <span className="field-error">{errors.customerName}</span>}
            </div>

            <div className="sub-create-form">
              <SelectField
                label="Company Type"
                value={companyType}
                onChange={(val: string) => {
                  setCompanyType(val);
                  if (errors.companyType) setErrors((prev) => ({ ...prev, companyType: '' }));
                }}
                options={[
                  { label: 'Individual', value: 'INDIVIDUAL' },
                  { label: 'Business', value: 'BUSINESS' },
                ]}
              />
              {errors.companyType && <span className="field-error">{errors.companyType}</span>}
            </div>
          </>
        );

      case 1:
        return (
          <EditAccount
            data={accountDetails ?? undefined}
            onChange={setAccountDetails}
            errors={accountErrors}
          />
        );

      case 2:
        return (
          <EditReview
            customerName={customerName}
            companyName={companyName}
            companyType={companyType}
            accountDetails={accountDetails}
          />
        );

      default:
        return <p>Coming soon...</p>;
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="edit-customer-container">
      <div className="cus-wrapper">
        <aside className="cus-sidebar">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`edit-step-item ${index === currentStep ? 'active' : ''}`}
              onClick={() => setCurrentStep(index)}
            >
              <div className="edit-step-text">
                <span className="edit-step-title">{step.title}</span>
              </div>
            </div>
          ))}
        </aside>

        <div className="form-section">
          <div className="form-card">
            <h4 className="form-section-heading">{steps[currentStep].title.toUpperCase()}</h4>
            <hr className="form-section-divider" />
            {renderStepContent()}
          </div>
          <div className="button-group">
            <button className="back" onClick={handleBack} disabled={currentStep === 0}>
              Back
            </button>
            <button className="save-next" onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Save Changes' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCustomer;
