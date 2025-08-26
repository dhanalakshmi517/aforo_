import React, { useState, useEffect } from 'react';
 import SubReview from './SubReview';
import { Api, Product, RatePlan, Customer } from './api';
import './CreateSubscription.css'; // You can rename this if desired
import { InputField, TextareaField, SelectField } from '../Components/InputFields';

interface CreateSubscriptionProps {
  onClose: () => void;
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

const CreateSubscription: React.FC<CreateSubscriptionProps> = ({ onClose }) => {
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
  const [paymentType, setPaymentType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, ratePlansData, customersData] = await Promise.all([
          Api.getProducts(),
          Api.getRatePlans(),
          Api.getCustomers(),
        ]);
        setProducts(productsData);
        setRatePlans(ratePlansData);
        setCustomers(customersData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleNext = async () => {
    if (currentStep === 0) {
      try {
        const payload = {
          customerId: selectedCustomerId || 0,
          productId: selectedProductId || 0,
          ratePlanId: selectedRatePlanId || 0,
          paymentType: paymentType || 'PREPAID',
          adminNotes: planDescription,
        };
        console.log('Creating subscription payload', payload);
        const resp = await Api.createSubscription(payload);
        console.log('Subscription created successfully', resp);
        setSubmissionStatus('success');
      } catch (e) {
        console.error('Failed to create subscription', e);
        setSubmissionStatus('error');
      }
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
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
                  const cust = customers.find(c => c.customerId === id);
                  setSelectedCustomerName(cust?.customerName || '');
                }}
                options={customers.map(c => ({ label: c.customerName, value: c.customerId.toString() }))}
              />
              </div>
           
                <SelectField
                  label="Product"
                  value={selectedProductId?.toString() || ''}
                  onChange={(val) => {
                    const id = Number(val);
                    setSelectedProductId(id);
                    const prod = products.find(p => p.productId === id);
                    setSelectedProductName(prod?.productName || '');
                    setSelectedRatePlanName('');
                  }}
                  options={products.map(p => ({ label: p.productName, value: p.productId.toString() }))}
                />
                <SelectField
                  label="Rate Plan"
                  value={selectedRatePlanId?.toString() || ''}
                  onChange={(val) => {
                    const id = Number(val);
                    setSelectedRatePlanId(id);
                    const rp = ratePlans.find(r => r.ratePlanId === id);
                    setSelectedRatePlanName(rp?.ratePlanName || '');
                  }}
                  options={ratePlans.map(rp => ({ label: rp.ratePlanName, value: rp.ratePlanId.toString() }))}
                />
                <p className="field-note">Select a rate plan associated with the chosen product. Changing the product will reset this selection.</p>
                <SelectField
                  label="Payment Type"
                  value={paymentType}
                  onChange={setPaymentType}
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
        const planDetails = {
          name: selectedCustomerName,
          description: planDescription,
          frequency: billingFrequency,
          product: selectedProductName,
        };
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

  return (
    <>
    <div className="sub-header">
        <h2>Create New Subscription</h2>
        <div className="header-actions">
          <button className="btn cancel" onClick={() => setShowCancelModal(true)}>Cancel</button>
          <button className="btn save-draft">Save as Draft</button>
        </div>
      </div>
    <div className="sub-create-price-plan">
      <div className="sub-usage-metric-wrapper">
        <aside className="sub-sidebars">
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
                xmlns="http://www.w3.org/2000/svg"
                width="2"
                height="111"
                viewBox="0 0 2 111"
                fill="none"
              >
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

        <div className="form-section">
          <div className="form-card">{renderStepContent()}</div>
          <div className="button-group">
            <button className="back" onClick={handleBack} disabled={currentStep === 0}>
              Back
            </button>
            <button
              className="save-next"
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
            >
              Save & Next
            </button>
          </div>
        </div>
      </div>

      {submissionStatus === 'success' && <p className="success-msg">Subscription created successfully.</p>}
      {submissionStatus === 'error' && <p className="error-msg">Failed to create subscription.</p>}

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
    </>
  );
};

export default CreateSubscription;
