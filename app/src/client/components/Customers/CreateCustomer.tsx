import React, { useState, useEffect } from 'react';
import CustomerReview from './CustomerReview';
import { InputField, SelectField, TextareaField } from '../Components/InputFields';
import { createCustomer, confirmCustomer } from '../../api';
import { AccountDetailsData } from './AccountDetailsForm';
import AccountDetailsForm from './AccountDetailsForm';
/* Local simple input/select components removed; using shared components */
/*
interface SimpleInputProps {
  label?: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (val: string) => void;
}
const InputField: React.FC<SimpleInputProps> = ({ label, value, placeholder, onChange, type = 'text' }) => (
  <div className="com-form-group">
    {label && <label className="com-form-label">{label}</label>}
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="cus-input"
    />
  </div>
);

interface SimpleSelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options?: { label: string; value: string }[];
  disabled?: boolean;
  placeholder?: string;
}
const _DeprecatedSelectField: React.FC<SimpleSelectProps> = ({ label, value, onChange, options = [], disabled = false, placeholder }) => (
  <div className="com-form-group">
    {label && <label className="com-form-label">{label}</label>}
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="cus-select"
      disabled={disabled}
    >
      <option value="">{placeholder || '--Select--'}</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

*/

import './CustomerForm.css'; // You can rename this if needed
import buttonStyles from '../NewProductForm/GeneralDetails.module.css';

interface CreateCustomerProps {
  onClose: () => void;
}

const connectorHeights = [70, 70];

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

  // Apply page-wide background color while CreateCustomer is mounted
  useEffect(() => {
    document.body.classList.add('create-customer-page');
    return () => {
      document.body.classList.remove('create-customer-page');
    };
  }, []);

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
        const createdResp = await createCustomer(fd);
        const newCustomerId = createdResp?.id ?? createdResp?.customerId ?? createdResp?.data?.id;
        if (newCustomerId !== undefined && newCustomerId !== null) {
          try {
            await confirmCustomer(newCustomerId);
          } catch (confirmErr: any) {
            console.error('Customer confirmation failed', confirmErr);
            alert(confirmErr.message || 'Customer created but confirmation failed');
          }
        }
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

  // Save as Draft: post whatever details are currently entered
  const handleSaveDraft = async () => {
    const nz = (v: string | undefined | null) => {
      if (typeof v !== 'string') return v ?? null;
      const t = v.trim();
      return t === '' ? null : t;
    };
    // Sanitize phone: allow optional leading '+' then digits
    const rawPhone = nz(accountDetails?.phoneNumber);
    let sanitizedPhone: string | null = null;
    if (rawPhone) {
      const cleaned = rawPhone.replace(/[^0-9+]/g, ''); // keep digits & plus
      sanitizedPhone = cleaned.startsWith('+')
        ? '+' + cleaned.slice(1).replace(/[^0-9]/g, '')
        : cleaned.replace(/[^0-9]/g, '');
      if (sanitizedPhone.length === 0) sanitizedPhone = null;
    }
    // Construct payload (allowing partial data). Backend should treat this as draft.
    const dataPayload = {
      companyName: nz(companyName),
      customerName: nz(customerName),
      companyType: nz(companyType),
      phoneNumber: sanitizedPhone,
      primaryEmail: nz(accountDetails?.primaryEmail),
      additionalEmailRecipients: accountDetails?.additionalEmailRecipients && accountDetails.additionalEmailRecipients.length ? accountDetails.additionalEmailRecipients : null,
      customerAddressLine1: nz(accountDetails?.customerAddressLine1),
      customerAddressLine2: nz(accountDetails?.customerAddressLine2),
      customerCity: nz(accountDetails?.customerCity),
      customerState: nz(accountDetails?.customerState),
      customerPostalCode: nz(accountDetails?.customerPostalCode),
      customerCountry: nz(accountDetails?.customerCountry),
      billingSameAsCustomer: accountDetails?.billingSameAsCustomer ?? false,
      billingAddressLine1: nz(accountDetails?.billingAddressLine1),
      billingAddressLine2: nz(accountDetails?.billingAddressLine2),
      billingCity: nz(accountDetails?.billingCity),
      billingState: nz(accountDetails?.billingState),
      billingPostalCode: nz(accountDetails?.billingPostalCode),
      billingCountry: nz(accountDetails?.billingCountry)
    } as const;

    console.log('Save-draft JSON payload:', dataPayload);
    const fd = new FormData();
    fd.append('request', new Blob([JSON.stringify(dataPayload)], { type: 'application/json' }));
    if (companyLogo) fd.append('companyLogo', companyLogo, companyLogo.name);
    console.log('Save-draft payload (FormData):', Array.from(fd.entries()));

    try {
      setIsSubmitting(true);
      await createCustomer(fd);
      alert('Draft saved successfully');
      onClose();
    } catch (err: any) {
      console.error('Save draft failed', err);
      alert(err.message || 'Error saving draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            {/* Company Name */}
            <div className="sub-create-form">
              <label className="com-form-label">Company Name</label>
              <input
                type="text"
                className="cus-input"
                value={companyName}
                placeholder="eg., abc company"
                onChange={e => { setCompanyName(e.target.value); if (errors.companyName) setErrors(prev => ({ ...prev, companyName: '' })); }}
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
                  </span>  </div>

                <input
                  id="companyLogoInput"
                  type="file"
                  accept="image/*"
                  className="company-logo-input"
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
              <label className="com-form-label">Customer Name</label>
              <input
                type="text"
                className="cus-input"
                value={customerName}
                placeholder="eg. john doe"
                onChange={e => { setCustomerName(e.target.value); if (errors.customerName) setErrors(prev => ({ ...prev, customerName: '' })); }}
              />
              {errors.customerName && <span className="field-error">{errors.customerName}</span>}
            </div>
            {/* Company Type (select) */}
            <div className="sub-create-form">
              <label className="com-form-label">Company Type</label>
              <select
                className="cus-select"
                value={companyType}
                onChange={e => { setCompanyType(e.target.value); if (errors.companyType) setErrors(prev => ({ ...prev, companyType: '' })); }}
              >
                <option value="">Select Company Type</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="BUSINESS">Business</option>
              </select>
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
          <button className="btn save-draft" onClick={handleSaveDraft} disabled={isSubmitting}>Save as Draft</button>
        </div>
      </div>
      <hr className="sub-header-divider" />
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="11.5" fill="var(--color-primary-800)" stroke="var(--color-primary-800)" />
                      <path d="M7 12l3 3 6-6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
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

          <div className="cus-form-section">
            <div className="cus-form-card">
              <h4 className="cus-form-section-heading">{steps[currentStep].title.toUpperCase()}</h4>
              <hr className="cus-form-section-divider" />
              {renderStepContent()}
            </div>
            <div className="button-group">
              <button type="button" className={buttonStyles.buttonSecondary} onClick={handleBack}>Back</button>
              <button
                className={buttonStyles.buttonPrimary}
                onClick={handleNext}
                disabled={isSubmitting}
              >{currentStep === steps.length - 1 ? 'Create Customer' : 'Save & Next'}</button>
            </div>
          </div>
        </div>

        {showCancelModal && (
          <div className="rate-delete-modal-overlay">
          <div className="rate-delete-modal-content">
            <div className="rate-delete-modal-body">
              <h5>Are you sure you want to cancel <br />creating this rate plan?</h5>
              <p>This action cannot be undone.</p>
            </div>
            <div className="rate-delete-modal-footer">
                <button className="rate-delete-modal-cancel" onClick={() => setShowCancelModal(false)}>Back</button>
                <button className="rate-delete-modal-confirm" onClick={onClose}>Confirm</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateCustomer;
