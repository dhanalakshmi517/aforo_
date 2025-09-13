import React, { useState, useEffect } from 'react';
import SubReview from './SubReview';
import { Api, Product, RatePlan, Customer } from './api';
import './CreateSubscription.new.css';
import { InputField, TextareaField, SelectField } from '../Components/InputFields';
import TopBar from '../TopBar/TopBar';

import { Subscription as SubscriptionType } from './api';

interface CreateSubscriptionProps {
  onClose: () => void;
  onCreateSuccess: (sub: SubscriptionType) => void;
}

const steps = [
  {
    title: 'Subscription Details',
    desc: 'Set up the core information like plan type, and pricing model for this subscription.',
  },
  {
    title: 'Review & Confirm',
    desc: 'Review the final pricing and details based on the information you\'ve entered.',
  },
];

const CreateSubscription: React.FC<CreateSubscriptionProps> = ({ onClose, onCreateSuccess }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [billingFrequency, setBillingFrequency] = useState('');
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [selectedRatePlanName, setSelectedRatePlanName] = useState('');
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | null>(null);
  const [paymentType, setPaymentType] = useState<'PREPAID' | 'POSTPAID' | ''>('');

  const [currentStep, setCurrentStep] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [savingDraft, setSavingDraft] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string,string>>({});

  // helper to remove a specific field error
  const clearError = (field: string) => {
    setErrors(prev => {
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  // Load data (with Bearer attached via Api)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, ratePlansData, customersData] = await Promise.all([
          Api.getProducts(),
          Api.getRatePlans(),
          Api.getCustomers(),
        ]);
        setProducts(productsData ?? []);
        setRatePlans(ratePlansData ?? []);
        setCustomers(customersData ?? []);
      } catch (error) {
        console.error('Failed to load subscription dependencies.', error);
      }
    };
    fetchData();
  }, []);

  const validateStep0 = (): boolean => {
    const e: Record<string,string> = {};
    if (!selectedCustomerId) e.customerId = "This field is required";
    if (!selectedProductId) e.productId = "This field is required";
    if (!selectedRatePlanId) e.ratePlanId = "This field is required";
    if (!paymentType) e.paymentType = "This field is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveDraft = async () => {
    if (savingDraft) return;
    setSavingDraft(true);
    try {
      const payload = {
        customerId: selectedCustomerId || 0,
        productId: selectedProductId || 0,
        ratePlanId: selectedRatePlanId || 0,
        paymentType: paymentType || 'PREPAID',
        adminNotes: planDescription,
        status: 'DRAFT'
      } as any;
      let resp: SubscriptionType;
      if (subscriptionId) {
        resp = await Api.updateSubscriptionDraft(subscriptionId, payload as any);
      } else {
        resp = await Api.createSubscriptionDraft(payload as any);
        setSubscriptionId(resp.subscriptionId);
      }
      console.log('Draft saved', resp);
      setSubmissionStatus('success');
    } catch (e) {
      console.error('Failed to save draft', e);
      setSubmissionStatus('error');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      if (!validateStep0()) return;
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // We are on the final Review step – create the subscription
    try {
      const payload = {
        customerId: selectedCustomerId || 0,
        productId: selectedProductId || 0,
        ratePlanId: selectedRatePlanId || 0,
        paymentType: (paymentType || 'PREPAID') as 'PREPAID' | 'POSTPAID',
        adminNotes: planDescription,
      };
      console.log('Creating subscription payload', payload);
      const resp: SubscriptionType = await Api.createSubscription(payload);
      console.log('Subscription created successfully', resp);
      setSubmissionStatus('success');
      onCreateSuccess(resp);
      onClose();
    } catch (e) {
      console.error('Failed to create subscription', e);
      setSubmissionStatus('error');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onClose();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="sub-create-form">
              <SelectField
                label="Customer"
                value={selectedCustomerId?.toString() || ''}
                onChange={(val) => {
                  const id = Number(val);
                  setSelectedCustomerId(id);
                  clearError('customerId');
                  const cust = customers.find(c => c.customerId === id);
                  setSelectedCustomerName(cust?.customerName || '');
                }}
                error={errors.customerId}
                options={customers.map(c => ({ label: c.customerName, value: c.customerId.toString() }))}
              />
            </div>

            <SelectField
              label="Product"
              value={selectedProductId?.toString() || ''}
                onChange={(val) => {
                  const id = Number(val);
                  setSelectedProductId(id);
                  clearError('productId');
                  const prod = products.find(p => p.productId === id);
                  setSelectedProductName(prod?.productName || '');
                  setSelectedRatePlanName('');
                  setSelectedRatePlanId(null);
                }}
                error={errors.productId}
              options={products.map(p => ({ label: p.productName, value: p.productId.toString() }))}
            />
            <div className="product-note">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <g clipPath="url(#clip0_7837_33153)">
                  <path d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#1D7AFC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                  <clipPath id="clip0_7837_33153">
                    <rect width="12" height="12" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              <span>
                Select a product to view its associated rate plans.
              </span>
            </div>

            <SelectField
              label="Rate Plan"
              value={selectedRatePlanId?.toString() || ''}
                onChange={(val) => {
                  const id = Number(val);
                  setSelectedRatePlanId(id);
                  clearError('ratePlanId');
                  const rp = ratePlans.find(r => r.ratePlanId === id);
                  setSelectedRatePlanName(rp?.ratePlanName || '');
                }}
                error={errors.ratePlanId}
              options={ratePlans.map(rp => ({ label: rp.ratePlanName, value: rp.ratePlanId.toString() }))}
            />
            <div className="rateplan-note">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <g clipPath="url(#clip0_7837_33153)">
                  <path d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#1D7AFC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                  <clipPath id="clip0_7837_33153">
                    <rect width="12" height="12" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              <span>
                Select a rate plan associated with the chosen product. Changing the product will reset this selection.
              </span>
            </div>

            <SelectField
              label="Payment Type"
              value={paymentType}
              onChange={(val) => { setPaymentType(val as 'PREPAID' | 'POSTPAID'); clearError('paymentType'); }}
              error={errors.paymentType}
              options={[
                { label: 'Post-Paid', value: 'POSTPAID' },
                { label: 'Pre-Paid', value: 'PREPAID' }
              ]}
            />

            <TextareaField
              label="Admin Notes"
              placeholder="Enter admin notes"
              value={planDescription}
              onChange={setPlanDescription}
            />
          </>
        );
      case 1:
        return (
          <SubReview
            customerName={selectedCustomerName || ''}
            productName={selectedProductName || ''}
            ratePlan={selectedRatePlanName || ''}
            paymentMethod={paymentType || 'Invoice (Net Terms)'}
            adminNotes={planDescription}
          />
        );
      default:
        return <p>Coming soon...</p>;
    }
  };

  const canSaveNext =
    selectedCustomerId &&
    selectedProductId &&
    selectedRatePlanId &&
    (paymentType === 'PREPAID' || paymentType === 'POSTPAID');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar
        title="Create New Subscription"
        cancel={{
          label: "Cancel",
          onClick: () => setShowCancelModal(true)
        }}
        save={{
          label: "Save as Draft",
          saving: savingDraft,
          saved: submissionStatus === 'success',
          onClick: saveDraft
        }}
      />

      <div className="sub-create-price-plan" style={{ padding: '24px 64px', flex: 1 }}>
        <div className="sub-usage-metric-wrapper" style={{ width: '100%', maxWidth: '100%' }}>
          <aside
            className="sub-sidebars"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '300px',
              backgroundColor: 'var(--color-neutral-100)',
              padding: '30px 20px',
              borderRight: '1.5px solid var(--color-neutral-200)',
              overflow: 'hidden',
              zIndex: 1,
            }}
          >
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="2" height="111" viewBox="0 0 2 111" fill="none">
                      <path
                        d="M1 110L1 1"
                        stroke={index < currentStep ? 'var(--color-primary-800)' : '#BDBBBE'}
                        strokeWidth="2"
                        strokeLinecap="round"
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

          <div
            className="form-section"
            style={{
              marginLeft: '300px',
              width: 'calc(100% - 300px)',
              height: '100%',
              overflow: 'hidden',
              padding: '32px 40px',
              position: 'relative',
            }}
          >
            <div className="form-card">{renderStepContent()}</div>
            <div className="button-group">
              <button className="back" onClick={handleBack} disabled={currentStep === 0}>
                Back
              </button>
              <button
                className="save-next"
                onClick={handleNext}
                disabled={!canSaveNext}
                title={!canSaveNext ? 'Select customer, product, rate plan and payment type' : currentStep < steps.length - 1 ? 'Save & Next' : 'Create Purchase'}
              >
                {currentStep < steps.length - 1 ? 'Save & Next' : 'Create Purchase'}
              </button>
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
                <button className="delete-modal-cancel" onClick={() => setShowCancelModal(false)}>
                  Back
                </button>
                <button className="delete-modal-confirm" onClick={onClose}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateSubscription;
