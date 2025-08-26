import React, { useState, useEffect } from 'react';
import CustomerReview from './CustomerReview';
import { createCustomer } from '../../api';
import { AccountDetailsData } from './AccountDetailsForm';
import AccountDetailsForm from './AccountDetailsForm';
import { InputField, SelectField } from '../Components/InputFields';
import './CustomerForm.css'; // You can rename this if needed

interface CreateCustomerProps {
  onClose: () => void;
}

const connectorHeights = [70,90];

const steps = [
  { title: 'Customer Details', desc: 'Enter core information for the customer.' },
  { title: 'Billing & Plan', desc: 'Configure billing frequency and plan.' },
  { title: 'Review & Confirm', desc: 'Double-check everything before saving.' },
];

const CreateCustomer: React.FC<CreateCustomerProps> = ({ onClose }) => {
  const [customerName, setCustomerName] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [billingFrequency, setBillingFrequency] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [accountDetails, setAccountDetails] = useState<AccountDetailsData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [paymentGateway, setPaymentGateway] = useState('');
  const [billingAddressLine1, setBillingAddressLine1] = useState('');
  const [billingAddressLine2, setBillingAddressLine2] = useState('');
  const [ratePlans, setRatePlans] = useState('');
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedRatePlanName, setSelectedRatePlanName] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [accountErrors, setAccountErrors] = useState<{ [key: string]: string }>({});

  // Automatically clear Account Details errors when fields become valid
  useEffect(() => {
    if (!accountDetails) return;

    setAccountErrors((prev) => {
      if (!prev || Object.keys(prev).length === 0) return prev;
      const updated: { [key: string]: string } = { ...prev };

      const clearIfValid = (key: keyof typeof updated, valid: boolean) => {
        if (updated[key] && valid) delete updated[key];
      };

      clearIfValid('phoneNumber', !!accountDetails.phoneNumber?.trim());
      clearIfValid(
        'primaryEmail',
        !!accountDetails.primaryEmail?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountDetails.primaryEmail)
      );

      const stringFields: (keyof typeof updated)[] = [
        'billingAddressLine1',
        'billingAddressLine2',
        'billingCity',
        'billingState',
        'billingPostalCode',
        'billingCountry',
        'customerAddressLine1',
        'customerAddressLine2',
        'customerCity',
        'customerState',
        'customerPostalCode',
        'customerCountry',
      ];
      stringFields.forEach((field) => clearIfValid(field, !!(accountDetails as any)[field]?.trim?.()));

      return updated;
    });
  }, [accountDetails]);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleNext = async () => {
    // Validate required fields on step 0 before progressing
    if (currentStep === 0) {
      const newErrors: { [key: string]: string } = {};
      if (!companyName.trim()) newErrors.companyName = 'Company Name is required';
      if (!customerName.trim()) newErrors.customerName = 'Customer Name is required';
      if (!companyType.trim()) newErrors.companyType = 'Company Type is required';
      setErrors(newErrors);
      if (Object.keys(newErrors).length) return; // stop navigation until fixed
    }
    // Validate required fields on step 1 before progressing
    if (currentStep === 1) {
      const newAccErrs: { [key: string]: string } = {};
      if (!accountDetails?.phoneNumber?.trim()) newAccErrs.phoneNumber = 'Phone Number is required';
      if (!accountDetails?.primaryEmail?.trim()) {
        newAccErrs.primaryEmail = 'Primary Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountDetails.primaryEmail)) {
        newAccErrs.primaryEmail = 'Enter a valid email address';
      }

      // Address validation
      if (!accountDetails?.billingAddressLine1?.trim()) newAccErrs.billingAddressLine1 = 'Billing Address Line 1 is required';
      if (!accountDetails?.billingAddressLine2?.trim()) newAccErrs.billingAddressLine2 = 'Billing Address Line 2 is required';
      if (!accountDetails?.billingCity?.trim()) newAccErrs.billingCity = 'Billing City is required';
      if (!accountDetails?.billingState?.trim()) newAccErrs.billingState = 'Billing State is required';
      if (!accountDetails?.billingPostalCode?.trim()) newAccErrs.billingPostalCode = 'Billing Postal Code is required';
      if (!accountDetails?.billingCountry?.trim()) newAccErrs.billingCountry = 'Billing Country is required';

      if (!accountDetails?.customerAddressLine1?.trim()) newAccErrs.customerAddressLine1 = 'Customer Address Line 1 is required';
      if (!accountDetails?.customerAddressLine2?.trim()) newAccErrs.customerAddressLine2 = 'Customer Address Line 2 is required';
      if (!accountDetails?.customerCity?.trim()) newAccErrs.customerCity = 'Customer City is required';
      if (!accountDetails?.customerState?.trim()) newAccErrs.customerState = 'Customer State is required';
      if (!accountDetails?.customerPostalCode?.trim()) newAccErrs.customerPostalCode = 'Customer Postal Code is required';
      if (!accountDetails?.customerCountry?.trim()) newAccErrs.customerCountry = 'Customer Country is required';
      setAccountErrors(newAccErrs);
      if (Object.keys(newAccErrs).length) return;
    }
    const isLastStep = currentStep === steps.length - 1;
    if (isLastStep) {
      // prepare payload and call API
      if (!accountDetails) {
        alert('Please complete account details');
        return;
      }
      if (!accountDetails.phoneNumber || !accountDetails.primaryEmail) {
        alert('Phone number and primary email are required');
        return;
      }
      const dataPayload = {
        companyName,
        companyLogoUrl: companyLogo ? companyLogo.name : null,
        customerName,
        companyType,
        phoneNumber: accountDetails.phoneNumber,
        primaryEmail: accountDetails.primaryEmail,
        additionalEmailRecipients: accountDetails.additionalEmailRecipients,
        customerAddressLine1: accountDetails.customerAddressLine1,
        customerAddressLine2: accountDetails.customerAddressLine2,
        customerCity: accountDetails.customerCity,
        customerState: accountDetails.customerState,
        customerPostalCode: accountDetails.customerPostalCode,
        customerCountry: accountDetails.customerCountry,
        billingSameAsCustomer: accountDetails.billingSameAsCustomer,
        billingAddressLine1: accountDetails.billingAddressLine1,
        billingAddressLine2: accountDetails.billingAddressLine2,
        billingCity: accountDetails.billingCity,
        billingState: accountDetails.billingState,
        billingPostalCode: accountDetails.billingPostalCode,
        billingCountry: accountDetails.billingCountry,
      };
      const fd = new FormData();
      fd.append('request', new Blob([JSON.stringify(dataPayload)], { type: 'application/json' }));
      if (companyLogo) fd.append('companyLogo', companyLogo, companyLogo.name);
      console.log('Customer create payload (FormData):', Array.from(fd.entries()));
      try {
        setIsSubmitting(true);
        await createCustomer(fd);
      } catch (err: any) {
        alert(err.message || 'Error creating customer');
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
      alert('Customer created successfully');
      onClose();
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
            {/* Company Name */}
            <div className="sub-create-form">
              <InputField
                label="Company Name"
                value={companyName}
                placeholder="Enter company name"
                onChange={(val) => { setCompanyName(val); if(errors.companyName) setErrors(prev=>({ ...prev, companyName: '' })); }}
              />
              {errors.companyName && <span className="field-error">{errors.companyName}</span>}
            </div>
      
            {/* Company Logo (Upload) */}
            <div className="sub-create-form">
              <label>Company Logo</label>
      
              <div className="upload-field">
                <div className="logo-box" onClick={() => document.getElementById('companyLogoInput')?.click()}>
                  {/* user/avatar circle icon */}
                  <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="7.5" r="3.5" stroke="#8C8A8F" strokeWidth="1.5"/>
                    <path d="M5 20c0-3.5 3.134-6 7-6s7 2.5 7 6" stroke="#8C8A8F" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
      
                  <span className="logo-placeholder">
                    {companyLogo ? companyLogo.name : 'Upload Company Logo'}
                  </span>

                                  </div>

                <input
                  id="companyLogoInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    setCompanyLogo(file ?? null);
                  }}
                  style={{ display: 'none' }}
                />
      
                                                </div>
      
              {companyLogo && (
                <div className="file-hint">
                  Selected: <strong>{companyLogo.name}</strong>
                  <button
                    type="button"
                    className="clear-file"
                    onClick={() => setCompanyLogo(null)}
                    aria-label="Clear selected file"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
      
            {/* Customer Name */}
            <div className="sub-create-form">
              <InputField
                label="Customer Name"
                value={customerName}
                placeholder="Enter customer name"
                onChange={(val)=>{ setCustomerName(val); if(errors.customerName) setErrors(prev=>({ ...prev, customerName: '' })); }}
              />
              {errors.customerName && <span className="field-error">{errors.customerName}</span>}
            </div>
      
            {/* Company Type (select) */}
            <div className="sub-create-form">
              <SelectField
                label="Company Type"
                value={companyType}
                onChange={(val)=>{ setCompanyType(val); if(errors.companyType) setErrors(prev=>({ ...prev, companyType: '' })); }}
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
          <AccountDetailsForm data={accountDetails ?? undefined} onChange={setAccountDetails} errors={accountErrors} />
        );

      case 2:
        return (
          <CustomerReview
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

  return (
    <>
      <div className="sub-header">
        <h2>Create New Customer</h2>
        <div className="header-actions">
                    <button className="btn cancel" onClick={() => setShowCancelModal(true)} disabled={isSubmitting}>Cancel</button>
          <button className="btn save-draft" disabled={isSubmitting}>Save as Draft</button>
        </div>
      </div>
      <div className="sub-create-price-plan">
        <div className="cus-wrapper">
          <aside className="cus-sidebar">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`sub-step-item ${index === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
              >
                <div className="sub-icon-wrappers">
                  {index < currentStep ? (
                    <svg style={index === 2 ? { transform: 'translateY(-6px)' } : undefined} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="11.5" fill="var(--color-primary-800)" stroke="var(--color-primary-800)" />
                      <path d="M7 12l3 3 6-6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg style={index === 2 ? { transform: 'translateY(-6px)' } : undefined} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7" />
                      <circle cx="12" cy="12" r="6" fill="#D6D5D7" />
                    </svg>
                  )}
                  {index < steps.length - 1 && (
                    <svg
                      className="sub-step-line"
                      xmlns="http://www.w3.org/2000/svg"
                      width="2"
                      height={connectorHeights[index]}
                      viewBox={`0 0 2 ${connectorHeights[index]}`}
                      fill="none"
                    >
                      <line
                        x1="1"
                        y1="0"
                        x2="1"
                        y2={connectorHeights[index]}
                        stroke={index < currentStep ? '#2D7CA4' : '#BDBBBE'}
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </div>
                <div className="sub-step-text">
                  <span className="sub-step-title">{step.title}</span>
                  <span className="sub-step-desc">{step.desc}</span>
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
              <button className="back" onClick={handleBack} disabled={currentStep === 0}>Back</button>
              <button
                className="save-next"
                onClick={handleNext}
                disabled={isSubmitting}
              >{currentStep === steps.length - 1 ? 'Create Customer' : 'Save & Next'}</button>
            </div>
          </div>
        </div>

        {showCancelModal && (
          <div className="delete-modal-overlay">
            <div className="delete-modal-content">
              <div className="delete-modal-body">
                <h5>Are you sure you want to discard<br /> this plan?</h5>
                <p>Your progress will not be saved.</p>
              </div>
              <div className="delete-modal-footer">
                <button className="delete-modal-cancel" onClick={() => setShowCancelModal(false)}>Back</button>
                <button className="delete-modal-confirm" onClick={onClose}>Confirm</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateCustomer;
