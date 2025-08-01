import React, { useState } from 'react';
import EditReview from './EditReview';
import './EditSubscription.css';

interface EditSubscriptionProps {
  onClose: () => void;
}

const steps = [
  { title: 'Subscription Details' },
  { title: 'Review & Confirm' },
];

const EditSubscription: React.FC<EditSubscriptionProps> = ({ onClose }) => {
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [billingFrequency, setBillingFrequency] = useState('');
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedRatePlanName, setSelectedRatePlanName] = useState('');
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
            <div className="edit-sub-create-form">
              <label>Customer Name</label>
              <input
                type="text"
                placeholder="Enter customer name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
            </div>
            <div className="edit-sub-form-row">
              <div className="edit-sub-create-form">
                <label>Product</label>
                <select
                  value={selectedProductName}
                  onChange={(e) => {
                    setSelectedProductName(e.target.value);
                    setSelectedRatePlanName('');
                  }}
                >
                  <option value="">--select--</option>
                  <option value="API Analytics">API Analytics</option>
                  <option value="SQL Reports">SQL Reports</option>
                  <option value="LLM Token">LLM Token</option>
                </select>
              </div>
              <div className="edit-sub-create-form">
                <label>Rate Plan</label>
                <select
                  value={selectedRatePlanName}
                  onChange={(e) => setSelectedRatePlanName(e.target.value)}
                >
                  <option value="">--select--</option>
                  <option value="Basic Plan">Basic Plan</option>
                  <option value="Pro Plan">Pro Plan</option>
                  <option value="Enterprise Plan">Enterprise Plan</option>
                </select>
              </div>
              <div className="edit-sub-create-form">
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
        return (
          <EditReview
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
      <div className="edit-sub-header">
        <h2>Edit Subscription</h2>
        <div className="edit-sub-header-actions">
          <button className="cancel-btn" onClick={() => setShowCancelModal(true)}>Cancel</button>
          <button className="draft-btn">Save as Draft</button>
        </div>
      </div>

      <div className="edit-sub-create-price-plan">
        <div className="edit-sub-usage-metric-wrapper">
          <aside className="edit-sub-sidebars">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`edit-sub-step-item ${index === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
              >
                <div className="sub-step-title">{step.title}</div>
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

export default EditSubscription;
