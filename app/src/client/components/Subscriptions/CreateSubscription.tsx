import React, { useState, useEffect } from 'react';
 import SubReview from './SubReview';
import { Api, Product, RatePlan } from './api';
import './CreateSubscription.css'; // You can rename this if desired

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
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [billingFrequency, setBillingFrequency] = useState('');
  const [selectedProductName, setSelectedProductName] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [selectedRatePlanName, setSelectedRatePlanName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, ratePlansData] = await Promise.all([
          Api.getProducts(),
          Api.getRatePlans(),
        ]);
        setProducts(productsData);
        setRatePlans(ratePlansData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleNext = () => {
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
              <label>Customer Name</label>
              <input
                type="text"
                placeholder="Enter customer name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
            </div>
           
            <div className="sub-form-row">
              <div className="sub-create-form">
                <label>Product</label>
                <select
                  value={selectedProductName}
                  onChange={(e) => {
                    setSelectedProductName(e.target.value);
                    setSelectedRatePlanName('');
                  }}
                >
                  <option value="">--select--</option>
                  {products.map((product) => (
                    <option key={product.productId} value={product.productName}>
                      {product.productName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sub-create-form">
                <label>Rate Plan</label>
                <select
                  value={selectedRatePlanName}
                  onChange={(e) => setSelectedRatePlanName(e.target.value)}
                >
                  <option value="">--select--</option>
                  {ratePlans.map((plan) => (
                    <option key={plan.ratePlanId} value={plan.ratePlanName}>
                      {plan.ratePlanName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sub-create-form">
              <label>Admin Notes</label>
              <textarea
                placeholder="Enter admin notes"
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
              />
            </div>
            </div>
          </>
        );
      case 1:
        const planDetails = {
          name: planName,
          description: planDescription,
          frequency: billingFrequency,
          product: selectedProductName,
        };
        return (
          <SubReview
            customerName={planName || ''}
            productName={selectedProductName || ''}
            ratePlan={selectedRatePlanName || ''}
            paymentMethod="Invoice (Net Terms)"
            basePrice={0}
            quantity={1}
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
          <button className="cancel-btn" onClick={() => setShowCancelModal(true)}>Cancel</button>
          <button className="draft-btn">Save as Draft</button>
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
